import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('storeToken') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Ideally an endpoint /api/store/auth/me should exist. For now we will rely on local storage state.
            // If we strictly needed it, we would fetch user info here.
            const savedCustomer = localStorage.getItem('storeCustomer');
            if (savedCustomer) setCustomer(JSON.parse(savedCustomer));
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setCustomer(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post('/api/store/auth/login', { email, password });
        setToken(res.data.token);
        setCustomer(res.data.customer);
        localStorage.setItem('storeToken', res.data.token);
        localStorage.setItem('storeCustomer', JSON.stringify(res.data.customer));
    };

    const signup = async (name, email, password, phone) => {
        await axios.post('/api/store/auth/signup', { name, email, password, phone });
    };

    const logout = () => {
        setToken(null);
        setCustomer(null);
        localStorage.removeItem('storeToken');
        localStorage.removeItem('storeCustomer');
    };

    return (
        <AuthContext.Provider value={{ customer, token, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
