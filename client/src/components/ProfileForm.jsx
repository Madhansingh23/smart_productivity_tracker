import { useState, useEffect } from 'react';
import api from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

export default function ProfileForm() {
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '' });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // load current user
    api.get('/profile/me')
      .then(res => {
        setForm(res.data);
        if (res.data.profilePic) {
          setPreview(`${API_BASE}${res.data.profilePic}`);
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = e => {
    setProfilePic(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(form).forEach(k => fd.append(k, form[k]));
    if (profilePic) fd.append('profilePic', profilePic);

    const res = await api.put('/profile/update', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    alert('Profile updated');
    if (res.data.user.profilePic) {
      setPreview(`${API_BASE}${res.data.user.profilePic}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-2">
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="username" placeholder="Username" value={form.username} onChange={handleChange} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
      <input type="file" onChange={handleFile} />
      {preview && <img src={preview} alt="preview" className="w-24 h-24 rounded-full" />}
      <button type="submit">Save</button>
    </form>
  );
}
