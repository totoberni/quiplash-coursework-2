'use strict';

// Set up express
const express = require('express');
const app = express();

// Set up axios for HTTP requests
const axios = require('axios');

// Setup socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Setup static page handling
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));

// Handle client interface on /
app.get('/', (req, res) => {
  res.render('client');
});
// Handle display interface on /display
app.get('/display', (req, res) => {
  res.render('display');
});

// URL of the backend API
const BACKEND_ENDPOINT = process.env.BACKEND || 'http://localhost:8080';

// Game state variables
let gameState = {
    phase: 'joining', // Possible phases: 'joining', 'promptCollection', 'answerSubmission', 'voting', 'results', 'scores', 'gameOver'
    players: {}, // key: socket.id, value: player object
    audience: {}, // key: socket.id, value: audience member object
    prompts: [], // array of prompts
    answers: {}, // key: prompt id, value: array of answers
    votes: {}, // key: prompt id, value: array of votes
    scores: {}, // key: username, value: score
    round: 1, // current round number
    maxPlayers: 8 // maximum number of players
};

// Start the server
function startServer() {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

// Chat message handler
function handleChat(message) {
    console.log('Handling chat: ' + message); 
    io.emit('chat', message);
}

// API wrapper functions

// Register a new player
async function registerPlayer(username, password) {
    // Validation checks
    if (!username || !password || username.length < 8 || password.length < 8) {
        throw new Error('Invalid username or password. Must be at least 8 characters long.');
    }
    try {
        const response = await axios.post(`${BACKEND_ENDPOINT}/api/player/register`, {
            username: username,
            password: password
        });
        return response.data;
    } catch (error) {
        // Handle API errors
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Registration failed.');
        }
    }
}

// Login an existing player
async function loginPlayer(username, password) {
    // Validation checks
    if (!username || !password || username.length < 8 || password.length < 8) {
        throw new Error('Invalid username or password. Must be at least 8 characters long.');
    }
    try {
        const response = await axios.post(`${BACKEND_ENDPOINT}/api/player/login`, {
            username: username,
            password: password
        });
        return response.data;
    } catch (error) {
        // Handle API errors
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Login failed.');
        }
    }
}

// Submit a new prompt
async function createPrompt(prompt) {
    if (!prompt || prompt.length === 0) {
        throw new Error('Prompt cannot be empty.');
    }
    try {
        const response = await axios.post(`${BACKEND_ENDPOINT}/api/prompt/create`, {
            prompt: prompt
        });
        return response.data;
    } catch (error) {
        // Handle API errors
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Prompt submission failed.');
        }
    }
}

// Get existing prompts
async function getPrompts() {
    try {
        const response = await axios.get(`${BACKEND_ENDPOINT}/api/utils/get`);
        return response.data;
    } catch (error) {
        throw new Error('Failed to retrieve prompts.');
    }
}

// Function to update all clients with the current game state
function updateAllClients() {
    // Prepare data to send to clients
    const playersInfo = Object.values(gameState.players).map(player => ({
        username: player.username,
        score: player.score,
        state: player.state,
        admin: player.admin || false
    }));
    const audienceInfo = Object.values(gameState.audience).map(member => ({
        username: member.username
    }));
    io.emit('gameStateUpdate', {
        phase: gameState.phase,
        players: playersInfo,
        audience: audienceInfo
    });
}

// Handle new connection
io.on('connection', socket => { 
    console.log('New connection');

    // Handle on chat message received
    socket.on('chat', message => {
        handleChat(message);
    });

    // Handle registration
    socket.on('register', async (username, password) => {
        try {
            await registerPlayer(username, password);
            // Registration successful
            socket.emit('registerSuccess', 'Registration successful. Please log in.');
        } catch (error) {
            // Handle registration error
            console.error('Registration error:', error.message);
            socket.emit('fail', error.message);
        }
    });

    // Handle login
    socket.on('login', async (username, password) => {
        try {
            await loginPlayer(username, password);
            // Login successful
            let userType = '';
            if (Object.keys(gameState.players).length < gameState.maxPlayers) {
                // Add player to players list
                gameState.players[socket.id] = {
                    username: username,
                    score: 0,
                    state: 'joined',
                    socket: socket
                };
                // If first player, set as admin
                if (Object.keys(gameState.players).length === 1) {
                    gameState.players[socket.id].admin = true;
                }
                socket.emit('loginSuccess', { message: 'Login successful. You have joined as a player.', admin: gameState.players[socket.id].admin });
                userType = 'player';
            } else {
                // Add player to audience
                gameState.audience[socket.id] = {
                    username: username,
                    socket: socket
                };
                socket.emit('loginSuccess', { message: 'Login successful. You have joined as an audience member.' });
                userType = 'audience';
            }
            console.log(`${username} has logged in as ${userType}.`);
            // Update all clients
            updateAllClients();
        } catch (error) {
            // Handle login error
            console.error('Login error:', error.message);
            socket.emit('fail', error.message);
        }
    });

    // Handle prompt submission
    socket.on('prompt', async (prompt) => {
        try {
            await createPrompt(prompt);
            // Prompt submission successful
            socket.emit('promptSuccess', 'Prompt submitted successfully.');
            // Store the prompt locally for current game
            gameState.prompts.push({ prompt: prompt, submittedBy: socket.id });
            console.log(`Prompt submitted: "${prompt}" by ${socket.id}`);
            // Optionally, update display or other clients
        } catch (error) {
            // Handle prompt submission error
            console.error('Prompt submission error:', error.message);
            socket.emit('fail', error.message);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Dropped connection');
        // Remove player or audience member from game state
        if (gameState.players[socket.id]) {
            delete gameState.players[socket.id];
        } else if (gameState.audience[socket.id]) {
            delete gameState.audience[socket.id];
        }
        // Update all clients
        updateAllClients();
    });
});

// Start server
if (module === require.main) {
    startServer();
}

module.exports = server;