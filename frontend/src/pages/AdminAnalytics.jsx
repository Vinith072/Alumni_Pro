
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Users,
  Briefcase,
  FileText,
  UserCheck,
  RefreshCw,
  TrendingUp,
  Download,
  GraduationCap
} from "lucide-react";

const statusColors = {
  Applied: "#2563eb",
  Referred: "#7c3aed",
  Shortlisted: "#0891b2",
  Interviewed: "#d97706",
  Selected: "#16a34a",
  Rejected: "#dc2626"
};

function AdminAnalytics() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const [
        statsResponse,
        applicationsResponse,
        jobsResponse,
        usersResponse
      ] = await Promise.all([
        axios.get(
          "http://localhost:5000/api/admin/dashboard-stats",
          config
        ),
        axios.get(
          "http://localhost:5000/api/application-status",
          config
        ),
        axios.get(
          "http://localhost:5000/api/jobs",
          config
        ),
        axios.get(
          "http://localhost:5000/api/admin/users",
          config
        )
      ]);

      setStats(statsResponse.data.statistics || {});
      setApplications(
        applicationsResponse.data.applications || []
      );
      setJobs(jobsResponse.data.jobs || []);
      setUsers(usersResponse.data.users || []);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // CSV helper
  const escapeCSV = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const downloadCSV = (filename, headers, rows) => {
    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) =>
        row.map(escapeCSV).join(",")
      )
    ].join("\r\n");

    const blob = new Blob(
      ["\uFEFF", csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Export Applications CSV
  const exportApplicationsCSV = () => {
    if (applications.length === 0) {
      alert("No applications available to export.");
      return;
    }

    const headers = [
      "Application ID",
      "Student Name",
      "Student Email",
      "Job Title",
      "Company",
      "Location",
      "Application Status",
      "Applied Date"
    ];

    const rows = applications.map((application) => [
      application.application_id,
      application.student_name,
      application.student_email,
      application.job_title,
      application.company_name,
      application.location,
      application.status,
      application.applied_at
        ? new Date(application.applied_at).toLocaleString("en-IN")
        : ""
    ]);

    downloadCSV(
      "Sahyadri_Applications_Report.csv",
      headers,
      rows
    );
  };

  // Export Alumni Verification CSV
  const exportAlumniCSV = () => {
    const alumni = users.filter(
      (user) => user.role === "Alumni"
    );

    if (alumni.length === 0) {
      alert("No alumni records available to export.");
      return;
    }

    const headers = [
      "User ID",
      "Full Name",
      "Email",
      "Department",
      "Graduation Year",
      "Current Company",
      "Job Title",
      "Verification Status",
      "Account Status"
    ];

    const rows = alumni.map((person) => [
      person.user_id,
      person.full_name,
      person.email,
      person.department,
      person.graduation_year,
      person.current_company,
      person.job_title,
      person.verification_status,
      person.is_active ? "Active" : "Inactive"
    ]);

    downloadCSV(
      "Sahyadri_Alumni_Verification_Report.csv",
      headers,
      rows
    );
  };

  // Count applications by status
  const statusCounts = {
    Applied: 0,
    Referred: 0,
    Shortlisted: 0,
    Interviewed: 0,
    Selected: 0,
    Rejected: 0
  };

  applications.forEach((application) => {
    if (statusCounts[application.status] !== undefined) {
      statusCounts[application.status]++;
    }
  });

  const maxStatusCount = Math.max(
    1,
    ...Object.values(statusCounts)
  );

  // User distribution
  const studentCount = users.filter(
    (user) => user.role === "Student"
  ).length;

  const alumniCount = users.filter(
    (user) => user.role === "Alumni"
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "Admin"
  ).length;

  // Alumni verification statistics
  const verifiedAlumni = users.filter(
    (user) =>
      user.role === "Alumni" &&
      user.verification_status === "Verified"
  ).length;

  const pendingAlumni = users.filter(
    (user) =>
      user.role === "Alumni" &&
      user.verification_status === "Pending"
  ).length;

  const rejectedAlumni = users.filter(
    (user) =>
      user.role === "Alumni" &&
      user.verification_status === "Rejected"
  ).length;

  // Top jobs by application count
  const jobApplicationCounts = jobs.map((job) => {
    const count = applications.filter(
      (application) =>
        Number(application.job_id) === Number(job.job_id)
    ).length;

    return {
      ...job,
      applicationCount: count
    };
  });

  const topJobs = [...jobApplicationCounts]
    .sort((a, b) => b.applicationCount - a.applicationCount)
    .slice(0, 5);

  const maxJobCount = Math.max(
    1,
    ...topJobs.map((job) => job.applicationCount)
  );

  // Statistics card
  const StatCard = ({ icon: Icon, title, value }) => (
    <div className="analytics-stat-card">
      <div className="analytics-stat-icon">
        <Icon size={23} />
      </div>

      <div>
        <p>{title}</p>
        <h2>{value ?? 0}</h2>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page admin-analytics-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Admin Reports & Analytics</h1>
          <p>Insights into Sahyadri Alumni Connect</p>
        </div>

        <button onClick={() => navigate("/dashboard/admin")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">

        {error && (
          <p className="form-error">{error}</p>
        )}

        {/* Page Heading and Export Buttons */}
        <div className="analytics-page-heading">

          <div>
            <h2>Platform Overview</h2>
            <p>Live statistics from the database</p>
          </div>

          <div className="analytics-action-buttons">

            <button
              className="export-report-button"
              onClick={exportApplicationsCSV}
              disabled={loading || applications.length === 0}
            >
              <Download size={16} />
              Export Applications
            </button>

            <button
              className="export-alumni-button"
              onClick={exportAlumniCSV}
              disabled={loading || alumniCount === 0}
            >
              <GraduationCap size={16} />
              Export Alumni
            </button>

            <button
              className="refresh-users-button"
              onClick={fetchAnalytics}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

          </div>

        </div>

        {loading ? (
          <p>Loading analytics...</p>
        ) : (
          <>

            {/* Overall Statistics */}
            <div className="analytics-stats-grid">

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
                icon={TrendingUp}
                title="Total Referrals"
                value={stats.total_referrals}
              />

            </div>

            {/* Applications by Status */}
            <section className="analytics-panel">

              <h2>Applications by Status</h2>
              <p>Distribution of student job applications</p>

              <div className="analytics-bar-chart">

                {Object.entries(statusCounts).map(
                  ([status, count]) => (

                    <div
                      className="analytics-bar-row"
                      key={status}
                    >

                      <span className="analytics-bar-label">
                        {status}
                      </span>

                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar-fill"
                          style={{
                            width: `${
                              (count / maxStatusCount) * 100
                            }%`,
                            background: statusColors[status]
                          }}
                        />
                      </div>

                      <strong>{count}</strong>

                    </div>

                  )
                )}

              </div>
            </section>

            {/* Alumni Verification */}
            <section className="analytics-panel">

              <h2>Alumni Verification Statistics</h2>
              <p>Alumni registration and approval status</p>

              <div className="verification-stats-grid">

                <div className="verification-stat verified">
                  <h3>{verifiedAlumni}</h3>
                  <p>Verified Alumni</p>
                </div>

                <div className="verification-stat pending">
                  <h3>{pendingAlumni}</h3>
                  <p>Pending Alumni</p>
                </div>

                <div className="verification-stat rejected">
                  <h3>{rejectedAlumni}</h3>
                  <p>Rejected Alumni</p>
                </div>

              </div>
            </section>

            {/* User Distribution */}
            <section className="analytics-panel">

              <h2>User Distribution</h2>

              <div className="analytics-distribution">

                <div>
                  <span>Students</span>
                  <strong>{studentCount}</strong>
                </div>

                <div>
                  <span>Alumni</span>
                  <strong>{alumniCount}</strong>
                </div>

                <div>
                  <span>Admins</span>
                  <strong>{adminCount}</strong>
                </div>

              </div>
            </section>

            {/* Top Job Opportunities */}
            <section className="analytics-panel">

              <h2>Top Job Opportunities</h2>
              <p>Jobs ranked by number of applications</p>

              {topJobs.length === 0 ? (
                <p>No job data available.</p>
              ) : (

                <div className="analytics-bar-chart">

                  {topJobs.map((job) => (

                    <div
                      className="analytics-bar-row"
                      key={job.job_id}
                    >

                      <span className="analytics-job-label">
                        {job.job_title}
                      </span>

                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar-fill"
                          style={{
                            width: `${
                              (job.applicationCount / maxJobCount) * 100
                            }%`,
                            background: "#2563eb"
                          }}
                        />
                      </div>

                      <strong>{job.applicationCount}</strong>

                    </div>

                  ))}

                </div>

              )}

            </section>

          </>
        )}

      </main>
    </div>
  );
}

export default AdminAnalytics;
