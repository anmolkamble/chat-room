// login.js
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const gender = document.getElementById('gender').value;
  const age = parseInt(document.getElementById('age').value, 10);
  const errEl = document.getElementById('err');

  errEl.textContent = '';

  if (!username) { errEl.textContent = 'Enter a username.'; return; }
  if (!gender) { errEl.textContent = 'Select gender.'; return; }
  if (!Number.isInteger(age) || age < 18) { errEl.textContent = 'You must be 18+ to enter.'; return; }

  // Save to sessionStorage and go to chat page
  sessionStorage.setItem('chat_user', JSON.stringify({ username, gender, age }));
  window.location.href = '/chat.html';
});
