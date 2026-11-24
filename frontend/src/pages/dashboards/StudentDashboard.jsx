
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Briefcase,
  FileText,
  Users,
  LogOut,
  Clock,
  Search,
  Handshake,
  UserRound
} from "lucide-react";

function StudentDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Student Dashboard Statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/applications/dashboard-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStats(
        response.data.statistics ||
        response.data.stats ||
        {}
      );

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="dashboard-page">

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div>
          <h1>WELCOME, STUDENT!</h1>
          <p>
            Sahyadri Alumni Connect - Student Dashboard
          </p>
        </div>

        <button onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <main className="dashboard-content">

        {/* Dashboard Statistics */}
        <h2>My Overview</h2>

        {loading ? (
          <p>Loading dashboard statistics...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="dashboard-grid">

            <div className="dashboard-card">
              <Briefcase size={28} />
              <h3>Total Jobs</h3>
              <h2>{stats.total_jobs ?? 0}</h2>
              <p>Available job opportunities</p>
            </div>

            <div className="dashboard-card">
              <FileText size={28} />
              <h3>My Applications</h3>
              <h2>{stats.total_applications ?? 0}</h2>
              <p>Jobs you have applied for</p>
            </div>

            <div className="dashboard-card">
              <Users size={28} />
              <h3>Referred</h3>
              <h2>{stats.referred ?? 0}</h2>
              <p>Applications with referrals</p>
            </div>

            <div
              className="dashboard-card clickable-card"
              onClick={() =>
                navigate("/student/application-history")
              }
            >
              <Clock size={28} />
              <h3>Application History</h3>
              <p>Track your application progress</p>
            </div>

          </div>
        )}

        {/* Student Features */}
        <h2 className="dashboard-section-title">
          Student Services
        </h2>

        <div className="dashboard-grid">

          {/* Browse Jobs */}
          <div
            className="dashboard-card clickable-card"
            onClick={() => navigate("/student/jobs")}
          >
            <Search size={30} />
            <h3>Browse Jobs</h3>
            <p>
              Explore job opportunities posted by verified alumni.
            </p>
          </div>

          {/* My Applications */}
          <div
            className="dashboard-card clickable-card"
            onClick={() => navigate("/student/my-applications")}
          >
            <FileText size={30} />
            <h3>My Applications</h3>
            <p>
              View your applications and check their current status.
            </p>
          </div>

          {/* Referral Requests */}
          <div
            className="dashboard-card clickable-card"
            onClick={() => navigate("/student/referral-request")}
          >
            <Handshake size={30} />
            <h3>Referral Requests</h3>
            <p>
              Find verified alumni, request job referrals and track responses.
            </p>
          </div>

          {/* Application History */}
          <div
            className="dashboard-card clickable-card"
            onClick={() => navigate("/student/application-history")}
          >
            <Clock size={30} />
            <h3>Application History</h3>
            <p>
              Track the complete history of your application status.
            </p>
          </div>

          {/* My Profile */}
          <div
            className="dashboard-card clickable-card"
            onClick={() => navigate("/student/profile")}
          >
            <UserRound size={30} />
            <h3>My Profile</h3>
            <p>
              View and update your personal details, education and skills.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}

export default StudentDashboard;
