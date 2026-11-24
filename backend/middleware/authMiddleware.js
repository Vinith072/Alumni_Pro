
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify JWT token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Check whether the user account is active
        const result = await pool.query(
            `SELECT user_id, role, is_active
             FROM users
             WHERE user_id = $1`,
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({
                message: "Your account has been deactivated. Please contact the administrator."
            });
        }

        // Confirm the token role matches the database role
        if (user.role !== decoded.role) {
            return res.status(403).json({
                message: "Invalid user permissions."
            });
        }

        req.user = {
            userId: user.user_id,
            role: user.role
        };

        next();

    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Invalid or expired token."
            });
        }

        console.error("Authentication error:", error.message);

        return res.status(500).json({
            message: "Authentication failed."
        });
    }
};


// Check user role
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You are not authorized to access this resource."
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    authorizeRole
};
