
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");

  const storedUser = localStorage.getItem("user");

  // Redirect users who are not logged in
  if (!token || !storedUser) {
    return <Navigate to="/roles" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/roles" replace />;
  }

  // Check whether the user has the required role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/roles" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
