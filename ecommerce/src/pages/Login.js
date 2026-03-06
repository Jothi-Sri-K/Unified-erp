import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '75vh' }}>
            <div className="card border-0 shadow-lg p-4 p-md-5" style={{ maxWidth: '450px', width: '100%', borderRadius: '1.5rem' }}>

                <div className="text-center mb-4">
                    <div className="d-inline-flex bg-primary text-white p-3 rounded-circle shadow-sm mb-3">
                        <Store size={32} />
                    </div>
                    <h2 className="fw-bolder text-dark">Welcome back</h2>
                    <p className="text-muted small">Sign in to access your orders and wishlist</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-danger py-2 px-3 small border-0 bg-opacity-10 fw-medium">
                            {error}
                        </div>
                    )}

                    <div className="mb-3 position-relative">
                        <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                            <Mail size={18} />
                        </span>
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

                    <div className="mb-4 position-relative">
                        <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                            <Lock size={18} />
                        </span>
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
                        className="btn btn-dark btn-lg w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                        style={{ borderRadius: '1rem' }}
                    >
                        {loading ? 'Signing in...' : <>Sign In <ArrowRight size={18} /></>}
                    </button>

                    <div className="text-center mt-4 pt-2 border-top">
                        <p className="text-muted small mb-0">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary text-decoration-none fw-bold">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
