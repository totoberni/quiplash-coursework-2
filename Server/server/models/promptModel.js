// server/models/promptModel.js

class Prompt {
    constructor(id, text, assignedPlayers) {
      this.id = id; // Unique identifier for the prompt
      this.text = text; // The prompt text
      this.assignedPlayers = assignedPlayers || []; // Array of usernames assigned to this prompt
    }
  }
  
  module.exports = Prompt;  