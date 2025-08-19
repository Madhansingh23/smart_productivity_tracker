// src/lib/api.js
import axios from 'axios';

// Use the env or fallback to local dev
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Single axios instance
const api = axios.create({ baseURL: API_BASE });

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Task caching
const CACHE_KEY = 'tasks_cache_v1';

export async function getTasksFast() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    // background refresh
    api.get('/tasks')
      .then(r => localStorage.setItem(CACHE_KEY, JSON.stringify(r.data)))
      .catch(() => {});
    return JSON.parse(cached);
  }
  const r = await api.get('/tasks');
  localStorage.setItem(CACHE_KEY, JSON.stringify(r.data));
  return r.data;
}

export function invalidateTasksCache() {
  localStorage.removeItem(CACHE_KEY);
}

export default api;
