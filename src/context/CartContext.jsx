import { createContext, useContext, useState, useEffect } from "react";
// Clerk Imports
import { useUser, useClerk } from "@clerk/clerk-react";

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

    // Persistence
    useEffect(() => {
        try {
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart to local storage", error);
        }
    }, [cartItems]);

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


