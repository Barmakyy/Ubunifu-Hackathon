import axios from 'axios';

// Use environment variable for API URL, fallback to local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    const { state } = JSON.parse(authData);
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data)
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data)
};

// Timetable API
export const timetableAPI = {
  getAll: () => api.get('/timetable'),
  create: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),
  uploadCSV: (formData) => api.post('/timetable/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Attendance API
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance/mark', data),
  getToday: () => api.get('/attendance/today'),
  getStats: (params) => api.get('/attendance/stats', { params })
};

// Task API
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getToday: () => api.get('/tasks/today'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStats: () => api.get('/tasks/stats')
};

// Goal API
export const goalAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`)
};

// Streak API
export const streakAPI = {
  get: () => api.get('/streak')
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/message', { message })
};

// Report API
export const reportAPI = {
  getAll: () => api.get('/reports'),
  getLatest: () => api.get('/reports/latest')
};

export default api;
