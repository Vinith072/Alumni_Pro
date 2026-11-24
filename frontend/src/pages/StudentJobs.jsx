
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Search,
  MapPin,
  Briefcase,
  Building2,
  CalendarDays,
  Eye
} from "lucide-react";

function StudentJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all available jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/jobs"
      );

      setJobs(response.data.jobs || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load job opportunities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Search and filter jobs
  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase().trim();
    const locationText = location.toLowerCase().trim();

    const matchesSearch =
      (job.job_title || "").toLowerCase().includes(searchText) ||
      (job.company_name || "").toLowerCase().includes(searchText);

    const matchesLocation =
      (job.location || "").toLowerCase().includes(locationText);

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="dashboard-page student-jobs-page student-jobs-redesign">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Browse Jobs</h1>
          <p>Explore career opportunities from Sahyadri alumni</p>
        </div>

        <button onClick={() => navigate("/dashboard/student")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">

        {/* Search Section */}
        <section className="student-job-search">

          <div className="job-search-input">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="job-search-input">
            <MapPin size={19} />
            <input
              type="text"
              placeholder="Filter by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

        </section>

        {/* Job Count */}
        <div className="student-job-heading">
          <div>
            <h2>Available Opportunities</h2>
            <p>
              {filteredJobs.length} job opportunities found
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p className="student-job-message">
            Loading job opportunities...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="student-job-error">{error}</p>
        )}

        {/* Empty State */}
        {!loading && !error && filteredJobs.length === 0 && (
          <div className="student-job-empty">
            <Briefcase size={42} />
            <h3>No jobs found</h3>
            <p>
              Try changing your search or location filter.
            </p>
          </div>
        )}

        {/* Job Cards */}
        {!loading && !error && filteredJobs.length > 0 && (

          <div className="student-jobs-grid">

            {filteredJobs.map((job) => (

              <div
                className="student-job-card"
                key={job.job_id}
              >

                <div className="student-job-card-top">
                  <div className="student-job-icon">
                    <Briefcase size={25} />
                  </div>

                  <span className="job-type-badge">
                    {job.employment_type || "Job"}
                  </span>
                </div>

                <h3>{job.job_title}</h3>

                <div className="student-job-company">
                  <Building2 size={16} />
                  <span>{job.company_name}</span>
                </div>

                <div className="student-job-location">
                  <MapPin size={16} />
                  <span>{job.location || "Location not specified"}</span>
                </div>

                <p className="student-job-description">
                  {job.description
                    ? job.description.length > 130
                      ? `${job.description.substring(0, 130)}...`
                      : job.description
                    : "No description available."}
                </p>

                <div className="student-job-card-footer">

                  <span className="student-job-date">
                    <CalendarDays size={14} />
                    {job.posted_at
                      ? new Date(job.posted_at).toLocaleDateString("en-IN")
                      : "Recently posted"}
                  </span>

                  <button
                    className="view-job-button"
                    onClick={() =>
                      navigate(`/student/jobs/${job.job_id}`)
                    }
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </main>
    </div>
  );
}

export default StudentJobs;
