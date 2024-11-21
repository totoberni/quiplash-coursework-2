// server/models/gameStateModel.js

const Player = require('./playerModel');

class GameState {
  constructor() {
    this.players = []; // Active players
    this.audience = []; // Audience members
    this.stage = 'waiting'; // Current game stage
    this.prompts = [];
    this.answers = [];
    this.votes = [];
    this.results = [];
    this.podium = { gold: [], silver: [], bronze: [] };
  }

  addPlayer(socket, username) {
    // Check if game has started or player limit reached
    if (this.stage !== 'waiting' || this.players.length >= 8) {
      // Add to audience
      const audienceMember = new Player(socket.id, username);
      this.audience.push(audienceMember);
      return false;
    }

    // Add as a player
    const player = new Player(socket.id, username);
    if (this.players.length === 0) {
      player.isAdmin = true; // First player is admin
    }
    this.players.push(player);
    return player.isAdmin;
  }

  removePlayer(socketId) {
    // Remove from players
    this.players = this.players.filter(player => player.socketId !== socketId);

    // Remove from audience
    this.audience = this.audience.filter(audience => audience.socketId !== socketId);
  }

  getState() {
    return {
      stage: this.stage,
      players: this.players,
      audience: this.audience,
      prompts: this.prompts,
      answers: this.answers,
      votes: this.votes,
      results: this.results,
      podium: this.podium,
    };
  }

  // Additional methods to manage game state transitions
}

const gameStateInstance = new GameState();

module.exports = gameStateInstance;