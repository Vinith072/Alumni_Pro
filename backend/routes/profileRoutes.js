
const express = require("express");
const router = express.Router();

const {
    getStudentProfile,
    updateStudentProfile,
    getAlumniProfile,
    updateAlumniProfile,
    getAdminProfile,
    updateAdminProfile
} = require("../controllers/profileController");

const {
    authMiddleware,
    authorizeRole
} = require("../middleware/authMiddleware");

// ==========================================
// STUDENT PROFILE ROUTES
// ==========================================

router.get(
    "/me",
    authMiddleware,
    authorizeRole("Student"),
    getStudentProfile
);

router.put(
    "/me",
    authMiddleware,
    authorizeRole("Student"),
    updateStudentProfile
);


// ==========================================
// ALUMNI PROFILE ROUTES
// ==========================================

router.get(
    "/alumni/me",
    authMiddleware,
    authorizeRole("Alumni"),
    getAlumniProfile
);

router.put(
    "/alumni/me",
    authMiddleware,
    authorizeRole("Alumni"),
    updateAlumniProfile
);


// ==========================================
// ADMIN PROFILE ROUTES
// ==========================================

router.get(
    "/admin/me",
    authMiddleware,
    authorizeRole("Admin"),
    getAdminProfile
);

router.put(
    "/admin/me",
    authMiddleware,
    authorizeRole("Admin"),
    updateAdminProfile
);

module.exports = router;
