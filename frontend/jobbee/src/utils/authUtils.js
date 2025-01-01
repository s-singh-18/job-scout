// utils/authUtils.js
import axios from 'axios';
import { API_URL } from '../config';

export const getUserRole = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/check`, { withCredentials: true });

    if (response.data.success) {
      return response.data.user.role; // Returns the role (user, employer, admin)
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    return null;
  }
};