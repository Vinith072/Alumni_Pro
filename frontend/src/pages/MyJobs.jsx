
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Trash2,
  Edit,
  X,
  Save
} from "lucide-react";

function MyJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    location: "",
    employment_type: "Full-time",
    description: ""
  });

  // Fetch alumni jobs
  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/jobs/my-jobs",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setJobs(response.data.jobs || []);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your job posts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  // Open edit form
  const handleEdit = (job) => {
    setEditingJob(job);

    setFormData({
      job_title: job.job_title || "",
      company_name: job.company_name || "",
      location: job.location || "",
      employment_type: job.employment_type || "Full-time",
      description: job.description || ""
    });

    setError("");
    setMessage("");
  };

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Update job
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/jobs/${editingJob.job_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage("Job updated successfully!");
      setEditingJob(null);

      await fetchMyJobs();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update job."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Delete job
  const handleDelete = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(jobId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/jobs/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage("Job deleted successfully!");

      await fetchMyJobs();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete this job."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard-page alumni-my-jobs-page">

      <header className="dashboard-header">
        <div>
          <h1>My Job Posts</h1>
          <p>Manage your posted opportunities</p>
        </div>

        <button onClick={() => navigate("/dashboard/alumni")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">

        <h2>Your Posted Jobs</h2>

        {message && (
          <p className="form-success">{message}</p>
        )}

        {error && (
          <p className="form-error">{error}</p>
        )}

        {/* Edit Form */}
        {editingJob && (
          <div className="edit-job-container">

            <div className="edit-job-heading">
              <h2>Edit Job</h2>

              <button
                type="button"
                onClick={() => setEditingJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>

              <label>Job Title</label>
              <input
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                required
              />

              <label>Company Name</label>
              <input
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
              />

              <label>Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <label>Employment Type</label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>

              <label>Job Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              />

              <button
                type="submit"
                className="save-job-button"
                disabled={updating}
              >
                <Save size={17} />
                {updating ? "Updating..." : "Save Changes"}
              </button>

            </form>
          </div>
        )}

        {loading && <p>Loading your jobs...</p>}

        {!loading && jobs.length === 0 && !error && (
          <p>You haven't posted any jobs yet.</p>
        )}

        {!loading && jobs.length > 0 && (
          <div className="my-jobs-list">

            {jobs.map((job) => (
              <div className="my-job-card" key={job.job_id}>

                <div className="my-job-header">
                  <div>
                    <h3>{job.job_title}</h3>
                    <h4>{job.company_name}</h4>
                  </div>

                  <span className="job-type">
                    {job.employment_type}
                  </span>
                </div>

                <div className="my-job-details">

                  <p>
                    <MapPin size={16} />
                    {job.location}
                  </p>

                  <p>
                    <Clock size={16} />
                    Posted on:{" "}
                    {job.posted_at
                      ? new Date(job.posted_at).toLocaleDateString("en-IN")
                      : "Date unavailable"}
                  </p>

                  <p>
                    <Users size={16} />
                    Total Applications: {job.total_applications ?? 0}
                  </p>

                </div>

                <p className="my-job-description">
                  {job.description}
                </p>

                <div className="my-job-actions">

                  <button
                    className="edit-job-button"
                    onClick={() => handleEdit(job)}
                  >
                    <Edit size={16} />
                    Edit Job
                  </button>

                  <button
                    className="delete-job-button"
                    onClick={() => handleDelete(job.job_id)}
                    disabled={deletingId === job.job_id}
                  >
                    <Trash2 size={16} />
                    {deletingId === job.job_id
                      ? "Deleting..."
                      : "Delete Job"}
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

export default MyJobs;
