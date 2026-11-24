
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  User,
  Search
} from "lucide-react";

function BrowseJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Fetch available jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/jobs"
        );

        setJobs(response.data.jobs || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load available jobs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Search jobs
  const filteredJobs = jobs.filter((job) =>
    [
      job.job_title,
      job.company_name,
      job.location,
      job.description
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Apply for a job
  const handleApply = async (jobId) => {
    try {
      setApplyingJobId(jobId);
      setMessage("");
      setMessageType("");

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/applications",
        {
          job_id: jobId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        response.data.message ||
        "Application submitted successfully!"
      );

      setMessageType("success");

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Unable to apply for this job."
      );

      setMessageType("error");

    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="dashboard-page browse-jobs-redesign">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h1>Browse Jobs</h1>
          <p>Explore opportunities posted by our alumni</p>
        </div>

        <button
          onClick={() => navigate("/dashboard/student")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

      </header>

      {/* Main Content */}
      <main className="dashboard-content">

        <h2>Available Opportunities</h2>

        {/* Search Bar */}
        <div className="job-search">

          <Search size={20} />

          <input
            type="text"
            placeholder="Search job title, company or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* Application Message */}
        {message && (
          <p className={
            messageType === "success"
              ? "form-success"
              : "form-error"
          }>
            {message}
          </p>
        )}

        {/* Loading */}
        {loading && <p>Loading jobs...</p>}

        {/* Error */}
        {error && (
          <p className="error-message">{error}</p>
        )}

        {/* No Jobs */}
        {!loading && !error && filteredJobs.length === 0 && (
          <p>No jobs found.</p>
        )}

        {/* Job Cards */}
        {!loading && !error && filteredJobs.length > 0 && (

          <div className="jobs-list">

            {filteredJobs.map((job) => (

              <div
                className="job-card"
                key={job.job_id}
              >

                {/* Job Header */}
                <div className="job-card-header">

                  <div>
                    <h3>{job.job_title}</h3>
                    <h4>{job.company_name}</h4>
                  </div>

                  <span className="job-type">
                    {job.employment_type}
                  </span>

                </div>

                {/* Job Information */}
                <div className="job-info">

                  <p>
                    <MapPin size={16} />
                    {job.location}
                  </p>

                  <p>
                    <User size={16} />
                    Posted by: {job.alumni_name || "Verified Alumni"}
                  </p>

                  <p>
                    <Clock size={16} />
                    Posted on:{" "}
                    {job.posted_at
                      ? new Date(job.posted_at).toLocaleDateString("en-IN")
                      : "Date unavailable"}
                  </p>

                </div>

                {/* Description */}
                <p className="job-description">
                  {job.description}
                </p>

                {/* Required Skills */}
                {job.skills?.length > 0 && (

                  <div className="job-skills">

                    <strong>Required Skills:</strong>

                    <div className="skill-tags">

                      {job.skills.map((skill, index) => {

                        const skillName =
                          typeof skill === "string"
                            ? skill
                            : skill.skill_name;

                        return (
                          <span
                            key={`${job.job_id}-${skillName}-${index}`}
                          >
                            {skillName}
                          </span>
                        );
                      })}

                    </div>

                  </div>

                )}

                {/* Apply Button */}
                <button
                  className="apply-button"
                  onClick={() => handleApply(job.job_id)}
                  disabled={applyingJobId === job.job_id}
                >
                  {applyingJobId === job.job_id
                    ? "Applying..."
                    : "Apply Now"}
                </button>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default BrowseJobs;
