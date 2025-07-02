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
  
  // For local development, use the production backend to avoid bandwidth usage
  if (currentUrl.includes('localhost:3000')) {
    const productionUrl = 'https://sg-crm-v1.onrender.com/api';
    console.log('Local development detected, using production API URL:', productionUrl);
    return productionUrl;
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

// Marketing API methods
export const marketingApi = {
  // Social Media Platform Configuration
  configurePlatform: (platform, config) => api.post(`/marketing/platforms/${platform}/configure`, config),
  getPlatforms: () => api.get('/marketing/platforms'),
  
  // Social Media Posts
  createPost: (content, platforms, scheduleTime = null) => 
    api.post('/marketing/posts', { content, platforms, schedule_time: scheduleTime }),
  getPosts: () => api.get('/marketing/posts'),
  
  // Analytics
  getAnalytics: (platform = null, days = 30) => 
    api.get('/marketing/analytics', { params: { platform, days } }),
  
  // Marketing Campaigns
  createCampaign: (campaignData) => api.post('/marketing/campaigns', campaignData),
  getCampaigns: () => api.get('/marketing/campaigns'),
  updateCampaign: (campaignId, updates) => api.put(`/marketing/campaigns/${campaignId}`, updates),
  deleteCampaign: (campaignId) => api.delete(`/marketing/campaigns/${campaignId}`),
};

export default api;
