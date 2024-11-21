// server/utils/socketUtils.js

const authController = require('../controllers/authController');
const gameController = require('../controllers/gameController');

module.exports.initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle registration
    socket.on('register', (data) => {
      authController.handleRegister(socket, data, io);
    });

    // Handle login
    socket.on('login', (data) => {
      authController.handleLogin(socket, data, io);
    });

    // Handle chat messages
    socket.on('chatMessage', (data) => {
      gameController.handleChatMessage(socket, data, io);
    });

    // Handle prompt submission
    socket.on('prompt', (data) => {
      gameController.handlePrompt(socket, data, io);
    });

    // Handle answer submission
    socket.on('answer', (data) => {
      gameController.handleAnswer(socket, data, io);
    });

    // Handle prompt generation
    socket.on('generatePrompt', (data) => {
      gameController.handleGeneratePrompt(socket, data, io);
    });

    // Handle prompt selection
    socket.on('selectPrompt', (data) => {
      gameController.handleSelectPrompt(socket, data, io);
    });

    // Handle voting
    socket.on('vote', (data) => {
      gameController.handleVote(socket, data, io);
    });

    // Handle advancing the game
    socket.on('advance', (data) => {
      gameController.handleAdvance(socket, io);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      gameController.handleDisconnect(socket, io);
    });
  });
};