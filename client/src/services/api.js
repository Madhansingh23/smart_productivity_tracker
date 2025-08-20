// services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE });

// --- Auth ---
export const login = async (identifier, password) => {
  const res = await api.post('/auth/login', { email: identifier, password });
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);  // ✅ save token
  }
  return res.data;
};

export const signup = async (data) => {
  const res = await api.post('/auth/signup', data);
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);  // ✅ save token
  }
  return res.data;
};

// --- Profile ---
export const getProfile = (username) =>
  api.get(`/profile/${username}`);

export const uploadProfilePic = (formData, token) =>
  api.post('/profile/upload-pic', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });

export default api;
