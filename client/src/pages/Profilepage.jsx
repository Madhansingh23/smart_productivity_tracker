// src/pages/ProfilePage.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { User, Mail, Calendar, Shield, Camera, Edit2, Save, X, Sun, Moon, Award, TrendingUp } from "lucide-react";
import api, { uploadProfilePic } from "../lib/api";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser, token } = useAuth();
  const { theme, setTheme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("profilePic", file);

    setUploading(true);
    try {
      const res = await uploadProfilePic(data, token);
      setUser(res.data.user);
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await api.put("/users/me", formData);
      setUser(res.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-neutral-800 overflow-hidden relative">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
        <div className="absolute top-0 left-0 w-full h-64 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all transform hover:scale-110 shadow-lg z-10"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <div className="px-8 pb-12 pt-40 relative">
          <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
            {/* Profile Picture */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2rem] p-1 bg-white dark:bg-neutral-900 shadow-2xl">
                <img
                  src={user.profilePic || "/default-avatar.png"}
                  alt={user.username}
                  className="w-full h-full rounded-[1.8rem] object-cover"
                />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-[2rem] m-1 backdrop-blur-sm">
                <Camera size={32} className="drop-shadow-md" />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>

            {/* Name & Quick Stats */}
            <div className="flex-1 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    {user.username}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-gray-100 dark:bg-neutral-800 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300"
                  >
                    <Edit2 size={18} /> Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Bio */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio Section */}
              {isEditing ? (
                <div className="bg-gray-50 dark:bg-neutral-800/50 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800 space-y-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit Profile</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
                    >
                      <Save size={20} /> Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {user.bio ? (
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                      <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">About Me</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        "{user.bio}"
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 dark:bg-neutral-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-neutral-700">
                      <p className="text-gray-500">No bio yet. Click edit to add one!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-100 dark:border-neutral-700 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Points</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.points}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-neutral-800 p-5 rounded-2xl border border-gray-100 dark:border-neutral-700 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Level</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.floor(user.points / 100) + 1}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Account Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-neutral-900/50 p-6 rounded-3xl border border-gray-100 dark:border-neutral-800">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-gray-400" /> Account Details
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg text-gray-400 shadow-sm">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email Address</p>
                      <p className="text-gray-900 dark:text-white font-medium break-all">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg text-gray-400 shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Member Since</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg text-green-500 shadow-sm">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
