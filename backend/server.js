require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const app = express();
const adminRoutes = require("./routes/adminRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const referralRoutes = require("./routes/referralRoutes");
const applicationStatusRoutes = require("./routes/applicationStatusRoutes");
const profileRoutes = require("./routes/profileRoutes");


app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/application-status", applicationStatusRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/auth", authRoutes);

// Welcome route
app.get("/", (req, res) => {
    res.send("Sahyadri Alumni Connect Backend is Running!");
});

// Database test route
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database()"
        );

        res.json({
            message: "Database connected successfully!",
            database: result.rows[0].current_database
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});