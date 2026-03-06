import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { ShoppingBag, RefreshCw, AlertCircle } from "lucide-react";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/api/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.put(
                `http://localhost:5000/api/orders/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchOrders();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleSync = async () => {
        try {
            await axios.post("http://localhost:5000/api/sync", {}, { headers: { Authorization: `Bearer ${token}` } });
            alert("Syncing triggered!");
            fetchOrders();
        } catch (err) {
            alert("Sync failed: " + (err.response?.data?.error || err.message));
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Orders...</div>;

    return (
        <div className="p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8 text-indigo-600" />
                        Order Management
                    </h1>
                    <p className="text-gray-500 mt-1">View and manage customer orders.</p>
                </div>
                <button
                    onClick={handleSync}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" /> Sync External Orders
                </button>
            </header>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Platform</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.external_order_id}</td>
                                    <td className="px-6 py-4 text-gray-600">{order.customer_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.platform_id === 1 ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
                                            }`}>
                                            {order.platform_id === 1 ? "Amazon" : "Flipkart"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">₹{order.total_amount}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            value={order.order_status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                        >
                                            <option value="Placed">Placed</option>
                                            <option value="Packed">Packed</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                            <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                            No orders found. Sync to fetch data.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;
