
const express = require("express");
const router = express.Router();

const {
    createJob,
    getAllJobs,
    getJobById,
    addJobSkills,
    getAllSkills,
    getMyJobs,
    updateJob,
    deleteJob,
    getJobStatistics
} = require("../controllers/jobController");

const {
    authMiddleware,
    authorizeRole
} = require("../middleware/authMiddleware");

// Alumni: Create a job
router.post(
    "/",
    authMiddleware,
    authorizeRole("Alumni"),
    createJob
);

// Public: Get all jobs
router.get("/", getAllJobs);

// Public: Get all available skills
router.get("/skills", getAllSkills);

// Alumni: Get their own jobs
router.get(
    "/my-jobs",
    authMiddleware,
    authorizeRole("Alumni"),
    getMyJobs
);

// Alumni: Add skills to their own job
router.post(
    "/:id/skills",
    authMiddleware,
    authorizeRole("Alumni"),
    addJobSkills
);

// Alumni: Update their own job posting
router.put(
    "/:id",
    authMiddleware,
    authorizeRole("Alumni"),
    updateJob
);

// Alumni: Delete their own job posting
router.delete(
    "/:id",
    authMiddleware,
    authorizeRole("Alumni"),
    deleteJob
);

// Alumni: View job application statistics
router.get(
    "/statistics",
    authMiddleware,
    authorizeRole("Alumni"),
    getJobStatistics
);

// Public: Get individual job details
router.get("/:id", getJobById);

module.exports = router;
