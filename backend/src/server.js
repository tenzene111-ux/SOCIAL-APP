require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] } });

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/notifications', require('./routes/notifications'));

// Socket.io for real-time features
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('user_status', { userId, online: true });
  });

  socket.on('send_message', (data) => {
    const recipientSocket = onlineUsers.get(data.recipientId);
    if (recipientSocket) io.to(recipientSocket).emit('new_message', data);
  });

  socket.on('typing', (data) => {
    const recipientSocket = onlineUsers.get(data.recipientId);
    if (recipientSocket) io.to(recipientSocket).emit('user_typing', data);
  });

  socket.on('new_notification', (data) => {
    const recipientSocket = onlineUsers.get(data.recipientId);
    if (recipientSocket) io.to(recipientSocket).emit('notification', data);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user_status', { userId, online: false });
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
