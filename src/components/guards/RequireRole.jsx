import React from "react";
import { Navigate } from "react-router-dom";

const RequireRole = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Check if user is logged in
  if (!token || !user.role) {
    console.log("No token or user role, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user's role is in the list
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`User role ${user.role} not allowed, redirecting to dashboard`);
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  // User is authenticated and has correct role
  return children;
};

export default RequireRole;
