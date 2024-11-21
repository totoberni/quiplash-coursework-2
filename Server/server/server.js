const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

// Import Controllers
const authController = require('./controllers/authController');
const promptController = require('./controllers/promptController');
const gameController = require('./controllers/gameController');
const voteController = require('./controllers/voteController');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, '../public')));

// Routes
app.use('/auth', authController);
app.use('/prompt', promptController);
app.use('/game', gameController);
app.use('/vote', voteController);

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle game-specific events
  socket.on('register', (data) => gameController.handleRegister(socket, data));
  socket.on('login', (data) => gameController.handleLogin(socket, data));
  socket.on('submitPrompt', (data) => gameController.handleSubmitPrompt(socket, data));
  socket.on('submitAnswer', (data) => gameController.handleSubmitAnswer(socket, data));
  socket.on('vote', (data) => voteController.handleVote(socket, data));
  socket.on('advance', () => gameController.handleAdvance(socket));

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    gameController.handleDisconnect(socket);
  });
});

// Start Server
const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
