import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import EmployerJobCard from '../components/EmployerJobCard';
import '../styles/EmployerJobCard.css';
import { API_URL } from '../config';

const EmployerDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployerJobs = async () => {
      try {
        const response = await axios.get(`${API_URL}/jobs/activity`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setJobs(response.data.data);
        } else {
          console.log(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching employer jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerJobs();
  }, []);

  const handleDelete = async (jobId) => {
    try {
      await axios.delete(`${API_URL}/job/${jobId}`, {
        withCredentials: true,
      });
      setJobs(jobs.filter((job) => job._id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="employer-dashboard container">
      <h2 className="text-center my-5">Employer Dashboard</h2>

      {/* Post New Job Button Section */}
      <div className="d-flex justify-content-center mb-4">
        <Link to="/employer/job/new" className="btn btn-primary">
          Post New Job
        </Link>
      </div>

      {/* Job Listings */}
      <div className="row justify-content-center">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div className="col-md-12 col-lg-12 mb-4" key={job._id}>
              <EmployerJobCard job={job} handleDelete={handleDelete} />
            </div>
          ))
        ) : (
          <p className="text-center">No jobs posted yet.</p>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboardPage;