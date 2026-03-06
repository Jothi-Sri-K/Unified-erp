import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ShoppingCart, AlertTriangle, Heart, ShieldCheck, Truck, Clock } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const { customer } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/api/store/products');
                setProducts(res.data);
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="container py-4">
            {/* Hero Section */}
            <div className="bg-dark text-white rounded-4 overflow-hidden shadow mb-5 position-relative" style={{ minHeight: '400px' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-25" style={{ mixBlendMode: 'overlay' }}></div>

                <div className="position-relative z-1 p-4 p-lg-5 col-lg-8 d-flex flex-column justify-content-center h-100">
                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-10 border border-white border-opacity-25 mb-4" style={{ width: 'fit-content' }}>
                        <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
                        <span className="small fw-bold text-white text-uppercase tracking-wide">Live ERP Sync Active</span>
                    </div>

                    <h1 className="display-4 fw-bolder mb-3">
                        Next-Gen <br /><span className="text-primary">Commerce.</span>
                    </h1>
                    <p className="lead text-light mb-4">
                        Experience seamless synchronization between our storefront and backend Unified ERP. Real-time inventory, secure transactions.
                    </p>
                    <div>
                        <button onClick={() => {
                            if (customer) {
                                window.scrollTo({ top: 600, behavior: 'smooth' });
                            } else {
                                navigate('/login');
                            }
                        }} className="btn btn-light btn-lg fw-bold px-4 rounded-pill shadow-sm">
                            {customer ? 'Explore Collection' : 'Login to Explore'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Bar */}
            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="d-flex align-items-center gap-3 bg-white p-4 rounded-4 border shadow-sm">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary"><ShieldCheck size={28} /></div>
                        <div>
                            <h5 className="fw-bold mb-1">Secure Checkout</h5>
                            <p className="small text-muted mb-0">100% encrypted transactions</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="d-flex align-items-center gap-3 bg-white p-4 rounded-4 border shadow-sm">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success"><Truck size={28} /></div>
                        <div>
                            <h5 className="fw-bold mb-1">Fast Delivery</h5>
                            <p className="small text-muted mb-0">Synced with warehouse</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="d-flex align-items-center gap-3 bg-white p-4 rounded-4 border shadow-sm">
                        <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger"><Clock size={28} /></div>
                        <div>
                            <h5 className="fw-bold mb-1">Real-time Stock</h5>
                            <p className="small text-muted mb-0">No overselling, ever</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            {customer && (
                <div id="products">
                    <div className="mb-4">
                        <h2 className="fw-bolder">Featured Products</h2>
                        <p className="text-muted">Direct from our integrated inventory.</p>
                    </div>

                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                        {products.map(product => {
                            const isOutOfStock = product.isOutOfStock;
                            const isLowStock = product.isLowStock;
                            const wishlisted = isInWishlist(product.id);

                            return (
                                <div key={product.id} className="col">
                                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative group-hover-lift transition-all">

                                        {/* Image Placeholder */}
                                        <div className="bg-light d-flex align-items-center justify-content-center position-relative" style={{ aspectRatio: '4/3' }}>
                                            <span className="text-muted fw-bold text-uppercase small tracking-widest">{product.category}</span>

                                            {/* Badges */}
                                            <div className="position-absolute top-0 start-0 p-3 d-flex flex-column gap-2">
                                                {isOutOfStock ? (
                                                    <span className="badge bg-dark rounded-pill py-2 px-3 shadow-sm">SOLD OUT</span>
                                                ) : isLowStock ? (
                                                    <span className="badge bg-danger rounded-pill py-2 px-3 d-flex align-items-center gap-1 shadow-sm">
                                                        <AlertTriangle size={12} /> Only {product.total_stock} left
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-white text-dark border rounded-pill py-2 px-3 shadow-sm">IN STOCK</span>
                                                )}
                                            </div>

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleWishlist(product);
                                                }}
                                                className={`btn position-absolute top-0 end-0 m-3 rounded-circle p-2 shadow-sm ${wishlisted ? 'btn-danger text-white' : 'btn-light text-muted'}`}
                                                style={{ opacity: customer ? 1 : 0 }}
                                            >
                                                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="card-body d-flex flex-column p-4">
                                            <div className="mb-3">
                                                <p className="small text-muted fw-bold mb-1 tracking-widest">{product.sku}</p>
                                                <h5 className="card-title fw-bold text-truncate">{product.name}</h5>
                                            </div>

                                            <div className="mt-auto d-flex align-items-center justify-content-between">
                                                <span className="fs-4 fw-bolder text-primary">₹{product.price}</span>
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    disabled={isOutOfStock}
                                                    className={`btn rounded-3 ${isOutOfStock ? 'btn-light text-muted' : 'btn-dark'} p-2 shadow-sm`}
                                                    title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                                >
                                                    <ShoppingCart size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


            <style jsx="true">{`
                .group-hover-lift {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .group-hover-lift:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
                }
            `}</style>
        </div>
    );
};

export default Home;
