
const express = require("express");
const router = express.Router();

const {
    applyForJob,
    getMyApplications,
    getMyApplicationHistory,
    getStudentDashboardStats
} = require("../controllers/applicationController");

const {
    authMiddleware,
    authorizeRole
} = require("../middleware/authMiddleware");

// Student: Apply for a job
router.post(
    "/",
    authMiddleware,
    authorizeRole("Student"),
    applyForJob
);

// Student: View their own applications
router.get(
    "/my-applications",
    authMiddleware,
    authorizeRole("Student"),
    getMyApplications
);

// Student: View their application history
router.get(
    "/my-history",
    authMiddleware,
    authorizeRole("Student"),
    getMyApplicationHistory
);

// Student: View dashboard statistics
router.get(
    "/dashboard-stats",
    authMiddleware,
    authorizeRole("Student"),
    getStudentDashboardStats
);

module.exports = router;
