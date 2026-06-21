import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import PostCard from '../Feed/PostCard';

const Explore = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    api.get('/posts/explore').then(res => setPosts(res.data)).catch(() => {});
  }, []);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length > 1) {
      const res = await api.get(`/users/search?q=${q}`);
      setUsers(res.data);
      setActiveTab('people');
    } else {
      setUsers([]);
      setActiveTab('trending');
    }
  };

  return (
    <div className="explore-page">
      <div className="explore-search">
        <input type="text" placeholder="Search people, hashtags..." value={query} onChange={e => handleSearch(e.target.value)} />
      </div>

      <div className="explore-tabs">
        <button className={activeTab === 'trending' ? 'active' : ''} onClick={() => setActiveTab('trending')}>Trending</button>
        <button className={activeTab === 'people' ? 'active' : ''} onClick={() => setActiveTab('people')}>People</button>
      </div>

      {activeTab === 'people' && (
        <div className="people-list">
          {users.map(u => (
            <Link key={u._id} to={`/profile/${u.username}`} className="person-card">
              <img src={u.avatar || '/default-avatar.png'} alt="" className="avatar-md" />
              <div>
                <strong>{u.fullName} {u.isVerified && '✓'}</strong>
                <span>@{u.username}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'trending' && (
        <div className="trending-posts">
          {posts.map(post => <PostCard key={post._id} post={post} setPosts={setPosts} />)}
        </div>
      )}
    </div>
  );
};

export default Explore;
