import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

// Auth
export const login = (identifier, password) =>
  api.post('/auth/login', { email: identifier, password });

export const signup = (data) =>
  api.post('/auth/signup', data);

// Profile
export const getProfile = (username) =>
  api.get(`/profile/${username}`);

export const uploadProfilePic = (formData, token) =>
  api.post('/profile/upload-pic', formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
  });

export default api;
