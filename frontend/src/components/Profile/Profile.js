import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import PostCard from '../Feed/PostCard';

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/users/${username}`).then(res => {
      setProfile(res.data.user);
      setPosts(res.data.posts);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [username]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/users/${profile._id}/follow`);
      setProfile(prev => ({
        ...prev,
        followers: res.data.following
          ? [...prev.followers, { _id: user.id }]
          : prev.followers.filter(f => f._id !== user.id)
      }));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!profile) return <div className="empty-state"><h3>User not found</h3></div>;

  const isOwn = user?.id === profile._id;
  const isFollowing = profile.followers?.some(f => f._id === user?.id);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="cover-photo" style={{ backgroundImage: `url(${profile.coverPhoto ? `http://localhost:5000${profile.coverPhoto}` : ''})` }} />
        <div className="profile-info">
          <img src={profile.avatar ? `http://localhost:5000${profile.avatar}` : '/default-avatar.png'} alt="" className="profile-avatar" />
          <div className="profile-details">
            <h2>{profile.fullName} {profile.isVerified && <span className="verified">✓</span>}</h2>
            <p className="username">@{profile.username}</p>
            {profile.bio && <p className="bio">{profile.bio}</p>}
            <div className="profile-meta">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.website && <a href={profile.website} target="_blank" rel="noreferrer">🔗 {profile.website}</a>}
            </div>
            <div className="profile-stats">
              <span><strong>{posts.length}</strong> Posts</span>
              <span><strong>{profile.followers?.length || 0}</strong> Followers</span>
              <span><strong>{profile.following?.length || 0}</strong> Following</span>
            </div>
          </div>
          {!isOwn && (
            <button onClick={handleFollow} className={`btn-${isFollowing ? 'secondary' : 'primary'}`}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}>Posts</button>
        <button className={activeTab === 'media' ? 'active' : ''} onClick={() => setActiveTab('media')}>Media</button>
        <button className={activeTab === 'likes' ? 'active' : ''} onClick={() => setActiveTab('likes')}>Likes</button>
      </div>

      <div className="profile-content">
        {activeTab === 'posts' && posts.map(post => <PostCard key={post._id} post={post} setPosts={setPosts} />)}
        {activeTab === 'media' && (
          <div className="media-grid">
            {posts.filter(p => p.media?.length > 0).map(p => p.media.map((m, i) => (
              <img key={`${p._id}-${i}`} src={`http://localhost:5000${m.url}`} alt="" />
            )))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
