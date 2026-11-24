
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    GraduationCap,
    CalendarDays,
    Code,
    ArrowLeft,
    Pencil,
    Save,
    X,
    RefreshCw
} from "lucide-react";

import axios from "axios";

function StudentProfile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        department: "",
        graduation_year: "",
        skills: ""
    });

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch Student Profile
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/profile/me",
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
                skills: data.skills || ""
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load student profile."
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

    // Update Student Profile
    const handleSave = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                ...formData,
                graduation_year: formData.graduation_year
                    ? Number(formData.graduation_year)
                    : null
            };

            const token = localStorage.getItem("token");

            const response = await axios.put(
                "http://localhost:5000/api/profile/me",
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
                graduation_year:
                    updatedProfile.graduation_year || "",
                skills: updatedProfile.skills || ""
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
            setSuccess("Profile updated successfully!");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update profile."
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
            skills: profile.skills || ""
        });

        setEditing(false);
        setError("");
        setSuccess("");
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <p>Loading student profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="dashboard-page">
                <p className="student-profile-error">
                    {error || "Student profile not found."}
                </p>

                <button onClick={() => navigate("/dashboard/student")}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-page student-profile-page student-profile-redesign">

            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1>My Profile</h1>
                    <p>View and manage your student information</p>
                </div>

                <button
                    onClick={() => navigate("/dashboard/student")}
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
                            <p>Student</p>
                            <span>
                                Student ID: {profile.student_id}
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
                                        placeholder="Enter your department"
                                    />
                                ) : (
                                    <p>
                                        {profile.department || "Not specified"}
                                    </p>
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
                                    <p>
                                        {profile.graduation_year || "Not specified"}
                                    </p>
                                )}
                            </div>

                        </div>

                        {/* Skills */}
                        <div className="student-profile-skills">
                            <label>
                                <Code size={17} />
                                Technical Skills
                            </label>

                            {editing ? (
                                <textarea
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Example: Java, React, Node.js, Python"
                                />
                            ) : (
                                <div className="student-profile-skill-list">
                                    {profile.skills ? (
                                        profile.skills
                                            .split(",")
                                            .map((skill, index) => (
                                                <span key={index}>
                                                    {skill.trim()}
                                                </span>
                                            ))
                                    ) : (
                                        <p>No skills added yet.</p>
                                    )}
                                </div>
                            )}
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

export default StudentProfile;
