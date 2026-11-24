
const pool = require("../config/db");

// Apply for a job

const applyForJob = async (req, res) => {
    const client = await pool.connect();

    try {
        const { job_id } = req.body;
        const student_id = req.user.userId;

        if (
            !job_id ||
            !Number.isInteger(Number(job_id)) ||
            Number(job_id) <= 0
        ) {
            return res.status(400).json({
                message: "Please provide a valid job ID."
            });
        }

        await client.query("BEGIN");

        // Check whether the job exists and is active
        const job = await client.query(
            `SELECT job_id
             FROM jobs
             WHERE job_id = $1
               AND is_deleted = FALSE
             FOR UPDATE`,
            [job_id]
        );

        if (job.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Job not found or is no longer available."
            });
        }

        // Prevent duplicate applications
        const existing = await client.query(
            `SELECT application_id
             FROM applications
             WHERE job_id = $1
               AND student_id = $2`,
            [job_id, student_id]
        );

        if (existing.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "You have already applied for this job."
            });
        }

        // Create application
        const result = await client.query(
            `INSERT INTO applications
             (job_id, student_id, status)
             VALUES ($1, $2, 'Applied')
             RETURNING *`,
            [job_id, student_id]
        );

        const application = result.rows[0];

        // Record initial application status
        await client.query(
            `INSERT INTO application_status_history
             (application_id, old_status, new_status, changed_by, remarks)
             VALUES ($1, NULL, 'Applied', $2, $3)`,
            [
                application.application_id,
                student_id,
                "Initial job application"
            ]
        );

        await client.query("COMMIT");

        return res.status(201).json({
            message: "Job application submitted successfully!",
            application
        });

    } catch (error) {
        await client.query("ROLLBACK");

        if (error.code === "23505") {
            return res.status(409).json({
                message: "You have already applied for this job."
            });
        }

        console.error("Apply for job error:", error.message);

        return res.status(500).json({
            message: "Server error while applying for job."
        });

    } finally {
        client.release();
    }
};



const getMyApplications = async (req, res) => {
    try {
        const student_id = req.user.userId;

        const result = await pool.query(
            `SELECT
                a.application_id,
                a.job_id,
                a.status,
                a.applied_at,
                j.job_title,
                j.company_name,
                j.location,
                j.employment_type
             FROM applications a
             JOIN jobs j ON a.job_id = j.job_id
             WHERE a.student_id = $1
             ORDER BY a.applied_at DESC`,
            [student_id]
        );

        res.status(200).json({
            count: result.rows.length,
            applications: result.rows
        });

    } catch (error) {
        console.error("Get applications error:", error.message);

        res.status(500).json({
            message: "Server error while fetching applications."
        });
    }
};


const getMyApplicationHistory = async (req, res) => {
    try {
        const studentId = req.user.userId;

        const result = await pool.query(
            `SELECT
                h.history_id,
                h.application_id,
                h.old_status,
                h.new_status,
                h.changed_at,
                h.remarks,
                u.full_name AS changed_by_name,
                u.role AS changed_by_role
             FROM application_status_history h
             JOIN applications a
                ON h.application_id = a.application_id
             JOIN users u
                ON h.changed_by = u.user_id
             WHERE a.student_id = $1
             ORDER BY h.changed_at ASC`,
            [studentId]
        );

        res.status(200).json({
            count: result.rows.length,
            history: result.rows
        });

    } catch (error) {
        console.error("Student history error:", error.message);

        res.status(500).json({
            message: "Server error while fetching your application history."
        });
    }
};

const getStudentDashboardStats = async (req, res) => {
    try {
        const studentId = req.user.userId;

        const result = await pool.query(
            `SELECT
                (SELECT COUNT(*)::int
                 FROM jobs) AS total_jobs,

                COUNT(*)::int AS total_applications,

                COUNT(*) FILTER (
                    WHERE status = 'Applied'
                )::int AS applied,

                COUNT(*) FILTER (
                    WHERE status = 'Referred'
                )::int AS referred,

                COUNT(*) FILTER (
                    WHERE status = 'Shortlisted'
                )::int AS shortlisted,

                COUNT(*) FILTER (
                    WHERE status = 'Interviewed'
                )::int AS interviewed,

                COUNT(*) FILTER (
                    WHERE status = 'Selected'
                )::int AS selected,

                COUNT(*) FILTER (
                    WHERE status = 'Rejected'
                )::int AS rejected

             FROM applications
             WHERE student_id = $1`,
            [studentId]
        );

        res.status(200).json({
            message: "Student dashboard statistics fetched successfully.",
            statistics: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Student dashboard statistics error:",
            error.message
        );

        res.status(500).json({
            message: "Server error while fetching dashboard statistics."
        });
    }
};



module.exports = {
    applyForJob,
    getMyApplications,
    getMyApplicationHistory,
    getStudentDashboardStats
};
