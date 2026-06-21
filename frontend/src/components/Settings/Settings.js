import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '', bio: user?.bio || '', website: user?.website || '', location: user?.location || '', isPrivate: user?.isPrivate || false });
  const [avatar, setAvatar] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (avatar) formData.append('avatar', avatar);
      if (coverPhoto) formData.append('coverPhoto', coverPhoto);
      const res = await api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error updating profile'); }
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      {message && <div className="success-msg">{message}</div>}
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label>Profile Picture</label>
          <input type="file" accept="image/*" onChange={e => setAvatar(e.target.files[0])} />
        </div>
        <div className="form-group">
          <label>Cover Photo</label>
          <input type="file" accept="image/*" onChange={e => setCoverPhoto(e.target.files[0])} />
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} maxLength={500} rows={4} />
        </div>
        <div className="form-group">
          <label>Website</label>
          <input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://" />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        </div>
        <div className="form-group checkbox">
          <label><input type="checkbox" checked={form.isPrivate} onChange={e => setForm({...form, isPrivate: e.target.checked})} /> Private Account</label>
        </div>
        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  );
};

export default Settings;
