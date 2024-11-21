// server/models/gameStateModel.js

class GameState {
    constructor() {
      this.phase = 'joining'; // Current phase of the game
      this.stateNumber = 0; // Tracks the progression of the game
      this.players = {}; // Active players
      this.audience = {}; // Audience members
      this.submittedPrompts = []; // Prompts submitted during the game
      this.activePrompts = []; // Prompts used in the current round
      this.currentPromptIndex = 0; // Index of the current prompt during voting
      this.answers = {}; // Answers submitted by players
      this.votes = {}; // Votes cast
      this.roundScores = {}; // Round scores for players
      this.totalScores = {}; // Total scores for players
      this.roundNumber = 1; // Current round number
      this.totalRounds = 3; // Total number of rounds in the game
    }
  
    startGame() {
      this.phase = 'prompts';
      this.stateNumber += 1;
    }
  
    endJoining() {
      // Initialize all players' scores and states
      Object.values(this.players).forEach((player) => {
        player.score = 0;
        player.roundScore = 0;
        player.state = 'active';
      });
      this.stateNumber += 1;
    }
  
    startPrompts() {
      this.phase = 'prompts';
      this.stateNumber += 1;
    }
  
    endPrompts() {
      // Prompts have been collected and stored
      this.stateNumber += 1;
    }
  
    startAnswers() {
      this.phase = 'answers';
      this.stateNumber += 1;
    }
  
    endAnswers() {
      // All answers have been collected
      this.phase = 'voting';
      this.stateNumber += 1;
    }
  
    startVoting() {
      this.phase = 'voting';
      this.stateNumber += 1;
    }
  
    endVoting() {
      // Voting completed
      this.phase = 'results';
      this.stateNumber += 1;
    }
  
    startResults() {
      this.phase = 'results';
      this.stateNumber += 1;
    }
  
    endResults() {
      // Round results processed
      this.phase = 'scores';
      this.stateNumber += 1;
    }
  
    startScores() {
      this.phase = 'scores';
      this.stateNumber += 1;
    }
  
    endScores() {
      // Scores updated
      this.stateNumber += 1;
    }
  
    endGame() {
      this.phase = 'gameOver';
      this.stateNumber += 1;
    }
  
    // Additional methods to manage transitions can be added here
  }
  
  module.exports = GameState;  