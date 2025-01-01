import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/JobPostPage.css';
import { API_URL } from '../config';

const JobPostPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        salary: '',
        jobType: '',
        experience: '',
        industry: [],
        minEducation: '',
        positions: 1,
        company: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        email: '',
        lastDate: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {
        title, description, salary, jobType, experience, industry,
        minEducation, positions, company, street, city, state,
        zipCode, country, email, lastDate
    } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleIndustryChange = (e) => {
        const { value, checked } = e.target;
        setFormData({
            ...formData,
            industry: checked
                ? [...industry, value]
                : industry.filter((item) => item !== value),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const address = `${street}, ${city}, ${state}, ${zipCode}, ${country}`;

        const jobData = {
            title,
            description,
            salary,
            jobType,
            experience,
            industry,
            minEducation,
            positions,
            company,
            address,
            email,
            lastDate,
        };

        try {
            const response = await axios.post(`${API_URL}/job/new`, jobData, {
                withCredentials: true,
            });

            if (response.data.success) {
                setMessage({ text: 'Job Created Successfully!', type: 'success' });
                setTimeout(() => navigate('/employer-dashboard'), 2000);
            } else {
                setMessage({ text: 'Failed to create job. Please try again.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Error occurred. Please try again later.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-job-form">
            <h2>Create New Job</h2>

            {/* Display Message */}
            {message && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Job Title */}
                <div>
                    <label>Job Title:</label>
                    <input type="text" name="title" value={title} onChange={handleChange} required />
                </div>

                {/* Description */}
                <div>
                    <label>Description:</label>
                    <textarea name="description" value={description} onChange={handleChange} required></textarea>
                </div>

                {/* Salary */}
                <div>
                    <label>Salary:</label>
                    <input type="number" name="salary" value={salary} onChange={handleChange} required />
                </div>

                {/* Job Type */}
                <div>
                    <label>Job Type:</label>
                    <select name="jobType" value={jobType} onChange={handleChange} required>
                        <option value="">Select Job Type</option>
                        <option value="Permanent">Permanent</option>
                        <option value="Temporary">Temporary</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>

                {/* Experience */}
                <div>
                    <label>Experience:</label>
                    <select name="experience" value={experience} onChange={handleChange} required>
                        <option value="">Select Experience Level</option>
                        <option value="0 Years / Fresher">0 Years / Fresher</option>
                        <option value="1 Year - 2 Years">1 Year - 2 Years</option>
                        <option value="2 Years - 5 Years">2 Years - 5 Years</option>
                        <option value="More than 5 Years">More than 5 Years</option>
                    </select>
                </div>

                {/* Industry */}
                <div>
                    <label>Industry:</label>
                    <div>
                        {['Business', 'Information Technology', 'Banking', 'Education/Training', 'Telecommunication', 'Others'].map((industryOption) => (
                            <label key={industryOption}>
                                <input
                                    type="checkbox"
                                    name="industry"
                                    value={industryOption}
                                    checked={industry.includes(industryOption)}
                                    onChange={handleIndustryChange}
                                />
                                {industryOption}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Minimum Education */}
                <div>
                    <label>Minimum Education:</label>
                    <select name="minEducation" value={minEducation} onChange={handleChange} required>
                        <option value="">Select Education Level</option>
                        <option value="High School">High School</option>
                        <option value="Bachelors">Bachelors</option>
                        <option value="Masters">Masters</option>
                        <option value="Phd">PhD</option>
                    </select>
                </div>

                {/* Email */}
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={email} onChange={handleChange} required />
                </div>

                {/* Posting Date */}
                <div>
                    <label>Last Date to Apply:</label>
                    <input type="date" name="lastDate" value={lastDate} onChange={handleChange} />
                </div>

                {/* Positions */}
                <div>
                    <label>Positions:</label>
                    <input type="number" name="positions" value={positions} onChange={handleChange} required />
                </div>

                {/* Company */}
                <div>
                    <label>Company:</label>
                    <input type="text" name="company" value={company} onChange={handleChange} required />
                </div>

                {/* Job Location */}
                <h3>Job Location</h3>
                {['street', 'city', 'state', 'zipCode', 'country'].map((field) => (
                    <div key={field}>
                        <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                        <input type="text" name={field} value={formData[field]} onChange={handleChange} required />
                    </div>
                ))}

                {/* Submit Button */}
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating Job...' : 'Create Job'}
                </button>
            </form>
        </div>
    );
};

export default JobPostPage;