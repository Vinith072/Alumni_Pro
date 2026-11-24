
const express = require("express");
const router = express.Router();

const {
    updateApplicationStatus,
    getAllApplications,
    getApplicationHistory
} = require("../controllers/applicationStatusController");

const {
    authMiddleware,
    authorizeRole
} = require("../middleware/authMiddleware");

// Admin: View all applications
router.get(
    "/",
    authMiddleware,
    authorizeRole("Admin"),
    getAllApplications
);

// Admin: View application status history
router.get(
    "/:id/history",
    authMiddleware,
    authorizeRole("Admin"),
    getApplicationHistory
);

// Admin: Update application status
router.patch(
    "/:id/status",
    authMiddleware,
    authorizeRole("Admin"),
    updateApplicationStatus
);



module.exports = router;
