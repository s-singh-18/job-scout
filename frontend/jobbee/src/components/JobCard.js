import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/JobCard.css';

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // Navigate to job details page with both id and slug
    navigate(`/jobs/${job._id}/${job.slug}`);
  };

  return (
    <div className="job-card-container">
      <div className="job-card">
        <h3 className="job-card-title">{job.title}</h3>
        <p className="job-card-company">{job.company}</p>
        <p className="job-card-location">{job.address || 'No Address'}</p>
        <p className="job-card-description">{job.description?.slice(0, 100)}...</p>
        <div className="view-details-btn-container">
          <button className="view-details-btn" onClick={handleViewDetails}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;