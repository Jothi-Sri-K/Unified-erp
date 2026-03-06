import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Package, MapPin, Clock } from 'lucide-react';

const Dashboard = () => {
    const { customer } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [ordersRes, addressesRes] = await Promise.all([
                    axios.get('/api/store/orders'),
                    axios.get('/api/store/user/addresses')
                ]);
                setOrders(ordersRes.data);
                setAddresses(addressesRes.data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (customer) fetchDashboardData();
    }, [customer]);

    if (!customer) return <div className="p-5 text-center text-muted">Please sign in.</div>;
    if (loading) return (
        <div className="d-flex justify-content-center p-5">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    return (
        <div className="container py-4">

            {/* Header */}
            <div className="mb-5">
                <h1 className="display-5 fw-bolder text-dark tracking-tight">Account Overview</h1>
                <p className="lead text-muted mt-2">Welcome back, {customer.name}</p>
            </div>

            <div className="row g-5">
                {/* Main Content: Orders */}
                <div className="col-lg-8">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h2 className="fs-4 fw-bold d-flex align-items-center gap-2 m-0"><Package className="text-primary" /> Order History</h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="card bg-white border-0 rounded-4 p-5 text-center shadow-sm">
                            <Clock className="mx-auto text-secondary opacity-50 mb-3" size={48} />
                            <p className="text-muted fs-5 mb-0">You haven't placed any orders yet.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-4">
                            {orders.map(order => (
                                <div key={order.id} className="card bg-white border border-light rounded-4 p-4 shadow-sm transition-all hover-shadow">
                                    <div className="row g-3 mb-4 pb-4 border-bottom border-light">
                                        <div className="col-6 col-md-3">
                                            <p className="small text-muted fw-bold text-uppercase tracking-wider mb-1">Order ID</p>
                                            <p className="font-monospace text-dark fw-bold mb-0">{order.external_order_id}</p>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <p className="small text-muted fw-bold text-uppercase tracking-wider mb-1">Date</p>
                                            <p className="text-dark fw-medium mb-0">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <p className="small text-muted fw-bold text-uppercase tracking-wider mb-1">Total</p>
                                            <p className="text-primary fw-bolder mb-0">₹{order.total_amount}</p>
                                        </div>
                                        <div className="col-6 col-md-3 text-md-end">
                                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2 fw-bold">
                                                {order.order_status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="d-flex flex-column gap-2">
                                        {order.OrderItems.map(item => (
                                            <div key={item.id} className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-white rounded-2 shadow-sm d-flex align-items-center justify-content-center text-muted border border-light" style={{ width: '48px', height: '48px', fontSize: '10px' }}>
                                                        IMG
                                                    </div>
                                                    <div>
                                                        <p className="fw-bold text-dark small mb-0">{item.Product?.name || 'Unknown Product'}</p>
                                                        <p className="small text-muted mb-0">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="fw-bold text-dark mb-0">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: Addresses */}
                <div className="col-lg-4">
                    <h2 className="fs-4 fw-bold d-flex align-items-center gap-2 mb-4"><MapPin className="text-danger" /> Saved Addresses</h2>

                    <div className="card bg-white border border-light rounded-4 p-4 shadow-sm">
                        {addresses.length === 0 ? (
                            <p className="text-muted small text-center py-3 mb-0">No addresses saved yet.</p>
                        ) : (
                            <div className="d-flex flex-column gap-3 mb-4">
                                {addresses.map(addr => (
                                    <div key={addr.id} className={`p-3 rounded-3 border ${addr.isDefault ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`}>
                                        {addr.isDefault && <span className="badge bg-primary bg-opacity-25 text-primary text-uppercase tracking-wider rounded-1 mb-2" style={{ fontSize: '10px' }}>Default</span>}
                                        <p className="fw-medium text-dark small mb-1">{addr.street}</p>
                                        <p className="text-muted small mb-0">{addr.city}, {addr.state} {addr.zipCode}</p>
                                        <p className="text-muted small mb-0">{addr.country}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="btn btn-outline-secondary border-2 border-dashed rounded-3 fw-bold w-100 py-3 d-flex align-items-center justify-content-center gap-2">
                            + Add New Address
                        </button>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .hover-shadow { transition: box-shadow 0.2s ease; }
                .hover-shadow:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
            `}</style>
        </div>
    );
};

export default Dashboard;
