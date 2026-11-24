
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Briefcase, Clock } from "lucide-react";

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/applications/my-applications",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setApplications(response.data.applications || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load applications."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusClass = (status) => {
    return status?.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>My Applications</h1>
          <p>Track your job applications</p>
        </div>

        <button onClick={() => navigate("/dashboard/student")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">
        <h2>Applied Jobs</h2>

        {loading && <p>Loading applications...</p>}

        {error && (
          <p className="error-message">{error}</p>
        )}

        {!loading && !error && applications.length === 0 && (
          <p>You haven't applied for any jobs yet.</p>
        )}

        {!loading && applications.length > 0 && (
          <div className="applications-list">
            {applications.map((app) => (
              <div className="application-card" key={app.application_id}>
                <div className="application-info">
                  <h3>{app.job_title}</h3>

                  <p>
                    <Briefcase size={16} />
                    {app.company_name}
                  </p>

                  <p>
                    <Clock size={16} />
                    {app.location} | {app.employment_type}
                  </p>

                  <p>
                    Application ID: {app.application_id}
                  </p>

                  <p>
                    Applied on:{" "}
                    {new Date(app.applied_at).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="application-status">
                  <span className={`status-badge ${getStatusClass(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyApplications;
