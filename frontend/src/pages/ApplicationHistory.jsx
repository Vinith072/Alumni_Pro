
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Clock, History } from "lucide-react";

function ApplicationHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/applications/my-history",
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
          "Failed to load application history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
   <div className="dashboard-page application-history-page">
      <header className="dashboard-header">
        <div>
          <h1>Application History</h1>
          <p>Track every change in your applications</p>
        </div>

        <button onClick={() => navigate("/dashboard/student")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">
        <h2>Status Timeline</h2>

        {loading && <p>Loading history...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && history.length === 0 && (
          <p>No application history found.</p>
        )}

        {!loading && history.length > 0 && (
          <div className="history-list">
            {history.map((item) => (
              <div className="history-card" key={item.history_id}>
                <div className="history-icon">
                  <History size={20} />
                </div>

                <div className="history-details">
                  <h3>
                    {item.old_status
                      ? `${item.old_status} → ${item.new_status}`
                      : item.new_status}
                  </h3>

                  <p>
                    Application ID: {item.application_id}
                  </p>

                  <p>
                    Changed by: {item.changed_by_role || "User"}
                  </p>

                  <p>
                    <Clock size={15} />
                    {new Date(item.changed_at).toLocaleString("en-IN")}
                  </p>

                  {item.remarks && (
                    <p>Remarks: {item.remarks}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ApplicationHistory;
