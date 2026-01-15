import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import emailjs from '@emailjs/browser';
import { DELIVERY_FEE, OWNER_PHONE, SHOP_COORDINATES, ORDER_STATUS } from "../utils/constants";

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
        houseNo: "",
        street: "",
        landmark: "",
        mapsLink: "",
        latitude: null,
        longitude: null
    });
    const [isSecure, setIsSecure] = useState(window.isSecureContext);


    // fills form automatically if user is logged in
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
                            houseNo: data.houseNo || "",
                            street: data.street || data.address || "",
                            landmark: data.landmark || "",
                            mapsLink: data.mapsLink || ""
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
            setCustomerDetails({ name: "", phone: "", houseNo: "", street: "", landmark: "", mapsLink: "" });
        }
    }, [user]);

    // resets location data when cart closes so it doesn't get stuck
    useEffect(() => {
        if (isCartOpen) {
            setCustomerDetails(prev => ({
                ...prev,
                mapsLink: "",
                latitude: null,
                longitude: null
            }));
        }
    }, [isCartOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails((prev) => ({ ...prev, [name]: value }));
    };

    // gets user's location coordinates for delivery
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCustomerDetails(prev => ({
                    ...prev,
                    latitude: latitude,
                    longitude: longitude,
                    mapsLink: `https://www.google.com/maps?q=${latitude},${longitude}`
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




    const [deliveryFee, setDeliveryFee] = useState(0);

    // simple math to check distance
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    // calculate fee if distance > 10km
    useEffect(() => {
        let fee = 0;

        if (customerDetails.latitude && customerDetails.longitude) {
            const dist = calculateDistance(
                SHOP_COORDINATES.lat,
                SHOP_COORDINATES.lng,
                customerDetails.latitude,
                customerDetails.longitude
            );

            if (dist > 10) {
                const extraKm = Math.ceil(dist - 10);
                fee += extraKm * DELIVERY_FEE;
            }
        }

        setDeliveryFee(fee);
    }, [cartItems, customerDetails.latitude, customerDetails.longitude]);

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);
    const [locationError, setLocationError] = useState("");

    // saves order to firebase and sends email
    const finalizeOrder = async (orderData) => {
        setIsPlacingOrder(true);
        try {
            const docRef = await addDoc(collection(db, "orders"), orderData);

            if (user) {
                try {
                    await setDoc(doc(db, "users", user.id), {
                        name: customerDetails.name,
                        phoneNumber: customerDetails.phone,
                        houseNo: customerDetails.houseNo,
                        street: customerDetails.street,
                        landmark: customerDetails.landmark,
                        mapsLink: customerDetails.mapsLink,
                        address: orderData.deliveryAddress,
                        updatedAt: serverTimestamp()
                    }, { merge: true });
                } catch (saveError) {
                    console.error("Failed to save user profile:", saveError);
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
                payment_mode: orderData.paymentMode,
                orders: emailItems
            };

            emailjs.send(SERVICE_ID, TEMPLATE_ID_CUSTOMER, emailParams, PUBLIC_KEY)
                .then(() => console.log("Customer email sent successfully"))
                .catch((err) => console.error("Failed to send customer email:", err));

            if (TEMPLATE_ID_ADMIN) {
                emailjs.send(SERVICE_ID, TEMPLATE_ID_ADMIN, emailParams, PUBLIC_KEY)
                    .then(() => console.log("Admin email sent successfully"))
                    .catch((err) => console.error("Failed to send admin email:", err));
            }

            setLastOrder({
                id: docRef.id,
                total: orderData.totalAmount,
                items: orderData.items,
                address: orderData.deliveryAddress,
                name: orderData.userInfo.name
            });
            setShowSuccessModal(true);
            clearCart();
            setIsCartOpen(false);

        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // force login before ordering
        if (!user) {
            const wantLogin = window.confirm("Please login check ordering.");
            if (wantLogin) {
                try { await loginWithGoogle(); } catch (e) { return; }
            }
            return;
        }

        if (cartItems.length === 0) return;

        if (!customerDetails.mapsLink) {
            setLocationError("Please click 'Get Current Location' to set delivery address.");
            return;
        } else {
            setLocationError("");
        }

        // constructing full address text
        const fullAddress = `
${customerDetails.houseNo ? `H.No: ${customerDetails.houseNo}` : ''}
${customerDetails.street}
${customerDetails.landmark ? `Landmark: ${customerDetails.landmark}` : ''}
${customerDetails.mapsLink ? `📍 Maps: ${customerDetails.mapsLink}` : ''}
        `.trim();

        const orderData = {
            userId: user ? user.id : null,
            userInfo: {
                name: customerDetails.name || (user?.fullName || "Guest"),
                email: user?.primaryEmailAddress?.emailAddress || "",
                phoneNumber: customerDetails.phone,
            },
            deliveryAddress: fullAddress,
            items: cartItems.map((item) => ({
                id: item.id,
                title: item.title,
                price: Number(item.price),
                quantity: item.quantity,
                unit: item.weight || "unit",
            })),
            deliveryFee: deliveryFee,
            totalAmount: cartTotal + deliveryFee,
            status: ORDER_STATUS.PENDING,
            paymentMode: "COD",
            createdAt: serverTimestamp(),
        };

        finalizeOrder(orderData);
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
        zIndex: 1200,
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
        zIndex: 1150,
        display: isCartOpen ? "block" : "none",
    };

    return (
        <>

            <div style={backdropStyle} onClick={() => setIsCartOpen(false)} />


            <div style={drawerStyle}>
                {/* header */}
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <div className="d-flex align-items-center">
                        <button
                            className="btn btn-sm btn-link text-dark p-0 me-2 d-flex align-items-center"
                            onClick={() => setIsCartOpen(false)}
                            aria-label="Back"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                            </svg>
                        </button>
                        <h5 className="m-0">
                            Shopping Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
                        </h5>
                    </div>
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

                    {cartItems.length > 0 && (
                        <div className="mt-4 pt-3 border-top">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="fw-bold fs-6">Subtotal:</span>
                                <span className="fw-bold fs-6">₹{cartTotal}</span>
                            </div>
                            {/* show delivery fee if far away */}
                            {deliveryFee > 0 && (
                                <>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="small">distance is more than 10 kms</span>
                                    </div>

                                    <div className="d-flex justify-content-between mb-2 text-danger">
                                        <span className="fw-bold fs-6">Delivery Charges:</span>
                                        <span className="fw-bold fs-6">+₹{deliveryFee}</span>
                                    </div>
                                </>
                            )}
                            <div className="d-flex justify-content-between mb-4 border-top pt-2">
                                <span className="fw-bold fs-4">Total:</span>
                                <span className="fw-bold fs-4">₹{cartTotal + deliveryFee}</span>
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
                                        <label className="form-label small fw-bold mb-1">House / Flat No.</label>
                                        <input
                                            type="text"
                                            name="houseNo"
                                            className="form-control form-control-sm"
                                            placeholder="e.g. 102, 1st Floor"
                                            value={customerDetails.houseNo}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small fw-bold mb-1">Street / Area / Colony <span className="text-danger">*</span></label>
                                        <textarea
                                            name="street"
                                            className="form-control form-control-sm"
                                            placeholder="Main Road, Near Temple..."
                                            rows="2"
                                            required
                                            value={customerDetails.street}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small fw-bold mb-1">Landmark</label>
                                        <input
                                            type="text"
                                            name="landmark"
                                            className="form-control form-control-sm"
                                            placeholder="Opposite Post Office"
                                            value={customerDetails.landmark}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <label className="form-label small fw-bold m-0">Location Link <span className="text-danger">*</span></label>
                                            <button
                                                type="button"
                                                className={`btn btn-sm p-0 text-decoration-none ${isSecure ? "text-primary" : "text-muted"}`}
                                                onClick={handleGetLocation}
                                                title={isSecure ? "Use Current Location" : "Location requires HTTPS"}
                                                disabled={!isSecure}
                                                style={{ fontSize: "0.8rem" }}
                                            >
                                                {isSecure ? "Current Location" : "⚠️ Location Unavailable"}
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            name="mapsLink"
                                            className="form-control form-control-sm bg-light text-muted"
                                            placeholder="Click button to fetch location"
                                            value={customerDetails.mapsLink}
                                            readOnly
                                            required
                                        />
                                        {locationError && <div className="text-danger small mt-1">{locationError}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold mb-1">Payment Method</label>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="paymentMethod"
                                                id="paymentCOD"
                                                checked
                                                disabled
                                            />
                                            <label className="form-check-label small" htmlFor="paymentCOD">
                                                Cash on Delivery
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="termsCheck"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        />
                                        <label className="form-check-label small text-muted" htmlFor="termsCheck">
                                            I agree to the <span className="text-primary text-decoration-underline" style={{ cursor: "pointer" }} onClick={() => setShowTermsModal(true)}>Terms & Conditions</span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={isPlacingOrder || !acceptedTerms}
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
                        </div >
                    )
                    }
                </div >
            </div >
            {showTermsModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1300, display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div className="bg-white p-4 rounded shadow-lg d-flex flex-column" style={{ width: "90%", maxWidth: "500px", maxHeight: "80vh" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
                            <h5 className="fw-bold m-0">Terms & Conditions</h5>
                            <button className="btn-close" onClick={() => setShowTermsModal(false)}></button>
                        </div>
                        <div className="text-muted small flex-grow-1 overflow-auto pe-2">
                            <p><strong>1. General</strong><br />By placing an order with Sri Balaji Traders, you agree to these terms.</p>
                            <p><strong>2. Pricing & Availability</strong><br />Prices are subject to change without notice. Rice varieties and availability may vary based on season.</p>
                            <p><strong>3. Delivery</strong><br />We strive to deliver within the estimated time, but delays may occur due to traffic or weather conditions.</p>
                            <p><strong>4. Returns & Refunds</strong><br />Please inspect your order upon delivery. Returns are accepted only for damaged or incorrect items reported immediately within 12 hours of delivery.</p>
                            <p><strong>5. Privacy</strong><br />Your personal details are used solely for order processing and delivery.</p>
                            <p><strong>6. Cancellation Policy</strong><br />If an order is rejected or cancelled at the time of delivery (doorstep), a cancellation fee of ₹15 may be charged.</p>
                            <p><strong>7. Bulk Orders</strong><br />Orders containing more than 2 bags might incur a delivery fee to cover auto/transport charges.</p>
                            <p><strong>8. Delivery Distance</strong><br />Free delivery is available within a 10km radius. Locations beyond 10km may be subject to additional distance-based delivery charges.</p>
                        </div>
                        <button className="btn btn-primary w-100 mt-3 flex-shrink-0" onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }}>
                            I Understand & Agree
                        </button>
                    </div>
                </div>
            )}
            {/* success modal after order placed */}
            {showSuccessModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div className="bg-white p-4 rounded shadow-lg text-center" style={{ width: "90%", maxWidth: "400px" }}>
                        <div className="mb-3">
                            <h2 className="text-success display-1">✅</h2>
                            <h4 className="fw-bold">Order Placed!</h4>
                            <p className="text-muted small">Your order has been successfully recorded.</p>
                        </div>
                        <div className="d-grid gap-2">
                            <button
                                className="btn btn-success fw-bold py-2"
                                onClick={() => {
                                    if (!lastOrder) return;
                                    const message = `*New Order Placed!*🍚\n\n` +
                                        `Order ID: ${lastOrder.id}\n` +
                                        `Name: ${lastOrder.name}\n` +
                                        `Total Amount: ₹${lastOrder.total}\n` +
                                        `Address: ${lastOrder.address}\n\n` +
                                        `Items:\n` +
                                        lastOrder.items.map(i => `- ${i.title} (${i.quantity} ${i.unit})`).join('\n');

                                    const url = `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
                                    window.open(url, '_blank');
                                    setShowSuccessModal(false);
                                }}
                            >
                                <span className="me-2">📱</span> Send to WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
