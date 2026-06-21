import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { format } from 'timeago.js';

const PostCard = ({ post, setPosts }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  const isLiked = post.likes?.includes(user?.id);
  const isSaved = post.saves?.includes(user?.id);

  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setPosts(prev => prev.map(p => p._id === post._id ? res.data : p));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: comment });
      setPosts(prev => prev.map(p => p._id === post._id ? res.data : p));
      setComment('');
    } catch (err) { console.error(err); }
  };

  const handleShare = async () => {
    try {
      await api.post(`/posts/${post._id}/share`, { content: '' });
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    try {
      const res = await api.post(`/posts/${post._id}/save`);
      setPosts(prev => prev.map(p => p._id === post._id ? res.data : p));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      setPosts(prev => prev.filter(p => p._id !== post._id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.author?.username}`} className="post-author">
          <img src={post.author?.avatar || '/default-avatar.png'} alt="" className="avatar-sm" />
          <div>
            <span className="author-name">{post.author?.fullName} {post.author?.isVerified && '✓'}</span>
            <span className="post-time">{format(post.createdAt)}</span>
          </div>
        </Link>
        {post.author?._id === user?.id && <button onClick={handleDelete} className="btn-icon">🗑️</button>}
      </div>

      {post.content && <p className="post-content">{post.content}</p>}

      {post.media?.length > 0 && (
        <div className={`post-media grid-${Math.min(post.media.length, 4)}`}>
          {post.media.map((m, i) => m.type === 'video'
            ? <video key={i} src={`http://localhost:5000${m.url}`} controls />
            : <img key={i} src={`http://localhost:5000${m.url}`} alt="" />
          )}
        </div>
      )}

      <div className="post-stats">
        <span>{post.likes?.length || 0} likes</span>
        <span>{post.comments?.length || 0} comments</span>
        <span>{post.shares?.length || 0} shares</span>
      </div>

      <div className="post-actions">
        <button onClick={handleLike} className={`action-btn ${isLiked ? 'liked' : ''}`}>
          {isLiked ? '❤️' : '🤍'} Like
        </button>
        <button onClick={() => setShowComments(!showComments)} className="action-btn">💬 Comment</button>
        <button onClick={handleShare} className="action-btn">🔄 Share</button>
        <button onClick={handleSave} className={`action-btn ${isSaved ? 'saved' : ''}`}>
          {isSaved ? '🔖' : '📑'} Save
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {post.comments?.map((c, i) => (
            <div key={i} className="comment">
              <img src={c.user?.avatar || '/default-avatar.png'} alt="" className="avatar-xs" />
              <div className="comment-body">
                <strong>{c.user?.username}</strong>
                <span>{c.text}</span>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} className="comment-form">
            <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." />
            <button type="submit" disabled={!comment.trim()}>Post</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
