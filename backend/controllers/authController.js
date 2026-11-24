
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER STUDENT OR ALUMNI
const register = async (req, res) => {
    const {
        full_name,
        email,
        password,
        role,
        department,
        graduation_year
    } = req.body;

    if (!full_name || !email || !password || !role) {
        return res.status(400).json({
            message: "Please fill all required fields"
        });
    }

    if (!["Student", "Alumni"].includes(role)) {
        return res.status(400).json({
            message: "Only Student and Alumni registration is allowed"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Password must contain at least 8 characters"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existingUser = await client.query(
            "SELECT user_id FROM users WHERE email = $1",
            [email.toLowerCase().trim()]
        );

        if (existingUser.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const userResult = await client.query(
            `INSERT INTO users
            (college_id, full_name, email, password_hash, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING user_id, full_name, email, role`,
            [
                1,
                full_name.trim(),
                email.toLowerCase().trim(),
                hashedPassword,
                role
            ]
        );

        const user = userResult.rows[0];

        if (role === "Student") {
            await client.query(
                `INSERT INTO student_profiles
                (user_id, department, graduation_year)
                VALUES ($1, $2, $3)`,
                [user.user_id, department || null, graduation_year || null]
            );
        }

        if (role === "Alumni") {
            await client.query(
                `INSERT INTO alumni_profiles
                (user_id, department, graduation_year, verification_status)
                VALUES ($1, $2, $3, 'Pending')`,
                [user.user_id, department || null, graduation_year || null]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            message: role === "Alumni"
                ? "Registration successful. Waiting for admin verification."
                : "Student registration successful",
            user
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Registration failed"
        });

    } finally {
        client.release();
    }
};


// LOGIN

const login = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            message: "Email, password and role are required"
        });
    }

    if (!["Admin", "Student", "Alumni"].includes(role)) {
        return res.status(400).json({
            message: "Invalid role"
        });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM users
             WHERE email = $1 AND role = $2`,
            [email.toLowerCase().trim(), role]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email, password or role"
            });
        }

        const user = result.rows[0];

        // Check whether the account is active
        if (!user.is_active) {
            return res.status(403).json({
                message: "Your account has been deactivated. Please contact the administrator."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email, password or role"
            });
        }

        let verificationStatus = null;

        if (role === "Alumni") {
            const alumni = await pool.query(
                `SELECT verification_status
                 FROM alumni_profiles
                 WHERE user_id = $1`,
                [user.user_id]
            );

            verificationStatus =
                alumni.rows[0]?.verification_status || "Pending";
        }

        const token = jwt.sign(
            {
                userId: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                verification_status: verificationStatus
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Login failed"
        });
    }
};


module.exports = { register, login };
