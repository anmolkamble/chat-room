// chat.js
const stored = sessionStorage.getItem('chat_user');
if (!stored) {
  window.location.href = '/';
  throw new Error('No user data');
}
const user = JSON.parse(stored);

// connect socket
const socket = io();

// UI elements
const usersList = document.getElementById('usersList');
const countEl = document.getElementById('count');
const messagesEl = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');
const msgInput = document.getElementById('msgInput');
const meInfo = document.getElementById('meInfo');
const logoutBtn = document.getElementById('logoutBtn');

meInfo.textContent = `You: ${user.username} (${user.gender}, ${user.age})`;

// join the chat (server verifies again)
socket.emit('join', user);

// handle join result
socket.on('joinError', (data) => {
  alert('Join error: ' + (data.message || 'Unknown'));
  sessionStorage.removeItem('chat_user');
  window.location.href = '/';
});

socket.on('joinSuccess', (data) => {
  updateUsers(data.onlineUsers, data.onlineCount);
  appendSystem(`${data.username}, welcome!`);
});

// others join/leave
socket.on('userJoined', (data) => {
  updateUsers(data.onlineUsers, data.onlineCount);
  appendSystem(`${data.username} joined the room.`);
});
socket.on('userLeft', (data) => {
  updateUsers(data.onlineUsers, data.onlineCount);
  appendSystem(`${data.username} left the room.`);
});

// messages
socket.on('message', (m) => {
  appendMessage(m.from, m.text, m.time);
});

// send message
msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const txt = msgInput.value.trim();
  if (!txt) return;
  socket.emit('message', txt);
  msgInput.value = '';
});

// logout button
logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('chat_user');
  window.location.href = '/';
});

// helpers
function updateUsers(list, count) {
  usersList.innerHTML = '';
  list.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    usersList.appendChild(li);
  });
  countEl.textContent = count;
}

function appendSystem(text) {
  const div = document.createElement('div');
  div.className = 'sys';
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendMessage(from, text, time) {
  const div = document.createElement('div');
  div.className = 'msg';
  const t = new Date(time);
  const timeStr = t.toLocaleTimeString();
  div.innerHTML = `<span class="from">${escapeHtml(from)}</span> <span class="ts">[${timeStr}]</span>: <span class="txt">${escapeHtml(text)}</span>`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// very small sanitizer
function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'
  })[c]);
}
