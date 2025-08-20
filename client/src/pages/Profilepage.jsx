import React, { useEffect, useState } from "react";
import api, { API_BASE } from "../lib/api.js"; // import API_BASE
import { useAuth } from "../context/AuthContext.jsx";
import Loading from "../components/Loading.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";


export default function Profilepage() {
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [availability, setAvailability] = useState({});
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(false);
  

  // Fetch user profile
useEffect(() => {
  async function fetchProfile() {
    try {
      setLoading(true); // <-- add this
      const res = await api.get("/profile/me");
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false); // <-- add this
    }
  }
  fetchProfile();
}, []);


if (loading || !formData) {
  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-6">
      <Loading text="Loading your profile..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}


  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // File input
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setProfilePicFile(e.target.files[0]);
    }
  };

  // Availability check (username/email/phone)
  const checkAvailability = async (field, value) => {
    if (!value) return;
    try {
      const res = await api.post("/profile/check", { field, value });
      setAvailability((prev) => ({ ...prev, [field]: res.data.exists ? "taken" : "ok" }));
    } catch {
      setAvailability((prev) => ({ ...prev, [field]: "error" }));
    }
  };

  // Save
  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          fd.append(key, formData[key]);
        }
      });
      if (profilePicFile) {
        fd.append("profilePic", profilePicFile);
      }

      // ❌ remove manual Content-Type override
      const res = await api.put("/profile/update", fd);

      setUser(res.data.user); // update context
      setFormData(res.data.user);
      setEditMode(false);
      setProfilePicFile(null);
      alert("Profile updated successfully ✅");
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // Cancel
  const handleCancel = () => {
    setEditMode(false);
    setProfilePicFile(null);
    api.get("/profile/me").then((res) => setFormData(res.data));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
        Profile
      </h2>

      {/* Profile Pic */}
      <div className="flex items-center mb-4 ">
        <img
  src={
    profilePicFile
      ? URL.createObjectURL(profilePicFile)
      : formData.profilePic || "/default-avatar.png" // ✅ now profilePic is base64 from backend
  }
  alt="Profile"
  className="w-40 h-40 rounded-full object-cover border mx-auto"
/>

        {editMode && (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="ml-4"
          />
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* First + Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            First Name
          </label>
          <input
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Last Name
          </label>
          <input
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Username
          </label>
          <input
            name="username"
            value={formData.username || ""}
            onChange={handleChange}
            onBlur={() => checkAvailability("username", formData.username)}
            disabled={!editMode}
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          {availability.username === "taken" && (
            <p className="text-red-500 text-sm">Username already exists</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            onBlur={() => checkAvailability("email", formData.email)}
            disabled={!editMode}
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          {availability.email === "taken" && (
            <p className="text-red-500 text-sm">Email already in use</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Phone
          </label>
          <input
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            onBlur={() => checkAvailability("phone", formData.phone)}
            disabled={!editMode}
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
          {availability.phone === "taken" && (
            <p className="text-red-500 text-sm">Phone already in use</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Address
          </label>
          <input
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob ? formData.dob.substring(0, 10) : ""}
            onChange={handleChange}
            disabled={!editMode}
            className="mt-1 w-full border rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
