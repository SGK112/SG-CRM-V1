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
    // Log the full error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: `${error.config?.baseURL}${error.config?.url}`,
      status: error.response?.status,
      message: error.message
    });
    
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

// API service methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  uploadFiles: (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post(`/clients/${id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const estimatesAPI = {
  getAll: () => api.get('/estimates'),
  getById: (id) => api.get(`/estimates/${id}`),
  create: (data) => api.post('/estimates', data),
  update: (id, data) => api.put(`/estimates/${id}`, data),
  delete: (id) => api.delete(`/estimates/${id}`),
  duplicate: (id) => api.post(`/estimates/${id}/duplicate`),
  sendToClient: (id, emailData) => api.post(`/estimates/${id}/send`, emailData),
  generatePDF: (id) => api.get(`/estimates/${id}/pdf`, { responseType: 'blob' }),
  getTemplates: () => api.get('/estimates/templates'),
};

export const contractorsAPI = {
  getAll: () => api.get('/contractors'),
  getById: (id) => api.get(`/contractors/${id}`),
  create: (data) => api.post('/contractors', data),
  update: (id, data) => api.put(`/contractors/${id}`, data),
  delete: (id) => api.delete(`/contractors/${id}`),
  getAvailability: (id, date) => api.get(`/contractors/${id}/availability?date=${date}`),
};

export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
  getByDateRange: (start, end) => api.get(`/appointments/range?start=${start}&end=${end}`),
};

export const servicesAPI = {
  getAll: () => api.get('/services'),
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  getPricing: (id) => api.get(`/services/${id}/pricing`),
};

export const vendorsAPI = {
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
  uploadPriceList: (id, file) => {
    const formData = new FormData();
    formData.append('priceList', file);
    return api.post(`/vendors/${id}/price-list`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  processStripePayment: (data) => api.post('/payments/stripe/process', data),
  createPaymentIntent: (amount, clientId) => api.post('/payments/stripe/intent', { amount, clientId }),
  getInvoices: () => api.get('/payments/invoices'),
  sendInvoice: (id) => api.post(`/payments/invoices/${id}/send`),
};

export const communicationsAPI = {
  getAll: () => api.get('/communications'),
  getByClient: (clientId) => api.get(`/communications/client/${clientId}`),
  create: (data) => api.post('/communications', data),
  markAsRead: (id) => api.put(`/communications/${id}/read`),
  sendEmail: (data) => api.post('/communications/email', data),
  sendSMS: (data) => api.post('/communications/sms', data),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/activity'),
  getChartData: (type, period) => api.get(`/dashboard/charts/${type}?period=${period}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  getIntegrations: () => api.get('/settings/integrations'),
  updateIntegration: (name, config) => api.put(`/settings/integrations/${name}`, config),
};

export const filesAPI = {
  upload: (files, category = 'general') => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('category', category);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/files/${id}`),
  getById: (id) => api.get(`/files/${id}`),
  getByCategory: (category) => api.get(`/files/category/${category}`),
};

export default api;
