
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
    ArrowLeft,
    Briefcase,
    Building2,
    MapPin,
    CalendarDays,
    Clock
} from "lucide-react";

function ApplicationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDetails = async () => {
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
                    applicationsResponse,
                    historyResponse
                ] = await Promise.all([
                    axios.get(
                        "http://localhost:5000/api/applications/my-applications",
                        config
                    ),
                    axios.get(
                        "http://localhost:5000/api/applications/my-history",
                        config
                    )
                ]);

                const applications =
                    applicationsResponse.data.applications || [];

                const selectedApplication = applications.find(
                    (item) =>
                        Number(item.application_id) === Number(id)
                );

                if (!selectedApplication) {
                    setError("Application not found.");
                    return;
                }

                setApplication(selectedApplication);

                const allHistory =
                    historyResponse.data.history || [];

                const selectedHistory = allHistory
                    .filter(
                        (item) =>
                            Number(item.application_id) === Number(id)
                    )
                    .sort(
                        (a, b) =>
                            new Date(a.changed_at) -
                            new Date(b.changed_at)
                    );

                setHistory(selectedHistory);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load application details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="dashboard-page application-details-redesign">
                <p>Loading application details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page application-details-redesign">
                <p className="student-job-error">{error}</p>

                <button
                    onClick={() =>
                        navigate("/student/my-applications")
                    }
                >
                    Back to Applications
                </button>
            </div>
        );
    }

    if (!application) return null;

    return (
<div className="dashboard-page application-details-redesign">
            <header className="dashboard-header">
                <div>
                    <h1>Application Details</h1>
                    <p>Track your job application progress</p>
                </div>

                <button
                    onClick={() =>
                        navigate("/student/my-applications")
                    }
                >
                    <ArrowLeft size={18} />
                    Back
                </button>
            </header>

            <main className="dashboard-content">

                <section className="application-details-card">

                    <h2>{application.job_title}</h2>

                    <p>
                        <Building2 size={17} />
                        {application.company_name}
                    </p>

                    <p>
                        <MapPin size={17} />
                        {application.location || "Location not specified"}
                    </p>

                    <p>
                        <Briefcase size={17} />
                        {application.employment_type || "Not specified"}
                    </p>

                    <p>
                        <CalendarDays size={17} />
                        Applied on:{" "}
                        {application.applied_at
                            ? new Date(
                                application.applied_at
                            ).toLocaleDateString("en-IN")
                            : "Date unavailable"}
                    </p>

                    <div className="application-current-status">
                        Current Status:{" "}
                        <strong>{application.status}</strong>
                    </div>

                    <p>
                        Application ID: #{application.application_id}
                    </p>

                </section>

                <section className="application-history-section">

                    <h2>Application Status Timeline</h2>

                    {history.length === 0 ? (
                        <p>No status history available.</p>
                    ) : (
                        <div className="application-timeline">

                            {history.map((item, index) => (
                                <div
                                    className="application-timeline-item"
                                    key={item.history_id || index}
                                >
                                    <h3>
                                        {item.old_status
                                            ? `${item.old_status} → ${item.new_status}`
                                            : item.new_status}
                                    </h3>

                                    <p>
                                        <Clock size={14} />

                                        {item.changed_at
                                            ? new Date(
                                                item.changed_at
                                            ).toLocaleString("en-IN")
                                            : "Date unavailable"}
                                    </p>

                                    {item.remarks && (
                                        <p>
                                            Remarks: {item.remarks}
                                        </p>
                                    )}
                                </div>
                            ))}

                        </div>
                    )}

                </section>

            </main>
        </div>
    );
}

export default ApplicationDetails;
