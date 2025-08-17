// src/lib/api.js
import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const api = axios.create({ baseURL: `${API_BASE}/api` });

// attach token automatically
api.interceptors.request.use((config)=>{
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// tiny cache for GET /tasks (localStorage + SWR)
const CACHE_KEY = 'tasks_cache_v1';
export async function getTasksFast() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    // revalidate in background
    api.get('/tasks').then(r => localStorage.setItem(CACHE_KEY, JSON.stringify(r.data))).catch(()=>{});
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
