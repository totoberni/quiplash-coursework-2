// server/controllers/gameController.js

const gameLogic = require('../utils/gameLogic');
const promptController = require('./promptController');

/**
 * Handles chat messages via Socket.IO.
 * @param {Object} socket - Socket.IO socket object.
 * @param {Object} data - Chat message data containing username and message.
 * @param {Object} io - Socket.IO server instance.
 */
function handleChatMessage(socket, data, io) {
  const { username, message } = data;

  // Server-side validation
  if (!username || typeof username !== 'string') {
    socket.emit('error', { message: 'Invalid username.' });
    return;
  }
  if (!message || typeof message !== 'string') {
    socket.emit('error', { message: 'Invalid message.' });
    return;
  }

  // Broadcast chat message to all clients
  io.emit('chatMessage', { username, message });
}

/**
 * Handles answer submission via Socket.IO.
 * @param {Object} socket - Socket.IO socket object.
 * @param {Object} data - Answer data containing username, promptId, and answerText.
 * @param {Object} io - Socket.IO server instance.
 */
function handleAnswer(socket, data, io) {
  const { username, promptId, answerText } = data;
  const player = gameLogic.gameState.players[username];

  if (!player) {
    socket.emit('answerResult', { success: false, message: 'Player not found.' });
    return;
  }

  // Validate answer length
  if (!answerText || answerText.length < 5 || answerText.length > 200) {
    socket.emit('answerResult', {
      success: false,
      message: 'Answer must be between 5 and 200 characters.',
    });
    return;
  }

  // Ensure the player is assigned to the prompt
  const prompt = gameLogic.gameState.activePrompts.find((p) => p.id === promptId);
  if (!prompt || !prompt.assignedPlayers.includes(username)) {
    socket.emit('answerResult', {
      success: false,
      message: 'You are not assigned to this prompt.',
    });
    return;
  }

  // Initialize answers array for the prompt if not present
  if (!gameLogic.gameState.answers[promptId]) {
    gameLogic.gameState.answers[promptId] = [];
  }

  // Check if player has already answered this prompt
  const existingAnswer = gameLogic.gameState.answers[promptId].find(
    (ans) => ans.username === username
  );
  if (existingAnswer) {
    socket.emit('answerResult', {
      success: false,
      message: 'You have already submitted an answer for this prompt.',
    });
    return;
  }

  // Store the answer
  gameLogic.gameState.answers[promptId].push({
    username,
    answerText,
  });

  // Update player's state
  player.state = 'answered';

  // Notify player that their answer was received
  socket.emit('answerResult', { success: true, message: 'Answer submitted successfully.' });

  // Check if all players have submitted answers
  const allAnswered = Object.values(gameLogic.gameState.players).every(
    (p) => p.state === 'answered' || p.state === 'disconnected'
  );

  if (allAnswered) {
    // Advance to voting phase
    gameLogic.advanceGameState(io);
  }
}

/**
 * Handles prompt submissions via Socket.IO.
 * Delegates to promptController.
 * @param {Object} socket - Socket.IO socket object.
 * @param {Object} data - Prompt data containing username and promptText.
 * @param {Object} io - Socket.IO server instance.
 */
function handlePrompt(socket, data, io) {
  promptController.handlePrompt(socket, data, io);
}

/**
 * Handles advancing the game to the next phase via Socket.IO.
 * @param {Object} socket - Socket.IO socket object.
 * @param {Object} data - Data containing the action to perform.
 * @param {Object} io - Socket.IO server instance.
 */
function handleAdvance(socket, data, io) {
  const { action } = data;

  if (!gameLogic.isAdmin(socket.id)) {
    socket.emit('advanceResult', { success: false, message: 'Only admin can advance the game.' });
    return;
  }

  switch (action) {
    case 'startGame':
      const started = gameLogic.startGame();
      if (started) {
        io.emit('phaseChange', {
          phase: gameLogic.gameState.phase,
          roundNumber: gameLogic.gameState.roundNumber,
          stateNumber: gameLogic.gameState.stateNumber,
        });
        socket.emit('advanceResult', { success: true, message: 'Game started successfully.' });
      } else {
        socket.emit('advanceResult', { success: false, message: 'Failed to start the game.' });
      }
      break;

    case 'pauseGame':
      gameLogic.gameState.isPaused = true;
      io.emit('message', { message: 'Game has been paused by the admin.' });
      socket.emit('advanceResult', { success: true, message: 'Game paused successfully.' });
      break;

    case 'resumeGame':
      gameLogic.gameState.isPaused = false;
      io.emit('message', { message: 'Game has been resumed by the admin.' });
      socket.emit('advanceResult', { success: true, message: 'Game resumed successfully.' });
      break;

    case 'resetGame':
      // Reset the game state
      gameLogic.resetGameState();
      io.emit('phaseChange', { phase: 'joining', stateNumber: 0 });
      socket.emit('advanceResult', { success: true, message: 'Game has been reset.' });
      break;

    default:
      socket.emit('advanceResult', { success: false, message: 'Invalid action.' });
      break;
  }
}

/**
 * Handles user disconnection via Socket.IO.
 * @param {Object} socket - Socket.IO socket object.
 * @param {Object} io - Socket.IO server instance.
 */
function handleDisconnect(socket, io) {
  const username = gameLogic.getUsernameBySocketId(socket.id);
  if (username) {
    gameLogic.removeUserBySocketId(socket.id);
    io.emit('message', { message: `${username} has disconnected.` });

    // Optionally, update game state or notify other players
    io.emit('gameStateUpdate', gameLogic.getGameState());
  }
}

module.exports = {
  handleChatMessage,
  handlePrompt, // Now delegates to promptController
  handleAnswer,
  handleAdvance,
  handleDisconnect,
};