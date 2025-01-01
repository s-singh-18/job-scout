import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/EmployerEditJobPage.css';
import { API_URL } from '../config';

const EditJobPage = () => {
    const { id, slug } = useParams(); // Get both 'id' and 'slug' from the URL
    const navigate = useNavigate();
    const [jobData, setJobData] = useState({
        title: '',
        description: '',
        email: '',
        address: '',
        company: '',
        industry: [],
        jobType: '',
        minEducation: '',
        positions: '',
        experience: '',
        salary: '',
        lastDate: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const industries = [
        "Business",
        "Information Technology",
        "Banking",
        "Education/Training",
        "Telecommunication",
        "Others"
    ];

    const educationOptions = [
        'High School',
        'Bachelors',
        'Masters',
        'Phd'
    ];

    const experienceOptions = [
        '0 Years / Fresher',
        '1 Year - 2 Years',
        '2 Years - 5 Years',
        'More than 5 Years'
    ];

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/job/${id}/${slug}`, {
                    withCredentials: true,
                });

                const job = data.data[0]; // Assuming the response returns an array of jobs, as per your backend

                setJobData({
                    title: job.title,
                    description: job.description,
                    email: job.email,
                    address: job.address,
                    company: job.company,
                    industry: job.industry, // Array of selected industries
                    jobType: job.jobType,
                    minEducation: job.minEducation, // Set the education field
                    positions: job.positions,
                    experience: job.experience, // Set the experience field
                    salary: job.salary,
                    lastDate: job.lastDate.split('T')[0], // Format date for input field
                });
            } catch (error) {
                console.error('Failed to fetch job details:', error);
            }
        };

        fetchJobDetails();
    }, [id, slug]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setJobData({
                ...jobData,
                [name]: checked
                    ? [...jobData[name], value]
                    : jobData[name].filter((item) => item !== value),
            });
        } else {
            setJobData({ ...jobData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`${API_URL}/job/${id}`, jobData, {
                withCredentials: true,
            });
            setMessage('Job updated successfully!');
            setTimeout(() => navigate('/employer-dashboard'), 1500); // Navigate after 1.5 seconds
        } catch (error) {
            console.error('Failed to update job:', error);
            setMessage('Failed to update job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <h1 className="text-center mb-5">Edit Job Details</h1>

            {message && <div className="alert alert-info">{message}</div>}
            {loading && <div className="text-center"><div className="spinner-border" role="status"></div></div>}

            <form onSubmit={handleSubmit} className="job-form">
                <div className="mb-3">
                    <label className="form-label">Job Title</label>
                    <input
                        type="text"
                        name="title"
                        value={jobData.title}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Job Description</label>
                    <textarea
                        name="description"
                        value={jobData.description}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Contact Email</label>
                    <input
                        type="email"
                        name="email"
                        value={jobData.email}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Job Address (Street Name, City, State, ZipCode, Country)</label>
                    <input
                        type="text"
                        name="address"
                        value={jobData.address}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Company Name</label>
                    <input
                        type="text"
                        name="company"
                        value={jobData.company}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Industry</label>
                    <div className="form-check">
                        {industries.map((industry) => (
                            <div key={industry}>
                                <input
                                    type="checkbox"
                                    name="industry"
                                    value={industry}
                                    checked={jobData.industry.includes(industry)}
                                    onChange={handleChange}
                                    className="form-check-input"
                                />
                                <label className="form-check-label">{industry}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Job Type</label>
                    <select name="jobType" value={jobData.jobType} onChange={handleChange} className="form-control" required>
                        <option value="">Select Job Type</option>
                        <option value="Permanent">Permanent</option>
                        <option value="Temporary">Temporary</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Minimum Education</label>
                    <select
                        name="minEducation"
                        value={jobData.minEducation}
                        onChange={handleChange}
                        className="form-control"
                        required
                    >
                        <option value="">Select Minimum Education</option>
                        {educationOptions.map((education) => (
                            <option key={education} value={education}>
                                {education}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Number of Positions</label>
                    <input
                        type="number"
                        name="positions"
                        value={jobData.positions}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Experience Required</label>
                    <select
                        name="experience"
                        value={jobData.experience}
                        onChange={handleChange}
                        className="form-control"
                        required
                    >
                        <option value="">Select Experience</option>
                        {experienceOptions.map((experience) => (
                            <option key={experience} value={experience}>
                                {experience}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Expected Salary (Monthly)</label>
                    <input
                        type="number"
                        name="salary"
                        value={jobData.salary}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Application Deadline</label>
                    <input
                        type="date"
                        name="lastDate"
                        value={jobData.lastDate}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Job'}
                </button>
            </form>
        </div>
    );
};

export default EditJobPage;