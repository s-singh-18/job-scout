import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfilePage.css';
import { API_URL } from '../config';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/profile`, { withCredentials: true });
        setUser(response.data.data);
      } catch (error) {
        console.log('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (!user) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">My Profile</h1>

      <div className="card shadow-lg mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4 text-center">
              {/* Display the Cloudinary profile picture if available */}
              <img
                src={user.profilePic || "https://via.placeholder.com/150"} // Cloudinary URL or placeholder
                alt="Profile"
                className="rounded-circle img-fluid mb-3"
                style={{ maxWidth: '150px' }} // Adjust the image size as needed
              />
              <h4>{user.name}</h4>
              <p className="text-muted">{user.role}</p>
            </div>
            <div className="col-md-8">
              <h5>Profile Information</h5>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th>Email</th>
                    <td>{user.email}</td>
                  </tr>
                  <tr>
                    <th>Account Created</th>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                  {user.role === "user" && (
                    <tr>
                      <th>Resume</th>
                      <td>
                        {user.resume ? (
                          <a href={user.resume} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">View Resume</a>
                        ) : (
                          <p>No resume uploaded yet</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button className="btn btn-primary" onClick={handleEditProfile}>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;