// server/controllers/authController.js

const apiUtils = require('../utils/apiUtils');
const gameState = require('../models/gameStateModel');

// Socket.IO event handlers
module.exports.handleRegister = async (socket, data) => {
  const { username, password } = data;

  // Validate input
  if (!username || !password) {
    socket.emit('error', 'Username and password are required.');
    return;
  }

  // Validate username length
  if (username.length < 5 || username.length > 15) {
    socket.emit('error', 'Username must be between 5 and 15 characters.');
    return;
  }

  // Validate password length
  if (password.length < 8 || password.length > 15) {
    socket.emit('error', 'Password must be between 8 and 15 characters.');
    return;
  }

  // Call the API to register the player
  try {
    const result = await apiUtils.registerPlayer(username, password);
    if (result.result) {
      socket.emit('registrationSuccess');
    } else {
      socket.emit('error', result.msg);
    }
  } catch (error) {
    socket.emit('error', 'Registration failed. Please try again.');
  }
};

module.exports.handleLogin = async (socket, data) => {
  const { username, password } = data;

  // Validate input
  if (!username || !password) {
    socket.emit('error', 'Username and password are required.');
    return;
  }

  // Call the API to login the player
  try {
    const result = await apiUtils.loginPlayer(username, password);
    if (result.result) {
      // Add player to game state
      const isAdmin = gameState.addPlayer(socket, username);
      socket.emit('loginSuccess', { isAdmin });
      // Optionally, emit an update to all clients
      io.emit('gameStateUpdate', gameState.getState());
    } else {
      socket.emit('error', result.msg);
    }
  } catch (error) {
    socket.emit('error', 'Login failed. Please try again.');
  }
};

// HTTP route handlers
module.exports.handleRegisterHTTP = async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ result: false, msg: 'Username and password are required.' });
  }

  // Validate username length
  if (username.length < 5 || username.length > 15) {
    return res.status(400).json({ result: false, msg: 'Username must be between 5 and 15 characters.' });
  }

  // Validate password length
  if (password.length < 8 || password.length > 15) {
    return res.status(400).json({ result: false, msg: 'Password must be between 8 and 15 characters.' });
  }

  // Call the API to register the player
  try {
    const result = await apiUtils.registerPlayer(username, password);
    if (result.result) {
      return res.status(200).json({ result: true, msg: 'Registration successful.' });
    } else {
      return res.status(400).json({ result: false, msg: result.msg });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ result: false, msg: 'Registration failed due to server error.' });
  }
};

module.exports.handleLoginHTTP = async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ result: false, msg: 'Username and password are required.' });
  }

  // Validate username length
  if (username.length < 5 || username.length > 15) {
    return res.status(400).json({ result: false, msg: 'Username must be between 5 and 15 characters.' });
  }

  // Validate password length
  if (password.length < 8 || password.length > 15) {
    return res.status(400).json({ result: false, msg: 'Password must be between 8 and 15 characters.' });
  }

  // Call the API to login the player
  try {
    const result = await apiUtils.loginPlayer(username, password);
    if (result.result) {
      // Optionally, handle session or token generation here
      return res.status(200).json({ result: true, msg: 'Login successful.' });
    } else {
      return res.status(400).json({ result: false, msg: result.msg });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ result: false, msg: 'Login failed due to server error.' });
  }
};