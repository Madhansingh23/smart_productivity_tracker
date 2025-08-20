// src/pages/Signup.jsx
import React, { useState } from 'react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [username,setUsername] = useState('');
  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');
  const [password,setPassword] = useState('');
  const [confirmPassword,setConfirmPassword] = useState('');
  const [emailOtp,setEmailOtp] = useState('');
  const [phoneOtp,setPhoneOtp] = useState('');
  const [emailSent,setEmailSent] = useState(false);
  const [phoneSent,setPhoneSent] = useState(false);
  const [usernameSuggestions,setUsernameSuggestions] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');

  const { setToken, setUser } = useAuth();
  const nav = useNavigate();

  async function checkUsername(v){
    if(v.length < 4) return;
    try {
      const r = await api.get(`/auth/check-username?username=${v}`);
      setUsernameSuggestions(r.data.available ? [] : r.data.suggestions || []);
    } catch(e){ console.error(e); }
  }

  async function sendEmailOtp(){
    try {
      await api.post('/auth/send-otp',{ email });
      setEmailSent(true);
    } catch(e){ setError('Failed to send email OTP'); }
  }
  async function verifyEmailOtp(){
  console.log("Verifying OTP with:", { email, code: emailOtp });
  try {
    const r = await api.post('/auth/verify-otp',{ email, code: emailOtp });
    console.log("Verify response:", r.data);
    alert(r.data.verified?'Email verified':'Invalid OTP');
  } catch(err) {
    console.error("Verify error:", err.response?.data || err.message);
    alert("Error: " + (err.response?.data?.error || err.message));
  }
}

  async function sendPhoneOtp(){
    try {
      await api.post('/auth/send-sms-otp',{ phone });
      setPhoneSent(true);
    } catch(e){ setError('Failed to send SMS OTP'); }
  }
  async function verifyPhoneOtp(){
    try {
      const r = await api.post('/auth/verify-sms-otp',{ phone, code: phoneOtp });
      if(!r.data.verified) setError('Invalid phone OTP');
    } catch(e){ setError('Invalid phone OTP'); }
  }

  async function submit(e){
    e.preventDefault();
    setError('');

    if(password !== confirmPassword){
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // basic availability checks
      const [u,eChk,pChk] = await Promise.all([
        api.get(`/auth/check-username?username=${username}`),
        api.get(`/auth/check-email?email=${email}`),
        phone ? api.get(`/auth/check-phone?phone=${phone}`) : Promise.resolve({data:{available:true}})
      ]);

      if(!u.data.available || !eChk.data.available || !pChk.data.available){
        setError('Choose a unique username/email/phone');
        setLoading(false);
        return;
      }

      const res = await api.post('/auth/signup', { username, email, phone, password });
      setToken(res.data.token); 
      setUser(res.data.user);
      nav('/');
    } catch(err){
      console.error(err);
      setError(err?.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border dark:border-neutral-800 rounded-2xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>

        {error && <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-3 py-2 rounded mb-3 text-sm">{error}</div>}

        <form onSubmit={submit} className="space-y-3">
          {/* Username */}
          <div>
            <label className="block mb-1 text-sm">Username</label>
            <input className="w-full p-3 border dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                   placeholder="Username" value={username}
                   onChange={e=>{ setUsername(e.target.value); checkUsername(e.target.value); }} />
            {usernameSuggestions.length>0 && (
              <div className="text-xs text-red-500 mt-1">
                Unavailable. Try: {usernameSuggestions.join(', ')}
              </div>
            )}
          </div>

          {/* Email + OTP */}
          <div>
            <label className="block mb-1 text-sm">Email</label>
            <input className="w-full p-3 border dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                   type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={sendEmailOtp} className="px-3 py-2 rounded border dark:border-neutral-700" disabled={!email}>
                Send Email OTP
              </button>
              {emailSent && (
                <>
                  <input className="flex-1 p-3 border dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                         placeholder="Enter OTP" value={emailOtp} onChange={e=>setEmailOtp(e.target.value)} />
                  <button type="button" onClick={verifyEmailOtp} className="px-3 py-2 rounded bg-green-600 text-white">Verify</button>
                </>
              )}
            </div>
          </div>

          {/* Phone + OTP */}
          <div>
            <label className="block mb-1 text-sm">Phone (optional)</label>
            <input className="w-full p-3 border dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                   placeholder="Phone number" value={phone} onChange={e=>setPhone(e.target.value)} />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={sendPhoneOtp} className="px-3 py-2 rounded border dark:border-neutral-700" disabled={!phone}>
                Send SMS OTP
              </button>
              {phoneSent && (
                <>
                  <input className="flex-1 p-3 border dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                         placeholder="Enter OTP" value={phoneOtp} onChange={e=>setPhoneOtp(e.target.value)} />
                  <button type="button" onClick={verifyPhoneOtp} className="px-3 py-2 rounded bg-green-600 text-white">Verify</button>
                </>
              )}
            </div>
          </div>

          {/* Passwords */}
          <div>
            <label className="block mb-1 text-sm">Password</label>
            <input type="password" className="w-full p-3 border dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                   placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 text-sm">Confirm Password</label>
            <input type="password" className="w-full p-3 border dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                   placeholder="Confirm Password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
          </div>

          {/* Submit */}
          <button disabled={loading} className="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
