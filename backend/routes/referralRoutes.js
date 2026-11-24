
const express = require("express");
const router = express.Router();

const {
    createReferralRequest,
    getMyReferralRequests,
    updateReferralStatus,
    getEligibleAlumni,
    getStudentReferralRequests
} = require("../controllers/referralController");

const {
    authMiddleware,
    authorizeRole
} = require("../middleware/authMiddleware");

// ==========================================
// STUDENT ROUTES
// ==========================================

// Student submits a referral request
router.post(
    "/",
    authMiddleware,
    authorizeRole("Student"),
    createReferralRequest
);

// Student finds eligible alumni for an application
router.get(
    "/eligible/:applicationId",
    authMiddleware,
    authorizeRole("Student"),
    getEligibleAlumni
);

// Student views their referral requests
router.get(
    "/student/my-requests",
    authMiddleware,
    authorizeRole("Student"),
    getStudentReferralRequests
);


// ==========================================
// ALUMNI ROUTES
// ==========================================

// Alumni views incoming referral requests
router.get(
    "/my-requests",
    authMiddleware,
    authorizeRole("Alumni"),
    getMyReferralRequests
);

// Alumni accepts or declines a referral
router.patch(
    "/:id/status",
    authMiddleware,
    authorizeRole("Alumni"),
    updateReferralStatus
);

module.exports = router;
