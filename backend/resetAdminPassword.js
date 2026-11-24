
require("dotenv").config();

const pool = require("./config/db");
const bcrypt = require("bcrypt");

async function resetAdminPassword() {
    try {
        const email = "admin@sahyadri.edu.in";

        // Choose your own new password
        const newPassword = "Admin@1233";

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await pool.query(
            `UPDATE users
             SET password_hash = $1
             WHERE email = $2
               AND role = 'Admin'
             RETURNING user_id, email, role`,
            [hashedPassword, email]
        );

        if (result.rows.length === 0) {
            console.log("Admin account not found.");
        } else {
            console.log("Admin password reset successfully!");
            console.log(result.rows[0]);
        }

    } catch (error) {
        console.error(error.message);
    } finally {
        await pool.end();
    }
}

resetAdminPassword();
