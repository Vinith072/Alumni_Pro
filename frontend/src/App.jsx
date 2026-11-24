
import {
    BrowserRouter,
    Routes,
    Route,
    useNavigate
} from "react-router-dom";

import MyApplications from "./pages/MyApplications";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import ApplicationHistory from "./pages/ApplicationHistory";
import BrowseJobs from "./pages/BrowseJobs";

import AdminDashboard from "./pages/dashboards/AdminDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import AlumniDashboard from "./pages/dashboards/AlumniDashboard";

import PostJob from "./pages/PostJob";
import ProtectedRoute from "./components/ProtectedRoute";

import ReferralRequest from "./pages/ReferralRequest";
import AlumniReferrals from "./pages/AlumniReferrals";
import MyJobs from "./pages/MyJobs";

import AlumniVerification from "./pages/AlumniVerification";
import Register from "./pages/Register";
import UserManagement from "./pages/UserManagement";
import AdminApplications from "./pages/AdminApplications";
import AdminAnalytics from "./pages/AdminAnalytics";

import StudentJobs from "./pages/StudentJobs";
import StudentJobDetails from "./pages/StudentJobDetails";
import StudentApplications from "./pages/StudentApplications";
import ApplicationDetails from "./pages/ApplicationDetails";

import StudentProfile from "./pages/StudentProfile";
import AlumniProfile from "./pages/AlumniProfile";
import AdminProfile from "./pages/AdminProfile";

import "./App.css";


// ==========================================
// COLLEGE WELCOME PAGE
// ==========================================

function Home() {
    const navigate = useNavigate();

    return (
        <div className="website">

            {/* College Header */}
            <header className="header">

                <div className="college-brand">

                    <img
                        src="/sahyadri-logo.jpg"
                        alt="Sahyadri College Logo"
                    />

                    <div className="college-details">
                        <h2>SAHYADRI COLLEGE</h2>

                        <p>
                            OF ENGINEERING &amp; MANAGEMENT
                        </p>

                        <span>
                            AUTONOMOUS | MANGALURU
                        </span>
                    </div>

                </div>

            </header>


            {/* Navigation */}
            <nav className="navbar">

                <a href="#home">Home</a>

                
<a
    href="https://sahyadri.edu.in/"
    target="_blank"
    rel="noopener noreferrer"
>
    About College
</a>


                <a
                    href="/roles"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/roles");
                    }}
                >
                    Alumni Connect
                </a>

            </nav>


            {/* Welcome Section */}
            <section className="hero" id="home">

                <div className="hero-content">

                    <h1>
                        Welcome to Sahyadri Alumni Connect
                    </h1>

                    

                    <button
                        className="enter-button"
                        onClick={() => navigate("/roles")}
                    >
                        ENTER ALUMNI CONNECT
                    </button>

                    <p>
                        Connecting our students and alumni to create
                        opportunities, share knowledge and build
                        successful careers.
                    </p>

                </div>

            </section>


            {/* About College */}
            <section className="about" id="about">

                <h2>About Our Institution</h2>

                <p>
                    Sahyadri College of Engineering &amp; Management
                    (Autonomous), Mangaluru, is dedicated to academic
                    excellence, innovation and professional development.
                </p>

            </section>


            {/* Footer */}
            <footer className="footer">

                <p>
                    © 2026 Sahyadri College of Engineering &amp; Management.
                    All Rights Reserved.
                </p>

            </footer>

        </div>
    );
}


// ==========================================
// MAIN APP
// ==========================================

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* College Welcome Page */}
                <Route
                    path="/"
                    element={<Home />}
                />


                {/* Role Selection */}
                <Route
                    path="/roles"
                    element={<RoleSelection />}
                />


                {/* Login and Registration */}
                <Route
                    path="/login/:role"
                    element={<Login />}
                />

                <Route
                    path="/register/:role"
                    element={<Register />}
                />


                {/* ==================================
                    PROTECTED ADMIN ROUTES
                ================================== */}

                <Route
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]} />
                    }
                >

                    <Route
                        path="/dashboard/admin"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/admin/alumni-verification"
                        element={<AlumniVerification />}
                    />

                    <Route
                        path="/admin/users"
                        element={<UserManagement />}
                    />

                    <Route
                        path="/admin/applications"
                        element={<AdminApplications />}
                    />

                    <Route
                        path="/admin/analytics"
                        element={<AdminAnalytics />}
                    />

                    <Route
                        path="/admin/profile"
                        element={<AdminProfile />}
                    />

                </Route>


                {/* ==================================
                    PROTECTED STUDENT ROUTES
                ================================== */}

                <Route
                    element={
                        <ProtectedRoute allowedRoles={["Student"]} />
                    }
                >

                    <Route
                        path="/dashboard/student"
                        element={<StudentDashboard />}
                    />

                    <Route
                        path="/student/jobs"
                        element={<StudentJobs />}
                    />

                    <Route
                        path="/student/jobs/:id"
                        element={<StudentJobDetails />}
                    />

                    <Route
                        path="/student/my-applications"
                        element={<StudentApplications />}
                    />

                    <Route
                        path="/student/application-history"
                        element={<ApplicationHistory />}
                    />

                    <Route
                        path="/student/application-details/:id"
                        element={<ApplicationDetails />}
                    />

                    <Route
                        path="/student/profile"
                        element={<StudentProfile />}
                    />

                    <Route
                        path="/student/referral-request"
                        element={<ReferralRequest />}
                    />

                </Route>


                {/* ==================================
                    PROTECTED ALUMNI ROUTES
                ================================== */}

                <Route
                    element={
                        <ProtectedRoute allowedRoles={["Alumni"]} />
                    }
                >

                    <Route
                        path="/dashboard/alumni"
                        element={<AlumniDashboard />}
                    />

                    <Route
                        path="/alumni/post-job"
                        element={<PostJob />}
                    />

                    <Route
                        path="/alumni/referrals"
                        element={<AlumniReferrals />}
                    />

                    <Route
                        path="/alumni/my-jobs"
                        element={<MyJobs />}
                    />

                    <Route
                        path="/alumni/profile"
                        element={<AlumniProfile />}
                    />

                </Route>


                {/* ==================================
                    INVALID URL - 404 PAGE
                ================================== */}

                <Route
                    path="*"
                    element={
                        <div
                            style={{
                                padding: "50px",
                                textAlign: "center"
                            }}
                        >

                            <h1>404 - Page Not Found</h1>

                            <button
                                onClick={() => window.location.assign("/")}
                            >
                                Back to Home
                            </button>

                        </div>
                    }
                />

            </Routes>

        </BrowserRouter>

    );
}

export default App;
