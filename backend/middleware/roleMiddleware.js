module.exports = (roles) => {
    return (req, res, next) => {
        // req.user is set by our previous authMiddleware
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied: You don't have permission for this." });
        }
        next();
    };
};