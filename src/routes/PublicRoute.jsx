import React from "react";
import { Navigate } from "react-router-dom";
import { localStorageEncryptionService } from "../helpers/localStorageEncryption";

const PublicRoute = (props) => {
  // Check if user is already authenticated
  const isAuthenticated = localStorageEncryptionService.isAuthenticated();
  
  // If user is authenticated and trying to access login page, redirect to users page
  if (isAuthenticated) {
    return <Navigate to="/users" />;
  }
  
  // If not authenticated, show the public page (login, register, etc.)
  return <React.Fragment>{props.children}</React.Fragment>;
};

export default PublicRoute; 