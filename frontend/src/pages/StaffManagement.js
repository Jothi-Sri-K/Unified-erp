import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Ban, Search, ShieldCheck, Users } from 'lucide-react';

const StaffManagement = () => {
    const { token } = useContext(AuthContext);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Warehouse'
    });

    const fetchStaff = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/staff', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaff(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/onboard', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`User ${formData.name} created successfully!`);
            setIsFormOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'Warehouse' });
            fetchStaff();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDisableUser = async (id) => {
        if (!window.confirm('Are you sure you want to disable this user?')) return;
        try {
            await axios.put(`http://localhost:5000/api/auth/staff/${id}/disable`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStaff();
        } catch (err) {
            alert('Failed to disable user');
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    return (
        <div className="p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-8 h-8 text-indigo-600" />
                        Staff Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage system access and roles.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                    <UserPlus className="w-4 h-4" /> Add New Staff
                </button>
            </header>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">
                                    {user.name.charAt(0)}
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                    user.role === 'Manager' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                {user.name}
                                {user.status === 'DISABLED' && <span className="px-2 py-0.5 mt-1 text-[10px] font-bold bg-red-100 text-red-700 rounded-full border border-red-200">DISABLED</span>}
                            </h3>
                            <p className="text-sm text-gray-500 mb-1">{user.email}</p>
                            <p className="text-xs text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => handleDisableUser(user.id)}
                                disabled={user.role === 'Admin' || user.status === 'DISABLED'} // Cannot disable admin or already disabled
                                className="w-full text-sm text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Ban className="w-4 h-4" /> {user.status === 'DISABLED' ? 'Account Disabled' : 'Disable Account'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Onboard New Staff</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input required type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input required type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input required type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="Manager">Manager</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Warehouse">Warehouse</option>
                                </select>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm">Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;