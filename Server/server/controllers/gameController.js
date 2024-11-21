// server/controllers/gameController.js

const gameState = require('../models/gameStateModel');
const apiUtils = require('../utils/apiUtils');

module.exports.handlePrompt = async (socket, data) => {
  const { prompt } = data;
  
  // Validate prompt length
  if (!prompt || prompt.length < 20 || prompt.length > 100) {
    socket.emit('error', 'Prompt must be between 20 and 100 characters.');
    return;
  }
  
  // Submit prompt to backend API
  try {
    const result = await apiUtils.createPrompt(socket.username, prompt);
    if (result.result) {
      // Add to game state
      gameState.prompts.push(result.prompt);
      // Optionally, emit game state update to display
      socket.emit('gameStateUpdate', gameState.getState());
      socket.broadcast.emit('gameStateUpdate', gameState.getState());
    } else {
      socket.emit('error', result.msg);
    }
  } catch (error) {
    socket.emit('error', 'Failed to submit prompt.');
  }
};

module.exports.handleAnswer = (socket, data) => {
  // Implement answer handling logic
};

module.exports.handleVote = (socket, data) => {
  // Implement vote handling logic
};

module.exports.handleAdvance = () => {
  // Implement game state advancement logic
};

module.exports.handleDisconnect = (socket) => {
  gameState.removePlayer(socket.id);
  // Optionally, emit game state update to display
  socket.broadcast.emit('gameStateUpdate', gameState.getState());
};
