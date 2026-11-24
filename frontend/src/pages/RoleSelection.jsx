
import { useNavigate } from "react-router-dom";
import { ShieldCheck, GraduationCap, BriefcaseBusiness, ArrowLeft } from "lucide-react";
import "../App.css";

function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      name: "Admin",
      description: "Manage users, verify alumni and monitor the platform.",
      icon: <ShieldCheck size={45} />,
      path: "/login/admin"
    },
    {
      name: "Student",
      description: "Explore job opportunities and request referrals.",
      icon: <GraduationCap size={45} />,
      path: "/login/student"
    },
    {
      name: "Alumni",
      description: "Share job opportunities and support students.",
      icon: <BriefcaseBusiness size={45} />,
      path: "/login/alumni"
    }
  ];

  return (
    <div className="role-page">

      <button className="back-button" onClick={() => navigate("/")}>
        <ArrowLeft size={18} /> Back to Home
      </button>

      <div className="role-container">
        <h1>Choose Your Login Role</h1>

        <p className="role-subtitle">
          Welcome to Sahyadri Alumni Connect
        </p>

        <div className="role-cards">
          {roles.map((role) => (
            <div className="role-card" key={role.name}>
              <div className="role-icon">{role.icon}</div>

              <h2>{role.name}</h2>

              <p>{role.description}</p>

              <button onClick={() => navigate(role.path)}>
                Continue
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default RoleSelection;
