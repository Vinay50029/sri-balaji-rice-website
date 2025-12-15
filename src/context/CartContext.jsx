import { createContext, useContext, useState, useEffect } from "react";
// Clerk Imports
import { useUser, useClerk } from "@clerk/clerk-react";
// Firebase Imports
import { db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    // Clerk Hooks
    const { user, isLoaded } = useUser();
    const { openSignIn, signOut } = useClerk();

    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem("cartItems");
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to load cart from local storage", error);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCartSynced, setIsCartSynced] = useState(false);

    // Persistence Effect: Sync to Firestore (if User and Synced) or LocalStorage (if Guest)
    useEffect(() => {
        if (user) {
            // ONLY save to Firestore if we have finished the initial sync/load
            if (isCartSynced) {
                const saveToFirestore = async () => {
                    try {
                        await setDoc(doc(db, "carts", user.id), { items: cartItems });
                    } catch (e) {
                        console.error("Error saving cart to Firestore:", e);
                    }
                };
                saveToFirestore();
            }
        } else {
            // Guest mode: always save to local storage
            try {
                localStorage.setItem("cartItems", JSON.stringify(cartItems));
            } catch (error) {
                console.error("Failed to save cart to local storage", error);
            }
        }
    }, [cartItems, user, isCartSynced]);

    // User Sync Effect: Handle Login/Logout merging
    useEffect(() => {
        if (!isLoaded) return;

        if (user) {
            // User Logged In
            const syncUserCart = async () => {
                try {
                    const cartRef = doc(db, "carts", user.id);
                    const docSnap = await getDoc(cartRef);
                    let remoteItems = [];

                    if (docSnap.exists()) {
                        remoteItems = docSnap.data().items || [];
                    }

                    // Merge guest items (currently in state) with remote items
                    if (cartItems.length > 0) {
                        const mergedMap = new Map();

                        // Add remote items first
                        remoteItems.forEach(item => mergedMap.set(item.id, item));

                        // Merge local items
                        cartItems.forEach(localItem => {
                            if (mergedMap.has(localItem.id)) {
                                const existing = mergedMap.get(localItem.id);
                                mergedMap.set(localItem.id, {
                                    ...existing,
                                    quantity: existing.quantity + localItem.quantity
                                });
                            } else {
                                mergedMap.set(localItem.id, localItem);
                            }
                        });

                        const finalItems = Array.from(mergedMap.values());
                        setCartItems(finalItems);
                    } else {
                        // No local items (or local storage washed), just load remote
                        // IMPORTANT: Even if remoteItems is empty, we must set it to reflect account state
                        setCartItems(remoteItems);
                    }

                    // Mark as synced so subsequent updates (e.g. adding items) can write to Firestore
                    setIsCartSynced(true);

                    // Clear LocalStorage explicitly to avoid stale guest data on reload
                    localStorage.removeItem("cartItems");

                } catch (error) {
                    console.error("Error syncing cart from Firestore:", error);
                    // In case of error, maybe we still want to allow edits? 
                    // For safety, let's enable sync so user isn't stuck efficiently read-only
                    setIsCartSynced(true);
                }
            };
            syncUserCart();
        } else {
            // User Logged Out: Clear cart and reset sync state
            setCartItems([]);
            setIsCartSynced(false);
        }
    }, [user, isLoaded]); // Dependency on auth state only

    // Cart Actions
    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevItems, { ...product, quantity: 1 }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, change) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === productId) {
                    const newQuantity = Math.max(1, item.quantity + change);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // Auth Actions (Mapped to Clerk)
    const loginWithGoogle = () => {
        openSignIn();
    };

    const logout = async () => {
        await signOut();
    };

    // Derived State
    const cartTotal = cartItems.reduce(
        (total, item) => total + (Number(item.price) || 0) * item.quantity,
        0
    );

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const value = {
        cartItems,
        user, // Provided by Clerk
        loadingAuth: !isLoaded,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        loginWithGoogle,
        logout
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}


