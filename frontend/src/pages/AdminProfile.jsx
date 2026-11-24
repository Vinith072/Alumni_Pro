
import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserRound, Mail, ShieldCheck, CalendarDays, Pencil, Save, X, RefreshCw } from "lucide-react";

function AdminProfile() {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        full_name: "",
        email: ""
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");
    const API_URL = "http://localhost:5000/api/profile/admin/me";

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = response.data.profile;

            setProfile(data);
            setFormData({
                full_name: data.full_name || "",
                email: data.email || ""
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load Admin profile."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await axios.put(API_URL, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const updatedProfile = response.data.profile;

            setProfile(updatedProfile);
            setFormData({
                full_name: updatedProfile.full_name || "",
                email: updatedProfile.email || ""
            });

            // Update stored user details
            const storedUser = JSON.parse(
                localStorage.getItem("user") || "{}"
            );

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...storedUser,
                    full_name: updatedProfile.full_name,
                    email: updatedProfile.email
                })
            );

            setIsEditing(false);
            setSuccess("Admin profile updated successfully!");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update Admin profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            full_name: profile.full_name || "",
            email: profile.email || ""
        });

        setIsEditing(false);
        setError("");
        setSuccess("");
    };

    if (loading) {
        return <div className="student-profile-page admin-profile-page">Loading Admin profile...</div>;
    }

    if (!profile) {
        return (
            <div className="student-profile-page admin-profile-page">
                <p className="student-profile-error">
                    {error || "Admin profile not found."}
                </p>
                <button onClick={fetchProfile}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="student-profile-page admin-profile-page">
            <div className="student-profile-card">

                <div className="student-profile-top">
                    <div className="student-profile-avatar">
                        <UserRound size={38} />
                    </div>

                    <div className="student-profile-heading">
                        <h2>Admin Profile</h2>
                        <p>Manage your administrator account details</p>
                    </div>

                    {!isEditing && (
                        <button
                            className="student-profile-edit-btn"
                            onClick={() => {
                                setIsEditing(true);
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

                {error && (
                    <div className="student-profile-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="student-profile-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSave}>
                    <div className="student-profile-grid">

                        <div className="student-profile-field">
                            <label>
                                <UserRound size={15} /> Full Name
                            </label>

                            {isEditing ? (
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            ) : (
                                <p>{profile.full_name}</p>
                            )}
                        </div>

                        <div className="student-profile-field">
                            <label>
                                <Mail size={15} /> Email Address
                            </label>

                            {isEditing ? (
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

                        <div className="student-profile-field">
                            <label>
                                <ShieldCheck size={15} /> Role
                            </label>
                            <p>{profile.role}</p>
                        </div>

                        <div className="student-profile-field">
                            <label>
                                <ShieldCheck size={15} /> Account Status
                            </label>
                            <p>
                                {profile.is_active ? "Active" : "Inactive"}
                            </p>
                        </div>

                        <div className="student-profile-field">
                            <label>
                                <CalendarDays size={15} /> Account Created
                            </label>
                            <p>
                                {profile.created_at
                                    ? new Date(profile.created_at).toLocaleDateString()
                                    : "Not available"}
                            </p>
                        </div>

                        <div className="student-profile-field">
                            <label>
                                <UserRound size={15} /> Admin ID
                            </label>
                            <p>{profile.user_id}</p>
                        </div>

                    </div>

                    {isEditing && (
                        <div className="student-profile-actions">
                            <button
                                type="submit"
                                className="student-profile-save-btn"
                                disabled={saving}
                            >
                                <Save size={16} />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                className="student-profile-cancel-btn"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    )}
                </form>

                <button
                    type="button"
                    className="student-profile-cancel-btn"
                    onClick={fetchProfile}
                    disabled={loading || saving}
                    style={{ marginTop: "18px" }}
                >
                    <RefreshCw size={15} />
                    Refresh Profile
                </button>

            </div>
        </div>
    );
}

export default AdminProfile;
