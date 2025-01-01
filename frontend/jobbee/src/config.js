export const API_URL = (process.env.NODE_ENV === 'production')
    ? '/api/v1'                         // Production: relative path
    : 'http://localhost:3000/api/v1';   // Development: full URL