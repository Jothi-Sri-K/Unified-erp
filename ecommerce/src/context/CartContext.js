import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const { token, customer } = useContext(AuthContext);

    const fetchCart = async () => {
        if (!token) {
            setCart([]);
            return;
        }
        try {
            const res = await axios.get('/api/store/cart');
            // Format to match old structure for easier UI migration
            const formattedCart = res.data.map(item => ({
                id: item.Product.id,
                cartItemId: item.id,
                name: item.Product.name,
                price: parseFloat(item.Product.price),
                quantity: item.quantity,
                total_stock: item.Product.total_stock,
                sku: item.Product.sku || 'SKU-000',
                category: item.Product.category || 'Item'
            }));
            setCart(formattedCart);
        } catch (err) {
            console.error("Failed to fetch cart", err);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [token]);

    const addToCart = async (product) => {
        if (!token) {
            alert("Please login to add to cart");
            return;
        }
        try {
            await axios.post('/api/store/cart/add', { product_id: product.id, quantity: 1 });
            await fetchCart(); // Refresh cart from server
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add to cart");
        }
    };

    const removeFromCart = async (cartItemId) => {
        if (!token) return;
        try {
            await axios.delete(`/api/store/cart/remove/${cartItemId}`);
            await fetchCart();
        } catch (err) {
            console.error("Failed to remove item", err);
        }
    };

    const updateQuantity = async (cartItemId, quantity) => {
        try {
            await axios.put(`/api/store/cart/update/${cartItemId}`, { quantity });
            await fetchCart();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update quantity");
        }
    }

    const clearCart = () => setCart([]); // Locally clear after checkout success

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};
