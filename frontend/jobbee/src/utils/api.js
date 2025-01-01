import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get("/profile");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user profile", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put("/profile", userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile", error);
    throw error;
  }
};

// Fetch activity jobs based on user role
export const fetchActivityJobs = async () => {
  try {
    const response = await api.get("/jobs/activity");
    return response.data.data; // Assuming the response contains a `data` field with jobs
  } catch (error) {
    console.error("Error fetching activity jobs", error);
    throw error;
  }
};

export default api;