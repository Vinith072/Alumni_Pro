
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  User,
  Briefcase,
  Mail,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

function AlumniReferrals() {
  const navigate = useNavigate();

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch incoming referral requests
  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/referrals/my-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setReferrals(response.data.referrals || []);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load referral requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  // Accept or decline a referral
  const handleReferralAction = async (referralId, status) => {
    try {
      setUpdatingId(referralId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/referrals/${referralId}/status`,
        {
          status: status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        response.data.message ||
        `Referral request ${status.toLowerCase()} successfully.`
      );

      await fetchReferrals();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update referral request."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-page alumni-referrals-redesign">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <h1>Referral Requests</h1>
          <p>Review requests from Sahyadri students</p>
        </div>

        <button
          onClick={() => navigate("/dashboard/alumni")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

      </header>

      {/* Main Content */}
      <main className="dashboard-content">

        <h2>Incoming Requests</h2>

        {message && (
          <p className="form-success">{message}</p>
        )}

        {error && (
          <p className="form-error">{error}</p>
        )}

        {loading && (
          <p>Loading referral requests...</p>
        )}

        {!loading && referrals.length === 0 && !error && (
          <p>No referral requests found.</p>
        )}

        {!loading && referrals.length > 0 && (

          <div className="alumni-referral-list">

            {referrals.map((referral) => {

              const status = referral.status?.toLowerCase();

              const isPending = status === "pending";

              return (

                <div
                  className="alumni-referral-card"
                  key={referral.referral_id}
                >

                  <div className="referral-student-info">

                    <div className="referral-avatar">
                      <User size={24} />
                    </div>

                    <div>
                      <h3>{referral.student_name}</h3>

                      <p>
                        <Mail size={15} />
                        {referral.student_email}
                      </p>
                    </div>

                  </div>

                  <div className="referral-job-info">

                    <p>
                      <Briefcase size={16} />
                      {referral.job_title}
                    </p>

                    <p>
                      Company: {referral.company_name}
                    </p>

                    <p>
                      Application ID: {referral.application_id}
                    </p>

                    <p>
                      <Clock size={15} />
                      Requested on:{" "}
                      {referral.requested_at
                        ? new Date(
                            referral.requested_at
                          ).toLocaleDateString("en-IN")
                        : "Date unavailable"}
                    </p>

                  </div>

                  <div className="referral-action-area">

                    <span
                      className={`referral-status ${status}`}
                    >
                      {referral.status}
                    </span>

                    {isPending && (

                      <div className="referral-action-buttons">

                        <button
                          className="accept-referral-button"
                          onClick={() =>
                            handleReferralAction(
                              referral.referral_id,
                              "Accepted"
                            )
                          }
                          disabled={
                            updatingId === referral.referral_id
                          }
                        >
                          <CheckCircle size={16} />
                          Accept
                        </button>

                        <button
                          className="decline-referral-button"
                          onClick={() =>
                            handleReferralAction(
                              referral.referral_id,
                              "Declined"
                            )
                          }
                          disabled={
                            updatingId === referral.referral_id
                          }
                        >
                          <XCircle size={16} />
                          Decline
                        </button>

                      </div>

                    )}

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </main>
    </div>
  );
}

export default AlumniReferrals;
