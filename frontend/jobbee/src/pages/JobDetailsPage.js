import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/JobDetailsPage.css';
import { API_URL } from '../config';

const JobDetailsPage = () => {
  const { id, slug } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [useExistingResume, setUseExistingResume] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/job/${id}/${slug}`,{ withCredentials: true });        
        setJob(response.data.data[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, slug]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setResume(file);
  };

  const handleApply = async () => {
    if (!useExistingResume && !resume) {
        setError('Please upload a resume to proceed.');
        return;
    }

    const formData = new FormData();
    formData.append('useExistingResume', useExistingResume);
    if (!useExistingResume && resume) {
        formData.append('resume', resume);
    }

    try {
        const response = await axios.put(
            `${API_URL}/job/${id}/apply`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true, // Ensure cookies are sent
            }
        );

        if (response.data.success) {
            setMessage('Successfully applied to the job!');
            setError('');
        }
    } catch (error) {
        console.error('Error applying to the job:', error);
        if (error.response && error.response.data && error.response.data.errMessage) {
            setError(error.response.data.errMessage);
        } else {
            setError('There was an issue applying for the job. Please try again.');
        }
    }
  };

  if (loading) return <div className="loading">Loading job details...</div>;

  if (!job) return <div className="error-message">Job not found.</div>;

  return (
    <div className="job-details-page">
      <div className="job-header">
        <h1 className="job-title">{job.title}</h1>
        <p className="job-company">{job.company}</p>
      </div>
      <div className="divider"></div>
      <div className="job-details">
        <p><strong>Address:</strong> {job.address || 'No Address'}</p>
        <p><strong>Job Type:</strong> {job.jobType}</p>
        <p><strong>Experience:</strong> {job.experience}</p>
        <p><strong>Minimum Education:</strong> {job.minEducation}</p>
        <p><strong>Salary:</strong> {job.salary}</p>
        <p><strong>Industry:</strong> {job.industry}</p>
        <p><strong>Positions Available:</strong> {job.positions}</p>
        <p><strong>Last Date to Apply:</strong> {new Date(job.lastDate).toLocaleDateString()}</p>
      </div>
      <div className="job-description">
        <h2>Job Description</h2>
        <p>{job.description}</p>
      </div>

      <div className="application-section">
        <h2>Apply for this Job</h2>
        <div className="toggle-container">
          <span>Use Existing Resume</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={!useExistingResume}
              onChange={() => setUseExistingResume(!useExistingResume)}
            />
            <span className="slider"></span>
          </label>
          <span>Upload New Resume</span>
        </div>
        {!useExistingResume && (
          <input type="file" className="file-input" onChange={handleFileChange} />
        )}
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <button className="apply-button" onClick={handleApply}>Apply</button>
      </div>
    </div>
  );
};

export default JobDetailsPage;