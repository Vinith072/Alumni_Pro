
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, UserPlus } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const { role } = useParams();

  const selectedRole =
    role?.toLowerCase() === "alumni" ? "Alumni" : "Student";

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    department: "",
    graduation_year: "",
    current_company: "",
    job_title: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: selectedRole,
        department: formData.department.trim(),
        graduation_year: Number(formData.graduation_year)
      };

      if (selectedRole === "Alumni") {
        payload.current_company = formData.current_company.trim();
        payload.job_title = formData.job_title.trim();
      }

      await axios.post(
        "http://localhost:5000/api/auth/register",
        payload
      );

      if (selectedRole === "Alumni") {
        setMessage(
          "Registration successful! Your account is pending Admin verification."
        );
      } else {
        setMessage(
          "Registration successful! You can now log in."
        );
      }

      setTimeout(() => {
        navigate(`/login/${role}`, { replace: true });
      }, 2000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <button
          type="button"
          className="register-back"
          onClick={() => navigate(`/login/${role}`)}
        >
          <ArrowLeft size={17} />
          Back to Login
        </button>

        <div className="register-heading">
          <UserPlus size={30} />
          <h1>{selectedRole} Registration</h1>
          <p>
            Sahyadri College of Engineering & Management
          </p>
        </div>

        {message && (
          <p className="form-success">{message}</p>
        )}

        {error && (
          <p className="form-error">{error}</p>
        )}

        <form onSubmit={handleSubmit}>

          <label>Full Name</label>
          <input
            type="text"
            name="full_name"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          <label>Department</label>
          <input
            type="text"
            name="department"
            placeholder="Example: Computer Science"
            value={formData.department}
            onChange={handleChange}
            required
          />

          <label>Graduation Year</label>
          <input
            type="number"
            name="graduation_year"
            placeholder="Example: 2024"
            min="1950"
            max="2100"
            value={formData.graduation_year}
            onChange={handleChange}
            required
          />

          {selectedRole === "Alumni" && (
            <>
              <label>Current Company</label>
              <input
                type="text"
                name="current_company"
                placeholder="Enter your company"
                value={formData.current_company}
                onChange={handleChange}
                required
              />

              <label>Current Job Title</label>
              <input
                type="text"
                name="job_title"
                placeholder="Enter your job title"
                value={formData.job_title}
                onChange={handleChange}
                required
              />
            </>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Create Account"}
          </button>

        </form>

        <p className="register-login-link">
          Already have an account?{" "}
          <Link to={`/login/${role}`}>Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
