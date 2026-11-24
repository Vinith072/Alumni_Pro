
const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");

const {
    authMiddleware
} = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// Protected route
router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "Authentication successful!",
        user: req.user
    });
});

module.exports = router;
