import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const Stories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/stories').then(res => setStories(res.data)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('media', file);
    try {
      await api.post('/stories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const res = await api.get('/stories');
      setStories(res.data);
    } catch (err) { console.error(err); }
  };

  const viewStory = (group) => {
    setViewing(group);
    setCurrentIndex(0);
    api.post(`/stories/${group.stories[0]._id}/view`).catch(() => {});
  };

  const nextStory = () => {
    if (currentIndex < viewing.stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      api.post(`/stories/${viewing.stories[currentIndex + 1]._id}/view`).catch(() => {});
    } else {
      setViewing(null);
    }
  };

  return (
    <>
      <div className="stories-container">
        <div className="story-item create-story" onClick={() => fileRef.current.click()}>
          <div className="story-avatar">
            <img src={user?.avatar || '/default-avatar.png'} alt="" />
            <span className="add-story">+</span>
          </div>
          <span>Your Story</span>
        </div>
        {stories.map((group) => (
          <div key={group.user._id} className="story-item" onClick={() => viewStory(group)}>
            <div className="story-avatar has-story">
              <img src={group.user.avatar || '/default-avatar.png'} alt="" />
            </div>
            <span>{group.user.username}</span>
          </div>
        ))}
        <input type="file" ref={fileRef} accept="image/*,video/*" onChange={handleCreate} hidden />
      </div>

      {viewing && (
        <div className="story-viewer" onClick={nextStory}>
          <div className="story-progress">
            {viewing.stories.map((_, i) => (
              <div key={i} className={`progress-bar ${i <= currentIndex ? 'active' : ''}`} />
            ))}
          </div>
          <div className="story-header">
            <img src={viewing.user.avatar || '/default-avatar.png'} alt="" className="avatar-sm" />
            <span>{viewing.user.username}</span>
            <button onClick={(e) => { e.stopPropagation(); setViewing(null); }}>✕</button>
          </div>
          {viewing.stories[currentIndex]?.media ? (
            viewing.stories[currentIndex].media.type === 'video'
              ? <video src={`http://localhost:5000${viewing.stories[currentIndex].media.url}`} autoPlay />
              : <img src={`http://localhost:5000${viewing.stories[currentIndex].media.url}`} alt="" />
          ) : (
            <div className="story-text" style={{ backgroundColor: viewing.stories[currentIndex]?.backgroundColor || '#1a1a2e' }}>
              {viewing.stories[currentIndex]?.text}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Stories;
