
const pool = require("../config/db");

// =====================================
// CREATE A NEW JOB
// =====================================
const createJob = async (req, res) => {
    try {
        const {
            job_title,
            company_name,
            location,
            employment_type,
            description,
            skills
        } = req.body;

        if (
            !job_title ||
            !company_name ||
            !location ||
            !employment_type ||
            !description
        ) {
            return res.status(400).json({
                message: "Please provide all required job details."
            });
        }

        // Check whether the user is a verified alumnus
        const alumni = await pool.query(
            `SELECT verification_status
             FROM alumni_profiles
             WHERE user_id = $1`,
            [req.user.userId]
        );

        if (
            alumni.rows.length === 0 ||
            alumni.rows[0].verification_status !== "Verified"
        ) {
            return res.status(403).json({
                message: "Only verified alumni can post jobs."
            });
        }

        const result = await pool.query(
            `INSERT INTO jobs
             (posted_by, job_title, company_name, location,
              employment_type, description)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                req.user.userId,
                job_title,
                company_name,
                location,
                employment_type,
                description
            ]
        );

        return res.status(201).json({
            message: "Job posted successfully!",
            job: result.rows[0]
        });

    } catch (error) {
        console.error("Create job error:", error.message);

        return res.status(500).json({
            message: "Server error while posting job."
        });
    }
};


// =====================================
// GET ALL ACTIVE JOBS
// =====================================
const getAllJobs = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT j.*, u.full_name AS alumni_name
             FROM jobs j
             JOIN users u ON j.posted_by = u.user_id
             WHERE j.is_deleted = FALSE
             ORDER BY j.posted_at DESC`
        );

        return res.status(200).json({
            count: result.rows.length,
            jobs: result.rows
        });

    } catch (error) {
        console.error("Get jobs error:", error.message);

        return res.status(500).json({
            message: "Server error while fetching jobs."
        });
    }
};


// =====================================
// GET JOB DETAILS
// =====================================
const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                j.job_id,
                j.job_title,
                j.company_name,
                j.location,
                j.employment_type,
                j.description,
                j.posted_at,
                u.full_name AS posted_by,
                ap.current_company,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'skill_id', s.skill_id,
                            'skill_name', s.skill_name
                        )
                    ) FILTER (WHERE s.skill_id IS NOT NULL),
                    '[]'
                ) AS required_skills
             FROM jobs j
             JOIN users u
                ON j.posted_by = u.user_id
             LEFT JOIN alumni_profiles ap
                ON ap.user_id = u.user_id
             LEFT JOIN job_skills js
                ON js.job_id = j.job_id
             LEFT JOIN skills s
                ON s.skill_id = js.skill_id
             WHERE j.job_id = $1
               AND j.is_deleted = FALSE
             GROUP BY j.job_id, u.full_name, ap.current_company`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found."
            });
        }

        return res.status(200).json({
            job: result.rows[0]
        });

    } catch (error) {
        console.error("Get job details error:", error.message);

        return res.status(500).json({
            message: "Server error while fetching job details."
        });
    }
};


// =====================================
// ADD JOB SKILLS
// =====================================
const addJobSkills = async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const { skill_ids } = req.body;
        const alumniId = req.user.userId;

        if (!Array.isArray(skill_ids) || skill_ids.length === 0) {
            return res.status(400).json({
                message: "Please provide at least one skill ID."
            });
        }

        if (
            !skill_ids.every(
                skillId =>
                    Number.isInteger(skillId) && skillId > 0
            )
        ) {
            return res.status(400).json({
                message: "All skill IDs must be positive integers."
            });
        }

        const uniqueSkillIds = [...new Set(skill_ids)];

        await client.query("BEGIN");

        const job = await client.query(
            `SELECT job_id
             FROM jobs
             WHERE job_id = $1
               AND posted_by = $2
               AND is_deleted = FALSE`,
            [id, alumniId]
        );

        if (job.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Job not found or you are not authorized."
            });
        }

        const skills = await client.query(
            `SELECT skill_id
             FROM skills
             WHERE skill_id = ANY($1::int[])`,
            [uniqueSkillIds]
        );

        if (skills.rows.length !== uniqueSkillIds.length) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                message: "One or more skill IDs do not exist."
            });
        }

        for (const skillId of uniqueSkillIds) {
            await client.query(
                `INSERT INTO job_skills (job_id, skill_id)
                 SELECT $1, $2
                 WHERE NOT EXISTS (
                     SELECT 1
                     FROM job_skills
                     WHERE job_id = $1
                       AND skill_id = $2
                 )`,
                [id, skillId]
            );
        }

        await client.query("COMMIT");

        return res.status(200).json({
            message: "Job skills added successfully.",
            job_id: Number(id),
            skill_ids: uniqueSkillIds
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Add job skills error:", error.message);

        return res.status(500).json({
            message: "Server error while adding job skills."
        });

    } finally {
        client.release();
    }
};


// =====================================
// GET ALL SKILLS
// =====================================
const getAllSkills = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT skill_id, skill_name
             FROM skills
             ORDER BY skill_name ASC`
        );

        return res.status(200).json({
            count: result.rows.length,
            skills: result.rows
        });

    } catch (error) {
        console.error("Get skills error:", error.message);

        return res.status(500).json({
            message: "Server error while fetching skills."
        });
    }
};


// =====================================
// GET ALUMNI'S ACTIVE JOB POSTS
// =====================================
const getMyJobs = async (req, res) => {
    try {
        const alumniId = req.user.userId;

        const result = await pool.query(
            `SELECT
                j.job_id,
                j.job_title,
                j.company_name,
                j.location,
                j.employment_type,
                j.description,
                j.posted_at,
                COUNT(DISTINCT a.application_id)::int
                    AS total_applications
             FROM jobs j
             LEFT JOIN applications a
                ON j.job_id = a.job_id
             WHERE j.posted_by = $1
               AND j.is_deleted = FALSE
             GROUP BY j.job_id
             ORDER BY j.posted_at DESC`,
            [alumniId]
        );

        return res.status(200).json({
            count: result.rows.length,
            jobs: result.rows
        });

    } catch (error) {
        console.error("Get my jobs error:", error.message);

        return res.status(500).json({
            message: "Server error while fetching your jobs."
        });
    }
};


// =====================================
// UPDATE JOB
// =====================================
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            job_title,
            company_name,
            location,
            employment_type,
            description
        } = req.body;

        const alumniId = req.user.userId;

        const result = await pool.query(
            `UPDATE jobs
             SET job_title = $1,
                 company_name = $2,
                 location = $3,
                 employment_type = $4,
                 description = $5
             WHERE job_id = $6
               AND posted_by = $7
               AND is_deleted = FALSE
             RETURNING *`,
            [
                job_title,
                company_name,
                location,
                employment_type,
                description,
                id,
                alumniId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found or you are not authorized."
            });
        }

        return res.status(200).json({
            message: "Job updated successfully.",
            job: result.rows[0]
        });

    } catch (error) {
        console.error("Update job error:", error.message);

        return res.status(500).json({
            message: "Server error while updating job."
        });
    }
};


// =====================================
// SOFT DELETE JOB
// =====================================
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const alumniId = req.user.userId;

        const result = await pool.query(
            `UPDATE jobs
             SET is_deleted = TRUE
             WHERE job_id = $1
               AND posted_by = $2
               AND is_deleted = FALSE
             RETURNING job_id, job_title`,
            [id, alumniId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found or you are not authorized."
            });
        }

        return res.status(200).json({
            message: "Job deleted successfully.",
            deleted_job: result.rows[0]
        });

    } catch (error) {
        console.error("Delete job error:", error);

        return res.status(500).json({
            message: "Server error while deleting job."
        });
    }
};


// =====================================
// GET JOB STATISTICS
// =====================================
const getJobStatistics = async (req, res) => {
    try {
        const alumniId = req.user.userId;

        // Retain historical application statistics
        const summary = await pool.query(
            `SELECT
                COUNT(DISTINCT j.job_id)::int AS total_jobs,
                COUNT(a.application_id)::int AS total_applications,
                COUNT(a.application_id)
                    FILTER (WHERE a.status = 'Shortlisted')::int
                    AS shortlisted,
                COUNT(a.application_id)
                    FILTER (WHERE a.status = 'Selected')::int
                    AS selected,
                COUNT(a.application_id)
                    FILTER (WHERE a.status = 'Rejected')::int
                    AS rejected
             FROM jobs j
             LEFT JOIN applications a
                ON j.job_id = a.job_id
             WHERE j.posted_by = $1`,
            [alumniId]
        );

        const jobStatistics = await pool.query(
            `SELECT
                j.job_id,
                j.job_title,
                j.company_name,
                COUNT(a.application_id)::int AS total_applications,
                COUNT(a.application_id)
                    FILTER (WHERE a.status = 'Applied')::int
                    AS applied,
                COUNT(a.application_id)
                    FILTER (WHERE a.status = 'Referred')::int
                    AS referred,
                COUNT(a.application_id)
                    FILTER (WHERE a.status = 'Shortlisted')::int
                    AS shortlisted,
                COUNT(a.application_id)
                    FILTER (WHERE a.status = 'Interviewed')::int
                    AS interviewed,
                COUNT(a.application_id)
                    FILTER (WHERE a.status = 'Selected')::int
                    AS selected,
                COUNT(a.application_id)
                    FILTER (WHERE a.status = 'Rejected')::int
                    AS rejected
             FROM jobs j
             LEFT JOIN applications a
                ON j.job_id = a.job_id
             WHERE j.posted_by = $1
             GROUP BY j.job_id
             ORDER BY j.posted_at DESC`,
            [alumniId]
        );

        return res.status(200).json({
            message: "Job statistics fetched successfully.",
            summary: summary.rows[0],
            jobs: jobStatistics.rows
        });

    } catch (error) {
        console.error("Job statistics error:", error.message);

        return res.status(500).json({
            message: "Server error while fetching job statistics."
        });
    }
};


// =====================================
// EXPORT CONTROLLERS
// =====================================
module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    addJobSkills,
    getAllSkills,
    getMyJobs,
    updateJob,
    deleteJob,
    getJobStatistics
};
