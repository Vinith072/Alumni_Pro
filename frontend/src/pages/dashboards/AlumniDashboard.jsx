
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Briefcase,
  Users,
  FileText,
  LogOut,
  UserCheck,
  Award,
  UserRound
} from "lucide-react";

function AlumniDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Alumni Dashboard Statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/jobs/statistics",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setStats(response.data.summary);

      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard-page alumni-dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h2>SAHYADRI COLLEGE</h2>
          <p>Alumni Dashboard</p>
        </div>

        <button onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <main className="dashboard-content">

        <div className="alumni-welcome">
  <h1>WELCOME, ALUMNI!</h1>
  <p>Share opportunities and support your juniors.</p>
</div>

        {/* Analytics */}
        <h2 className="alumni-section-title">
          Dashboard Analytics
        </h2>

        {loading && <p>Loading statistics...</p>}

        {error && (
          <p className="error-message">{error}</p>
        )}

        {stats && (
          <div className="dashboard-grid">

            <div className="dashboard-card">
              <Briefcase size={25} />
              <h3>Total Jobs Posted</h3>
              <h2>{stats.total_jobs ?? 0}</h2>
            </div>

            <div className="dashboard-card">
              <Users size={25} />
              <h3>Total Applications</h3>
              <h2>{stats.total_applications ?? 0}</h2>
            </div>

            <div className="dashboard-card">
              <UserCheck size={25} />
              <h3>Shortlisted</h3>
              <h2>{stats.shortlisted ?? 0}</h2>
            </div>

            <div className="dashboard-card">
              <Award size={25} />
              <h3>Selected</h3>
              <h2>{stats.selected ?? 0}</h2>
            </div>

          </div>
        )}

        {/* Alumni Actions */}
        <h2 className="alumni-section-title">
          Manage Opportunities
        </h2>

        <div className="dashboard-grid">

          {/* Post Jobs */}
          <div
            className="dashboard-card clickable-card"
            onClick={() => navigate("/alumni/post-job")}
          >
            <Briefcase size={26} />
            <h3>Post Jobs</h3>
            <p>Share opportunities at your company.</p>
            <span>Post a new job →</span>
          </div>

          {/* Referral Requests */}
          <div
            className="dashboard-card clickable-card"
            onClick={() => navigate("/alumni/referrals")}
          >
            <Users size={26} />
            <h3>Referral Requests</h3>
            <p>View and respond to student requests.</p>
            <span>View requests →</span>
          </div>

          {/* My Job Posts */}
          <div
            className="dashboard-card clickable-card"
            onClick={() => navigate("/alumni/my-jobs")}
          >
            <FileText size={26} />
            <h3>My Job Posts</h3>
            <p>Manage all your posted opportunities.</p>
            <span>Manage jobs →</span>
          </div>

          {/* My Profile */}
          <div
            className="dashboard-card clickable-card"
            onClick={() => navigate("/alumni/profile")}
          >
            <UserRound size={26} />
            <h3>My Profile</h3>
            <p>
              View and update your personal details,
              company and professional information.
            </p>
            <span>View profile →</span>
          </div>

        </div>

      </main>
    </div>
  );
}

export default AlumniDashboard;
