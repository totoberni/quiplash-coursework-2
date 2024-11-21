// server/utils/gameLogic.js

/**
 * GameLogic Singleton Class
 * Manages the entire game state and provides methods to manipulate and retrieve game data.
 */
class GameLogic {
    /**
     * Constructs the GameLogic instance.
     * Implements the Singleton pattern by ensuring only one instance exists.
     */
    constructor() {
      if (GameLogic.instance) {
        return GameLogic.instance;
      }
  
      // Initialize the game state
      this.gameState = {
        phase: 'joining', // Current phase of the game
        stateNumber: 0, // Tracks the progression of the game
        players: {}, // Active players
        audience: {}, // Audience members
        submittedPrompts: [], // Prompts submitted during the game
        activePrompts: [], // Prompts used in the current round
        currentPromptIndex: 0, // Index of the current prompt during voting
        answers: {}, // Answers submitted by players
        votes: {}, // Votes cast
        roundScores: {}, // Round scores for players
        totalScores: {}, // Total scores for players
        roundNumber: 1, // Current round number
        totalRounds: 3, // Total number of rounds in the game
        isPaused: false, // Indicates if the game is paused
      };
  
      // Assign the instance
      GameLogic.instance = this;
    }
  
    /**
     * Adds a player to the game.
     * @param {String} username - The player's username.
     * @param {String} socketId - The player's socket ID.
     * @param {Boolean} [isAdmin=false] - Indicates if the player is the admin.
     * @returns {Boolean} - True if player was added, false if username is taken.
     */
    addPlayer(username, socketId, isAdmin = false) {
      if (this.gameState.players[username] || this.gameState.audience[username]) {
        return false; // Username already taken
      }
  
      this.gameState.players[username] = {
        username,
        socketId,
        isAdmin,
        score: 0,
        roundScore: 0,
        assignedPrompts: [],
        state: 'active',
      };
  
      this.gameState.totalScores[username] = 0;
  
      return true;
    }
  
    /**
     * Adds an audience member to the game.
     * @param {String} username - The audience member's username.
     * @param {String} socketId - The audience member's socket ID.
     * @returns {Boolean} - True if audience member was added, false if username is taken.
     */
    addAudience(username, socketId) {
      if (this.gameState.players[username] || this.gameState.audience[username]) {
        return false; // Username already taken
      }
  
      this.gameState.audience[username] = {
        username,
        socketId,
        state: 'active',
      };
  
      return true;
    }
  
    /**
     * Removes a user from the game based on their socket ID.
     * @param {String} socketId - The user's socket ID.
     * @returns {String|null} - The username removed, or null if not found.
     */
    removeUserBySocketId(socketId) {
      // Remove from players
      const playerEntry = Object.values(this.gameState.players).find(
        (p) => p.socketId === socketId
      );
      if (playerEntry) {
        const username = playerEntry.username;
        delete this.gameState.players[username];
        delete this.gameState.totalScores[username];
        delete this.gameState.roundScores[username];
  
        // Reassign admin if necessary
        if (playerEntry.isAdmin) {
          this.assignNewAdmin();
        }
  
        return username;
      }
  
      // Remove from audience
      const audienceEntry = Object.values(this.gameState.audience).find(
        (a) => a.socketId === socketId
      );
      if (audienceEntry) {
        const username = audienceEntry.username;
        delete this.gameState.audience[username];
        return username;
      }
  
      return null;
    }
  
    /**
     * Assigns a new admin if the current admin disconnects.
     */
    assignNewAdmin() {
      const remainingPlayers = Object.values(this.gameState.players);
      if (remainingPlayers.length > 0) {
        remainingPlayers[0].isAdmin = true;
        // Notify the new admin if necessary
        // For example: io.to(newAdmin.socketId).emit('adminAssigned', {...});
      }
    }
  
    /**
     * Checks if a user is already in the game.
     * @param {String} username - The user's username.
     * @returns {Boolean} - True if the user is in the game, false otherwise.
     */
    isUserInGame(username) {
      return (
        this.gameState.players.hasOwnProperty(username) ||
        this.gameState.audience.hasOwnProperty(username)
      );
    }
  
    /**
     * Retrieves the username associated with a given socket ID.
     * @param {String} socketId - The socket ID.
     * @returns {String|null} - The username or null if not found.
     */
    getUsernameBySocketId(socketId) {
      const player = Object.values(this.gameState.players).find(
        (p) => p.socketId === socketId
      );
      if (player) return player.username;
      const audience = Object.values(this.gameState.audience).find(
        (a) => a.socketId === socketId
      );
      return audience ? audience.username : null;
    }
  
    /**
     * Checks if the user associated with the socket ID is the admin.
     * @param {String} socketId - The socket ID.
     * @returns {Boolean} - True if admin, false otherwise.
     */
    isAdmin(socketId) {
      const username = this.getUsernameBySocketId(socketId);
      return username ? this.gameState.players[username].isAdmin : false;
    }
  
    /**
     * Starts the game.
     * Only callable by admin, and only if at least 3 players have joined.
     * @returns {Boolean} - True if game started successfully, false otherwise.
     */
    startGame() {
      if (this.gameState.phase !== 'joining') {
        return false; // Game already started
      }
  
      const numPlayers = this.getTotalPlayers();
      if (numPlayers < 3) {
        return false; // Not enough players to start
      }
  
      // Initialize player states if needed
      Object.values(this.gameState.players).forEach((player) => {
        player.score = 0;
        player.roundScore = 0;
        player.state = 'active';
      });
  
      this.gameState.roundNumber = 1;
      this.gameState.phase = 'prompts';
      this.gameState.stateNumber += 1;
  
      return true;
    }
  
    /**
     * Advances the game to the next phase.
     */
    async advanceGameState() {
      if (this.gameState.isPaused) {
        // Game is paused
        return;
      }
  
      switch (this.gameState.phase) {
        case 'joining':
          this.endJoining();
          await this.startPrompts();
          break;
  
        case 'prompts':
          this.endPrompts();
          await this.startAnswers();
          break;
  
        case 'answers':
          this.endAnswers();
          await this.startVoting();
          break;
  
        case 'voting':
          this.endVoting();
          await this.startResults();
          break;
  
        case 'results':
          this.endResults();
          await this.startScores();
          break;
  
        case 'scores':
          this.endScores();
          if (this.gameState.roundNumber < this.gameState.totalRounds) {
            this.gameState.roundNumber += 1;
            await this.startPrompts();
          } else {
            await this.endGame();
          }
          break;
  
        case 'gameOver':
          // Game is over; no further actions
          break;
  
        default:
          break;
      }
    }
  
    /**
     * Ends the joining phase.
     */
    endJoining() {
      // Initialize all players
      Object.values(this.gameState.players).forEach((player) => {
        player.score = 0;
        player.roundScore = 0;
        player.state = 'active';
      });
      this.gameState.stateNumber += 1;
    }
  
    /**
     * Starts the prompts phase.
     */
    async startPrompts() {
      this.gameState.phase = 'prompts';
      this.gameState.stateNumber += 1;
      this.gameState.activePrompts = [];
      this.gameState.currentPromptIndex = 0;
    }
  
    /**
     * Ends the prompts phase.
     */
    endPrompts() {
      // Prompts have been collected and stored
      this.gameState.stateNumber += 1;
    }
  
    /**
     * Starts the answers phase.
     */
    async startAnswers() {
      this.gameState.phase = 'answers';
      this.gameState.stateNumber += 1;
  
      // Retrieve prompts from the submittedPrompts and an external API
      const apiPrompts = await this.getPromptsFromAPI();
      const numApiPrompts = Math.floor(this.gameState.submittedPrompts.length / 2);
      const selectedApiPrompts = apiPrompts.slice(0, numApiPrompts).map((p) => p.promptText);
  
      // Combine prompts
      const combinedPrompts = [
        ...this.gameState.submittedPrompts.map((p) => p.promptText),
        ...selectedApiPrompts,
      ];
  
      // Shuffle and assign prompts to players
      this.assignPrompts(combinedPrompts);
    }
  
    /**
     * Ends the answers phase.
     */
    endAnswers() {
      // All answers have been collected
      this.gameState.phase = 'voting';
      this.gameState.stateNumber += 1;
    }
  
    /**
     * Starts the voting phase.
     */
    async startVoting() {
      this.gameState.phase = 'voting';
      this.gameState.stateNumber += 1;
      this.gameState.currentPromptIndex = 0;
    }
  
    /**
     * Ends the voting phase.
     */
    endVoting() {
      // Voting completed
      this.gameState.phase = 'results';
      this.gameState.stateNumber += 1;
    }
  
    /**
     * Starts the results phase.
     */
    async startResults() {
      this.gameState.phase = 'results';
      this.gameState.stateNumber += 1;
      this.calculateRoundScores();
    }
  
    /**
     * Ends the results phase.
     */
    endResults() {
      // Round results have been processed
      this.gameState.phase = 'scores';
      this.gameState.stateNumber += 1;
    }
  
    /**
     * Starts the scores phase.
     */
    async startScores() {
      this.gameState.phase = 'scores';
      this.gameState.stateNumber += 1;
      this.updateTotalScores();
    }
  
    /**
     * Ends the scores phase.
     */
    endScores() {
      // Scores have been updated
      this.gameState.stateNumber += 1;
    }
  
    /**
     * Ends the game.
     */
    async endGame() {
      this.gameState.phase = 'gameOver';
      this.gameState.stateNumber += 1;
    }
  
    /**
     * Assigns prompts to players based on number of players and prompts.
     * For even number of players: Each prompt is assigned to 2 players.
     * For odd number of players: Each player is assigned 2 prompts per round,
     * and prompts are shared among players accordingly.
     * @param {Array} prompts - Array of prompt texts.
     */
    assignPrompts(prompts) {
      const players = Object.keys(this.gameState.players);
      const numPlayers = players.length;
      const isEven = numPlayers % 2 === 0;
  
      let numberOfPrompts;
      if (isEven) {
        numberOfPrompts = numPlayers / 2; // Each prompt assigned to 2 players
      } else {
        numberOfPrompts = numPlayers; // Each prompt assigned to 2 players, overlapping
      }
  
      // Select the required number of prompts
      const selectedPrompts = prompts.slice(0, numberOfPrompts);
  
      // Assign prompts to players
      selectedPrompts.forEach((promptText, index) => {
        const promptId = `prompt_${this.gameState.roundNumber}_${index}`;
        let assignedPlayers = [];
  
        if (isEven) {
          // Assign to two consecutive players
          const player1 = players[index % numPlayers];
          const player2 = players[(index + 1) % numPlayers];
          assignedPlayers = [player1, player2];
        } else {
          // For odd number of players, assign prompts in a way that players get 2 prompts
          // Example for 3 players:
          // Prompt1: Player1, Player2
          // Prompt2: Player1, Player3
          // Prompt3: Player2, Player3
          const player1 = players[index % numPlayers];
          const player2 = players[(index + index + 1) % numPlayers];
          assignedPlayers = [player1, player2];
        }
  
        const prompt = {
          id: promptId,
          text: promptText,
          assignedPlayers: assignedPlayers,
        };
        this.gameState.activePrompts.push(prompt);
  
        // Assign prompt to players
        assignedPlayers.forEach((username) => {
          const player = this.gameState.players[username];
          if (!player.assignedPrompts) {
            player.assignedPrompts = [];
          }
          player.assignedPrompts.push(prompt);
        });
      });
    }
  
    /**
     * Shuffles an array using the Fisher-Yates algorithm.
     * @param {Array} array - The array to shuffle.
     * @returns {Array} - The shuffled array.
     */
    shuffleArray(array) {
      const newArray = array.slice();
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    }
  
    /**
     * Calculates round scores based on votes.
     */
    calculateRoundScores() {
      const roundNumber = this.gameState.roundNumber;
  
      // Initialize round scores
      Object.keys(this.gameState.players).forEach((username) => {
        this.gameState.players[username].roundScore = 0;
      });
  
      // For each prompt, calculate scores
      this.gameState.activePrompts.forEach((prompt) => {
        const answers = this.gameState.answers[prompt.id] || [];
        const votes = this.gameState.votes[prompt.id] || {};
  
        answers.forEach((answer) => {
          const voteCount = votes[answer.username] ? votes[answer.username].size : 0;
          const points = roundNumber * voteCount * 100;
          this.gameState.players[answer.username].roundScore += points;
        });
      });
    }
  
    /**
     * Updates total scores by adding round scores.
     */
    updateTotalScores() {
      Object.keys(this.gameState.players).forEach((username) => {
        const player = this.gameState.players[username];
        player.score += player.roundScore;
        player.roundScore = 0; // Reset round score
        this.gameState.totalScores[username] = player.score;
      });
    }
  
    /**
     * Placeholder for fetching prompts from an external API.
     * @returns {Array} - Array of prompt objects with promptText.
     */
    async getPromptsFromAPI() {
      // Implement your logic to fetch prompts from an external API or generate them internally
      // For demonstration, returning a static array of prompt objects
      return [
        { promptText: 'What is your favorite childhood memory?' },
        { promptText: 'Describe a place you would love to visit.' },
        { promptText: 'What invention would make your life easier?' },
        { promptText: 'If you could have dinner with anyone, who would it be?' },
        { promptText: 'What is your biggest fear and why?' },
        { promptText: 'Share a unique talent you possess.' },
      ];
    }
  
    /**
     * Placeholder for saving a prompt via an external API.
     * @param {String} username - The user's username.
     * @param {String} promptText - The prompt text.
     */
    async savePrompt(username, promptText) {
      // Implement your logic to save the prompt to a database or external service
      // For demonstration, simply returning a resolved promise
      return Promise.resolve();
    }
  
    /**
     * Retrieves the current game state.
     * @returns {Object} - The current game state.
     */
    getGameState() {
      // Return a copy to prevent external mutations
      return JSON.parse(JSON.stringify(this.gameState));
    }
  
    /**
     * Retrieves a player's specific state.
     * @param {String} username - The player's username.
     * @returns {Object|null} - The player's state or null if not found.
     */
    getPlayerState(username) {
      const player = this.gameState.players[username];
      if (player) {
        return {
          username: player.username,
          isAdmin: player.isAdmin,
          score: player.score,
          roundScore: player.roundScore,
          assignedPrompts: player.assignedPrompts.map((p) => ({
            promptId: p.id,
            promptText: p.text,
          })),
          state: player.state,
        };
      }
      const audience = this.gameState.audience[username];
      if (audience) {
        return {
          username: audience.username,
          state: audience.state,
        };
      }
      return null;
    }
  
    /**
     * Gets the total number of players.
     * @returns {Number} - The number of players.
     */
    getTotalPlayers() {
      return Object.keys(this.gameState.players).length;
    }
  }
  
  // Export the singleton instance
  const instance = new GameLogic();
  Object.freeze(instance); // Prevent modifications to the instance
  
  module.exports = instance;  