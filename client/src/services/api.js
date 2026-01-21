import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

// Assets API
export const assetsAPI = {
  getAll: (params) => api.get('/assets', { params }),
  getOne: (id) => api.get(`/assets/${id}`),
  create: (data) => api.post('/assets', data),
  update: (id, data) => api.put(`/assets/${id}`, data),
  delete: (id) => api.delete(`/assets/${id}`),
  assign: (id, userId) => api.post(`/assets/${id}/assign`, { userId }),
  unassign: (id) => api.post(`/assets/${id}/unassign`),
  addMaintenance: (id, data) => api.post(`/assets/${id}/maintenance`, data),
  getQR: (id) => api.get(`/assets/${id}/qr`),
  getStats: () => api.get('/assets/stats'),
};

// Vendors API
export const vendorsAPI = {
  getAll: (params) => api.get('/vendors', { params }),
  getOne: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
  addContract: (id, data) => api.post(`/vendors/${id}/contracts`, data),
  updateContract: (id, contractId, data) => api.put(`/vendors/${id}/contracts/${contractId}`, data),
  deleteContract: (id, contractId) => api.delete(`/vendors/${id}/contracts/${contractId}`),
  getStats: () => api.get('/vendors/stats'),
};

// Onboarding API
export const onboardingAPI = {
  // Templates
  getTemplates: (params) => api.get('/onboarding/templates', { params }),
  getTemplate: (id) => api.get(`/onboarding/templates/${id}`),
  createTemplate: (data) => api.post('/onboarding/templates', data),
  updateTemplate: (id, data) => api.put(`/onboarding/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/onboarding/templates/${id}`),
  // Instances
  getInstances: (params) => api.get('/onboarding/instances', { params }),
  getInstance: (id) => api.get(`/onboarding/instances/${id}`),
  createInstance: (data) => api.post('/onboarding/instances', data),
  updateTask: (instanceId, taskId, data) => api.put(`/onboarding/instances/${instanceId}/tasks/${taskId}`, data),
  cancelInstance: (id) => api.put(`/onboarding/instances/${id}/cancel`),
  getStats: () => api.get('/onboarding/stats'),
};

export default api;
