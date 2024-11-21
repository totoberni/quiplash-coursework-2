// server/server.js

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const socketUtils = require('./utils/socketUtils'); // Import socketUtils

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, '../public')));

// Serve client and display interfaces
app.get('/', (req, res) => {
  res.render('client');
});

app.get('/display', (req, res) => {
  res.render('display');
});

// Initialize Socket.IO event handling using socketUtils
socketUtils.initializeSocket(io);

// Start the server
const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});