// server/controllers/authController.js

const request = require('request');
const gameLogic = require('../utils/gameLogic');

// **Define BACKEND_ENDPOINT Directly Without '/auth' Prefix**
const BACKEND_ENDPOINT = process.env.BACKEND_ENDPOINT || 'http://localhost:8181';

/**
 * Handles player registration via HTTP.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
function registerHTTP(req, res) {
  const { username, password } = req.body;

  // Server-side validation
  if (!username || typeof username !== 'string') {
    return res.status(400).json({
      result: false,
      msg: 'Username is required and must be a string.',
    });
  }
  if (username.length <= 4 || username.length >= 8) { // Adjusted to match goals
    return res.status(400).json({
      result: false,
      msg: 'Username must be more than 4 and less than 8 characters.',
    });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      result: false,
      msg: 'Password is required and must be a string.',
    });
  }
  if (password.length <= 8 || password.length >= 16) { // Adjusted to match goals
    return res.status(400).json({
      result: false,
      msg: 'Password must be more than 8 and less than 16 characters.',
    });
  }

  // Make a POST request to the backend API for registration
  request.post(
    `${BACKEND_ENDPOINT}/player/register`,
    {
      json: true,
      body: { username, password },
    },
    (err, response, body) => {
      if (err) {
        console.error('Registration Error:', err);
        return res.status(500).json({
          result: false,
          msg: 'An error occurred during registration.',
        });
      }

      if (response.statusCode === 200 && body.result === true) {
        // Check if the user is already in the game (prevents duplicate registrations)
        if (gameLogic.isUserInGame(username)) {
          return res.status(409).json({
            result: false,
            msg: 'Username is already taken in the game.',
          });
        }

        // Determine if the user should be a player or audience
        const totalPlayers = gameLogic.getTotalPlayers();
        const isAdmin = totalPlayers === 0; // First player is admin
        const role = totalPlayers < 8 ? 'player' : 'audience';

        // Add user to game logic with a temporary socket ID (to be updated upon Socket.IO connection)
        if (role === 'player') {
          gameLogic.addPlayer(username, null, isAdmin);
        } else {
          gameLogic.addAudience(username, null, isAdmin);
        }

        // Respond with successful registration
        res.status(200).json({
          result: true,
          msg: 'Registration successful.',
        });

        // **Note:** Emitting Socket.IO events from here requires access to the `io` instance.
        // Consider restructuring your server to allow controllers to access `io`, possibly via an event emitter.
      } else {
        // Registration failed due to API error
        res.status(response.statusCode).json({
          result: false,
          msg: body.msg || 'Registration failed.',
        });
      }
    }
  );
}

/**
 * Handles player login via HTTP.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
function loginHTTP(req, res) {
  const { username, password } = req.body;

  // Server-side validation
  if (!username || typeof username !== 'string') {
    return res.status(400).json({
      result: false,
      msg: 'Username is required and must be a string.',
    });
  }
  if (username.length <= 4 || username.length >= 8) { // Adjusted to match goals
    return res.status(400).json({
      result: false,
      msg: 'Username must be more than 4 and less than 8 characters.',
    });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      result: false,
      msg: 'Password is required and must be a string.',
    });
  }
  if (password.length <= 8 || password.length >= 16) { // Adjusted to match goals
    return res.status(400).json({
      result: false,
      msg: 'Password must be more than 8 and less than 16 characters.',
    });
  }

  // Make a POST request to the backend API for login
  request.post(
    `${BACKEND_ENDPOINT}/player/login`,
    {
      json: true,
      body: { username, password },
    },
    (err, response, body) => {
      if (err) {
        console.error('Login Error:', err);
        return res.status(500).json({
          result: false,
          msg: 'An error occurred during login.',
        });
      }

      if (response.statusCode === 200 && body.result === true) {
        // Check if the user is already logged in
        if (gameLogic.isUserInGame(username)) {
          return res.status(409).json({
            result: false,
            msg: 'User is already logged in.',
          });
        }

        // Determine if the user should be a player or audience
        const totalPlayers = gameLogic.getTotalPlayers();
        const isAdmin = totalPlayers === 0; // First player is admin
        const role = totalPlayers < 8 ? 'player' : 'audience';

        // Add user to game logic with a temporary socket ID (to be updated upon Socket.IO connection)
        if (role === 'player') {
          gameLogic.addPlayer(username, null, isAdmin);
        } else {
          gameLogic.addAudience(username, null, isAdmin);
        }

        // Respond with successful login
        res.status(200).json({
          result: true,
          msg: 'Login successful.',
        });

        // **Note:** Emitting Socket.IO events from here requires access to the `io` instance.
        // Consider restructuring your server to allow controllers to access `io`, possibly via an event emitter.
      } else {
        // Login failed due to API error
        res.status(response.statusCode).json({
          result: false,
          msg: body.msg || 'Login failed.',
        });
      }
    }
  );
}

module.exports = {
  registerHTTP,
  loginHTTP,
};