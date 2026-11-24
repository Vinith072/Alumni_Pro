
const pool = require("../config/db");

// ==========================================
// 1. STUDENT CREATES A REFERRAL REQUEST
// ==========================================

const createReferralRequest = async (req, res) => {
    try {
        const { application_id, alumni_id } = req.body;
        const student_id = req.user.userId;

        if (!application_id || !alumni_id) {
            return res.status(400).json({
                message: "Application ID and Alumni ID are required."
            });
        }

        // Check application ownership and get job company
        const application = await pool.query(
            `SELECT a.application_id, a.job_id, j.company_name
             FROM applications a
             JOIN jobs j ON j.job_id = a.job_id
             WHERE a.application_id = $1
             AND a.student_id = $2`,
            [application_id, student_id]
        );

        if (application.rows.length === 0) {
            return res.status(404).json({
                message: "Application not found."
            });
        }

        // Check eligible alumnus
        const eligibleAlumni = await pool.query(
            `SELECT u.user_id
             FROM alumni_profiles ap
             JOIN users u ON u.user_id = ap.user_id
             WHERE ap.user_id = $1
             AND LOWER(TRIM(ap.current_company)) =
                 LOWER(TRIM($2))
             AND ap.verification_status = 'Verified'
             AND u.is_active = TRUE`,
            [
                alumni_id,
                application.rows[0].company_name
            ]
        );

        if (eligibleAlumni.rows.length === 0) {
            return res.status(403).json({
                message: "This alumnus is not eligible for this referral."
            });
        }

        // Prevent duplicate requests
        const existing = await pool.query(
            `SELECT referral_id
             FROM referral_requests
             WHERE application_id = $1
             AND alumni_id = $2`,
            [application_id, alumni_id]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                message: "Referral request already exists."
            });
        }

        // Create referral request
        const result = await pool.query(
            `INSERT INTO referral_requests
             (application_id, alumni_id, status)
             VALUES ($1, $2, 'Pending')
             RETURNING *`,
            [application_id, alumni_id]
        );

        res.status(201).json({
            message: "Referral request submitted successfully!",
            referral: result.rows[0]
        });

    } catch (error) {
        console.error("Referral request error:", error.message);

        res.status(500).json({
            message: "Server error while creating referral request."
        });
    }
};


// ==========================================
// 2. ALUMNI VIEWS INCOMING REFERRAL REQUESTS
// ==========================================

const getMyReferralRequests = async (req, res) => {
    try {
        const alumni_id = req.user.userId;

        const result = await pool.query(
            `SELECT
                rr.referral_id,
                rr.application_id,
                rr.status,
                rr.requested_at,
                rr.responded_at,
                u.full_name AS student_name,
                u.email AS student_email,
                j.job_title,
                j.company_name
             FROM referral_requests rr
             JOIN applications a
                ON rr.application_id = a.application_id
             JOIN users u
                ON a.student_id = u.user_id
             JOIN jobs j
                ON a.job_id = j.job_id
             WHERE rr.alumni_id = $1
             ORDER BY rr.requested_at DESC`,
            [alumni_id]
        );

        res.status(200).json({
            count: result.rows.length,
            referrals: result.rows
        });

    } catch (error) {
        console.error("Get referral requests error:", error.message);

        res.status(500).json({
            message: "Server error while fetching referral requests."
        });
    }
};


// ==========================================
// 3. ALUMNI ACCEPTS OR DECLINES REFERRAL
// ==========================================

const updateReferralStatus = async (req, res) => {
    const client = await pool.connect();

    let transactionStarted = false;

    try {
        const { id } = req.params;
        const { status } = req.body;
        const alumni_id = req.user.userId;

        if (!["Accepted", "Declined"].includes(status)) {
            return res.status(400).json({
                message: "Status must be Accepted or Declined."
            });
        }

        await client.query("BEGIN");
        transactionStarted = true;

        // Update pending referral belonging to this alumnus
        const referralResult = await client.query(
            `UPDATE referral_requests
             SET status = $1,
                 responded_at = CURRENT_TIMESTAMP
             WHERE referral_id = $2
             AND alumni_id = $3
             AND status = 'Pending'
             RETURNING *`,
            [status, id, alumni_id]
        );

        if (referralResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                message: "Pending referral request not found."
            });
        }

        const referral = referralResult.rows[0];

        // If accepted, update application status
        if (status === "Accepted") {
            const applicationResult = await client.query(
                `SELECT status
                 FROM applications
                 WHERE application_id = $1
                 FOR UPDATE`,
                [referral.application_id]
            );

            if (applicationResult.rows.length === 0) {
                throw new Error("Related application not found.");
            }

            const oldStatus = applicationResult.rows[0].status;

            // Change Applied to Referred only
            if (oldStatus === "Applied") {
                await client.query(
                    `UPDATE applications
                     SET status = 'Referred',
                         updated_at = CURRENT_TIMESTAMP
                     WHERE application_id = $1`,
                    [referral.application_id]
                );

                await client.query(
                    `INSERT INTO application_status_history
                     (application_id, old_status, new_status,
                      changed_by, remarks)
                     VALUES ($1, $2, 'Referred', $3, $4)`,
                    [
                        referral.application_id,
                        oldStatus,
                        alumni_id,
                        "Referral accepted by alumnus"
                    ]
                );
            }
        }

        await client.query("COMMIT");
        transactionStarted = false;

        res.status(200).json({
            message: `Referral ${status.toLowerCase()} successfully.`,
            referral
        });

    } catch (error) {
        if (transactionStarted) {
            await client.query("ROLLBACK");
        }

        console.error("Update referral error:", error.message);

        res.status(500).json({
            message: "Server error while updating referral."
        });

    } finally {
        client.release();
    }
};


// ==========================================
// 4. STUDENT FINDS ELIGIBLE VERIFIED ALUMNI
// ==========================================

const getEligibleAlumni = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const student_id = req.user.userId;

        // Verify application belongs to logged-in student
        const application = await pool.query(
            `SELECT
                a.application_id,
                a.status,
                j.company_name
             FROM applications a
             JOIN jobs j ON j.job_id = a.job_id
             WHERE a.application_id = $1
             AND a.student_id = $2`,
            [applicationId, student_id]
        );

        if (application.rows.length === 0) {
            return res.status(404).json({
                message: "Application not found."
            });
        }

        const companyName = application.rows[0].company_name;

        // Find verified alumni working at the hiring company
        const result = await pool.query(
            `SELECT
                u.user_id AS alumni_id,
                u.full_name,
                u.email,
                ap.department,
                ap.graduation_year,
                ap.current_company,
                ap.job_title
             FROM alumni_profiles ap
             JOIN users u ON u.user_id = ap.user_id
             WHERE LOWER(TRIM(ap.current_company)) =
                   LOWER(TRIM($1))
             AND ap.verification_status = 'Verified'
             AND u.is_active = TRUE
             ORDER BY u.full_name`,
            [companyName]
        );

        res.status(200).json({
            application_id: Number(applicationId),
            company_name: companyName,
            count: result.rows.length,
            alumni: result.rows
        });

    } catch (error) {
        console.error("Eligible alumni error:", error.message);

        res.status(500).json({
            message: "Server error while fetching eligible alumni."
        });
    }
};


// ==========================================
// 5. STUDENT VIEWS THEIR OWN REFERRAL REQUESTS
// ==========================================

const getStudentReferralRequests = async (req, res) => {
    try {
        const student_id = req.user.userId;

        const result = await pool.query(
            `SELECT
                rr.referral_id,
                rr.application_id,
                rr.alumni_id,
                rr.status,
                rr.requested_at,
                rr.responded_at,
                j.job_title,
                j.company_name,
                u.full_name AS alumni_name,
                u.email AS alumni_email,
                ap.current_company,
                ap.job_title AS alumni_job_title
             FROM referral_requests rr
             JOIN applications a
                ON rr.application_id = a.application_id
             JOIN jobs j
                ON a.job_id = j.job_id
             JOIN users u
                ON rr.alumni_id = u.user_id
             JOIN alumni_profiles ap
                ON u.user_id = ap.user_id
             WHERE a.student_id = $1
             ORDER BY rr.requested_at DESC`,
            [student_id]
        );

        res.status(200).json({
            count: result.rows.length,
            referrals: result.rows
        });

    } catch (error) {
        console.error("Student referrals error:", error.message);

        res.status(500).json({
            message: "Server error while fetching student referrals."
        });
    }
};


// ==========================================
// EXPORT ALL CONTROLLER FUNCTIONS
// ==========================================

module.exports = {
    createReferralRequest,
    getMyReferralRequests,
    updateReferralStatus,
    getEligibleAlumni,
    getStudentReferralRequests
};
