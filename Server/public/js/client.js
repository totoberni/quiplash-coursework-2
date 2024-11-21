// public/client.js

const socket = io();

// VueJS application for the player client
var app = new Vue({
  el: '#app',
  data: {
    connected: false,
    username: '',
    password: '',
    isLoggedIn: false,
    isAdmin: false,
    errorMessage: '',
  },
  methods: {
    register() {
      // Input validation
      if (this.username.length < 4 || this.username.length > 15) {
        this.errorMessage = 'Username must be between 5 and 15 characters.';
        return;
      }
      if (this.password.length < 8 || this.password.length > 15) {
        this.errorMessage = 'Password must be between 8 and 15 characters.';
        return;
      }
      
      // Emit register event
      socket.emit('register', {
        username: this.username,
        password: this.password,
      });
      this.clearError();
    },
    login() {
      // Input validation
      if (this.username.length < 4 || this.username.length > 15) {
        this.errorMessage = 'Username must be between 5 and 15 characters.';
        return;
      }
      if (this.password.length < 8 || this.password.length > 15) {
        this.errorMessage = 'Password must be between 8 and 15 characters.';
        return;
      }
      
      // Emit login event
      socket.emit('login', {
        username: this.username,
        password: this.password,
      });
      this.clearError();
    },
    handleError(message) {
      this.errorMessage = message;
    },
    clearError() {
      this.errorMessage = '';
    },
  },
  mounted() {
    socket.on('connect', () => {
      this.connected = true;
    });

    socket.on('disconnect', () => {
      this.connected = false;
    });

    socket.on('loginSuccess', (data) => {
      this.isLoggedIn = true;
      this.isAdmin = data.isAdmin;
      // Proceed to game lobby or game screen
      alert('Login successful!');
    });

    socket.on('registrationSuccess', () => {
      alert('Registration successful! Please log in.');
    });

    socket.on('error', (message) => {
      this.handleError(message);
    });
  },
});