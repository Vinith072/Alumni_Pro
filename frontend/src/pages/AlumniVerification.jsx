
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Building2,
  Briefcase,
  CheckCircle,
  XCircle
} from "lucide-react";

function AlumniVerification() {
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch pending alumni
  const fetchPendingAlumni = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/alumni/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAlumni(response.data.alumni || []);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load pending alumni."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAlumni();
  }, []);

  // Approve or reject alumni
  const handleVerification = async (userId, status) => {
    try {
      setUpdatingId(userId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/admin/alumni/${userId}/verification`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        response.data.message ||
        `Alumni ${status.toLowerCase()} successfully.`
      );

      await fetchPendingAlumni();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update alumni verification."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">
        <div>
          <h1>Alumni Verification</h1>
          <p>Review and verify alumni registrations</p>
        </div>

        <button
          onClick={() => navigate("/dashboard/admin")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">

        <h2>Pending Alumni Requests</h2>

        {message && (
          <p className="form-success">{message}</p>
        )}

        {error && (
          <p className="form-error">{error}</p>
        )}

        {loading && <p>Loading pending alumni...</p>}

        {!loading && alumni.length === 0 && !error && (
          <p>No pending alumni verification requests.</p>
        )}

        {!loading && alumni.length > 0 && (

          <div className="verification-list">

            {alumni.map((person) => (

              <div
                className="verification-card"
                key={person.user_id}
              >

                <div className="verification-person">

                  <div className="verification-avatar">
                    <User size={25} />
                  </div>

                  <div>
                    <h3>{person.full_name}</h3>

                    <p>
                      <Mail size={15} />
                      {person.email}
                    </p>
                  </div>

                </div>

                <div className="verification-details">

                  <p>
                    <GraduationCap size={16} />
                    Department: {person.department || "Not provided"}
                  </p>

                  <p>
                    Graduation Year: {person.graduation_year || "Not provided"}
                  </p>

                  <p>
                    <Building2 size={16} />
                    Company: {person.current_company || "Not provided"}
                  </p>

                  <p>
                    <Briefcase size={16} />
                    Job Title: {person.job_title || "Not provided"}
                  </p>

                </div>

                <span className="pending-status">
                  Pending Verification
                </span>

                <div className="verification-actions">

                  <button
                    className="approve-button"
                    onClick={() =>
                      handleVerification(person.user_id, "Verified")
                    }
                    disabled={updatingId === person.user_id}
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>

                  <button
                    className="reject-button"
                    onClick={() =>
                      handleVerification(person.user_id, "Rejected")
                    }
                    disabled={updatingId === person.user_id}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>
    </div>
  );
}

export default AlumniVerification;
