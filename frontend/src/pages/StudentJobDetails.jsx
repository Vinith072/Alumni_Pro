
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  MapPin,
  Building2,
  Briefcase,
  CalendarDays,
  GraduationCap,
  CheckCircle,
  Send,
  User
} from "lucide-react";

function StudentJobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch Job Details
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/jobs/${id}`
      );

      setJob(response.data.job || response.data);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load job details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  // Apply for Job
  const handleApply = async () => {
    try {
      setApplying(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/applications",
        {
          job_id: Number(id)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        response.data.message ||
        "Your application has been submitted successfully!"
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit your application."
      );
    } finally {
      setApplying(false);
    }
  };

  // Extract required skills
  const skillData = job?.skills || job?.required_skills || [];

const skills = Array.isArray(skillData)
  ? skillData.map((skill) =>
      typeof skill === "string"
        ? skill
        : skill.skill_name || skill.name
    ).filter(Boolean)
  : [];

  if (loading) {
    return (
      <div className="dashboard-page">
        <p className="student-job-message">
          Loading job details...
        </p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content">
          <p className="student-job-error">{error}</p>

          <button
            onClick={() => navigate("/student/jobs")}
            className="view-job-button"
          >
            <ArrowLeft size={17} />
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="dashboard-page student-job-details-page student-job-details-redesign">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Job Details</h1>
          <p>Explore this career opportunity</p>
        </div>

        <button onClick={() => navigate("/student/jobs")}>
          <ArrowLeft size={18} />
          Back to Jobs
        </button>
      </header>

      <main className="dashboard-content">

        {/* Job Information */}
        <section className="job-details-card">

          <div className="job-details-top">

            <div className="student-job-icon">
              <Briefcase size={32} />
            </div>

            <span className="job-type-badge">
              {job.employment_type || "Job"}
            </span>

          </div>

          <h2>{job.job_title}</h2>

          <div className="job-details-company">
            <Building2 size={19} />
            <span>{job.company_name}</span>
          </div>

          <div className="job-details-meta">

            <div>
              <MapPin size={18} />
              <span>
                {job.location || "Location not specified"}
              </span>
            </div>

            <div>
              <CalendarDays size={18} />
              <span>
                {job.posted_at
                  ? new Date(job.posted_at).toLocaleDateString("en-IN")
                  : "Recently posted"}
              </span>
            </div>

            <div>
              <User size={18} />
              <span>
                {job.posted_by_name || job.alumni_name || "Sahyadri Alumni"}
              </span>
            </div>

          </div>

          <hr />

          {/* Job Description */}
          <section className="job-details-section">

            <h3>Job Description</h3>

            <p>
              {job.description || "No job description available."}
            </p>

          </section>

          {/* Required Skills */}
          <section className="job-details-section">

            <h3>
              <GraduationCap size={20} />
              Required Skills
            </h3>

            {skills.length > 0 ? (
              <div className="job-skills-list">
                {skills.map((skill, index) => (
                  <span key={`${skill}-${index}`}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p>No specific skills listed.</p>
            )}

          </section>

          {/* Application Message */}
          {error && (
            <div className="job-application-error">
              {error}
            </div>
          )}

          {message && (
            <div className="job-application-success">
              <CheckCircle size={19} />
              {message}
            </div>
          )}

          {/* Apply Button */}
          <div className="job-apply-section">

            <button
              className="apply-job-button"
              onClick={handleApply}
              disabled={applying || Boolean(message)}
            >
              <Send size={18} />

              {applying
                ? "Submitting..."
                : message
                  ? "Application Submitted"
                  : "Apply Now"}
            </button>

          </div>

        </section>

      </main>
    </div>
  );
}

export default StudentJobDetails;
