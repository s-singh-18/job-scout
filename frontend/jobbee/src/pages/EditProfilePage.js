import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/EditProfilePage.css';
import { API_URL } from '../config';

const EditProfilePage = () => {
  const [user, setUser] = useState({ name: '', email: '', profilePicture: '', resume: '', role: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null); // To store selected profile picture
  const [resume, setResume] = useState(null); // To store selected resume file
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
        setUser({
          name: response.data.data.name,
          email: response.data.data.email,
          profilePicture: response.data.data.profilePic || '', // Get the profile picture URL if exists
          resume: response.data.data.resume || '', // Get the resume URL if exists
          role: response.data.data.role || '', // Get the role of the user
        });
      } catch (error) {
        console.log('Error fetching user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Save the selected profile picture
  };

  const handleResumeChange = (e) => {
    setResume(e.target.files[0]); // Save the selected resume
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    if (image) {
      formData.append('profilePicture', image); // Add profile picture to form data
    }

    try {
      // Update profile details (name, email, and profile picture)
      const response = await axios.put(`${API_URL}/profile/update`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file upload
        },
      });

      if (response.data.success) {
        setUser({
          ...user,
          profilePicture: response.data.data.profilePic, // Update the profile picture URL
        });
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile. Please try again.');
      }

      // Upload resume (if provided and if user role is 'user')
      if (resume && user.role === 'user') {
        const resumeFormData = new FormData();
        resumeFormData.append('resume', resume); // Add resume to form data

        const resumeResponse = await axios.put(`${API_URL}/user/resume`, resumeFormData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (resumeResponse.data.success) {
          setUser({
            ...user,
            resume: resumeResponse.data.data.resume, // Update the resume URL
          });
          setMessage('Resume uploaded successfully!');
        } else {
          setMessage('Failed to upload resume. Please try again.');
        }
      }

      setTimeout(() => navigate('/profile'), 1500); // Redirect after 1.5 seconds
    } catch (error) {
      console.log('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">Edit Your Profile</h1>

      {message && <div className="alert alert-info">{message}</div>}
      {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="mb-4">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control form-control-lg"
            id="name"
            name="name"
            value={user.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            className="form-control form-control-lg"
            id="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Profile Picture Upload */}
        <div className="mb-4">
          <label htmlFor="profilePicture" className="form-label">Profile Picture</label>
          <input
            type="file"
            className="form-control"
            id="profilePicture"
            name="profilePicture"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* Conditionally show Resume Upload based on role */}
        {user.role === 'user' && (
          <div className="mb-4">
            <label htmlFor="resume" className="form-label">Resume</label>
            <input
              type="file"
              className="form-control"
              id="resume"
              name="resume"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleResumeChange}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;
