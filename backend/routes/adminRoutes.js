
const express = require("express");
const router = express.Router();

const {
    getPendingAlumni,
    updateAlumniVerification,
    getAdminDashboardStats,
    getAllUsers,
    deactivateUser,
    reactivateUser
} = require("../controllers/adminController");

const {
    authMiddleware,
    authorizeRole
} = require("../middleware/authMiddleware");

// Only Admin can view pending alumni
router.get(
    "/alumni/pending",
    authMiddleware,
    authorizeRole("Admin"),
    getPendingAlumni
);

// Admin: View dashboard statistics
router.get(
    "/dashboard-stats",
    authMiddleware,
    authorizeRole("Admin"),
    getAdminDashboardStats
);

// Admin: View all registered users
router.get(
    "/users",
    authMiddleware,
    authorizeRole("Admin"),
    getAllUsers
);
// Only Admin can approve or reject alumni
router.patch(
    "/alumni/:id/verification",
    authMiddleware,
    authorizeRole("Admin"),
    updateAlumniVerification
);

// Admin: Deactivate a Student or Alumni account
router.patch(
    "/users/:id/deactivate",
    authMiddleware,
    authorizeRole("Admin"),
    deactivateUser
);

// Admin: Reactivate a user account
router.patch(
    "/users/:id/reactivate",
    authMiddleware,
    authorizeRole("Admin"),
    reactivateUser
);
module.exports = router;

