import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await register(form); } catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="logo">SocialApp</h1>
          <p>Sign up to see photos and videos from your friends.</p>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
          <input placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
          <button type="submit" className="btn-primary">Sign Up</button>
        </form>
        <div className="auth-footer">
          <p>Have an account? <Link to="/login">Log In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
