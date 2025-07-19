import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { localStorageEncryptionService } from "../../helpers/localStorageEncryption";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = () => {
      try {
        // Clear all stored authentication data
        localStorageEncryptionService.removeTokenData();
        localStorageEncryptionService.removeUserData();
        
        console.log('✅ User logged out successfully');
        
        // Redirect to login page
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('❌ Error during logout:', error);
        // Still redirect to login even if cleanup fails
        navigate('/login', { replace: true });
      }
    };

    performLogout();
  }, [navigate]);

  return <></>;
};

export default Logout;
