import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    Users,
    LogOut,
    Menu,
    ShoppingBag
} from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Sales', 'Warehouse'] },
        { label: 'Inventory', path: '/inventory', icon: Package, roles: ['Admin', 'Manager', 'Warehouse', 'Sales'] },
        { label: 'Orders', path: '/orders', icon: ShoppingBag, roles: ['Admin', 'Manager', 'Sales', 'Warehouse'] },
        { label: 'Staff Management', path: '/staff', icon: Users, roles: ['Admin'] },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-xl font-bold text-indigo-600 tracking-tight">Unified ERP</span>
                </div>

                <nav className="flex-1 py-6 space-y-1 px-4">
                    {navItems.map((item) => {
                        if (!item.roles.includes(user.role)) return null;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-indigo-600' : 'text-gray-400'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                    <span className="font-bold text-indigo-600">Unified ERP</span>
                    <Menu className="w-6 h-6 text-gray-600" />
                </div>
                {children}
            </main>
        </div>
    );
};

export default Layout;
