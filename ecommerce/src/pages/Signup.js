import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react';

const Signup = () => {
    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(formData.name, formData.email, formData.password, formData.phone);
            setSuccess("Registration successful! (Simulating verification). Please login.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center py-5">
            <div className="card border-0 shadow-lg p-4 p-md-5" style={{ maxWidth: '500px', width: '100%', borderRadius: '1.5rem' }}>

                <div className="text-center mb-4">
                    <h2 className="fw-bolder text-dark">Create Account</h2>
                    <p className="text-muted small">Join our unified store today</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-danger py-2 px-3 small border-0 fw-medium">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success py-2 px-3 small border-0 fw-medium">
                            {success}
                        </div>
                    )}

                    <div className="mb-3 position-relative">
                        <span className="position-absolute top-50 translate-middle-y ms-3 text-muted"><User size={18} /></span>
                        <input
                            type="text"
                            required
                            className="form-control form-control-lg bg-light border-0 ps-5"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ borderRadius: '1rem' }}
                        />
                    </div>

                    <div className="mb-3 position-relative">
                        <span className="position-absolute top-50 translate-middle-y ms-3 text-muted"><Mail size={18} /></span>
                        <input
                            type="email"
                            required
                            className="form-control form-control-lg bg-light border-0 ps-5"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={{ borderRadius: '1rem' }}
                        />
                    </div>

                    <div className="mb-3 position-relative">
                        <span className="position-absolute top-50 translate-middle-y ms-3 text-muted"><Phone size={18} /></span>
                        <input
                            type="text"
                            className="form-control form-control-lg bg-light border-0 ps-5"
                            placeholder="Phone Number (Optional)"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            style={{ borderRadius: '1rem' }}
                        />
                    </div>

                    <div className="mb-4 position-relative">
                        <span className="position-absolute top-50 translate-middle-y ms-3 text-muted"><Lock size={18} /></span>
                        <input
                            type="password"
                            required
                            className="form-control form-control-lg bg-light border-0 ps-5"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ borderRadius: '1rem' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-lg w-100 fw-bold shadow-sm"
                        style={{ borderRadius: '1rem' }}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="text-center mt-4">
                        <Link to="/login" className="text-decoration-none fw-medium text-muted">
                            Already have an account? <span className="text-primary text-decoration-underline">Sign in</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
