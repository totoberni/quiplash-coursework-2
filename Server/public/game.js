// public/game.js

const socket = io();

// VueJS application for the client
new Vue({
  el: '#game',
  data: {
    // Connection and Authentication
    connected: false,
    username: '',
    password: '',
    isLoggedIn: false,
    isAdmin: false,
    isAudience: false,

    // Feedback Messages
    message: '',
    error: '',

    // Game-specific Data
    phase: 'joining', // Current phase of the game
    stateNumber: 0, // Tracks the progression of the game
    players: [], // List of players
    audience: [], // List of audience members
    prompts: [], // List of prompts submitted
    promptCount: 0, // Number of prompts submitted
    promptsBy: [], // List of who submitted prompts
    assignedPrompts: [], // Prompts assigned to the current user
    currentVotingPrompt: null, // The prompt currently being voted on
    votingAnswers: [], // Answers available for voting
    roundResults: [], // Results of the current round
    leaderboard: [], // Current leaderboard standings
    finalPodium: [], // Final podium standings

    // Chat Data
    chatMessages: [],
    newChatMessage: '',

    // Prompt Submission
    newPrompt: '',

    // Answer Submission
    answers: {}, // User's answers keyed by promptId

    // Admin Controls
    playerToKick: '', // Username of the player to kick
  },
  mounted() {
    this.setupSocketListeners();
  },
  methods: {
    /**
     * Sets up all Socket.IO event listeners.
     */
    setupSocketListeners() {
      // Connection Events
      socket.on('connect', () => {
        this.connected = true;
        this.message = 'Connected to the server.';
        this.error = '';
      });

      socket.on('disconnect', () => {
        this.connected = false;
        this.isLoggedIn = false;
        this.error = 'Disconnected from server.';
        this.message = '';
      });

      // Authentication Results
      socket.on('registerResult', (data) => {
        if (data.success) {
          this.isLoggedIn = true;
          this.isAdmin = data.isAdmin;
          this.message = data.message;
          this.error = '';
          // Optionally, redirect to game view or update UI
        } else {
          this.error = data.message;
          this.message = '';
        }
      });

      socket.on('loginResult', (data) => {
        if (data.success) {
          this.isLoggedIn = true;
          this.isAdmin = data.isAdmin;
          this.isAudience = data.isAudience || false;
          this.message = data.message;
          this.error = '';
          // Optionally, redirect to game view or update UI
        } else {
          this.error = data.message;
          this.message = '';
        }
      });

      // Prompt Submission Results
      socket.on('promptResult', (data) => {
        if (data.success) {
          this.message = data.message;
          this.error = '';
        } else {
          this.error = data.message;
          this.message = '';
        }
      });

      // Answer Submission Results
      socket.on('answerResult', (data) => {
        if (data.success) {
          this.message = data.message;
          this.error = '';
        } else {
          this.error = data.message;
          this.message = '';
        }
      });

      // Vote Casting Results
      socket.on('voteResult', (data) => {
        if (data.success) {
          this.message = data.message;
          this.error = '';
        } else {
          this.error = data.message;
          this.message = '';
        }
      });

      // Prompt Submission Interface
      socket.on('submitAnswers', (data) => {
        this.assignedPrompts = data.prompts;
        // Initialize answers object for assigned prompts
        data.prompts.forEach(prompt => {
          if (!this.answers[prompt.promptId]) {
            this.$set(this.answers, prompt.promptId, '');
          }
        });
        this.message = 'Please submit your answers.';
        this.error = '';
      });

      // Voting Phase Initiation
      socket.on('startVoting', (data) => {
        this.currentVotingPrompt = {
          id: data.promptId,
          text: data.promptText
        };
        this.votingAnswers = data.answers;
        this.message = `Voting has started for prompt: "${data.promptText}"`;
        this.error = '';
      });

      // Round Results
      socket.on('roundResults', (data) => {
        this.roundResults = data.results;
        this.message = 'Round results are available.';
        this.error = '';
      });

      // Leaderboard Updates
      socket.on('leaderboard', (data) => {
        this.leaderboard = data.leaderboard;
        this.message = 'Leaderboard updated.';
        this.error = '';
      });

      // Final Podium Announcement
      socket.on('finalPodium', (data) => {
        this.finalPodium = data.podium;
        this.message = 'Game Over! Final Podium.';
        this.error = '';
      });

      // General Game State Updates
      socket.on('gameStateUpdate', (data) => {
        this.phase = data.phase;
        this.stateNumber = data.stateNumber;
        this.players = data.players;
        this.audience = data.audience;
        this.leaderboard = data.totalScores; // Adjust based on actual data structure
        // Update other state as necessary
      });

      // Prompt Count and Details Update
      socket.on('promptCountUpdate', (data) => {
        this.promptCount = data.promptCount;
        this.promptsBy = data.promptsBy;
        this.message = `Total Prompts Submitted: ${data.promptCount}`;
        this.error = '';
      });

      // Chat Messages
      socket.on('chatMessage', (chat) => {
        this.chatMessages.push(chat);
        // Optionally, scroll the chat box to the latest message
      });

      // Transient Messages (e.g., user actions)
      socket.on('message', (data) => {
        this.message = data.message;
        // Optionally, display transient messages (e.g., user actions)
      });

      // Phase Change Notifications
      socket.on('phaseChange', (data) => {
        this.handlePhaseChange(data);
      });

      // Error Messages
      socket.on('error', (data) => {
        this.error = data.message;
        this.message = '';
      });
    },

    /**
     * Registers a new user via Socket.IO
     */
    register() {
      if (!this.username || !this.password) {
        this.error = 'Username and password are required for registration.';
        return;
      }
      socket.emit('register', {
        username: this.username.trim(),
        password: this.password.trim(),
      });
      // Optionally, clear password field after submission
      this.password = '';
    },

    /**
     * Logs in an existing user via Socket.IO
     */
    login() {
      if (!this.username || !this.password) {
        this.error = 'Username and password are required for login.';
        return;
      }
      socket.emit('login', {
        username: this.username.trim(),
        password: this.password.trim(),
      });
      // Optionally, clear password field after submission
      this.password = '';
    },

    /**
     * Submits a new prompt to the server via Socket.IO
     */
    submitPrompt() {
      if (!this.newPrompt) {
        this.error = 'Prompt is required.';
        return;
      }
      socket.emit('prompt', {
        username: this.username,
        prompt: this.newPrompt.trim(),
      });
      this.newPrompt = ''; // Clear input after submission
    },

    /**
     * Submits an answer for a given prompt via Socket.IO
     * @param {String} promptId - The ID of the prompt being answered.
     */
    submitAnswer(promptId) {
      const answerText = this.answers[promptId];
      if (!answerText) {
        this.error = 'Answer is required.';
        return;
      }
      socket.emit('answer', {
        username: this.username,
        promptId,
        answerText: answerText.trim(),
      });
      // Optionally, clear the answer input
      this.answers[promptId] = '';
    },

    /**
     * Casts a vote for a specific answer via Socket.IO
     * @param {String} promptId - The ID of the prompt being voted on.
     * @param {String} selectedAnswerUsername - The username of the player whose answer is being voted for.
     */
    castVote(promptId, selectedAnswerUsername) {
      socket.emit('vote', {
        username: this.username,
        promptId,
        selectedAnswerUsername,
      });
    },

    /**
     * Sends a new chat message via Socket.IO
     */
    sendChatMessage() {
      if (!this.newChatMessage.trim()) {
        return;
      }
      socket.emit('chatMessage', {
        username: this.username,
        message: this.newChatMessage.trim(),
      });
      this.newChatMessage = ''; // Clear chat input after sending
    },

    /**
     * Handles phase change events.
     * @param {Object} data - Contains the new phase and state number.
     */
    handlePhaseChange(data) {
      this.phase = data.phase;
      this.stateNumber = data.stateNumber;
      // Reset or initialize data as needed based on phase
      // For example, clear answers or reset voting data
      if (data.phase === 'voting') {
        this.votingAnswers = [];
        this.currentVotingPrompt = null;
      }
      if (data.phase === 'gameOver') {
        // Handle game over UI changes
      }
    },

    /**
     * Admin method to start the game via Socket.IO
     */
    startGame() {
      if (this.isAdmin) {
        socket.emit('advance', { action: 'startGame' });
      } else {
        this.error = 'Only the admin can start the game.';
      }
    },

    /**
     * Admin method to pause the game via Socket.IO
     */
    pauseGame() {
      if (this.isAdmin) {
        socket.emit('advance', { action: 'pauseGame' });
      } else {
        this.error = 'Only the admin can pause the game.';
      }
    },

    /**
     * Admin method to resume the game via Socket.IO
     */
    resumeGame() {
      if (this.isAdmin) {
        socket.emit('advance', { action: 'resumeGame' });
      } else {
        this.error = 'Only the admin can resume the game.';
      }
    },

    /**
     * Admin method to reset the game via Socket.IO
     */
    resetGame() {
      if (this.isAdmin) {
        socket.emit('advance', { action: 'resetGame' });
      } else {
        this.error = 'Only the admin can reset the game.';
      }
    },

    /**
     * Admin method to kick a player from the game via Socket.IO
     * @param {String} playerUsername - The username of the player to be kicked.
     */
    kickPlayer(playerUsername) {
      if (this.isAdmin) {
        if (!playerUsername) {
          this.error = 'Player username is required to kick.';
          return;
        }
        socket.emit('kickPlayer', { username: this.username, playerUsername });
        this.playerToKick = ''; // Clear input after kicking
      } else {
        this.error = 'Only the admin can kick players.';
      }
    },
  },
});