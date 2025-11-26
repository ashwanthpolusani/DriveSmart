// Centralized configuration for the application

// Use the production Render URL when deployed, and localhost for local development
export const API_BASE_URL = import.meta.env.PROD
  ? 'https://drivesmartbackend.onrender.com'
  : 'http://localhost:4000';
