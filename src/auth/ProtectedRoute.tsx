import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // Optional array of allowed roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/signin" />;
  }

  // If roles are specified, check if the user has one of the allowed roles
  if (roles && user && !roles.includes(user.role)) {
    // Redirect to a home page or an unauthorized page if role doesn't match
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
