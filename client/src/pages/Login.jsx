// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login(){
  const [identifier,setIdentifier]=useState('');
  const [password,setPassword]=useState('');
  const { setToken, setUser } = useAuth();
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    try {
      const res = await api.post('/auth/login',{ identifier, password });
      setToken(res.data.token); setUser(res.data.user);
      nav('/');
    } catch(err){ alert(err?.response?.data?.error || 'Login failed'); }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 dark:bg-neutral-900">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-2xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
        <p className="text-sm text-neutral-500 mb-4">Sign in to continue</p>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full p-3 border dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
                 placeholder="Email or Username" value={identifier} onChange={e=>setIdentifier(e.target.value)} />
          <input type="password" className="w-full p-3 border dark:border-neutral-700 rounded bg-white dark:bg-neutral-800"
                 placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded">Login</button>
        </form>
        <div className="mt-4 text-sm">No account? <Link to="/signup" className="text-blue-600">Create one</Link></div>
      </div>
    </div>
  );
}
