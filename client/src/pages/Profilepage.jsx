import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

export default function ProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      const endpoint = username === 'me' ? '/profile/me' : `/profile/${username}`;
      const res = await api.get(endpoint);
      setUser(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
  }, [username]);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('profilePic', file);
    setUploading(true);

    try {
      await api.post('/profile/upload-pic', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await load();
    } finally {
      setUploading(false);
    }
  }
  const [error, setError] = useState(null);

async function load() {
  try {
    setError(null);
    const endpoint = username === 'me' ? '/profile/me' : `/profile/${username}`;
    const res = await api.get(endpoint);
    setUser(res.data);
  } catch (e) {
    console.error(e);
    setError('Failed to load profile');
  }
}


  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <div className="flex gap-4 items-center">
          <img
            src={user.profilePic || '/default-avatar.png'}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <div className="text-xl font-semibold">
              {user.name} <span className="text-gray-500">@{user.username}</span>
            </div>
            <div className="text-gray-600 text-sm">{user.bio || 'No bio yet.'}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-500">Age</div>
            <div className="font-medium">{user.age || '-'}</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xs text-gray-500">Date of birth</div>
            <div className="font-medium">
              {user.dob ? new Date(user.dob).toLocaleDateString() : '-'}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-medium mb-2">Update profile picture</label>
          <input type="file" accept="image/*" onChange={onFile} />
          {uploading && <div className="text-sm text-gray-500 mt-1">Uploading...</div>}
        </div>
      </div>
    </div>
  );
}
