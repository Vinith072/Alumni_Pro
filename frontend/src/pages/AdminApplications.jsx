
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  User,
  Briefcase,
  MapPin,
  Calendar,
  RefreshCw,
  Save,
  History,
  X,
  Clock,
  FileText
} from "lucide-react";

const statuses = [
  "Applied",
  "Referred",
  "Shortlisted",
  "Interviewed",
  "Selected",
  "Rejected"
];

function AdminApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Application history states
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Fetch all applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/application-status",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const records = response.data.applications || [];

      setApplications(records);

      const statusValues = {};

      records.forEach((application) => {
        statusValues[application.application_id] =
          application.status;
      });

      setSelectedStatuses(statusValues);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle status selection
  const handleStatusChange = (applicationId, status) => {
    setSelectedStatuses((previous) => ({
      ...previous,
      [applicationId]: status
    }));
  };

  // Update application status
  const handleUpdateStatus = async (application) => {
    const applicationId = application.application_id;
    const newStatus = selectedStatuses[applicationId];

    if (newStatus === application.status) {
      setMessage("No status changes to save.");
      return;
    }

    if (
      application.status === "Selected" ||
      application.status === "Rejected"
    ) {
      setError(
        "Selected and Rejected applications are final."
      );
      return;
    }

    const confirmed = window.confirm(
      `Change application status to ${newStatus}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(applicationId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/application-status/${applicationId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        response.data.message ||
        "Application status updated successfully!"
      );

      await fetchApplications();

      // Refresh history if it is currently open
      if (selectedApplication === applicationId) {
        await fetchApplicationHistory(applicationId);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update application status."
      );

      await fetchApplications();

    } finally {
      setUpdatingId(null);
    }
  };

  // Fetch application history
  const fetchApplicationHistory = async (applicationId) => {
    try {
      setHistoryLoading(true);
      setHistory([]);
      setSelectedApplication(applicationId);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/application-status/${applicationId}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setHistory(response.data.history || []);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load application history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // Close history
  const closeHistory = () => {
    setSelectedApplication(null);
    setHistory([]);
    setHistoryLoading(false);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  // Status color
  const getStatusClass = (status) => {
    switch (status) {
      case "Applied":
        return "status-applied";
      case "Referred":
        return "status-referred";
      case "Shortlisted":
        return "status-shortlisted";
      case "Interviewed":
        return "status-interviewed";
      case "Selected":
        return "status-selected";
      case "Rejected":
        return "status-rejected";
      default:
        return "";
    }
  };

  return (
    <div className="dashboard-page admin-applications-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Applications Management</h1>
          <p>Review and manage student job applications</p>
        </div>

        <button onClick={() => navigate("/dashboard/admin")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">

        <h2>All Applications ({applications.length})</h2>

        {message && (
          <p className="form-success">{message}</p>
        )}

        {error && (
          <p className="form-error">{error}</p>
        )}

        <button
          className="refresh-users-button"
          onClick={fetchApplications}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh Applications
        </button>

        {loading && <p>Loading applications...</p>}

        {!loading && applications.length === 0 && !error && (
          <p>No applications found.</p>
        )}

        {/* Applications List */}
        {!loading && applications.length > 0 && (

          <div className="admin-applications-list">

            {applications.map((application) => {

              const isFinal =
                application.status === "Selected" ||
                application.status === "Rejected";

              return (
                <div
                  className="admin-application-card"
                  key={application.application_id}
                >

                  {/* Job Heading */}
                  <div className="admin-application-heading">
                    <div>
                      <h3>{application.job_title}</h3>
                      <p>{application.company_name}</p>
                    </div>

                    <span className="application-id">
                      Application #{application.application_id}
                    </span>
                  </div>

                  {/* Application Details */}
                  <div className="admin-application-details">

                    <p>
                      <User size={16} />
                      Student: {application.student_name}
                    </p>

                    <p>
                      Email: {application.student_email}
                    </p>

                    <p>
                      <Briefcase size={16} />
                      Posted by: {application.posted_by}
                    </p>

                    <p>
                      <MapPin size={16} />
                      Location: {application.location}
                    </p>

                    <p>
                      <Calendar size={16} />
                      Applied: {formatDate(application.applied_at)}
                    </p>

                  </div>

                  {/* Status Management */}
                  <div className="application-status-section">

                    <div>
                      <label>Current Status</label>

                      <p
                        className={`current-application-status ${getStatusClass(application.status)}`}
                      >
                        {application.status}
                      </p>
                    </div>

                    <div>
                      <label>Update Status</label>

                      <select
                        value={
                          selectedStatuses[application.application_id] ||
                          application.status
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            application.application_id,
                            e.target.value
                          )
                        }
                        disabled={
                          isFinal ||
                          updatingId === application.application_id
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="save-application-status"
                      onClick={() =>
                        handleUpdateStatus(application)
                      }
                      disabled={
                        isFinal ||
                        updatingId === application.application_id ||
                        selectedStatuses[application.application_id] ===
                          application.status
                      }
                    >
                      <Save size={16} />

                      {updatingId === application.application_id
                        ? "Updating..."
                        : "Save Status"}
                    </button>

                  </div>

                  {isFinal && (
                    <p className="final-application-message">
                      This application has reached its final status.
                    </p>
                  )}

                  {/* View History Button */}
                  <div className="application-history-action">

                    <button
                      className="view-history-button"
                      onClick={() =>
                        fetchApplicationHistory(
                          application.application_id
                        )
                      }
                    >
                      <History size={17} />
                      View History
                    </button>

                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* Application History Panel */}
        {selectedApplication !== null && (

          <div className="history-overlay">

            <div className="history-modal">

              <div className="history-modal-header">

                <div>
                  <h2>
                    <History size={21} />
                    Application History
                  </h2>

                  <p>
                    Application ID: #{selectedApplication}
                  </p>
                </div>

                <button
                  className="close-history-button"
                  onClick={closeHistory}
                  aria-label="Close history"
                >
                  <X size={22} />
                </button>

              </div>

              <div className="history-modal-body">

                {historyLoading && (
                  <p className="history-loading">
                    Loading application history...
                  </p>
                )}

                {!historyLoading && history.length === 0 && (
                  <p className="history-empty">
                    No application history found.
                  </p>
                )}

                {!historyLoading && history.length > 0 && (

                  <div className="history-timeline">

                    {history.map((item) => (

                      <div
                        className="history-item"
                        key={item.history_id}
                      >

                        <div className="history-icon">
                          <Clock size={18} />
                        </div>

                        <div className="history-item-content">

                          <h3>
                            {item.old_status
                              ? `${item.old_status} → ${item.new_status}`
                              : `Application ${item.new_status}`}
                          </h3>

                          <p>
                            <strong>Changed by:</strong>{" "}
                            {item.changed_by_name ||
                              item.changed_by ||
                              "System"}
                          </p>

                          <p>
                            <Calendar size={14} />
                            {formatDate(item.changed_at)}
                          </p>

                          <p className="history-remarks">
                            <FileText size={14} />
                            <strong>Remarks:</strong>{" "}
                            {item.remarks || "No remarks provided"}
                          </p>

                        </div>

                      </div>

                    ))}

                  </div>
                )}

              </div>

              <div className="history-modal-footer">

                <button onClick={closeHistory}>
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

      </main>
    </div>
  );
}

export default AdminApplications;
