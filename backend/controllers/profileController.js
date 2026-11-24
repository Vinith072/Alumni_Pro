
const pool = require("../config/db");

// ==========================================
// GET STUDENT PROFILE
// ==========================================
const getStudentProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.role,
                sp.student_id,
                sp.department,
                sp.graduation_year,
                sp.skills
             FROM users u
             INNER JOIN student_profiles sp
                ON u.user_id = sp.user_id
             WHERE u.user_id = $1
             AND u.role = 'Student'
             AND u.is_active = TRUE`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        res.status(200).json({
            message: "Student profile fetched successfully",
            profile: result.rows[0]
        });

    } catch (error) {
        console.error("Get student profile error:", error.message);

        res.status(500).json({
            message: "Unable to fetch student profile"
        });
    }
};


// ==========================================
// UPDATE STUDENT PROFILE
// ==========================================
const updateStudentProfile = async (req, res) => {
    const {
        full_name,
        email,
        department,
        graduation_year,
        skills
    } = req.body;

    const userId = req.user.userId;

    if (
        typeof full_name !== "string" ||
        typeof email !== "string" ||
        !full_name.trim() ||
        !email.trim()
    ) {
        return res.status(400).json({
            message: "Full name and email are required"
        });
    }

    const cleanName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
        return res.status(400).json({
            message: "Please provide a valid name and email"
        });
    }

    if (
        graduation_year !== null &&
        graduation_year !== undefined &&
        graduation_year !== "" &&
        (!Number.isInteger(Number(graduation_year)) ||
            Number(graduation_year) < 1950 ||
            Number(graduation_year) > 2100)
    ) {
        return res.status(400).json({
            message: "Please provide a valid graduation year"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const studentCheck = await client.query(
            `SELECT user_id
             FROM users
             WHERE user_id = $1
             AND role = 'Student'
             AND is_active = TRUE`,
            [userId]
        );

        if (studentCheck.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Active student account not found"
            });
        }

        const existingEmail = await client.query(
            `SELECT user_id
             FROM users
             WHERE email = $1
             AND user_id <> $2`,
            [cleanEmail, userId]
        );

        if (existingEmail.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        await client.query(
            `UPDATE users
             SET full_name = $1,
                 email = $2
             WHERE user_id = $3`,
            [cleanName, cleanEmail, userId]
        );

        await client.query(
            `UPDATE student_profiles
             SET department = $1,
                 graduation_year = $2,
                 skills = $3
             WHERE user_id = $4`,
            [
                department?.trim() || null,
                graduation_year ? Number(graduation_year) : null,
                skills?.trim() || null,
                userId
            ]
        );

        await client.query("COMMIT");

        const updatedProfile = await pool.query(
            `SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.role,
                sp.student_id,
                sp.department,
                sp.graduation_year,
                sp.skills
             FROM users u
             INNER JOIN student_profiles sp
                ON u.user_id = sp.user_id
             WHERE u.user_id = $1`,
            [userId]
        );

        res.status(200).json({
            message: "Student profile updated successfully",
            profile: updatedProfile.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Update student profile error:", error.message);

        res.status(500).json({
            message: "Unable to update student profile"
        });

    } finally {
        client.release();
    }
};


// ==========================================
// GET ALUMNI PROFILE
// ==========================================
const getAlumniProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.role,
                ap.alumni_id,
                ap.department,
                ap.graduation_year,
                ap.current_company,
                ap.job_title,
                ap.verification_status
             FROM users u
             INNER JOIN alumni_profiles ap
                ON u.user_id = ap.user_id
             WHERE u.user_id = $1
             AND u.role = 'Alumni'
             AND u.is_active = TRUE`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Alumni profile not found"
            });
        }

        res.status(200).json({
            message: "Alumni profile fetched successfully",
            profile: result.rows[0]
        });

    } catch (error) {
        console.error("Get alumni profile error:", error.message);

        res.status(500).json({
            message: "Unable to fetch alumni profile"
        });
    }
};


// ==========================================
// UPDATE ALUMNI PROFILE
// ==========================================
const updateAlumniProfile = async (req, res) => {
    const {
        full_name,
        email,
        department,
        graduation_year,
        current_company,
        job_title
    } = req.body;

    const userId = req.user.userId;

    if (
        typeof full_name !== "string" ||
        typeof email !== "string" ||
        !full_name.trim() ||
        !email.trim()
    ) {
        return res.status(400).json({
            message: "Full name and email are required"
        });
    }

    const cleanName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
        return res.status(400).json({
            message: "Please provide a valid name and email"
        });
    }

    if (
        graduation_year !== null &&
        graduation_year !== undefined &&
        graduation_year !== "" &&
        (!Number.isInteger(Number(graduation_year)) ||
            Number(graduation_year) < 1950 ||
            Number(graduation_year) > 2100)
    ) {
        return res.status(400).json({
            message: "Please provide a valid graduation year"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const alumniCheck = await client.query(
            `SELECT user_id
             FROM users
             WHERE user_id = $1
             AND role = 'Alumni'
             AND is_active = TRUE`,
            [userId]
        );

        if (alumniCheck.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Active alumni account not found"
            });
        }

        const existingEmail = await client.query(
            `SELECT user_id
             FROM users
             WHERE email = $1
             AND user_id <> $2`,
            [cleanEmail, userId]
        );

        if (existingEmail.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        await client.query(
            `UPDATE users
             SET full_name = $1,
                 email = $2
             WHERE user_id = $3`,
            [cleanName, cleanEmail, userId]
        );

        await client.query(
            `UPDATE alumni_profiles
             SET department = $1,
                 graduation_year = $2,
                 current_company = $3,
                 job_title = $4
             WHERE user_id = $5`,
            [
                department?.trim() || null,
                graduation_year ? Number(graduation_year) : null,
                current_company?.trim() || null,
                job_title?.trim() || null,
                userId
            ]
        );

        await client.query("COMMIT");

        const updatedProfile = await pool.query(
            `SELECT
                u.user_id,
                u.full_name,
                u.email,
                u.role,
                ap.alumni_id,
                ap.department,
                ap.graduation_year,
                ap.current_company,
                ap.job_title,
                ap.verification_status
             FROM users u
             INNER JOIN alumni_profiles ap
                ON u.user_id = ap.user_id
             WHERE u.user_id = $1`,
            [userId]
        );

        res.status(200).json({
            message: "Alumni profile updated successfully",
            profile: updatedProfile.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Update alumni profile error:", error.message);

        res.status(500).json({
            message: "Unable to update alumni profile"
        });

    } finally {
        client.release();
    }
};


// ==========================================
// GET ADMIN PROFILE
// ==========================================
const getAdminProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                user_id,
                full_name,
                email,
                role,
                is_active,
                created_at
             FROM users
             WHERE user_id = $1
             AND role = 'Admin'
             AND is_active = TRUE`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Admin profile not found"
            });
        }

        res.status(200).json({
            message: "Admin profile fetched successfully",
            profile: result.rows[0]
        });

    } catch (error) {
        console.error("Get admin profile error:", error.message);

        res.status(500).json({
            message: "Unable to fetch admin profile"
        });
    }
};


// ==========================================
// UPDATE ADMIN PROFILE
// ==========================================
const updateAdminProfile = async (req, res) => {
    const { full_name, email } = req.body;
    const userId = req.user.userId;

    if (
        typeof full_name !== "string" ||
        typeof email !== "string" ||
        !full_name.trim() ||
        !email.trim()
    ) {
        return res.status(400).json({
            message: "Full name and email are required"
        });
    }

    const cleanName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
        return res.status(400).json({
            message: "Please provide a valid email address"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const adminCheck = await client.query(
            `SELECT user_id
             FROM users
             WHERE user_id = $1
             AND role = 'Admin'
             AND is_active = TRUE`,
            [userId]
        );

        if (adminCheck.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Active admin account not found"
            });
        }

        const existingEmail = await client.query(
            `SELECT user_id
             FROM users
             WHERE email = $1
             AND user_id <> $2`,
            [cleanEmail, userId]
        );

        if (existingEmail.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        await client.query(
            `UPDATE users
             SET full_name = $1,
                 email = $2
             WHERE user_id = $3
             AND role = 'Admin'`,
            [cleanName, cleanEmail, userId]
        );

        await client.query("COMMIT");

        const updatedProfile = await pool.query(
            `SELECT
                user_id,
                full_name,
                email,
                role,
                is_active,
                created_at
             FROM users
             WHERE user_id = $1`,
            [userId]
        );

        res.status(200).json({
            message: "Admin profile updated successfully",
            profile: updatedProfile.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Update admin profile error:", error.message);

        res.status(500).json({
            message: "Unable to update admin profile"
        });

    } finally {
        client.release();
    }
};


// ==========================================
// EXPORT ALL PROFILE FUNCTIONS
// ==========================================
module.exports = {
    getStudentProfile,
    updateStudentProfile,
    getAlumniProfile,
    updateAlumniProfile,
    getAdminProfile,
    updateAdminProfile
};
