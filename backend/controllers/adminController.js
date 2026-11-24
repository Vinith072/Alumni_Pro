
const pool = require("../config/db");

// Get all alumni verification requests
const getPendingAlumni = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.user_id,
                u.full_name,
                u.email,
                ap.department,
                ap.graduation_year,
                ap.current_company,
                ap.job_title,
                ap.verification_status
            FROM users u
            JOIN alumni_profiles ap
                ON u.user_id = ap.user_id
            WHERE ap.verification_status = 'Pending'
            ORDER BY u.created_at DESC
        `);

        res.status(200).json({
            count: result.rows.length,
            alumni: result.rows
        });

    } catch (error) {
        console.error("Get pending alumni error:", error.message);
        res.status(500).json({
            message: "Server error while fetching alumni."
        });
    }
};

// Approve or reject alumni
const updateAlumniVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["Verified", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be Verified or Rejected."
            });
        }

        const result = await pool.query(
            `UPDATE alumni_profiles
             SET verification_status = $1
             WHERE user_id = $2
             RETURNING user_id, verification_status`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Alumni profile not found."
            });
        }

        res.status(200).json({
            message: `Alumni ${status.toLowerCase()} successfully.`,
            alumni: result.rows[0]
        });

    } catch (error) {
        console.error("Update alumni verification error:", error.message);
        res.status(500).json({
            message: "Server error while updating verification."
        });
    }
};


const getAdminDashboardStats = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                (SELECT COUNT(*)
                 FROM users)::int AS total_users,

                (SELECT COUNT(*)
                 FROM users
                 WHERE role = 'Student')::int AS total_students,

                (SELECT COUNT(*)
                 FROM users
                 WHERE role = 'Alumni')::int AS total_alumni,

                (SELECT COUNT(*)
                 FROM alumni_profiles
                 WHERE verification_status = 'Pending')::int
                 AS pending_alumni,

                (SELECT COUNT(*)
                 FROM alumni_profiles
                 WHERE verification_status = 'Verified')::int
                 AS verified_alumni,

                (SELECT COUNT(*)
                 FROM alumni_profiles
                 WHERE verification_status = 'Rejected')::int
                 AS rejected_alumni,

                (SELECT COUNT(*)
                 FROM jobs)::int AS total_jobs,

                (SELECT COUNT(*)
                 FROM applications)::int AS total_applications,

                (SELECT COUNT(*)
                 FROM referral_requests)::int AS total_referrals
        `);

        res.status(200).json({
            message: "Admin dashboard statistics fetched successfully.",
            statistics: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Admin dashboard statistics error:",
            error.message
        );

        res.status(500).json({
            message: "Server error while fetching admin dashboard statistics."
        });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`
    SELECT
        u.user_id,
        u.full_name,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        ap.verification_status
    FROM users u
    LEFT JOIN alumni_profiles ap
        ON u.user_id = ap.user_id
    ORDER BY u.user_id DESC
`);

        res.status(200).json({
            count: result.rows.length,
            users: result.rows
        });

    } catch (error) {
        console.error("Get all users error:", error.message);

        res.status(500).json({
            message: "Server error while fetching users."
        });
    }
};


const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        // Validate user ID
        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        // Prevent admin from deactivating themselves
        if (Number(id) === adminId) {
            return res.status(403).json({
                message: "You cannot deactivate your own account."
            });
        }

        // Deactivate only Student or Alumni accounts
        const result = await pool.query(
            `UPDATE users
             SET is_active = FALSE
             WHERE user_id = $1
               AND role IN ('Student', 'Alumni')
               AND is_active = TRUE
             RETURNING user_id, full_name, email, role, is_active`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found, already inactive, or not eligible for deactivation."
            });
        }

        res.status(200).json({
            message: "User account deactivated successfully.",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Deactivate user error:", error.message);

        res.status(500).json({
            message: "Server error while deactivating user."
        });
    }
};

const reactivateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.userId;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        if (Number(id) === adminId) {
            return res.status(403).json({
                message: "Invalid operation."
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET is_active = TRUE
             WHERE user_id = $1
               AND role IN ('Student', 'Alumni')
               AND is_active = FALSE
             RETURNING user_id, full_name, email, role, is_active`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found or account is already active."
            });
        }

        res.status(200).json({
            message: "User account reactivated successfully.",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Reactivate user error:", error.message);

        res.status(500).json({
            message: "Server error while reactivating user."
        });
    }
};



module.exports = {
    getPendingAlumni,
    updateAlumniVerification,
    getAdminDashboardStats,
    getAllUsers,
    deactivateUser,
    reactivateUser
};
