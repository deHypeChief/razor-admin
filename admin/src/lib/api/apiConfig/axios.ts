// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL:  import.meta.env.VITE_SERVER_API, // Replace with your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add token (if available)
api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('admin-payload') as string)?.auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;