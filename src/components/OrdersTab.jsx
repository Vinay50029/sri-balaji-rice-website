import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import { ORDER_STATUS } from "../utils/constants";

export default function OrdersTab() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const audioContextRef = useRef(null);
    const isFirstLoad = useRef(true);


    const playNotificationSound = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            if (ctx.state === "suspended") {
                ctx.resume();
            }

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(500, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setOrders(fetchedOrders);


            if (!isFirstLoad.current) {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        playNotificationSound();

                    }
                });
            }
            isFirstLoad.current = false;
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, "orders", orderId), { status: newStatus });


            const order = orders.find(o => o.id === orderId);
            if (order && order.userInfo?.email) {
                const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
                const TEMPLATE_ID_CUSTOMER = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_CUSTOMER;
                const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

                const emailParams = {
                    order_id: orderId,
                    to_name: order.userInfo.name,
                    to_email: order.userInfo.email,
                    message: `Your order status has been updated to: ${newStatus.toUpperCase()}`,
                    total_amount: order.totalAmount,

                    items_summary: `Status Update: ${newStatus.toUpperCase()}`,
                    order_date: new Date().toLocaleString()
                };

                emailjs.send(SERVICE_ID, TEMPLATE_ID_CUSTOMER, emailParams, PUBLIC_KEY)
                    .then(() => console.log("Status update email sent"))
                    .catch((err) => console.error("Failed to send status email:", err));
            }

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            await deleteDoc(doc(db, "orders", orderId));
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "";

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    const filteredOrders = orders.filter(
        (order) => filterStatus === "all" || order.status === filterStatus
    );

    const getStatusColor = (status) => {
        switch (status) {
            case ORDER_STATUS.PENDING: return "warning";
            case ORDER_STATUS.ACCEPTED: return "info";
            case ORDER_STATUS.DELIVERED: return "success";
            case ORDER_STATUS.CANCELLED: return "danger";
            default: return "secondary";
        }
    };

    if (loading) return <div className="text-center p-5">Loading Orders...</div>;

    return (
        <div className="container-fluid" >
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="m-0">Customer Orders ({orders.length})</h3>
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-warning" onClick={playNotificationSound}>
                        🔔 Enable Sound
                    </button>
                    <select
                        className="form-select w-auto"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value={ORDER_STATUS.PENDING}>Pending</option>
                        <option value={ORDER_STATUS.ACCEPTED}>Accepted</option>
                        <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
                        <option value={ORDER_STATUS.CANCELLED}>Cancelled</option>
                    </select>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="alert alert-secondary text-center">No orders found.</div>
            ) : (
                <div className="row g-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="col-12 col-md-6 col-lg-4">
                            <div className={`card h-100 shadow-sm border-${getStatusColor(order.status)}`}>
                                <div className={`card-header bg-${getStatusColor(order.status)} bg-opacity-10 d-flex justify-content-between align-items-center`}>
                                    <span className="badge bg-white text-dark border">{order.status.toUpperCase()}</span>
                                    <small className="text-muted">{formatDate(order.createdAt)}</small>
                                </div>
                                <div className="card-body">
                                    <div className="mb-2 text-muted small" style={{ fontSize: '0.75rem', background: '#f8f9fa', padding: '4px', borderRadius: '4px' }}>
                                        User ID: {order.userId || "Guest"}
                                    </div>
                                    <h5 className="card-title mb-2">{order.userInfo?.name || "Guest"}</h5>
                                    <p className="card-text mb-1">
                                        <strong>Phone:</strong> <a href={`tel:${order.userInfo?.phoneNumber}`}>{order.userInfo?.phoneNumber}</a>
                                    </p>
                                    <p className="card-text mb-3">
                                        <strong>Address:</strong> {order.deliveryAddress || "N/A"}
                                    </p>

                                    <div className="bg-light p-2 rounded mb-3" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="d-flex justify-content-between small border-bottom py-1">
                                                <span>{item.quantity} x {item.title} ({item.unit})</span>
                                                <span className="fw-bold">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <strong>Total Amount:</strong>
                                        <h5 className="text-primary m-0">₹{order.totalAmount}</h5>
                                    </div>

                                    <div className="d-grid gap-2">
                                        {order.status === ORDER_STATUS.PENDING && (
                                            <button className="btn btn-sm btn-info text-white" onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.ACCEPTED)}>Accept Order</button>
                                        )}
                                        {order.status === ORDER_STATUS.ACCEPTED && (
                                            <button className="btn btn-sm btn-success" onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.DELIVERED)}>Mark Delivered</button>
                                        )}
                                        {order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.DELIVERED && (
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.CANCELLED)}>Cancel Order</button>
                                        )}
                                        <button className="btn btn-sm btn-link text-muted" onClick={() => handleDeleteOrder(order.id)}>Delete Record</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
