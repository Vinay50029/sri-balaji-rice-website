

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc, addDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { OWNER_PHONE, ORDER_STATUS } from "../utils/constants";

// this component shows the user's order history
// it basically fetches orders where userId matches the current user
export default function UserOrders({ user, onClose }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelledOrder, setCancelledOrder] = useState(null);

    // states for handling product ratings
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [ratingData, setRatingData] = useState(null); // stores which order/item is being rated
    const [ratingValue, setRatingValue] = useState(5);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    // simple counter to force re-fetching orders when needed
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setLoading(true);
        setRefreshKey(prev => prev + 1);
    };

    // when the component loads, we fetch the orders from firestore
    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            try {
                // query to find orders belonging to this user
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", user.id)
                );
                const snapshot = await getDocs(q);

                const userOrders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // sorting orders so the newest ones come first
                userOrders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

                setOrders(userOrders);
            } catch (error) {
                console.error("Error fetching user orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, refreshKey]);

    // if user wants to cancel an order, we update the status in firebase
    const handleCancelOrder = async (order) => {

        try {
            await updateDoc(doc(db, "orders", order.id), {
                status: ORDER_STATUS.CANCELLED
            });

            // update the local state so the UI changes immediately
            setOrders(prev => prev.map(o =>
                o.id === order.id ? { ...o, status: ORDER_STATUS.CANCELLED } : o
            ));

            setCancelledOrder(order);
            setShowCancelModal(true);

        } catch (error) {
            console.error("Error cancelling order:", error);
            alert("Failed to cancel order. Please try again.");
        }
    };

    // this opens whatsapp with a pre-filled message for cancellation
    const openWhatsAppForCancellation = () => {
        if (cancelledOrder) {
            const message = `* Cancelling Order * 🚫\n\nOrder ID: ${cancelledOrder.id} \nTotal: ₹${cancelledOrder.totalAmount} \n\nI would like to cancel this order.`;
            const url = `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
            setShowCancelModal(false);
        }
    };

    // preparing to rate a specific item from an order
    const handleRateItem = (order, item) => {
        setRatingData({ orderId: order.id, item });
        setRatingValue(5);
        setRatingModalOpen(true);
    };

    // submitting the rating to the database
    // this does two things: adds a review doc and updates the product's average rating
    const submitRating = async () => {
        if (!ratingData || !user) return;
        setIsSubmittingRating(true);

        try {
            const { item } = ratingData;
            // 1. first, we add the review to the 'reviews' collection
            await addDoc(collection(db, "reviews"), {
                userId: user.id,
                userName: user.firstName || "User",
                productId: item.id || item.productId, // checking for id
                productName: item.title,
                rating: ratingValue,
                createdAt: serverTimestamp(),
                orderId: ratingData.orderId
            });

            // 2. then we use a transaction to safely update the product's rating stats
            await runTransaction(db, async (transaction) => {
                let productRef = doc(db, "fatherPosts", item.id);
                let productDoc = await transaction.get(productRef);

                // checking if product exists in either collection
                if (!productDoc.exists()) {
                    // if not in fatherPosts, check otherProducts
                    productRef = doc(db, "otherProducts", item.id);
                    productDoc = await transaction.get(productRef);

                    if (!productDoc.exists()) {
                        console.warn("Product doc not found in fatherPosts or otherProducts, skipping stats update");
                        return;
                    }
                }

                const data = productDoc.data();
                const oldRatingCount = data.ratingCount || 0;
                const oldRatingAvg = data.ratingAvg || 0;

                // calculating the new average rating
                const newRatingCount = oldRatingCount + 1;
                const newRatingAvg = ((oldRatingAvg * oldRatingCount) + ratingValue) / newRatingCount;

                transaction.update(productRef, {
                    ratingCount: newRatingCount,
                    ratingAvg: newRatingAvg
                });
            });

            alert("Thank you for your rating! ⭐");
            setRatingModalOpen(false);

        } catch (error) {
            console.error("Error submitting rating:", error);
            alert("Failed to submit rating. Please try again.");
        } finally {
            setIsSubmittingRating(false);
        }
    };


    // styles for the modal overlay
    const modalOverlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
    };

    const modalContentStyle = {
        backgroundColor: "#fff",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "600px",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
    };

    // helper function to get color based on order status
    const getStatusColor = (status) => {
        switch (status) {
            case ORDER_STATUS.PENDING: return "warning";
            case ORDER_STATUS.ACCEPTED: return "info";
            case ORDER_STATUS.DELIVERED: return "success";
            case ORDER_STATUS.CANCELLED: return "danger";
            default: return "secondary";
        }
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <div className="d-flex align-items-center gap-2">
                        <h5 className="m-0">My Orders</h5>
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                            onClick={handleRefresh}
                            title="Refresh Orders"
                        >
                            ↻
                        </button>
                    </div>
                </div>

                <div className="flex-grow-1 overflow-auto p-3">
                    {loading ? (
                        <div className="text-center p-4">
                            <div className="spinner-border text-primary spinner-border-sm mb-2" role="status"></div>
                            <p className="mb-0 small text-muted">Loading your orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        // show this if user has no orders
                        <div className="text-center p-5 text-muted bg-light rounded m-3 border border-dashed">
                            <div className="display-1 mb-3">📦</div>
                            <h6 className="fw-bold text-dark">No Orders Found</h6>
                            <p className="small mb-2">Shop Now!</p>
                        </div>
                    ) : (
                        // list of order cards
                        <div className="d-flex flex-column gap-3">
                            {orders.map(order => (
                                <div key={order.id} className="card border shadow-sm">
                                    <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`badge bg-${getStatusColor(order.status)}`}>
                                                {(order.status || ORDER_STATUS.PENDING).toUpperCase()}
                                            </span>
                                            <small className="text-muted monospace" style={{ fontSize: '0.75rem' }}>#{order.id.slice(-6)}</small>
                                        </div>
                                        <small className="text-muted">
                                            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : ""}
                                        </small>
                                    </div>
                                    <div className="card-body p-3">
                                        <div className="mb-2">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="d-flex justify-content-between align-items-center small mb-2">
                                                    <div>
                                                        <span className="text-dark fw-medium">{item.quantity} x {item.title}</span>
                                                        <div className="text-muted">₹{item.price * item.quantity}</div>
                                                    </div>

                                                    {/* we only show the rate button if the order is delivered */}
                                                    {order.status === ORDER_STATUS.DELIVERED && (
                                                        <button
                                                            className="btn btn-sm btn-outline-warning text-dark py-0"
                                                            style={{ fontSize: '0.75rem' }}
                                                            onClick={() => handleRateItem(order, item)}
                                                        >
                                                            Rate ⭐
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-top pt-2 d-flex justify-content-between fw-bold mb-2">
                                            <span>Total</span>
                                            <span>₹{order.totalAmount}</span>
                                        </div>

                                        {/* user can only cancel if status is still pending */}
                                        {order.status === ORDER_STATUS.PENDING && (
                                            <div className="text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleCancelOrder(order)}
                                                >
                                                    Cancel Order
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-top text-end bg-light rounded-bottom">
                    <div className="d-flex justify-content-between align-items-center w-100">

                        <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>

            {/* popup modal to confirm cancellation */}
            {showCancelModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", justifyContent: "center", alignItems: "center"
                }} onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white p-4 rounded shadow-lg text-center" style={{ width: "90%", maxWidth: "400px" }}>
                        <div className="mb-3">
                            <h2 className="text-danger display-1">🚫</h2>
                            <h4 className="fw-bold">Order Cancelled</h4>
                            <p className="text-muted small">Your order has been cancelled successfully.</p>
                        </div>
                        <div className="d-grid gap-2">
                            <button
                                className="btn btn-success fw-bold py-2"
                                onClick={openWhatsAppForCancellation}
                            >
                                <span className="me-2">📱</span> Notify on WhatsApp
                            </button>
                            <button
                                className="btn btn-secondary py-2"
                                onClick={() => setShowCancelModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* popup modal for giving a star rating */}
            {ratingModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0,0,0,0.6)", zIndex: 2050, display: "flex", justifyContent: "center", alignItems: "center"
                }} onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white p-4 rounded shadow-lg text-center" style={{ width: "90%", maxWidth: "350px" }}>
                        <div className="mb-4">
                            <h5 className="fw-bold mb-1">Rate this Product</h5>
                            <p className="text-muted small">{ratingData?.item?.title}</p>

                            <div className="d-flex justify-content-center gap-2 my-3">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        onClick={() => setRatingValue(star)}
                                        style={{
                                            cursor: 'pointer',
                                            fontSize: '2rem',
                                            transition: 'transform 0.1s',
                                            transform: ratingValue >= star ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                        className={ratingValue >= star ? "text-warning" : "text-muted opacity-25"}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <p className="fw-bold text-warning mb-0">
                                {ratingValue === 5 ? "Excellent!" :
                                    ratingValue === 4 ? "Very Good" :
                                        ratingValue === 3 ? "Good" :
                                            ratingValue === 2 ? "Fair" : "Poor"}
                            </p>
                        </div>
                        <div className="d-grid gap-2">
                            <button
                                className="btn btn-accent fw-bold py-2"
                                onClick={submitRating}
                                disabled={isSubmittingRating}
                            >
                                {isSubmittingRating ? "Submitting..." : "Submit Rating"}
                            </button>
                            <button
                                className="btn btn-light py-2 border"
                                onClick={() => setRatingModalOpen(false)}
                                disabled={isSubmittingRating}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

