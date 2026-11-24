
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  FileText,
  Handshake,
  ShieldCheck,
  BarChart3,
  ClipboardList,
  UserCog,
  LogOut,
  RefreshCw,
  TrendingUp,
  UserRound
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Admin Dashboard Statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard-stats",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStats(response.data.statistics || {});

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

  // Statistics Card
  const StatCard = ({ icon: Icon, title, value }) => (
    <div className="dashboard-card admin-stat-card">
      <div className="admin-stat-icon">
        <Icon size={23} />
      </div>

      <div>
        <h4>{title}</h4>
        <h2>{value ?? 0}</h2>
      </div>
    </div>
  );

  // Management Card
  const ManagementCard = ({
    icon: Icon,
    title,
    description,
    path
  }) => (
    <button
      type="button"
      className="dashboard-card admin-management-card"
      onClick={() => navigate(path)}
    >
      <Icon size={27} />
      <h3>{title}</h3>
      <p>{description}</p>
      <span>Manage Now →</span>
    </button>
  );

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>SAHYADRI COLLEGE</h1>
          <p>Admin Dashboard</p>
        </div>

        <div className="admin-header-actions">

          <button
            type="button"
            onClick={fetchDashboardStats}
            disabled={loading}
            className="admin-refresh-button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-logout-button"
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>
      </header>

      <main className="dashboard-content">

        {/* Welcome */}
        <section className="admin-welcome">
          <div>
            <h2>Welcome, Admin!</h2>
            <p>
              Manage students, alumni, jobs and platform activities.
            </p>
          </div>
        </section>

        {error && (
          <p className="form-error">{error}</p>
        )}

        {/* Dashboard Statistics */}
        <section className="admin-dashboard-section">

          <div className="admin-section-heading">
            <div>
              <h2>Dashboard Analytics</h2>
              <p>Overall platform statistics</p>
            </div>
          </div>

          {loading ? (
            <p>Loading dashboard statistics...</p>
          ) : (
            <div className="dashboard-grid admin-stats-grid">

              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.total_users}
              />

              <StatCard
                icon={UserCheck}
                title="Total Students"
                value={stats.total_students}
              />

              <StatCard
                icon={Users}
                title="Total Alumni"
                value={stats.total_alumni}
              />

              <StatCard
                icon={Clock}
                title="Pending Alumni"
                value={stats.pending_alumni}
              />

              <StatCard
                icon={ShieldCheck}
                title="Verified Alumni"
                value={stats.verified_alumni}
              />

              <StatCard
                icon={UserX}
                title="Rejected Alumni"
                value={stats.rejected_alumni}
              />

              <StatCard
                icon={Briefcase}
                title="Total Jobs"
                value={stats.total_jobs}
              />

              <StatCard
                icon={FileText}
                title="Total Applications"
                value={stats.total_applications}
              />

              <StatCard
                icon={Handshake}
                title="Total Referrals"
                value={stats.total_referrals}
              />

            </div>
          )}

        </section>

        {/* Management */}
        <section className="admin-dashboard-section">

          <div className="admin-section-heading">
            <div>
              <h2>Management</h2>
              <p>Manage all platform activities</p>
            </div>
          </div>

          <div className="dashboard-grid admin-management-grid">

            <ManagementCard
              icon={ShieldCheck}
              title="Alumni Verification"
              description="Review and approve alumni registrations."
              path="/admin/alumni-verification"
            />

            <ManagementCard
              icon={UserCog}
              title="User Management"
              description="View, deactivate and reactivate user accounts."
              path="/admin/users"
            />

            <ManagementCard
              icon={ClipboardList}
              title="Applications Management"
              description="Review applications and update their status."
              path="/admin/applications"
            />

            <ManagementCard
              icon={BarChart3}
              title="Reports & Analytics"
              description="View platform statistics and reports."
              path="/admin/analytics"
            />

            {/* My Profile */}
            <ManagementCard
              icon={UserRound}
              title="My Profile"
              description="View and update your personal and account details."
              path="/admin/profile"
            />

          </div>

        </section>

        {/* Quick Overview */}
        <section className="admin-dashboard-section">

          <div className="admin-section-heading">
            <div>
              <h2>Quick Overview</h2>
              <p>Important platform information</p>
            </div>
          </div>

          <div className="admin-quick-overview">

            <div>
              <TrendingUp size={21} />
              <span>Active platform management</span>
            </div>

            <div>
              <UserCheck size={21} />
              <span>Alumni verification system</span>
            </div>

            <div>
              <Briefcase size={21} />
              <span>Job and referral management</span>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;
