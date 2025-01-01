import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import '../styles/LoginPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_URL } from '../config';

const LoginPage = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });

      if (response.data.success) {
        setIsAuthenticated(true); // Update the parent component state
        navigate('/'); // Redirect to home page after successful login
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card shadow-lg">
        <h2 className="text-center mb-4">Welcome Back!</h2>
        <p className="text-center text-muted">Log in to access your account</p>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-3">
            <span className="input-group-text bg-primary text-white">
              <FaEnvelope />
            </span>
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group mb-4">
            <span className="input-group-text bg-primary text-white">
              <FaLock />
            </span>
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
        <div className="text-center mt-3">
          <p>
            Don't have an account? <Link to="/register" className="text-primary">Sign up</Link>
          </p>
          <p>
            Forgot your password? <Link to="/forgot-password" className="text-primary">Reset it here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;