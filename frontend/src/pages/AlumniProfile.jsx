
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  User,
  Mail,
  GraduationCap,
  CalendarDays,
  Building2,
  Briefcase,
  ArrowLeft,
  Pencil,
  Save,
  X,
  RefreshCw,
  ShieldCheck
} from "lucide-react";

function AlumniProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    department: "",
    graduation_year: "",
    current_company: "",
    job_title: ""
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch Alumni Profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/profile/alumni/me",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = response.data.profile;

      setProfile(data);

      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        department: data.department || "",
        graduation_year: data.graduation_year || "",
        current_company: data.current_company || "",
        job_title: data.job_title || ""
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load alumni profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Form Changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Update Alumni Profile
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      const payload = {
        ...formData,
        graduation_year: formData.graduation_year
          ? Number(formData.graduation_year)
          : null
      };

      const response = await axios.put(
        "http://localhost:5000/api/profile/alumni/me",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedProfile = response.data.profile;

      setProfile(updatedProfile);

      setFormData({
        full_name: updatedProfile.full_name || "",
        email: updatedProfile.email || "",
        department: updatedProfile.department || "",
        graduation_year: updatedProfile.graduation_year || "",
        current_company: updatedProfile.current_company || "",
        job_title: updatedProfile.job_title || ""
      });

      // Update stored user information
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            full_name: updatedProfile.full_name,
            email: updatedProfile.email
          })
        );
      }

      setEditing(false);
      setSuccess("Alumni profile updated successfully!");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update alumni profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Cancel Editing
  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name || "",
      email: profile.email || "",
      department: profile.department || "",
      graduation_year: profile.graduation_year || "",
      current_company: profile.current_company || "",
      job_title: profile.job_title || ""
    });

    setEditing(false);
    setError("");
    setSuccess("");
  };

  // Loading
  if (loading) {
    return (
      <div className="dashboard-page">
        <p>Loading alumni profile...</p>
      </div>
    );
  }

  // Profile Not Found
  if (!profile) {
    return (
      <div className="dashboard-page">
        <p className="student-profile-error">
          {error || "Alumni profile not found."}
        </p>

        <button onClick={() => navigate("/dashboard/alumni")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page student-profile-page alumni-profile-redesign">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>My Alumni Profile</h1>
          <p>View and manage your professional information</p>
        </div>

        <button
          onClick={() => navigate("/dashboard/alumni")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>
      </header>

      <main className="dashboard-content">

        {/* Messages */}
        {error && (
          <div className="student-profile-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="student-profile-message success">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <section className="student-profile-card">

          <div className="student-profile-top">

            <div className="student-profile-avatar">
              <User size={38} />
            </div>

            <div className="student-profile-heading">
              <h2>{profile.full_name}</h2>
              <p>Alumni</p>
              <span>
                Alumni ID: {profile.alumni_id}
              </span>
            </div>

            {!editing && (
              <button
                className="student-profile-edit-btn"
                onClick={() => {
                  setEditing(true);
                  setSuccess("");
                  setError("");
                }}
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}

          </div>

          {/* Verification Status */}
          <div className="student-profile-divider"></div>

          <div className="alumni-verification-status">
            <ShieldCheck size={20} />

            <strong>Verification Status:</strong>

            <span
              className={`verification-badge ${
                profile.verification_status?.toLowerCase()
              }`}
            >
              {profile.verification_status || "Pending"}
            </span>
          </div>

          <div className="student-profile-divider"></div>

          {/* Profile Form */}
          <form onSubmit={handleSave}>

            <div className="student-profile-grid">

              {/* Full Name */}
              <div className="student-profile-field">
                <label>
                  <User size={16} />
                  Full Name
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                  />
                ) : (
                  <p>{profile.full_name}</p>
                )}
              </div>

              {/* Email */}
              <div className="student-profile-field">
                <label>
                  <Mail size={16} />
                  Email Address
                </label>

                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p>{profile.email}</p>
                )}
              </div>

              {/* Department */}
              <div className="student-profile-field">
                <label>
                  <GraduationCap size={16} />
                  Department
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                  />
                ) : (
                  <p>{profile.department || "Not specified"}</p>
                )}
              </div>

              {/* Graduation Year */}
              <div className="student-profile-field">
                <label>
                  <CalendarDays size={16} />
                  Graduation Year
                </label>

                {editing ? (
                  <input
                    type="number"
                    name="graduation_year"
                    value={formData.graduation_year}
                    onChange={handleChange}
                    min="1950"
                    max="2100"
                    placeholder="Enter graduation year"
                  />
                ) : (
                  <p>{profile.graduation_year || "Not specified"}</p>
                )}
              </div>

              {/* Current Company */}
              <div className="student-profile-field">
                <label>
                  <Building2 size={16} />
                  Current Company
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="current_company"
                    value={formData.current_company}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                ) : (
                  <p>{profile.current_company || "Not specified"}</p>
                )}
              </div>

              {/* Job Title */}
              <div className="student-profile-field">
                <label>
                  <Briefcase size={16} />
                  Job Title
                </label>

                {editing ? (
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    placeholder="Enter job title"
                  />
                ) : (
                  <p>{profile.job_title || "Not specified"}</p>
                )}
              </div>

            </div>

            {/* Action Buttons */}
            {editing && (
              <div className="student-profile-actions">

                <button
                  type="button"
                  className="student-profile-cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="student-profile-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={17} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Changes
                    </>
                  )}
                </button>

              </div>
            )}

          </form>

        </section>

      </main>
    </div>
  );
}

export default AlumniProfile;
