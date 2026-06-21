import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const CreatePost = ({ onPost }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);
  const [preview, setPreview] = useState([]);
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const handleMedia = (e) => {
    const files = Array.from(e.target.files);
    setMedia(files);
    setPreview(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('visibility', visibility);
      media.forEach(f => formData.append('media', f));
      const res = await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onPost(res.data);
      setContent(''); setMedia([]); setPreview([]);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="create-post">
      <div className="create-post-header">
        <img src={user?.avatar || '/default-avatar.png'} alt="" className="avatar-sm" />
        <textarea placeholder="What's on your mind?" value={content} onChange={e => setContent(e.target.value)} rows={3} />
      </div>
      {preview.length > 0 && (
        <div className="media-preview">
          {preview.map((url, i) => <img key={i} src={url} alt="" />)}
          <button onClick={() => { setMedia([]); setPreview([]); }}>✕</button>
        </div>
      )}
      <div className="create-post-actions">
        <div className="post-tools">
          <button onClick={() => fileRef.current.click()} className="tool-btn">📷 Photo/Video</button>
          <select value={visibility} onChange={e => setVisibility(e.target.value)} className="visibility-select">
            <option value="public">🌍 Public</option>
            <option value="followers">👥 Followers</option>
            <option value="private">🔒 Only me</option>
          </select>
        </div>
        <button onClick={handleSubmit} disabled={loading || (!content.trim() && media.length === 0)} className="btn-primary btn-sm">
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
      <input type="file" ref={fileRef} multiple accept="image/*,video/*" onChange={handleMedia} hidden />
    </div>
  );
};

export default CreatePost;
