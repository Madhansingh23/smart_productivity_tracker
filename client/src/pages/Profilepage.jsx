import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProfile, uploadProfilePic } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { username } = useParams();
  const { token, user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    getProfile(username).then(res => setProfile(res.data));
  }, [username]);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePic', file);
    const res = await uploadProfilePic(formData, token);
    setProfile(prev => ({ ...prev, profilePic: res.data.profilePic }));
    if (user.username === username) {
      setUser(prev => ({ ...prev, profilePic: res.data.profilePic }));
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div>
      <h1>{profile.name}'s Profile</h1>
      <img src={profile.profilePic} alt={profile.name} className="w-32 h-32 rounded-full" />
      {user && user.username === username && (
        <div>
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-1 rounded">
            Update Picture
          </button>
        </div>
      )}
      <p>Email: {profile.email}</p>
      <p>Age: {profile.age}</p>
      <p>Date of Birth: {profile.dateOfBirth?.slice(0, 10)}</p>
      <p>About: {profile.selfDescription}</p>
    </div>
  );
}
