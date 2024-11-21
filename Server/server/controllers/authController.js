// server/controllers/authController.js

const apiUtils = require('../utils/apiUtils');
const gameLogic = require('../utils/gameLogic');

/**
 * Handles player registration via Socket.IO.
 * @param {Object} socket - Socket.IO socket object.
 * @param {Object} data - Registration data containing username and password.
 * @param {Object} io - Socket.IO server instance.
 */
async function handleRegister(socket, data, io) {
  const { username, password } = data;

  // Server-side validation
  if (!username || typeof username !== 'string') {
    socket.emit('registerResult', {
      success: false,
      message: 'Username is required and must be a string.',
    });
    return;
  }
  if (username.length < 4 || username.length > 15) {
    socket.emit('registerResult', {
      success: false,
      message: 'Username must be between 5 and 15 characters.',
    });
    return;
  }
  if (!password || typeof password !== 'string') {
    socket.emit('registerResult', {
      success: false,
      message: 'Password is required and must be a string.',
    });
    return;
  }
  if (password.length < 8 || password.length > 15) {
    socket.emit('registerResult', {
      success: false,
      message: 'Password must be between 8 and 15 characters.',
    });
    return;
  }

  try {
    // Call the API to register the user
    const result = await apiUtils.registerPlayer(username, password);

    if (result.success) {
      // Check if the user is already in the game (prevents duplicate registrations)
      if (gameLogic.isUserInGame(username)) {
        socket.emit('registerResult', {
          success: false,
          message: 'Username is already taken in the game.',
        });
        return;
      }

      // Determine if the user should be a player or audience
      const totalPlayers = gameLogic.getTotalPlayers();
      const isAdmin = totalPlayers === 0; // First player is admin
      const role = totalPlayers < 8 ? 'player' : 'audience';

      if (role === 'player') {
        gameLogic.addPlayer(username, socket.id, isAdmin);
      } else {
        gameLogic.addAudience(username, socket.id);
      }

      // Respond with successful registration
      socket.emit('registerResult', {
        success: true,
        message: 'Registration successful.',
        role,
        isAdmin,
      });

      // Notify all clients about the new player
      io.emit('playerJoined', { username });

    } else {
      // Registration failed due to API error
      socket.emit('registerResult', {
        success: false,
        message: result.message || 'Registration failed.',
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    socket.emit('registerResult', {
      success: false,
      message: 'An error occurred during registration.',
    });
  }
}

/**
 * Handles player login via Socket.IO.
 * @param {Object} socket - Socket.IO socket object.
 * @param {Object} data - Login data containing username and password.
 * @param {Object} io - Socket.IO server instance.
 */
async function handleLogin(socket, data, io) {
  const { username, password } = data;

  // Server-side validation
  if (!username || typeof username !== 'string') {
    socket.emit('loginResult', {
      success: false,
      message: 'Username is required and must be a string.',
    });
    return;
  }
  if (!password || typeof password !== 'string') {
    socket.emit('loginResult', {
      success: false,
      message: 'Password is required and must be a string.',
    });
    return;
  }

  try {
    // Call the API to authenticate the user
    const result = await apiUtils.loginPlayer(username, password);

    if (result.success) {
      // Check if the user is already logged in
      if (gameLogic.isUserInGame(username)) {
        socket.emit('loginResult', { success: false, message: 'User is already logged in.' });
        return;
      }

      // Determine if the user should be a player or audience
      const totalPlayers = gameLogic.getTotalPlayers();
      const isAdmin = totalPlayers === 0; // First player is admin
      const role = totalPlayers < 8 ? 'player' : 'audience';

      if (role === 'player') {
        gameLogic.addPlayer(username, socket.id, isAdmin);
      } else {
        gameLogic.addAudience(username, socket.id);
      }

      // Respond with successful login
      socket.emit('loginResult', {
        success: true,
        message: 'Login successful.',
        role,
        isAdmin,
      });

      // Notify all clients about the new player
      io.emit('playerJoined', { username });

    } else {
      // Login failed due to API error
      socket.emit('loginResult', {
        success: false,
        message: result.message || 'Login failed.',
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    socket.emit('loginResult', { success: false, message: 'An error occurred during login.' });
  }
}

module.exports = {
  handleRegister,
  handleLogin,
};