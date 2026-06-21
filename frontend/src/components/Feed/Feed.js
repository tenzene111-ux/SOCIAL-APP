import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import Stories from '../Stories/Stories';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/posts/feed?page=${page}`);
      setPosts(prev => page === 1 ? res.data : [...prev, ...res.data]);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [page]);

  const handleNewPost = (post) => setPosts([post, ...posts]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target.documentElement;
    if (scrollHeight - scrollTop <= clientHeight + 100) setPage(prev => prev + 1);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="feed-container">
      <div className="feed-main">
        <Stories />
        <CreatePost onPost={handleNewPost} />
        <div className="posts-list">
          {posts.length === 0 ? (
            <div className="empty-state">
              <h3>Welcome to SocialApp!</h3>
              <p>Follow people to see their posts here, or create your first post.</p>
            </div>
          ) : posts.map(post => <PostCard key={post._id} post={post} setPosts={setPosts} />)}
        </div>
      </div>
    </div>
  );
};

export default Feed;
