import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from '../config';

const Navbar = ({ setIsAuthenticated }) => {
  const [userRole, setUserRole] = useState(null); // To store user role
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user role when component mounts
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
        setUserRole(response.data.data.role); // Store the role
      } catch (error) {
        console.log("Error fetching user role:", error);
      }
    };
    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${API_URL}/logout`, { withCredentials: true });
      if (response.data.success) {
        setIsAuthenticated(false);
        setUserRole(null); // Reset role on logout
        navigate("/login");
      }
    } catch (error) {
      console.log("Logout failed. Please try again.");
    }
  };

  const handleDashboardClick = () => {
    if (!userRole) {
      console.log("User is not authenticated.");
      navigate("/login");
      return;
    }
    if (userRole === "user") {
      navigate("/user-dashboard");
    } else if (userRole === "employer") {
      navigate("/employer-dashboard");
    } else if (userRole === "admin") {
      navigate("/admin-dashboard");
    } else {
      console.log("Role not found.");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">JobScout</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link text-light" to="/profile">Profile</Link>
            </li>

            {/* Render Dashboard button only when role is available */}
            {userRole && (
              <li className="nav-item">
                <button
                  className="nav-link text-light btn btn-link"
                  onClick={handleDashboardClick}
                >
                  Dashboard
                </button>
              </li>
            )}

            <li className="nav-item">
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;