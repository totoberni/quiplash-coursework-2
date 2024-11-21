// server/utils/socketUtils.js

const authController = require('../controllers/authController');
const gameController = require('../controllers/gameController');

module.exports.initializeSocket = (socket, io) => {
  // Handle registration
  socket.on('register', (data) => {
    authController.handleRegister(socket, data);
  });

  // Handle login
  socket.on('login', (data) => {
    authController.handleLogin(socket, data);
  });

  // Handle prompt submission
  socket.on('prompt', (data) => {
    gameController.handlePrompt(socket, data);
  });

  // Handle answer submission
  socket.on('answer', (data) => {
    gameController.handleAnswer(socket, data);
  });

  // Handle voting
  socket.on('vote', (data) => {
    gameController.handleVote(socket, data);
  });

  // Handle advancing the game
  socket.on('advance', () => {
    gameController.handleAdvance(socket);
  });
};
