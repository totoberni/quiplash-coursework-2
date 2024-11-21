// public/game.js

const socket = io();

// VueJS application for the client
new Vue({
  el: '#game',
  data: {
    connected: false,
    username: '',
    password: '',
    isLoggedIn: false,
    isAdmin: false,
    message: '',
    error: '',
    // Additional client-side data properties
  },
  mounted() {
    this.setupSocketListeners();
  },
  methods: {
    setupSocketListeners() {
      socket.on('connect', () => {
        this.connected = true;
      });

      socket.on('disconnect', () => {
        this.connected = false;
        this.isLoggedIn = false;
        this.error = 'Disconnected from server.';
      });

      socket.on('fail', (msg) => {
        this.error = msg;
      });

      socket.on('success', (msg) => {
        this.message = msg;
      });

      socket.on('joinedGame', (data) => {
        this.isLoggedIn = true;
        this.username = data.player.username;
        this.isAdmin = data.player.isAdmin;
        this.message = data.message;
        // Additional logic for logged-in players
      });

      socket.on('joinedAudience', (data) => {
        this.isLoggedIn = true;
        this.username = data.player.username;
        this.message = data.message;
        // Handle audience-specific UI changes
      });

      // Additional socket listeners for game events
    },
    register() {
      socket.emit('register', {
        username: this.username.trim(),
        password: this.password.trim(),
      });
    },
    login() {
      socket.emit('login', {
        username: this.username.trim(),
        password: this.password.trim(),
      });
    },
    // Additional methods for game interactions
  },
});