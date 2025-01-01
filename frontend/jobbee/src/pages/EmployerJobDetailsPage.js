import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/EmployerJobDetailsPage.css';
import { API_URL } from '../config';

const EmployerJobDetailsPage = () => {
  const { id, slug } = useParams(); // Extract job id and slug from URL params
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // Fetch job details based on job id and slug
        const jobResponse = await axios.get(`${API_URL}/job/${id}/${slug}`, { withCredentials: true });
        const jobData = jobResponse.data.data[0];
        setJob(jobData);

        // Fetch applicants' details if there are any applicants
        if (jobData.applicantsApplied && jobData.applicantsApplied.length > 0) {
          const applicantsData = await Promise.all(
            jobData.applicantsApplied.map(async (applicant) => {
              const applicantResponse = await axios.get(`${API_URL}/user/${applicant.id}`, { withCredentials: true });
              return applicantResponse.data.data; // Assuming user data is in 'data' field
            })
          );
          setApplicants(applicantsData);
        }

        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Something went wrong');
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, slug]);

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      {/* Job Details */}
      <div className="job-card">
        <h1>{job?.title}</h1>
        <p><strong>Company:</strong> {job?.company}</p>
        <p><strong>Description:</strong> {job?.description}</p>
        <p><strong>Address:</strong> {job?.address || 'No Address'}</p>
        <p><strong>Salary:</strong> {job?.salary}</p>
        <p><strong>Experience:</strong> {job?.experience}</p>
        <p><strong>Education Required:</strong> {job?.minEducation}</p>
        <p><strong>Last Date to Apply:</strong> {new Date(job?.lastDate).toLocaleDateString()}</p>
        <p><strong>Job Type:</strong> {job?.jobType}</p>
        <p><strong>Positions Available:</strong> {job?.positions}</p>
      </div>

      {/* Applicant Details */}
      <h2>Applicants</h2>
      {applicants.length > 0 ? (
        <table className="applicant-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Resume</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant, index) => (
              <tr key={index}>
                <td>{applicant?.name || 'N/A'}</td>
                <td>{applicant?.email || 'N/A'}</td>
                <td>
                  <a href={applicant?.resume || '#'} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No applicants yet.</p>
      )}
    </div>
  );
};

export default EmployerJobDetailsPage;