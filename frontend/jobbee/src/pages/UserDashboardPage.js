import React, { useState, useEffect } from "react";
import JobCard from "../components/JobCard";
import { fetchActivityJobs } from "../utils/api";
import "../styles/UserDashboardPage.css";

const UserDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getJobs = async () => {
      try {
        const data = await fetchActivityJobs();
        setJobs(data);
      } catch (err) {
        setError("Failed to load activity jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getJobs();
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-danger">{error}</p>;

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">User Dashboard</h2>
      <div className="row">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div className="col-md-4 mb-4" key={job._id}>
              <JobCard job={job} />
            </div>
          ))
        ) : (
          <p className="text-center">No activity found.</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;