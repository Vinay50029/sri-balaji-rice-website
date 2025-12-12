import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export default function UserOrders({ user, onClose }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            try {
                // Query orders for this user
                console.log("Fetching orders for User ID:", user.id);
                const q = query(
                    collection(db, "orders"),
                    where("userId", "==", user.id)
                    // orderBy("createdAt", "desc") // Requires index, temporarily removing to fix empty list
                );
                const snapshot = await getDocs(q);
                console.log("Found orders:", snapshot.size);
                const userOrders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setOrders(userOrders);
            } catch (error) {
                console.error("Error fetching user orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    // Styles
    const modalOverlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1060,
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

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "warning";
            case "accepted": return "info";
            case "delivered": return "success";
            case "cancelled": return "danger";
            default: return "secondary";
        }
    };

    return (
        <div style={modalOverlayStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="m-0">My Orders</h5>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>

                <div className="flex-grow-1 overflow-auto p-3">
                    {loading ? (
                        <div className="text-center p-4">Loading your orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center p-5 text-muted">
                            <p className="mb-2">📦</p>
                            <p>You haven't placed any orders yet.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {orders.map(order => (
                                <div key={order.id} className="card border shadow-sm">
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                        <span className={`badge bg-${getStatusColor(order.status)}`}>
                                            {(order.status || "pending").toUpperCase()}
                                        </span>
                                        <small className="text-muted">
                                            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : ""}
                                        </small>
                                    </div>
                                    <div className="card-body p-3">
                                        <div className="mb-2">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="d-flex justify-content-between small text-muted">
                                                    <span>{item.quantity} x {item.title}</span>
                                                    <span>₹{item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-top pt-2 d-flex justify-content-between fw-bold">
                                            <span>Total</span>
                                            <span>₹{order.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-3 border-top text-end bg-light rounded-bottom">
                    <div className="d-flex justify-content-between align-items-center w-100">
                        {/* <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                            Debug: UserID {user?.id ? user.id.slice(0, 8) : "No ID"}... | Orders: {orders.length}
                        </small> */}
                        <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
