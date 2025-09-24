// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for online users
// Map socket.id -> { username, gender, age }
const users = new Map();

// Helper to get array of usernames
function getUsernames() {
  return Array.from(users.values()).map(u => u.username);
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // client emits 'join' when entering chat.html with chosen credentials
  socket.on('join', (data) => {
    // Basic validation
    const username = (data.username || '').trim();
    const gender = (data.gender || '').trim();
    const age = parseInt(data.age, 10);

    if (!username) {
      socket.emit('joinError', { message: 'Username required.' });
      return;
    }
    if (!['male','female','other'].includes(gender.toLowerCase())) {
      socket.emit('joinError', { message: 'Invalid gender.' });
      return;
    }
    if (!Number.isInteger(age) || age < 18) {
      socket.emit('joinError', { message: 'You must be 18+ to enter.' });
      return;
    }

    // Check username uniqueness (case-insensitive)
    const lower = username.toLowerCase();
    const taken = Array.from(users.values()).some(u => u.username.toLowerCase() === lower);
    if (taken) {
      socket.emit('joinError', { message: 'Username already in use. Choose another.' });
      return;
    }

    // Save user
    users.set(socket.id, { username, gender, age });
    console.log(`${username} joined. Total online: ${users.size}`);

    // Notify this user
    socket.emit('joinSuccess', {
      username,
      onlineCount: users.size,
      onlineUsers: getUsernames()
    });

    // Broadcast to others that someone joined and send updated user list
    socket.broadcast.emit('userJoined', { username, onlineCount: users.size, onlineUsers: getUsernames() });
  });

  // Chat message from a client
  socket.on('message', (msg) => {
    const user = users.get(socket.id);
    if (!user) return; // ignore if not joined

    const payload = {
      from: user.username,
      text: String(msg).slice(0, 1000), // limit message length
      time: Date.now()
    };
    io.emit('message', payload);
  });

  // When a client disconnects
  socket.on('disconnect', () => {
    const u = users.get(socket.id);
    if (u) {
      users.delete(socket.id);
      console.log(`${u.username} left. Total online: ${users.size}`);
      io.emit('userLeft', { username: u.username, onlineCount: users.size, onlineUsers: getUsernames() });
    } else {
      console.log('Socket disconnected (no user):', socket.id);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
