// Dynamic API configuration supporting local development and production deployments (Vercel + Render)

const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Remove trailing slashes
  url = url.trim().replace(/\/+$/, '');
  
  // If the user provided the base domain without '/api', append it
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

export const API_BASE_URL = getApiBaseUrl();
export const AUTH_API_URL = `${API_BASE_URL}/auth`;

export default {
  API_BASE_URL,
  AUTH_API_URL
};
