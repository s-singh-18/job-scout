import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import JobDetailsPage from "./pages/JobDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EditProfilePage from "./pages/EditProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import UserDashboardPage from "./pages/UserDashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmployerDashboardPage from "./pages/EmployerDashboardPage";
import EmployerJobDetailsPage from "./pages/EmployerJobDetailsPage";
import EmployerEditJobPage from "./pages/EmployerEditJobPage";
import JobPostPage from "./pages/JobPostPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import { API_URL } from './config';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/check`, { withCredentials: true });
        if (response.data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Loading state while checking authentication
  }

  return (
    <Router>
      <div className="main-content">
        {/* Render Navbar only if the user is authenticated */}
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}

        <div className="content">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={!isAuthenticated ? <LoginPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />}
            />
            <Route
              path="/forgot-password"
              element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/" />}
            />
            <Route
              path="/reset-password/:token"
              element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to="/" />}
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/jobs/:id/:slug"
              element={isAuthenticated ? <JobDetailsPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={isAuthenticated ? <UserProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/edit-profile"
              element={isAuthenticated ? <EditProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/user-dashboard"
              element={isAuthenticated ? <UserDashboardPage /> : <Navigate to="/login" />}
            />

            {/* Employer Routes */}
            <Route
              path="/employer-dashboard"
              element={isAuthenticated ? <EmployerDashboardPage /> : <Navigate to="/" />}
            />
            <Route
              path="/employer/job/:id/:slug"
              element={isAuthenticated ? <EmployerJobDetailsPage /> : <Navigate to="/" />}
            />
            <Route
              path="/employer/edit/job/:id/:slug"
              element={isAuthenticated ? <EmployerEditJobPage /> : <Navigate to="/" />}
            />
            <Route
              path="/employer/job/new"
              element={isAuthenticated ? <JobPostPage /> : <Navigate to="/" />}
            />

            {/* Catch-All Route */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </div>

        {/* Footer component */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;