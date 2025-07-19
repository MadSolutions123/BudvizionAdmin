import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

//i18n
import { withTranslation } from "react-i18next";

import { Link, useNavigate } from "react-router-dom";
import { localStorageEncryptionService } from "../../../helpers/localStorageEncryption";

// users
import user1 from "../../../assets/images/users/avatar-1.jpg";

const ProfileMenu = (props) => {
  // Declare a new state variable, which we'll call "menu"
  const [menu, setMenu] = useState(false);
  const [username, setusername] = useState("Admin");
  const [userEmail, setUserEmail] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from encrypted storage
    const userData = localStorageEncryptionService.getUserData();
    if (userData) {
      // Set username and email from stored user data
      setusername(userData.firstName ? `${userData.firstName} ${userData.lastName}` : userData.userName || userData.email || "Admin");
      setUserEmail(userData.email || "");
    }
  }, []);

  // Handle logout function
  const handleLogout = () => {
    try {
      // Clear all stored authentication data
      localStorageEncryptionService.removeTokenData();
      localStorageEncryptionService.removeUserData();
      
      console.log('✅ User logged out successfully');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still redirect to login even if cleanup fails
      navigate('/login');
    }
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item "
          id="page-header-user-dropdown"
          tag="button"
        >
          <img
            className="rounded-circle header-profile-user"
            src={user1}
            alt="Header Avatar"
          />
          <span className="d-none d-xl-inline-block ms-2 me-1">{username}</span>
          <i className="mdi mdi-chevron-down d-none d-xl-inline-block" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          {/* <DropdownItem tag="a" href="/profile">
            {" "}
            <i className="bx bx-user font-size-16 align-middle me-1" />
            {props.t("Profile")}{" "}
          </DropdownItem>
          <DropdownItem tag="a" href="/crypto-wallet">
            <i className="bx bx-wallet font-size-16 align-middle me-1" />
            {props.t("My Wallet")}
          </DropdownItem>
          <DropdownItem tag="a" href="#">
            <span className="badge bg-success float-end">11</span>
            <i className="bx bx-wrench font-size-16 align-middle me-1" />
            {props.t("Settings")}
          </DropdownItem>
          <DropdownItem tag="a" href="auth-lock-screen">
            <i className="bx bx-lock-open font-size-16 align-middle me-1" />
            {props.t("Lock screen")}
          </DropdownItem>
          <div className="dropdown-divider" /> */}
          <DropdownItem onClick={handleLogout}>
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            <span>{props.t("Logout")}</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

ProfileMenu.propTypes = {
  t: PropTypes.any,
};

export default withTranslation()(ProfileMenu);
