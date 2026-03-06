import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { token } = useContext(AuthContext);

    const fetchWishlist = async () => {
        if (!token) {
            setWishlist([]);
            return;
        }
        try {
            const res = await axios.get('/api/store/wishlist');
            const formatted = res.data.map(item => ({
                id: item.Product.id,
                name: item.Product.name,
                price: parseFloat(item.Product.price),
                total_stock: item.Product.total_stock
            }));
            setWishlist(formatted);
        } catch (err) {
            console.error("Failed to fetch wishlist", err);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [token]);

    const toggleWishlist = async (product) => {
        if (!token) {
            alert("Please login to manage wishlist");
            return;
        }

        const isWishlisted = wishlist.find(i => i.id === product.id);

        try {
            if (isWishlisted) {
                await axios.delete(`/api/store/wishlist/remove/${product.id}`);
            } else {
                await axios.post('/api/store/wishlist/add', { product_id: product.id });
            }
            fetchWishlist();
        } catch (err) {
            console.error("Wishlist toggle failed", err);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
