// src/pages/Signup.jsx
import React, { useState } from 'react';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Phone, Lock, ArrowRight, Check, X, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setToken, setUser } = useAuth();
  const nav = useNavigate();

  async function checkUsername(v) {
    if (v.length < 4) return;
    try {
      const r = await api.get(`/auth/check-username?username=${v}`);
      setUsernameSuggestions(r.data.available ? [] : r.data.suggestions || []);
    } catch (e) { console.error(e); }
  }

  async function sendEmailOtp() {
    try {
      await api.post('/auth/send-otp', { email });
      setEmailSent(true);
      toast.success('OTP sent to email');
    } catch (e) { toast.error('Failed to send email OTP'); }
  }

  async function verifyEmailOtp() {
    try {
      const r = await api.post('/auth/verify-otp', { email, code: emailOtp });
      if (r.data.verified) toast.success('Email verified!');
      else toast.error('Invalid OTP');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed');
    }
  }

  async function sendPhoneOtp() {
    try {
      await api.post('/auth/send-sms-otp', { phone });
      setPhoneSent(true);
      toast.success('OTP sent to phone');
    } catch (e) { toast.error('Failed to send SMS OTP'); }
  }

  async function verifyPhoneOtp() {
    try {
      const r = await api.post('/auth/verify-sms-otp', { phone, code: phoneOtp });
      if (r.data.verified) toast.success('Phone verified!');
      else toast.error('Invalid phone OTP');
    } catch (e) { toast.error('Invalid phone OTP'); }
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // basic availability checks
      const [u, eChk, pChk] = await Promise.all([
        api.get(`/auth/check-username?username=${username}`),
        api.get(`/auth/check-email?email=${email}`),
        phone ? api.get(`/auth/check-phone?phone=${phone}`) : Promise.resolve({ data: { available: true } })
      ]);

      if (!u.data.available || !eChk.data.available || !pChk.data.available) {
        setError('Choose a unique username/email/phone');
        setLoading(false);
        return;
      }

      const res = await api.post('/auth/signup', { username, email, phone, password });
      setToken(res.data.token);
      setUser(res.data.user);
      toast.success('Account created successfully!');
      nav('/');
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800 p-4 py-10">
      <div className="w-full max-w-2xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-700 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white mb-6 shadow-lg shadow-emerald-500/30">
              <UserPlus size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-gray-500 dark:text-gray-400">Join us and start tracking your productivity</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
              <X size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-gray-400"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); checkUsername(e.target.value); }}
                />
              </div>
              {usernameSuggestions.length > 0 && (
                <p className="text-xs text-red-500 ml-1">
                  Unavailable. Try: {usernameSuggestions.join(', ')}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-gray-400"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={sendEmailOtp}
                  disabled={!email || emailSent}
                  className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {emailSent ? 'Sent' : 'Send OTP'}
                </button>
              </div>
              {emailSent && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                  <input
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl outline-none focus:border-blue-500 transition-all dark:text-white"
                    placeholder="Enter email OTP"
                    value={emailOtp}
                    onChange={e => setEmailOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={verifyEmailOtp}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                  >
                    <Check size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Phone size={20} />
                  </div>
                  <input
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-gray-400"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                {phone && (
                  <button
                    type="button"
                    onClick={sendPhoneOtp}
                    disabled={phoneSent}
                    className="px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {phoneSent ? 'Sent' : 'Send OTP'}
                  </button>
                )}
              </div>
              {phoneSent && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                  <input
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl outline-none focus:border-blue-500 transition-all dark:text-white"
                    placeholder="Enter SMS OTP"
                    value={phoneOtp}
                    onChange={e => setPhoneOtp(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={verifyPhoneOtp}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                  >
                    <Check size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Passwords */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <ShieldCheck size={20} />
                </div>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder-gray-400"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                disabled={loading}
                className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
