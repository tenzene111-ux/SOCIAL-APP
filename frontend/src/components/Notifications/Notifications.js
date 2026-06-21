import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { format } from 'timeago.js';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications').then(res => setNotifications(res.data)).catch(() => {});
    api.put('/notifications/read-all').catch(() => {});
  }, []);

  const getIcon = (type) => {
    const icons = { like: '❤️', comment: '💬', follow: '👤', mention: '@', share: '🔄', message: '✉️', story_reaction: '🎭', tag: '🏷️' };
    return icons[type] || '🔔';
  };

  const getMessage = (notif) => {
    const msgs = {
      like: 'liked your post', comment: 'commented on your post', follow: 'started following you',
      mention: 'mentioned you', share: 'shared your post', message: 'sent you a message',
      story_reaction: 'reacted to your story', tag: 'tagged you in a post'
    };
    return msgs[notif.type] || 'interacted with you';
  };

  return (
    <div className="notifications-page">
      <h2>Notifications</h2>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state"><p>No notifications yet</p></div>
        ) : notifications.map(notif => (
          <div key={notif._id} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
            <span className="notif-icon">{getIcon(notif.type)}</span>
            <img src={notif.sender?.avatar || '/default-avatar.png'} alt="" className="avatar-sm" />
            <div className="notif-content">
              <p><Link to={`/profile/${notif.sender?.username}`}><strong>{notif.sender?.fullName}</strong></Link> {getMessage(notif)}</p>
              <span className="notif-time">{format(notif.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
