export const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://job-scout-y3ik.onrender.com/api/v1'  // Your backend Render URL
    : 'http://localhost:3000/api/v1';