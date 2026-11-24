
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import "../App.css";

function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleName = {
    admin: "Admin",
    student: "Student",
    alumni: "Alumni"
  };

  const selectedRole = roleName[role?.toLowerCase()];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Invalid login role.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
          role: selectedRole
        }
      );

      // Store authentication details
      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Redirect according to user role
      const dashboardRoutes = {
        Admin: "/dashboard/admin",
        Student: "/dashboard/student",
        Alumni: "/dashboard/alumni"
      };

      navigate(dashboardRoutes[selectedRole], {
        replace: true
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <button
        className="back-button"
        onClick={() => navigate("/roles")}
      >
        <ArrowLeft size={18} />
        Back to Roles
      </button>

      <div className="login-card">

        <img
          src="/sahyadri-logo.jpg"
          alt="Sahyadri College"
          className="login-logo"
        />

        <h1>SAHYADRI COLLEGE</h1>

        <p className="login-college">
          OF ENGINEERING & MANAGEMENT
        </p>

        <div className="login-divider"></div>

        <h2>{selectedRole || "Login"} Login</h2>

        <p className="login-subtitle">
          Welcome to Sahyadri Alumni Connect
        </p>

        <form onSubmit={handleLogin}>

          <label>Email Address</label>

          <div className="login-input">
            <Mail size={19} />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="login-input">
            <Lock size={19} />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="login-error">{error}</p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading || !selectedRole}
          >
            {loading ? "Logging in..." : "LOGIN"}
          </button>

        </form>

        {selectedRole !== "Admin" && selectedRole && (
          <p className="register-link">
            Don't have an account?{" "}
            <span
              onClick={() => navigate(`/register/${role}`)}
            >
              Register here
            </span>
          </p>
        )}

      </div>
    </div>
  );
}

export default Login;
