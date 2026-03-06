import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, Heart, LogOut, LayoutDashboard } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { cartCount, cartTotal } = useContext(CartContext);
    const { customer, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-vh-100 bg-light d-flex flex-column" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            {/* Top Navigation */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-3 shadow-sm">
                <div className="container">
                    {/* Brand */}
                    <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
                        <div className="bg-primary text-white p-2 rounded shadow-sm">
                            <Store size={22} />
                        </div>
                        <span className="fw-bold fs-4 text-dark tracking-tight">Unified Store</span>
                    </Link>

                    {/* Navbar Toggler for Mobile */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Nav Items */}
                    <div className="collapse navbar-collapse justify-content-end" id="navbarContent">
                        <ul className="navbar-nav align-items-center gap-3">

                            {customer ? (
                                <>
                                    <li className="nav-item">
                                        <Link to="/wishlist" className="nav-link text-danger d-flex align-items-center gap-1">
                                            <Heart size={20} />
                                            <span className="d-lg-none">Wishlist</span>
                                        </Link>
                                    </li>

                                    <li className="nav-item dropdown">
                                        <button className="btn btn-light rounded-pill border d-flex align-items-center gap-2 px-3 fw-medium dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                                {customer.name?.charAt(0).toUpperCase()}
                                            </div>
                                            {customer.name.split(' ')[0]}
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                                            <li>
                                                <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/dashboard">
                                                    <LayoutDashboard size={16} className="text-secondary" /> My Account
                                                </Link>
                                            </li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li>
                                                <button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={handleLogout}>
                                                    <LogOut size={16} /> Sign out
                                                </button>
                                            </li>
                                        </ul>
                                    </li>
                                </>
                            ) : (
                                <li className="nav-item">
                                    <Link to="/login" className="nav-link fw-semibold text-dark">
                                        Sign In
                                    </Link>
                                </li>
                            )}

                            {/* Cart Item */}
                            <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                                <Link
                                    to="/cart"
                                    className="btn btn-dark rounded-pill d-flex align-items-center px-4 py-2 gap-2 shadow-sm"
                                >
                                    <ShoppingCart size={18} />
                                    {cartCount > 0 && (
                                        <span className="badge bg-primary rounded-pill">
                                            {cartCount}
                                        </span>
                                    )}
                                    {cartCount > 0 && <span className="ms-2 fw-bold">₹{cartTotal.toLocaleString()}</span>}
                                </Link>
                            </li>

                        </ul>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-grow-1 w-100 py-5" style={{ animation: "fadeIn 0.5s ease-out" }}>
                <div className="container">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-top py-5 mt-auto">
                <div className="container">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                        <div className="d-flex align-items-center gap-2 text-muted fw-bold tracking-wide">
                            <Store size={20} /> UNIFIED STORE
                        </div>
                        <div className="text-muted small">
                            Powered by Unified ERP Integration &copy; {new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx="true">{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Layout;
