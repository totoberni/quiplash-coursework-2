// public/display.js

const socket = io();

// VueJS application for the display client
var displayApp = new Vue({
  el: '#display',
  data: {
    connected: false,
    gameState: {
      stage: 'waiting', // stages: waiting, prompts, answers, voting, results, scores, gameOver
      players: [],
      audience: [],
      prompts: [],
      answers: [],
      votes: [],
      results: [],
      podium: { gold: [], silver: [], bronze: [] },
    },
    errorMessage: '',
  },
  mounted() {
    socket.on('connect', () => {
      this.connected = true;
      console.log('Connected to server as display client');
    });

    socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
    });

    socket.on('gameStateUpdate', (state) => {
      this.gameState = state;
    });

    socket.on('error', (message) => {
      this.errorMessage = message;
    });
  },
});
