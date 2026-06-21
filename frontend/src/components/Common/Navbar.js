import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const location = useLocation();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    api.get('/notifications/unread-count').then(res => setUnreadNotifs(res.data.count)).catch(() => {});
  }, [location]);

  useEffect(() => {
    if (socket) {
      socket.on('notification', () => setUnreadNotifs(prev => prev + 1));
      return () => socket.off('notification');
    }
  }, [socket]);

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-logo">SocialApp</Link>
        <div className="nav-search">
          <input type="text" placeholder="Search..." />
        </div>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          </Link>
          <Link to="/explore" className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </Link>
          <Link to="/messages" className={`nav-link ${location.pathname === '/messages' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          </Link>
          <Link to="/notifications" className={`nav-link ${location.pathname === '/notifications' ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            {unreadNotifs > 0 && <span className="badge">{unreadNotifs}</span>}
          </Link>
          <div className="nav-profile" onClick={() => setShowDropdown(!showDropdown)}>
            <img src={user?.avatar || '/default-avatar.png'} alt="" className="nav-avatar" />
            {showDropdown && (
              <div className="dropdown">
                <Link to={`/profile/${user?.username}`} onClick={() => setShowDropdown(false)}>Profile</Link>
                <Link to="/settings" onClick={() => setShowDropdown(false)}>Settings</Link>
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
