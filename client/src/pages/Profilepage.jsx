import React, { useEffect, useState } from "react";
import api, { API_BASE } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    dob: "",
    age: "",
    address: "",
    phone: "",
    profilePic: null,
  });

  useEffect(() => {
    (async () => {
      const res = await api.get("/profile/me");
      setProfile(res.data);
      setEmailVerified(!!res.data.emailVerified);
      setFormData({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        username: res.data.username || "",
        email: res.data.email || "",
        dob: res.data.dob ? res.data.dob.split("T")[0] : "",
        age: res.data.age || "",
        address: res.data.address || "",
        phone: res.data.phone || "",
        profilePic: null,
      });
    })();
  }, []);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      setPreviewImage(URL.createObjectURL(file));
      return;
    }

    // text fields
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "dob") {
      const birthDate = new Date(value);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        setFormData((prev) => ({ ...prev, age }));
      }
    }

    if (name === "username" && value.length > 3) {
      try {
        const res = await api.get(`/auth/check-username?username=${value}`);
        setUsernameSuggestions(res.data.available ? [] : (res.data.suggestions || []));
      } catch (err) { /* ignore */ }
    }

    if (name === "email" && value.includes("@")) {
      try {
        const res = await api.get(`/auth/check-email?email=${value}`);
        if (!res.data.available && value !== profile.email) {
          // only warn if it's not your current email
          alert("Email already exists");
        }
      } catch (err) { /* ignore */ }
    }

    if (name === "phone" && value.length >= 10) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) {
        alert("Invalid phone number (10 digits only)");
        return;
      }
      try {
        const res = await api.get(`/auth/check-phone?phone=${value}`);
        if (!res.data.available && value !== (profile.phone || '')) {
          alert("Phone number already exists");
        }
      } catch (err) { /* ignore */ }
    }
  };

  const handleSave = async () => {
    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") {
        form.append(k, v);
      }
    });

    const res = await api.put("/profile/update", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // update local state + auth context
    const me = await api.get("/profile/me");
    setProfile(me.data);
    setUser(me.data);
    setEditMode(false);
    setPreviewImage(null);
  };

  const sendOtp = async () => {
    try {
      await api.post("/auth/send-otp", { email: formData.email });
      setOtpSent(true);
      alert("OTP sent to your email");
    } catch {
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await api.post("/auth/verify-otp", { email: formData.email, code: otp });
      if (res.data.verified) {
        setEmailVerified(true);
        setOtpSent(false);
        alert("Email verified!");
      } else {
        alert("Invalid code");
      }
    } catch {
      alert("OTP verification failed");
    }
  };

  if (!profile) return <p>Loading...</p>;

  const imgSrc = profile.profilePic ? `${API_BASE}${profile.profilePic}` : "/default-avatar.png";

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={previewImage || imgSrc}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <div>
            <div className="text-xl font-semibold">
              {profile.firstName} {profile.lastName} <span className="text-gray-500">@{profile.username}</span>
            </div>
            <div className="text-gray-600 text-sm">{profile.address || 'No address yet'}</div>
          </div>
        </div>

        <hr className="my-4" />

        {editMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="border rounded p-2" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} />
            <input className="border rounded p-2" name="lastName"  placeholder="Last name" value={formData.lastName} onChange={handleChange} />

            <div className="sm:col-span-2">
              <input className="border rounded p-2 w-full" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
              {usernameSuggestions.length > 0 && (
                <p className="text-xs text-red-600 mt-1">Unavailable. Try: {usernameSuggestions.join(", ")}</p>
              )}
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input className="border rounded p-2 flex-1" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
              {!emailVerified ? (
                !otpSent ? (
                  <button onClick={sendOtp} className="px-3 py-2 rounded bg-gray-700 text-white">Send OTP</button>
                ) : (
                  <>
                    <input className="border rounded p-2" placeholder="Enter OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} />
                    <button onClick={verifyOtp} className="px-3 py-2 rounded bg-green-600 text-white">Verify</button>
                  </>
                )
              ) : (
                <span className="text-green-600 text-sm font-medium">Verified</span>
              )}
            </div>

            <input className="border rounded p-2" type="date" name="dob" value={formData.dob} onChange={handleChange} />
            <input className="border rounded p-2" name="age" value={formData.age} readOnly placeholder="Age" />

            <input className="border rounded p-2 sm:col-span-2" name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
            <input className="border rounded p-2 sm:col-span-2" name="phone" placeholder="Phone (10 digits)" value={formData.phone} onChange={handleChange} />

            <div className="sm:col-span-2">
              <input type="file" name="profilePic" accept="image/*" onChange={handleChange} />
            </div>

            <div className="sm:col-span-2 flex gap-2">
              <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
              <button onClick={() => { setEditMode(false); setPreviewImage(null); }} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-500">Name</div>
                <div className="font-medium">{profile.firstName} {profile.lastName}</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-500">Username</div>
                <div className="font-medium">@{profile.username}</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-medium">{profile.email} {!profile.emailVerified && <span className="text-yellow-600">(unverified)</span>}</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-500">Phone</div>
                <div className="font-medium">{profile.phone || '-'}</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-500">DOB</div>
                <div className="font-medium">{profile.dob ? profile.dob.split('T')[0] : '-'}</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-500">Age</div>
                <div className="font-medium">{profile.age ?? '-'}</div>
              </div>
              <div className="bg-gray-50 rounded p-3 sm:col-span-2">
                <div className="text-xs text-gray-500">Address</div>
                <div className="font-medium">{profile.address || '-'}</div>
              </div>
            </div>
            <button onClick={() => setEditMode(true)} className="bg-gray-700 text-white px-4 py-2 mt-4 rounded">Edit</button>
          </>
        )}
      </div>
    </div>
  );
}
