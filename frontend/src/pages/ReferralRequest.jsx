
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Users,
  Send,
  Building2,
  MapPin,
  Briefcase,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

function ReferralRequest() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [eligibleAlumni, setEligibleAlumni] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadingAlumni, setLoadingAlumni] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [expandedApplication, setExpandedApplication] = useState(null);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`
  };

  // ==========================================
  // FETCH STUDENT APPLICATIONS AND REFERRALS
  // ==========================================

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const [applicationsResponse, referralsResponse] =
        await Promise.all([
          axios.get(
            "http://localhost:5000/api/applications/my-applications",
            { headers }
          ),
          axios.get(
            "http://localhost:5000/api/referrals/student/my-requests",
            { headers }
          )
        ]);

      setApplications(
        applicationsResponse.data.applications || []
      );

      setReferrals(
        referralsResponse.data.referrals || []
      );

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Unable to load referral information."
      );
      setMessageType("error");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // FIND ELIGIBLE ALUMNI FOR AN APPLICATION
  // ==========================================

  const handleFindAlumni = async (application) => {
    const applicationId = application.application_id;

    try {
      setLoadingAlumni(applicationId);
      setMessage("");
      setMessageType("");

      setExpandedApplication(applicationId);

      const response = await axios.get(
        `http://localhost:5000/api/referrals/eligible/${applicationId}`,
        { headers }
      );

      setEligibleAlumni((previous) => ({
        ...previous,
        [applicationId]: response.data.alumni || []
      }));

      if (!response.data.alumni?.length) {
        setMessage(
          `No verified alumni found at ${application.company_name}.`
        );
        setMessageType("info");
      }

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Unable to find eligible alumni."
      );
      setMessageType("error");

    } finally {
      setLoadingAlumni(null);
    }
  };

  // ==========================================
  // SEND REFERRAL REQUEST
  // ==========================================

  const handleReferralRequest = async (
    application,
    alumnus
  ) => {
    const applicationId = application.application_id;
    const alumniId = alumnus.alumni_id;

    try {
      setSubmittingId(`${applicationId}-${alumniId}`);
      setMessage("");
      setMessageType("");

      const response = await axios.post(
        "http://localhost:5000/api/referrals",
        {
          application_id: applicationId,
          alumni_id: alumniId
        },
        { headers }
      );

      setMessage(
        response.data.message ||
        "Referral request submitted successfully!"
      );
      setMessageType("success");

      // Refresh referral request records
      const referralsResponse = await axios.get(
        "http://localhost:5000/api/referrals/student/my-requests",
        { headers }
      );

      setReferrals(
        referralsResponse.data.referrals || []
      );

    } catch (err) {
      setMessage(
        err.response?.data?.message ||
        "Unable to submit referral request."
      );
      setMessageType("error");

    } finally {
      setSubmittingId(null);
    }
  };

  // ==========================================
  // CHECK EXISTING REQUEST
  // ==========================================

  const getExistingReferral = (applicationId, alumniId) => {
    return referrals.find(
      (referral) =>
        Number(referral.application_id) === Number(applicationId) &&
        Number(referral.alumni_id) === Number(alumniId)
    );
  };

  // ==========================================
  // REFERRAL STATUS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "referral-status-pending";

      case "Accepted":
        return "referral-status-accepted";

      case "Declined":
        return "referral-status-declined";

      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock size={15} />;

      case "Accepted":
        return <CheckCircle size={15} />;

      case "Declined":
        return <XCircle size={15} />;

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page student-referral-redesign">

      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <h1>Referral Requests</h1>
          <p>
            Connect with verified Sahyadri alumni for job referrals
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

        {/* PAGE HEADING */}
        <div className="student-referral-heading">
          <div>
            <h2>Your Job Applications</h2>
            <p>
              Find verified alumni working at the companies
              where you have applied.
            </p>
          </div>

          <button
            className="referral-refresh-button"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className={`referral-message referral-message-${messageType}`}>
            {message}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <p className="referral-empty">
            Loading your applications...
          </p>
        )}

        {/* NO APPLICATIONS */}
        {!loading && applications.length === 0 && (
          <div className="referral-empty">
            <Briefcase size={40} />
            <h3>No applications found</h3>
            <p>
              Apply for a job before requesting a referral.
            </p>

            <button
              className="referral-primary-button"
              onClick={() => navigate("/student/jobs")}
            >
              Browse Jobs
            </button>
          </div>
        )}

        {/* APPLICATION LIST */}
        {!loading && applications.length > 0 && (
          <div className="student-referral-list">

            {applications.map((application) => {
              const applicationId = application.application_id;

              const alumniList =
                eligibleAlumni[applicationId];

              const isExpanded =
                expandedApplication === applicationId;

              return (
                <div
                  className="student-referral-card"
                  key={applicationId}
                >

                  {/* APPLICATION INFORMATION */}
                  <div className="student-referral-card-top">

                    <div className="student-referral-icon">
                      <Briefcase size={24} />
                    </div>

                    <span className="referral-application-status">
                      {application.status}
                    </span>

                  </div>

                  <h3>{application.job_title}</h3>

                  <div className="student-referral-info">

                    <p>
                      <Building2 size={16} />
                      {application.company_name}
                    </p>

                    <p>
                      <MapPin size={16} />
                      {application.location || "Location not specified"}
                    </p>

                    <p>
                      <Users size={16} />
                      Application ID: #{applicationId}
                    </p>

                  </div>

                  {/* FIND ALUMNI BUTTON */}
                  <button
                    className="referral-primary-button"
                    onClick={() => handleFindAlumni(application)}
                    disabled={loadingAlumni === applicationId}
                  >
                    <Search size={17} />

                    {loadingAlumni === applicationId
                      ? "Finding Alumni..."
                      : "Find Eligible Alumni"}
                  </button>

                  {/* ELIGIBLE ALUMNI */}
                  {isExpanded && alumniList && (
                    <div className="eligible-alumni-section">

                      <h4>
                        Verified Alumni at {application.company_name}
                      </h4>

                      {alumniList.length === 0 ? (
                        <p className="referral-empty-text">
                          No eligible alumni found for this company.
                        </p>
                      ) : (

                        <div className="eligible-alumni-list">

                          {alumniList.map((alumnus) => {

                            const existingReferral =
                              getExistingReferral(
                                applicationId,
                                alumnus.alumni_id
                              );

                            const requestKey =
                              `${applicationId}-${alumnus.alumni_id}`;

                            return (
                              <div
                                className="eligible-alumni-card"
                                key={alumnus.alumni_id}
                              >

                                <div className="alumni-avatar">
                                  {alumnus.full_name
                                    ?.charAt(0)
                                    .toUpperCase()}
                                </div>

                                <div className="eligible-alumni-details">

                                  <h5>{alumnus.full_name}</h5>

                                  <p>
                                    {alumnus.job_title ||
                                      "Alumni"}
                                  </p>

                                  <p>
                                    {alumnus.department || "Department not specified"}
                                  </p>

                                  <p>
                                    Graduation Year:{" "}
                                    {alumnus.graduation_year || "Not specified"}
                                  </p>

                                  <p>
                                    {alumnus.email}
                                  </p>

                                </div>

                                <div className="alumni-referral-action">

                                  {existingReferral ? (

                                    <span
                                      className={`referral-status-badge ${getStatusClass(
                                        existingReferral.status
                                      )}`}
                                    >
                                      {getStatusIcon(existingReferral.status)}
                                      {existingReferral.status}
                                    </span>

                                  ) : (

                                    <button
                                      className="send-referral-button"
                                      onClick={() =>
                                        handleReferralRequest(
                                          application,
                                          alumnus
                                        )
                                      }
                                      disabled={
                                        submittingId === requestKey
                                      }
                                    >
                                      <Send size={15} />

                                      {submittingId === requestKey
                                        ? "Sending..."
                                        : "Request Referral"}
                                    </button>

                                  )}

                                </div>

                              </div>
                            );
                          })}

                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

        {/* STUDENT REFERRAL HISTORY */}
        <section className="student-referral-history">

          <h2>My Referral Requests</h2>

          <p>
            Track responses from alumni.
          </p>

          {referrals.length === 0 ? (
            <div className="referral-empty-text">
              No referral requests submitted yet.
            </div>
          ) : (

            <div className="student-referral-history-list">

              {referrals.map((referral) => (

                <div
                  className="student-referral-history-card"
                  key={referral.referral_id}
                >

                  <div>
                    <h4>{referral.job_title}</h4>

                    <p>
                      <Building2 size={14} />
                      {referral.company_name}
                    </p>

                    <p>
                      Alumni: {referral.alumni_name}
                    </p>

                    <p>
                      Referral ID: #{referral.referral_id}
                    </p>
                  </div>

                  <span
                    className={`referral-status-badge ${getStatusClass(
                      referral.status
                    )}`}
                  >
                    {getStatusIcon(referral.status)}
                    {referral.status}
                  </span>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default ReferralRequest;
