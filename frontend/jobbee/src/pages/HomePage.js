import React, { useState, useEffect } from "react";
import JobCard from "../components/JobCard";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/HomePage.css';
import { API_URL } from '../config';

const HomePage = () => {
  const [jobs, setJobs] = useState([]);

  // Fetch jobs data from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_URL}/jobs`, { withCredentials: true });
        setJobs(response.data.data);
      } catch (error) {
        console.log("Error fetching jobs. Please try again later.");
      }
    };

    fetchJobs();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <header className="hero bg-primary text-white text-center py-5">
        <div className="container">
          <h1>Welcome to <span className="gradient-text">JobScout</span></h1>
          <p>Your gateway to amazing career opportunities</p>
        </div>
      </header>

      {/* Job Listings Section */}
      <div className="container py-5">
        <h2 className="text-center mb-4">Available Jobs</h2>
        <div className="row">
          {Array.isArray(jobs) && jobs.length > 0 ? (
            jobs.map((job) => (
              <div className="col-md-4 mb-4" key={job._id}>
                <JobCard job={job} />
              </div>
            ))
          ) : (
            <p className="text-center">No jobs available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;