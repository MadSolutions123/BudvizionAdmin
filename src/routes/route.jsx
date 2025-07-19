import React from "react";
import { Navigate } from "react-router-dom";
import { localStorageEncryptionService } from "../helpers/localStorageEncryption";

const Authmiddleware = (props) => {
  // Check if user is authenticated using encrypted storage
  const isAuthenticated = localStorageEncryptionService.isAuthenticated();
  
  if (!isAuthenticated) {
    return (
      <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
    );
  }
  return <React.Fragment>{props.children}</React.Fragment>;
};

export default Authmiddleware;
