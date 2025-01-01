import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/EmployerJobCard.css';

const EmployerJobCard = ({ job, handleDelete }) => {
  return (
    <div className="custom-job-card">
      {/* Job Title */}
      <div className="custom-job-card-header">{job.title}</div>

      {/* Job Description */}
      <div className="custom-job-card-body">
        <p>{job.description}</p>
      </div>

      {/* Job Additional Information */}
      <div className="job-additional-info">
        <p><strong>Address:</strong> {job.address}</p>
        <p><strong>Salary:</strong> {job.salary}</p>
        <p><strong>Experience:</strong> {job.experience} years</p>
      </div>

      {/* Buttons Footer */}
      <div className="custom-job-card-footer">
        {/* Left: View Details */}
        <div className="left-buttons">
          <Link to={`/employer/job/${job._id}/${job.slug}`} className="btn view-details-btn">
            View Details
          </Link>
        </div>

        {/* Right: Edit and Delete */}
        <div className="right-buttons">
          <Link to={`/employer/edit/job/${job._id}/${job.slug}`} className="btn edit-job-btn">
            Edit
          </Link>
          <button onClick={() => handleDelete(job._id)} className="btn delete-job-btn">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployerJobCard;