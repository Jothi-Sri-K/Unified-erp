import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Trash2, ArrowRight, CheckCircle, Store, ShieldCheck, MapPin } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useContext(CartContext);
    const { customer } = useContext(AuthContext);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [phone, setPhone] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        street: '', city: '', state: '', zipCode: '', country: 'India'
    });

    useEffect(() => {
        if (customer) {
            setPhone(customer.phone || '');
            fetchAddresses();
        }
    }, [customer]);

    const fetchAddresses = async () => {
        try {
            const res = await axios.get('/api/store/user/addresses');
            setAddresses(res.data);
            const defaultAddr = res.data.find(a => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
        } catch (err) {
            console.error("Failed to fetch addresses:", err);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAddress) {
                await axios.put(`/api/store/user/addresses/${editingAddress.id}`, formData);
            } else {
                await axios.post('/api/store/user/addresses', formData);
            }
            setShowAddressForm(false);
            setEditingAddress(null);
            setFormData({ street: '', city: '', state: '', zipCode: '', country: 'India' });
            fetchAddresses();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to save address");
        }
    };

    const handleEditAddress = (addr) => {
        setFormData({
            street: addr.street,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country
        });
        setEditingAddress(addr);
        setShowAddressForm(true);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (!customer) {
            navigate('/login');
            return;
        }

        const selectedAddress = addresses.find(a => a.id == selectedAddressId);
        if (!selectedAddress) {
            alert("Please select a delivery address.");
            return;
        }
        if (!phone) {
            alert("Please provide a contact phone number.");
            return;
        }

        setIsCheckingOut(true);

        try {
            const res = await axios.post('/api/store/orders/checkout', {
                shippingDetails: selectedAddress,
                phone: phone
            });

            setSuccessMsg(`Order #${res.data.orderId} placed! Invoice emailed.`);
            clearCart();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to process checkout. Item might be out of stock!");
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (successMsg) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <div className="card border-0 shadow-lg p-5 text-center" style={{ maxWidth: '500px', width: '100%', borderRadius: '2rem' }}>
                    <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="fw-bolder mb-3">Payment Successful!</h2>
                    <p className="text-muted mb-4 lead">{successMsg}</p>
                    <div className="d-grid gap-3">
                        <Link to="/dashboard" className="btn btn-dark btn-lg fw-bold rounded-pill shadow-sm">
                            View Dashboard
                        </Link>
                        <Link to="/" className="btn btn-link text-muted fw-bold text-decoration-none">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '50vh' }}>
                <div className="bg-light p-4 rounded-circle mb-4 position-relative">
                    <ShoppingBag size={48} className="text-secondary" />
                </div>
                <h3 className="fw-bolder mb-2">Your cart is empty</h3>
                <p className="text-muted mb-4">Looks like you haven't made your choice yet. Explore our synced inventory.</p>
                <Link to="/" className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2">
                    Explore Storefront <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h2 className="fw-bolder mb-4">Shopping Cart</h2>

            <div className="row g-5">
                {/* Cart Items */}
                <div className="col-lg-8">
                    <div className="d-flex flex-column gap-3">
                        {cart.map(item => (
                            <div key={item.cartItemId || item.id} className="card border-0 shadow-sm rounded-4 p-4 d-flex flex-column flex-sm-row align-items-sm-center gap-4">

                                <div className="bg-light rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '100px', height: '100px' }}>
                                    <Store className="text-secondary opacity-50" size={32} />
                                </div>

                                <div className="flex-grow-1">
                                    <p className="small text-muted fw-bold mb-1 tracking-widest">{item.sku}</p>
                                    <h5 className="fw-bold mb-2">{item.name}</h5>
                                    <div className="d-flex align-items-center gap-3">
                                        <span className="fw-bolder text-primary fs-5">₹{item.price}</span>
                                        <div className="border-start" style={{ height: '20px' }}></div>
                                        <select
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.cartItemId, parseInt(e.target.value))}
                                            className="form-select form-select-sm fw-bold border-0 bg-light rounded-3"
                                            style={{ width: 'auto' }}
                                        >
                                            {[...Array(Math.min(10, item.total_stock)).keys()].map(x => (
                                                <option key={x + 1} value={x + 1}>{x + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="d-flex flex-sm-column align-items-center align-items-sm-end justify-content-between w-100 w-sm-auto mt-3 mt-sm-0">
                                    <p className="fs-4 fw-bolder mb-0 mb-sm-3">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    <button
                                        onClick={() => removeFromCart(item.cartItemId || item.id)}
                                        className="btn btn-outline-danger btn-sm p-2 rounded-3 border-0 bg-danger bg-opacity-10 d-flex align-items-center"
                                        title="Remove Item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Checkout Summary */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
                        <h4 className="fw-bolder mb-4">Order Summary</h4>

                        <div className="d-flex flex-column gap-3 mb-4 pb-4 border-bottom text-muted">
                            <div className="d-flex justify-content-between">
                                <span>Subtotal</span>
                                <span className="fw-bold text-dark">₹{cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Shipping</span>
                                <span className="fw-bold text-success">Free</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Tax (Estimated)</span>
                                <span className="fw-bold text-dark">₹0</span>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="fw-bold text-dark">Total</span>
                            <span className="display-6 fw-bolder text-primary">₹{cartTotal.toLocaleString()}</span>
                        </div>

                        {/* Delivery Address & Phone Info */}
                        <div className="mb-4">
                            <h6 className="fw-bolder mb-3">Delivery Information</h6>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted mb-1">Contact Number</label>
                                <input type="text" className="form-control form-control-sm" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted mb-1">Select Delivery Address</label>
                                {addresses.length === 0 ? (
                                    <p className="small text-danger mb-2">No saved addresses found. Please add one.</p>
                                ) : (
                                    <select
                                        className="form-select form-select-sm mb-2 text-truncate"
                                        value={selectedAddressId}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                        style={{ maxWidth: '100%' }}
                                    >
                                        <option value="" disabled>Select Address</option>
                                        {addresses.map(addr => (
                                            <option key={addr.id} value={addr.id}>
                                                {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-primary fw-medium flex-fill" onClick={() => { setEditingAddress(null); setFormData({ street: '', city: '', state: '', zipCode: '', country: 'India' }); setShowAddressForm(true); }}>
                                        + New Address
                                    </button>
                                    {selectedAddressId && (
                                        <button className="btn btn-sm btn-outline-secondary fw-medium flex-fill" onClick={() => handleEditAddress(addresses.find(a => a.id == selectedAddressId))}>
                                            Edit Selected
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Inline Address Form */}
                            {showAddressForm && (
                                <div className="bg-light p-3 rounded-3 mt-3 border">
                                    <h6 className="fw-bold mb-3 small">{editingAddress ? 'Edit Address' : 'Add New Address'}</h6>
                                    <form onSubmit={handleAddressSubmit}>
                                        <div className="mb-2">
                                            <input type="text" className="form-control form-control-sm" placeholder="Street Address" required value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                                        </div>
                                        <div className="row g-2 mb-2">
                                            <div className="col-6">
                                                <input type="text" className="form-control form-control-sm" placeholder="City" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                            </div>
                                            <div className="col-6">
                                                <input type="text" className="form-control form-control-sm" placeholder="State/Province" required value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="row g-2 mb-3">
                                            <div className="col-6">
                                                <input type="text" className="form-control form-control-sm" placeholder="Zip/Postal Code" required value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} />
                                            </div>
                                            <div className="col-6">
                                                <input type="text" className="form-control form-control-sm" placeholder="Country" required value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button type="button" className="btn btn-sm btn-outline-secondary w-100" onClick={() => setShowAddressForm(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-sm btn-primary w-100">Save Address</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut || !customer}
                            className={`btn btn-dark btn-lg w-100 fw-bold rounded-pill shadow-sm mb-3`}
                        >
                            {isCheckingOut ? 'Processing...' : !customer ? 'Login to Checkout' : 'Pay & Place Order'}
                        </button>

                        <div className="d-flex align-items-center justify-content-center gap-2 small fw-medium text-muted">
                            <ShieldCheck size={16} /> Encrypted ERP Transaction
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
