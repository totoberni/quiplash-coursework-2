// server/controllers/voteController.js

const gameLogic = require('../utils/gameLogic');

module.exports = {
  /**
   * Handles vote casting from players/audience.
   * @param {Socket} socket - The client's socket.
   * @param {Object} data - Vote data containing username, promptId, and selectedAnswerUsername.
   * @param {Object} io - Socket.IO server instance.
   */
  handleVote(socket, data, io) {
    const { username, promptId, selectedAnswerUsername } = data;

    const voter = gameLogic.gameState.players[username] || gameLogic.gameState.audience[username];

    if (!voter) {
      socket.emit('error', { message: 'User not found.' });
      return;
    }

    // Prevent self-voting
    const prompt = gameLogic.gameState.activePrompts.find((p) => p.id === promptId);
    if (!prompt) {
      socket.emit('error', { message: 'Prompt not found.' });
      return;
    }

    if (prompt.assignedPlayers.includes(username)) {
      socket.emit('error', { message: 'You cannot vote on your own prompt.' });
      return;
    }

    const answers = gameLogic.gameState.answers[promptId] || [];
    const selectedAnswer = answers.find((ans) => ans.username === selectedAnswerUsername);
    if (!selectedAnswer) {
      socket.emit('error', { message: 'Selected answer does not exist for this prompt.' });
      return;
    }

    // Initialize votes for the prompt and answer if not present
    if (!gameLogic.gameState.votes[promptId]) {
      gameLogic.gameState.votes[promptId] = {};
    }
    if (!gameLogic.gameState.votes[promptId][selectedAnswerUsername]) {
      gameLogic.gameState.votes[promptId][selectedAnswerUsername] = new Set();
    }

    // Check if the voter has already voted for this prompt
    const hasVoted = Object.values(gameLogic.gameState.votes[promptId]).some((votersSet) =>
      votersSet.has(username)
    );
    if (hasVoted) {
      socket.emit('error', { message: 'You have already voted on this prompt.' });
      return;
    }

    // Record the vote
    gameLogic.gameState.votes[promptId][selectedAnswerUsername].add(username);

    // Update voter's state if necessary
    voter.state = 'voted';

    // Notify that the user has voted
    io.emit('message', { message: `${username} has voted.` });

    // Notify player that their vote was received
    socket.emit('voteResult', { success: true, message: 'Vote cast successfully.' });

    // Check if all voters have voted
    const totalVoters =
      Object.keys(gameLogic.gameState.players).length +
      Object.keys(gameLogic.gameState.audience).length;

    const totalVotes = Object.values(gameLogic.gameState.votes[promptId]).reduce(
      (acc, votersSet) => acc + votersSet.size,
      0
    );

    if (totalVotes >= totalVoters) {
      // All votes are in, proceed to results
      gameLogic.advanceGameState(io);
    }
  },
};