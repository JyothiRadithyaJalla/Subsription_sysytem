import axios from 'axios';

// Use environment variable for deployed API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Plans API
export const plansAPI = {
  getAll: () => api.get('/plans'),
  getById: (id) => api.get(`/plans/${id}`),
};

// Subscriptions API
export const subscriptionsAPI = {
  create: (data) => api.post('/subscriptions', data),
  getActive: () => api.get('/subscriptions/active'),
  getHistory: () => api.get('/subscriptions/history'),
  cancel: (id) => api.delete(`/subscriptions/${id}`),
};

// Content API
export const contentAPI = {
  getMovies: (params) => api.get('/content/movies', { params }),
  getChannels: (params) => api.get('/content/channels', { params }),
  getGenres: () => api.get('/content/genres'),
  getCategories: () => api.get('/content/categories'),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getSubscriptions: () => api.get('/admin/subscriptions'),
};

// Payment API
export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data),
};

export default api;
