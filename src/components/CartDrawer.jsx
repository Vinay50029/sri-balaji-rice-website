import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import emailjs from '@emailjs/browser';

export default function CartDrawer() {
    const {
        isCartOpen,
        setIsCartOpen,
        cartItems,
        removeFromCart,
        updateQuantity,
        cartTotal,
        user,
        loginWithGoogle,
        clearCart,
    } = useCart();

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [customerDetails, setCustomerDetails] = useState({
        name: "",
        phone: "",
        address: "",
    });
    const [isSecure, setIsSecure] = useState(window.isSecureContext);


    useEffect(() => {
        if (user) {
            const fetchUserProfile = async () => {
                try {
                    const userDocRef = doc(db, "users", user.id);
                    const userSnap = await getDoc(userDocRef);
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        setCustomerDetails(prev => ({
                            ...prev,
                            name: data.name || user.fullName || "",
                            phone: data.phoneNumber || "",
                            address: data.address || ""
                        }));
                    } else {

                        setCustomerDetails(prev => ({ ...prev, name: user.fullName || "" }));
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            };
            fetchUserProfile();
        } else {

            setCustomerDetails({ name: "", phone: "", address: "" });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
                setCustomerDetails(prev => ({
                    ...prev,
                    address: `Lat: ${latitude}, Long: ${longitude}\nMaps: ${mapsLink}\n(Add more details...)`
                }));
            },
            (error) => {
                console.error("Location error:", error);
                let msg = "Unable to retrieve location.";
                if (error.code === 1) msg = "Location permission denied. Please enable it in browser settings.";
                else if (error.code === 2) msg = "Location unavailable. Check your GPS.";
                else if (error.code === 3) msg = "Location request timed out.";
                alert(msg + "\nError: " + error.message);
            }
        );
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();


        if (!user) {
            const wantLogin = window.confirm("Please login with Google to place your order and track history.");
            if (wantLogin) {
                try {
                    await loginWithGoogle();
                } catch (e) { return; }
            } else {
                return;
            }
            return;
        }

        if (cartItems.length === 0) return;

        setIsPlacingOrder(true);
        try {
            const orderData = {
                userId: user ? user.id : null,
                userInfo: {
                    name: customerDetails.name || (user?.fullName || "Guest"),
                    email: user?.primaryEmailAddress?.emailAddress || "",
                    phoneNumber: customerDetails.phone,
                },
                deliveryAddress: customerDetails.address,
                items: cartItems.map((item) => ({
                    id: item.id,
                    title: item.title,
                    price: Number(item.price),
                    quantity: item.quantity,
                    unit: item.weight || "unit",
                })),
                totalAmount: cartTotal,
                status: "pending",
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, "orders"), orderData);


            if (user) {
                try {
                    await setDoc(doc(db, "users", user.id), {
                        name: customerDetails.name,
                        phoneNumber: customerDetails.phone,
                        address: customerDetails.address,
                        updatedAt: serverTimestamp()
                    }, { merge: true });
                } catch (saveError) {
                    console.error("Failed to save user profile:", saveError);
                    // Don't block the order success even if profile save fails
                }
            }


            const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const TEMPLATE_ID_CUSTOMER = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CUSTOMER;
            const TEMPLATE_ID_ADMIN = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_ADMIN;
            const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;


            const emailItems = orderData.items.map(item => ({
                name: item.title,
                price: item.price,
                units: item.quantity,
                unit_weight: item.unit
            }));

            const emailParams = {
                order_id: docRef.id,
                name: orderData.userInfo.name,
                email: orderData.userInfo.email,
                contact_number: orderData.userInfo.phoneNumber,
                delivery_address: orderData.deliveryAddress,
                total_amount: orderData.totalAmount,
                items_summary: orderData.items.map(i => `${i.title} (${i.quantity} ${i.unit})`).join(', '),
                order_date: new Date().toLocaleString(),
                orders: emailItems
            };


            emailjs.send(SERVICE_ID, TEMPLATE_ID_CUSTOMER, emailParams, PUBLIC_KEY)
                .then(() => console.log("Customer email sent successfully"))
                .catch((err) => console.error("Failed to send customer email:", err));





            alert("Order placed successfully! We will contact you shortly.");
            clearCart();
            setIsCartOpen(false);

        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };


    const drawerStyle = {
        position: "fixed",
        top: 0,
        right: isCartOpen ? 0 : "-100%",
        width: "100%",
        maxWidth: "400px",
        height: "100vh",
        backgroundColor: "#fff",
        boxShadow: "-2px 0 5px rgba(0,0,0,0.1)",
        transition: "right 0.3s ease-in-out",
        zIndex: 1050,
        display: "flex",
        flexDirection: "column",
    };

    const backdropStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1040,
        display: isCartOpen ? "block" : "none",
    };

    return (
        <>

            <div style={backdropStyle} onClick={() => setIsCartOpen(false)} />


            <div style={drawerStyle}>

                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h5 className="m-0">
                        Shopping Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                    </h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setIsCartOpen(false)}
                        aria-label="Close"
                    ></button>
                </div>


                <div className="flex-grow-1 overflow-auto p-3">
                    {cartItems.length === 0 ? (
                        <div className="text-center mt-5 text-muted">
                            <p>Your cart is empty.</p>
                            <button
                                className="btn btn-outline-primary btn-sm mt-2"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {cartItems.map((item) => (
                                <div key={item.id} className="d-flex align-items-start gap-2 border-bottom pb-2">

                                    <div
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "8px",
                                            overflow: "hidden",
                                            flexShrink: 0,
                                            backgroundColor: "#f0f0f0",
                                        }}
                                    >
                                        {(item.media && item.media[0]) || item.mediaURL ? (
                                            <img
                                                src={(item.media && item.media[0]?.url) || item.mediaURL}
                                                alt={item.title}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center h-100">
                                                🍚
                                            </div>
                                        )}
                                    </div>


                                    <div className="flex-grow-1">
                                        <h6 className="mb-0 text-truncate" style={{ maxWidth: "180px" }}>
                                            {item.title}
                                        </h6>
                                        <small className="text-muted">
                                            ₹{item.price} / {item.weight}
                                        </small>
                                        <div className="d-flex align-items-center gap-2 mt-2">
                                            <button
                                                className="btn btn-sm btn-outline-secondary px-2 py-0"
                                                onClick={() => updateQuantity(item.id, -1)}
                                            >
                                                -
                                            </button>
                                            <span style={{ minWidth: "20px", textAlign: "center" }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                className="btn btn-sm btn-outline-secondary px-2 py-0"
                                                onClick={() => updateQuantity(item.id, 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>


                                    <button
                                        className="btn btn-sm text-danger"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {cartItems.length > 0 && (
                    <div className="p-3 border-top bg-light">
                        <div className="d-flex justify-content-between mb-3 fw-bold font-size-16">
                            <span>Total:</span>
                            <span>₹{cartTotal}</span>
                        </div>

                        {!user && (
                            <div className="alert alert-info py-2 small mb-2">
                                Login will be required to place order.
                            </div>
                        )}




                        {user ? (
                            <form onSubmit={handlePlaceOrder} className="mt-3">
                                <div className="mb-2">
                                    <label className="form-label small fw-bold mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control form-control-sm"
                                        placeholder="Full Name"
                                        required
                                        value={customerDetails.name}
                                        onChange={handleInputChange}
                                        defaultValue={user?.fullName || ""}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-bold mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-control form-control-sm"
                                        placeholder="+91"
                                        required
                                        value={customerDetails.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-bold mb-1">Delivery Address</label>
                                    <div className="input-group input-group-sm mb-1">
                                        <button
                                            type="button"
                                            className={`btn ${isSecure ? "btn-outline-secondary" : "btn-secondary"}`}
                                            onClick={handleGetLocation}
                                            title={isSecure ? "Use Current Location" : "Location requires HTTPS"}
                                            disabled={!isSecure}
                                        >
                                            {isSecure ? "Use Current Location" : "⚠️ Location Unavailable (HTTPS Required)"}
                                        </button>
                                    </div>
                                    <textarea
                                        name="address"
                                        className="form-control form-control-sm"
                                        placeholder="House No, Street, Landmark..."
                                        rows="2"
                                        required
                                        value={customerDetails.address}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                    disabled={isPlacingOrder}
                                    style={{ borderRadius: "20px", fontWeight: "bold" }}
                                >
                                    {isPlacingOrder ? "Placing Order..." : "Place Order"}
                                </button>
                            </form>
                        ) : (
                            <div className="mt-3 text-center">
                                <p className="small text-muted mb-2">Please login to enter your delivery details.</p>
                                <button
                                    type="button"
                                    className="btn btn-primary w-100"
                                    onClick={loginWithGoogle}
                                    style={{ borderRadius: "20px", fontWeight: "bold" }}
                                >
                                    Login to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
