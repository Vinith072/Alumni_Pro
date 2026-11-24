
require("dotenv").config();

const pool = require("./config/db");
const bcrypt = require("bcrypt");

async function resetPassword() {
    try {
        const email = "student@test.com";

        // Replace this with your own new password
        const newPassword = "Student@1233";

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await pool.query(
            `UPDATE users
             SET password_hash = $1
             WHERE email = $2
               AND role = 'Student'
             RETURNING user_id, email`,
            [hashedPassword, email]
        );

        if (result.rows.length === 0) {
            console.log("Student account not found.");
        } else {
            console.log("Student password reset successfully!");
            console.log(result.rows[0]);
        }

    } catch (error) {
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

resetPassword();
