// server/models/playerModel.js

class Player {
    constructor(socketId, username) {
      this.socketId = socketId;
      this.username = username;
      this.isAdmin = false;
      this.score = 0;
      // Additional properties as needed
    }
  }
  
  module.exports = Player;
  