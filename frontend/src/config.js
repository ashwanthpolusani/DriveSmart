// Centralized configuration for the application

// Use the production Render URL when deployed, and localhost for local development
// Prefer explicit Vite environment variable so it can be configured on hosting platforms
// (set VITE_API_BASE_URL in Vercel / Vite environment). Falls back to local / production defaults.
const envUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = envUrl
  || (import.meta.env.PROD ? 'https://drivesmartbackend.onrender.com' : 'http://localhost:4000');
