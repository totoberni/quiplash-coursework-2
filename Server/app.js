// app.js

'use strict';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const authRoutes = require('./server/routes/authRoutes');
const gameController = require('./server/controllers/gameController');
const socketUtils = require('./server/utils/socketUtils');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/static', express.static('public'));

// Set up routes
app.use('/auth', authRoutes);

// Handle client interface on '/'
app.get('/', (req, res) => {
  res.render('client');
});

// Handle display interface on '/display'
app.get('/display', (req, res) => {
  res.render('display');
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Initialize socket event handlers
  socketUtils.initializeSocket(socket, io);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    gameController.handleDisconnect(socket);
  });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});