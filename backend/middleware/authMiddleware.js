const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model

module.exports = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);

        // 🚨 Re-verify user from Database to prevent disabled users from accessing APIs
        const user = await User.findByPk(decoded.id);
        if (!user || user.status === 'DISABLED') {
            return res.status(401).json({ message: "Account disabled or not found." });
        }

        req.user = user; // Attach full user object (including latest role & status)
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};