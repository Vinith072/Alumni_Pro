
require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("./config/db");

async function createAdmin() {
    try {
        const name = "Sahyadri Admin";
        const email = "admin@sahyadri.edu.in";
        const password = "Admin@12345";

        const existing = await pool.query(
            "SELECT user_id FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            console.log("Admin account already exists!");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `INSERT INTO users
            (college_id, full_name, email, password_hash, role)
            VALUES (1, $1, $2, $3, 'Admin')
            RETURNING user_id, full_name, email, role`,
            [name, email, hashedPassword]
        );

        console.log("Admin created successfully!");
        console.log(result.rows[0]);

    } catch (error) {
        console.error("Admin creation failed:", error.message);
    } finally {
        await pool.end();
    }
}

createAdmin();

