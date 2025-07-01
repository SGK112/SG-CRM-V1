import axios from 'axios';

// Automatically detect the correct API URL based on the current domain
const getApiUrl = () => {
  const currentUrl = window.location.href;
  
  // If running in GitHub Codespaces
  if (currentUrl.includes('app.github.dev')) {
    const match = currentUrl.match(/https:\/\/([^-]+(-[^-]+)*)-3000\.app\.github\.dev/);
    if (match) {
      const baseUrl = match[1];
      const apiUrl = `https://${baseUrl}-8000.app.github.dev/api`;
      console.log('Detected GitHub Codespace, using API URL:', apiUrl);
      return apiUrl;
    }
  }
  
  // Default to environment variable or localhost
  const defaultUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  console.log('Using default API URL:', defaultUrl);
  return defaultUrl;
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
