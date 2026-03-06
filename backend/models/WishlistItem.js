const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Wishlist = require('./Wishlist');
const Product = require('./Product');

const WishlistItem = sequelize.define('WishlistItem', {
    wishlist_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Wishlist,
            key: 'id'
        },
        allowNull: false
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id'
        },
        allowNull: false
    }
}, { timestamps: true });

Wishlist.hasMany(WishlistItem, { foreignKey: 'wishlist_id' });
WishlistItem.belongsTo(Wishlist, { foreignKey: 'wishlist_id' });

Product.hasMany(WishlistItem, { foreignKey: 'product_id' });
WishlistItem.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = WishlistItem;
