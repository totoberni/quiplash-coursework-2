// app.js

'use strict';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Importing Controllers
const gameController = require('./server/controllers/gameController'); // Ensure correct path

// Importing Socket Utils
const socketUtils = require('./server/utils/socketUtils');

// Initialize Express App
const app = express();

// Create HTTP Server and Initialize Socket.IO
const server = http.createServer(app);
const io = socketIo(server);

// Middleware Setup
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Set View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ensure views directory is correctly set

// Serve Static Files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Root Route - Render Game Interface
app.get('/', (req, res) => {
  res.render('game'); // Ensure that game.ejs exists in the 'views' directory
});

// Initialize Socket.IO Handlers
socketUtils.initializeSocket(io);

// Error Handling Middleware

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).render('404'); // Ensure that a 404.ejs exists
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err }); // Ensure that an error.ejs exists
});

// Start Server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})