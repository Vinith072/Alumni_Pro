
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    ArrowLeft,
    Briefcase,
    Building2,
    MapPin,
    CalendarDays,
    History,
    RefreshCw,
    X,
    Clock
} from "lucide-react";

function StudentApplications() {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [history, setHistory] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);

    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch applications
    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError("");

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
                "Unable to load applications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // Fetch application history
    const handleViewHistory = async (application) => {
        try {
            setSelectedApplication(application);
            setHistory([]);
            setHistoryLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/applications/my-history",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const allHistory = response.data.history || [];

            const filteredHistory = allHistory
                .filter(
                    (item) =>
                        Number(item.application_id) ===
                        Number(application.application_id)
                )
                .sort(
                    (a, b) =>
                        new Date(a.changed_at) - new Date(b.changed_at)
                );

            setHistory(filteredHistory);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load application history."
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    // Status colors
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
        <div className="dashboard-page student-applications-redesign">

            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1>My Applications</h1>
                    <p>
                        Track your job applications and their progress
                    </p>
                </div>

                <button
                    onClick={() => navigate("/dashboard/student")}
                >
                    <ArrowLeft size={18} />
                    Dashboard
                </button>
            </header>

            <main className="dashboard-content">

                {/* Heading */}
                <div className="student-applications-heading">
                    <div>
                        <h2>Applied Jobs</h2>
                        <p>
                            You have submitted {applications.length} applications.
                        </p>
                    </div>

                    <button
                        className="refresh-users-button"
                        onClick={fetchApplications}
                        disabled={loading}
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <p>Loading applications...</p>
                )}

                {/* Error */}
                {!loading && error && (
                    <p className="student-job-error">
                        {error}
                    </p>
                )}

                {/* Empty State */}
                {!loading && !error && applications.length === 0 && (
                    <div className="student-job-empty">
                        <Briefcase size={42} />

                        <h3>No applications yet</h3>

                        <p>
                            Browse jobs and submit your first application.
                        </p>

                        <button
                            className="view-job-button"
                            onClick={() => navigate("/student/jobs")}
                        >
                            Browse Jobs
                        </button>
                    </div>
                )}

                {/* Application Cards */}
                {!loading && !error && applications.length > 0 && (
                    <div className="student-applications-list">

                        {applications.map((application) => (
                            <div
                                className="student-application-card"
                                key={application.application_id}
                            >

                                <div className="student-application-top">
                                    <div className="student-application-icon">
                                        <Briefcase size={25} />
                                    </div>

                                    <span
                                        className={`application-status-badge ${getStatusClass(
                                            application.status
                                        )}`}
                                    >
                                        {application.status}
                                    </span>
                                </div>

                                <h3>{application.job_title}</h3>

                                <div className="student-application-info">

                                    <div>
                                        <Building2 size={16} />
                                        <span>{application.company_name}</span>
                                    </div>

                                    <div>
                                        <MapPin size={16} />
                                        <span>
                                            {application.location || "Not specified"}
                                        </span>
                                    </div>

                                    <div>
                                        <Briefcase size={16} />
                                        <span>
                                            {application.employment_type || "Not specified"}
                                        </span>
                                    </div>

                                    <div>
                                        <CalendarDays size={16} />
                                        <span>
                                            Applied: {application.applied_at
                                                ? new Date(application.applied_at)
                                                    .toLocaleDateString("en-IN")
                                                : "Date unavailable"}
                                        </span>
                                    </div>

                                </div>

                                {/* Application ID */}
                                <p className="application-id">
                                    Application ID: #{application.application_id}
                                </p>

                                {/* Application Actions */}
                                <div className="application-card-actions">

                                    <button
                                        type="button"
                                        className="application-details-btn"
                                        onClick={() =>
                                            navigate(
                                                `/student/application-details/${application.application_id}`
                                            )
                                        }
                                    >
                                        View Details
                                    </button>

                                    <button
                                        type="button"
                                        className="student-view-history-btn"
                                        onClick={() =>
                                            handleViewHistory(application)
                                        }
                                    >
                                        <History size={16} />
                                        View History
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </main>

            {/* History Modal */}
            {selectedApplication && (
                <div
                    className="application-history-overlay"
                    onClick={() => setSelectedApplication(null)}
                >
                    <div
                        className="application-history-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="application-history-header">
                            <div>
                                <h2>Application History</h2>

                                <p>
                                    {selectedApplication.job_title}
                                </p>

                                <span>
                                    Application ID: #
                                    {selectedApplication.application_id}
                                </span>
                            </div>

                            <button
                                onClick={() => setSelectedApplication(null)}
                                aria-label="Close"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {historyLoading ? (
                            <p>Loading history...</p>
                        ) : history.length === 0 ? (
                            <p>No history records available.</p>
                        ) : (
                            <div className="student-history-timeline">

                                {history.map((item, index) => (
                                    <div
                                        className="student-history-item"
                                        key={item.history_id || index}
                                    >
                                        <div className="student-history-dot" />

                                        <div className="student-history-content">
                                            <h4>
                                                {item.old_status
                                                    ? `${item.old_status} → ${item.new_status}`
                                                    : item.new_status}
                                            </h4>

                                            <p>
                                                <Clock size={14} />

                                                {item.changed_at
                                                    ? new Date(item.changed_at)
                                                        .toLocaleString("en-IN")
                                                    : "Date unavailable"}
                                            </p>

                                            {item.remarks && (
                                                <p>
                                                    Remarks: {item.remarks}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                            </div>
                        )}

                        <div className="application-history-modal-footer">
                            <button
                                onClick={() => setSelectedApplication(null)}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default StudentApplications;
