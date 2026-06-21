# SocialApp - Full-Featured Social Media Platform

A complete social media platform built with React and Node.js, featuring all the core functionality found in modern social networks.

## Features

- **Authentication** - Register, login, JWT-based sessions
- **Posts** - Create, like, comment, share, save posts with media (photos/videos)
- **Stories** - 24-hour ephemeral stories with viewers tracking
- **Real-time Messaging** - Direct messages, group chats, typing indicators, online status
- **Notifications** - Real-time notifications for likes, comments, follows, mentions
- **User Profiles** - Customizable profiles with avatar, cover photo, bio, verification badge
- **Follow System** - Follow/unfollow users, follower/following counts
- **Explore/Search** - Discover trending posts, search for users
- **Privacy Controls** - Public/followers/private post visibility, private accounts, block users
- **Media Upload** - Support for images, videos, GIFs up to 50MB
- **Polls** - Create polls in posts
- **Reposts/Shares** - Share posts with your followers
- **Bookmarks** - Save posts for later
- **Real-time Updates** - Socket.io for live messaging and notifications

## Tech Stack

- **Frontend**: React 18, React Router, Socket.io Client, Axios
- **Backend**: Node.js, Express, MongoDB/Mongoose, Socket.io, JWT, Multer
- **Real-time**: WebSocket via Socket.io

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB

### Backend Setup
```bash
cd backend
cp .env.example .env  # Edit with your MongoDB URI and JWT secret
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The app runs on `http://localhost:3000` (frontend) and `http://localhost:5000` (backend).

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts/feed` - Get feed posts
- `GET /api/posts/explore` - Get trending posts
- `POST /api/posts` - Create post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment
- `POST /api/posts/:id/share` - Share/repost
- `POST /api/posts/:id/save` - Save/unsave post
- `DELETE /api/posts/:id` - Delete post

### Users
- `GET /api/users/search?q=` - Search users
- `GET /api/users/:username` - Get user profile
- `POST /api/users/:id/follow` - Follow/unfollow
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/block` - Block/unblock user

### Messages
- `GET /api/messages/conversations` - List conversations
- `POST /api/messages/conversations` - Create conversation
- `GET /api/messages/:conversationId` - Get messages
- `POST /api/messages/:conversationId` - Send message

### Stories
- `GET /api/stories` - Get stories feed
- `POST /api/stories` - Create story
- `POST /api/stories/:id/view` - Mark as viewed

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/unread-count` - Get unread count
