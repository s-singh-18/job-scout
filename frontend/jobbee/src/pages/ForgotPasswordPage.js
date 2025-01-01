import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ForgotPasswordPage.css';
import { API_URL } from '../config';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/password/forgot`, { email });
      setMessage(res.data.message);

      // Assuming resetToken is sent in the response (backend should send it)
      const resetToken = res.data.resetToken; // Modify this based on your backend response structure

      // Show success message to user, telling them to check their email for the reset link
      if (resetToken) {
        setMessage('Password reset link sent! Check your email.');
      } else {
        setMessage('No reset token provided.');
      }
    } catch (error) {
      setMessage(error.response.data.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page-wrapper">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p>Enter your email to receive a password reset link</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Recovery Email'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;