
const pool = require("../config/db");

const updateApplicationStatus = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        const admin_id = req.user.userId;

        const allowedStatuses = [
            "Applied",
            "Referred",
            "Shortlisted",
            "Interviewed",
            "Selected",
            "Rejected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid application status."
            });
        }

        await client.query("BEGIN");

        const application = await client.query(
            `SELECT status
             FROM applications
             WHERE application_id = $1
             FOR UPDATE`,
            [id]
        );

        if (application.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Application not found."
            });
        }

        const oldStatus = application.rows[0].status;

        if (["Selected", "Rejected"].includes(oldStatus)) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "This application is already in a final status."
            });
        }

        if (oldStatus === status) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "Application already has this status."
            });
        }

        await client.query(
            `UPDATE applications
             SET status = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE application_id = $2`,
            [status, id]
        );

        await client.query(
            `INSERT INTO application_status_history
             (application_id, old_status, new_status,
              changed_by, remarks)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                id,
                oldStatus,
                status,
                admin_id,
                remarks || "Status updated by admin"
            ]
        );

        await client.query("COMMIT");

        res.status(200).json({
            message: "Application status updated successfully.",
            old_status: oldStatus,
            new_status: status
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Application status error:", error.message);

        res.status(500).json({
            message: "Server error while updating application status."
        });

    } finally {
        client.release();
    }
};


const getAllApplications = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.application_id,
                a.status,
                a.applied_at,
                a.updated_at,
                u.full_name AS student_name,
                u.email AS student_email,
                j.job_title,
                j.company_name,
                j.location,
                alumni.full_name AS posted_by
            FROM applications a
            JOIN users u
                ON a.student_id = u.user_id
            JOIN jobs j
                ON a.job_id = j.job_id
            JOIN users alumni
                ON j.posted_by = alumni.user_id
            ORDER BY a.applied_at DESC
        `);

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


const getApplicationHistory = async (req, res) => {
    try {
        const { id } = req.params;

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
             JOIN users u
                ON h.changed_by = u.user_id
             WHERE h.application_id = $1
             ORDER BY h.changed_at ASC`,
            [id]
        );

        res.status(200).json({
            application_id: Number(id),
            count: result.rows.length,
            history: result.rows
        });

    } catch (error) {
        console.error("History error:", error.message);

        res.status(500).json({
            message: "Server error while fetching application history."
        });
    }
};


module.exports = {
    updateApplicationStatus,
    getAllApplications,
    getApplicationHistory
};