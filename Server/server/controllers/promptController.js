// server/controllers/promptController.js

const apiUtils = require('../utils/apiUtils');
const gameLogic = require('../utils/gameLogic');
const Prompt = require('../models/promptModel');

module.exports = {
  /**
   * Handles prompt submission via Socket.IO.
   * @param {Socket} socket - The client's socket.
   * @param {Object} data - Prompt data containing username and promptText.
   * @param {Object} io - Socket.IO server instance.
   */
  async handlePrompt(socket, data, io) {
    const { username, promptText } = data;

    // Validate prompt length
    if (!promptText || promptText.length < 20 || promptText.length > 100) {
      socket.emit('promptResult', {
        success: false,
        message: 'Prompt must be between 20 and 100 characters.',
      });
      return;
    }

    // Check if user is part of the game
    if (!gameLogic.isUserInGame(username)) {
      socket.emit('promptResult', {
        success: false,
        message: 'User not found in the game.',
      });
      return;
    }

    try {
      // Save the prompt via API
      await apiUtils.createPrompt(username, promptText);

      // Create a new Prompt instance
      const promptId = `prompt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const prompt = new Prompt(promptId, promptText);

      // Store prompt locally for the current game
      gameLogic.gameState.submittedPrompts.push(prompt);

      // Respond to the user
      socket.emit('promptResult', {
        success: true,
        message: 'Prompt submitted successfully.',
      });

      // Update display with prompt count
      const promptCountData = {
        promptCount: gameLogic.gameState.submittedPrompts.length,
        promptsBy: gameLogic.gameState.submittedPrompts.map((p) => ({
          username: p.username,
          promptText: p.text,
        })),
      };
      io.emit('promptCountUpdate', promptCountData);
    } catch (error) {
      console.error('Prompt submission error:', error);
      socket.emit('promptResult', { success: false, message: 'Failed to submit prompt.' });
    }
  },
};