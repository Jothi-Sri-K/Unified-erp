import React, { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import { HeartCrack, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
    const { wishlist, toggleWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    if (wishlist.length === 0) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: '50vh' }}>
                <div className="bg-danger bg-opacity-10 p-4 rounded-circle mb-4">
                    <HeartCrack className="text-danger opacity-75" size={64} />
                </div>
                <h2 className="display-6 fw-bolder text-dark mb-3">Your wishlist is empty</h2>
                <p className="text-muted lead mx-auto mb-5" style={{ maxWidth: '400px' }}>
                    Discover our collection of premium ERP-synced products and save your favorites here.
                </p>
                <Link
                    to="/"
                    className="btn btn-dark btn-lg fw-bold rounded-pill px-5 shadow-sm d-inline-flex align-items-center gap-2"
                >
                    Explore Storefront <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h1 className="display-5 fw-bolder text-dark mb-2">Saved Items</h1>
            <p className="lead text-muted mb-5">Products you're keeping an eye on.</p>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                {wishlist.map((item) => (
                    <div key={item.id} className="col">
                        <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative group-wishlist transition-all">

                            {/* Image Placeholder */}
                            <div className="bg-light d-flex align-items-center justify-content-center position-relative" style={{ aspectRatio: '1/1' }}>
                                <span className="text-muted fw-bold text-uppercase small tracking-widest">Item Placeholder</span>

                                {/* Remove button overlay */}
                                <button
                                    onClick={() => toggleWishlist(item)}
                                    className="btn btn-light text-danger position-absolute top-0 end-0 m-3 rounded-circle p-2 shadow-sm btn-remove opacity-0 transition-all z-2"
                                >
                                    <HeartCrack size={18} />
                                </button>

                                {item.total_stock <= 0 && (
                                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center z-1" style={{ backdropFilter: 'blur(2px)' }}>
                                        <span className="badge bg-danger fs-5 px-3 py-2 shadow-sm" style={{ transform: 'rotate(-5deg)' }}>SOLD OUT</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="card-body d-flex flex-column p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <h5 className="card-title fw-bold text-dark mb-0 pe-2">{item.name}</h5>
                                    <span className="fs-5 fw-bolder text-primary">₹{item.price}</span>
                                </div>

                                <div className="mt-auto d-grid pt-3">
                                    <button
                                        onClick={() => {
                                            addToCart(item);
                                            toggleWishlist(item); // Remove from wishlist on add to cart
                                        }}
                                        disabled={item.total_stock <= 0}
                                        className="btn btn-dark fw-bold rounded-3 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm w-100"
                                    >
                                        <ShoppingCart size={18} />
                                        Move to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <style jsx="true">{`
                .group-wishlist:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; transform: translateY(-3px); }
                .group-wishlist:hover .btn-remove { opacity: 1 !important; transform: scale(1.1); }
            `}</style>
        </div>
    );
};

export default WishlistPage;
