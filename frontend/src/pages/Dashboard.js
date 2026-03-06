import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Bell, RefreshCw, ShoppingCart, TrendingUp, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    amazonOrders: 0,
    flipkartOrders: 0,
    totalRevenue: 0,
    orderStatus: []
  });
  const [loading, setLoading] = useState(true);

  const { token, user } = useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifRes, analyticsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/notifications", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5000/api/analytics", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setNotifications(notifRes.data);
      setStats(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = [
    { name: "Amazon", value: stats.amazonOrders },
    { name: "Flipkart", value: stats.flipkartOrders }
  ];
  const platformColors = ["#FF9900", "#2874F0"];

  const STATUS_COLORS = {
    Placed: '#3B82F6',     // Blue
    Packed: '#F59E0B',     // Amber
    Shipped: '#8B5CF6',    // Purple
    Delivered: '#10B981',  // Emerald
    Cancelled: '#EF4444'   // Red
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Overview of your business performance.</p>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Bell className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Notifications</h3>
            <ul className="list-disc list-inside text-sm text-amber-800 mt-1 space-y-1">
              {notifications.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</h3>
            </div>
          </div>
        </div>

        {/* Charts */}
        {(user?.role === "Admin" || user?.role === "Manager") && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 flex flex-col items-center">
              <h3 className="font-semibold text-gray-900 mb-4 self-start">Platform Distribution</h3>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={platformColors[index % platformColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-[#FF9900]"></div> Amazon
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full bg-[#2874F0]"></div> Flipkart
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2 flex flex-col items-center">
              <h3 className="font-semibold text-gray-900 mb-4 self-start">Order Status Distribution</h3>
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={stats.orderStatus || []}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(stats.orderStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#9CA3AF'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                  <div key={status} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }}></div> {status}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
