// src/lib/api.js
import axios from 'axios';

// Use the env or fallback to local dev
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/';

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
      .then(r => {
       const tasks = Array.isArray(r.data) ? r.data : (r.data.tasks || []);
       localStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
     })
      .catch(() => {});
    return JSON.parse(cached);
  }
  const r = await api.get('/tasks');
  const tasks = Array.isArray(r.data) ? r.data : (r.data.tasks || []);
  localStorage.setItem(CACHE_KEY, JSON.stringify(tasks));
  return tasks;
}

export function invalidateTasksCache() {
  localStorage.removeItem(CACHE_KEY);
}

export default api;
