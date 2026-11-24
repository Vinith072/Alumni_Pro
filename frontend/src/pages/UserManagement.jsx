
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ArrowLeft,
  Users,
  Mail,
  ShieldCheck,
  UserX,
  UserCheck,
  RefreshCw
} from "lucide-react";

function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUsers(response.data.users || []);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Activate or deactivate user
  const handleAccountStatus = async (userId, isActive) => {
    const action = isActive ? "deactivate" : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this account?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(userId);
      setError("");
      setMessage("");

      const token = localStorage.getItem("token");

      const endpoint = isActive
        ? "deactivate"
        : "reactivate";

      const response = await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        response.data.message ||
        `User account ${action}d successfully.`
      );

      await fetchUsers();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Unable to ${action} account.`
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "All") return true;
    return user.role === filter;
  });

  const activeCount = users.filter(
    (user) => user.is_active
  ).length;

  const inactiveCount = users.length - activeCount;

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>User Management</h1>
          <p>Manage registered Students and Alumni</p>
        </div>

        <button onClick={() => navigate("/dashboard/admin")}>
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">

        <h2>Users Overview</h2>

        {/* Summary */}
        <div className="user-summary-grid">

          <div className="user-summary-card">
            <Users size={23} />
            <h3>Total Users</h3>
            <h2>{users.length}</h2>
          </div>

          <div className="user-summary-card">
            <UserCheck size={23} />
            <h3>Active Accounts</h3>
            <h2>{activeCount}</h2>
          </div>

          <div className="user-summary-card">
            <UserX size={23} />
            <h3>Inactive Accounts</h3>
            <h2>{inactiveCount}</h2>
          </div>

        </div>

        {/* Messages */}
        {message && (
          <p className="form-success">{message}</p>
        )}

        {error && (
          <p className="form-error">{error}</p>
        )}

        {/* Filter */}
        <div className="users-heading">
          <h2>Registered Users</h2>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Users</option>
            <option value="Student">Students</option>
            <option value="Alumni">Alumni</option>
            <option value="Admin">Admins</option>
          </select>

          <button
            className="refresh-users-button"
            onClick={fetchUsers}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading && <p>Loading users...</p>}

        {!loading && filteredUsers.length === 0 && (
          <p>No users found.</p>
        )}

        {/* User List */}
        {!loading && filteredUsers.length > 0 && (

          <div className="users-list">

            {filteredUsers.map((user) => (

              <div className="user-card" key={user.user_id}>

                <div className="user-card-top">

                  <div className="user-avatar">
                    <Users size={24} />
                  </div>

                  <div className="user-main-info">
                    <h3>{user.full_name}</h3>

                    <p>
                      <Mail size={15} />
                      {user.email}
                    </p>
                  </div>

                  <span className={`user-role ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>

                </div>

                <div className="user-extra-details">

                  <p>
                    <ShieldCheck size={16} />
                    Account Status:{" "}
                    <strong>
                      {user.is_active ? "Active" : "Inactive"}
                    </strong>
                  </p>

                  {user.verification_status && (
                    <p>
                      Alumni Verification:{" "}
                      <strong>{user.verification_status}</strong>
                    </p>
                  )}

                </div>

                <div className="user-card-actions">

                  <span className={
                    user.is_active
                      ? "active-status"
                      : "inactive-status"
                  }>
                    {user.is_active ? "Active Account" : "Inactive Account"}
                  </span>

                  {user.role !== "Admin" && (
                    <button
                      className={
                        user.is_active
                          ? "deactivate-user-button"
                          : "reactivate-user-button"
                      }
                      disabled={updatingId === user.user_id}
                      onClick={() =>
                        handleAccountStatus(
                          user.user_id,
                          user.is_active
                        )
                      }
                    >
                      {user.is_active ? (
                        <UserX size={16} />
                      ) : (
                        <UserCheck size={16} />
                      )}

                      {updatingId === user.user_id
                        ? "Updating..."
                        : user.is_active
                          ? "Deactivate"
                          : "Reactivate"}
                    </button>
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

export default UserManagement;
