import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../utils/api';
import { format } from 'timeago.js';

const Messages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const messagesEnd = useRef();

  useEffect(() => {
    api.get('/messages/conversations').then(res => setConversations(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (active) {
      api.get(`/messages/${active._id}`).then(res => setMessages(res.data)).catch(() => {});
    }
  }, [active]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (msg) => {
        if (msg.conversation === active?._id) setMessages(prev => [...prev, msg]);
      });
      socket.on('user_typing', (data) => { if (data.conversationId === active?._id) { setTyping(true); setTimeout(() => setTyping(false), 2000); } });
      return () => { socket.off('new_message'); socket.off('user_typing'); };
    }
  }, [socket, active]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    try {
      const res = await api.post(`/messages/${active._id}`, { text });
      setMessages([...messages, res.data]);
      const other = active.participants.find(p => p._id !== user.id);
      if (socket && other) socket.emit('send_message', { ...res.data, recipientId: other._id, conversation: active._id });
      setText('');
    } catch (err) { console.error(err); }
  };

  const handleTyping = () => {
    const other = active?.participants.find(p => p._id !== user.id);
    if (socket && other) socket.emit('typing', { recipientId: other._id, conversationId: active._id, username: user.username });
  };

  const startConversation = async (participantId) => {
    try {
      const res = await api.post('/messages/conversations', { participantId });
      setConversations(prev => [res.data, ...prev.filter(c => c._id !== res.data._id)]);
      setActive(res.data);
      setSearchUser(''); setSearchResults([]);
    } catch (err) { console.error(err); }
  };

  const searchUsers = async (q) => {
    setSearchUser(q);
    if (q.length > 1) {
      const res = await api.get(`/users/search?q=${q}`);
      setSearchResults(res.data);
    } else setSearchResults([]);
  };

  return (
    <div className="messages-page">
      <div className="conversations-list">
        <div className="conversations-header">
          <h3>Messages</h3>
        </div>
        <div className="search-users">
          <input placeholder="Search users..." value={searchUser} onChange={e => searchUsers(e.target.value)} />
          {searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map(u => (
                <div key={u._id} className="search-item" onClick={() => startConversation(u._id)}>
                  <img src={u.avatar || '/default-avatar.png'} alt="" className="avatar-xs" />
                  <span>{u.fullName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {conversations.map(conv => {
          const other = conv.participants?.find(p => p._id !== user?.id);
          return (
            <div key={conv._id} className={`conversation-item ${active?._id === conv._id ? 'active' : ''}`} onClick={() => setActive(conv)}>
              <img src={other?.avatar || '/default-avatar.png'} alt="" className="avatar-md" />
              <div className="conv-info">
                <strong>{conv.isGroup ? conv.groupName : other?.fullName}</strong>
                <span className={`status ${other?.online ? 'online' : ''}`}>{other?.online ? 'Online' : `Last seen ${format(other?.lastSeen)}`}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-area">
        {active ? (
          <>
            <div className="chat-header">
              <h4>{active.isGroup ? active.groupName : active.participants?.find(p => p._id !== user?.id)?.fullName}</h4>
            </div>
            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg._id} className={`message ${msg.sender?._id === user?.id ? 'sent' : 'received'}`}>
                  <div className="message-bubble">
                    {msg.media && (msg.media.type === 'image' ? <img src={`http://localhost:5000${msg.media.url}`} alt="" /> : null)}
                    <p>{msg.text}</p>
                    <span className="message-time">{format(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
              {typing && <div className="typing-indicator">typing...</div>}
              <div ref={messagesEnd} />
            </div>
            <form className="chat-input" onSubmit={sendMessage}>
              <input value={text} onChange={e => { setText(e.target.value); handleTyping(); }} placeholder="Type a message..." />
              <button type="submit" disabled={!text.trim()}>Send</button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Select a conversation</h3>
            <p>Choose a conversation or search for a user to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
