# Complete Development Pipeline for Web Development Project

1. Server Setup and Basics
a. Clone and Set Up the Template Application
Action: Clone the provided template application using Git.
bash
Copy code
git clone https://git.soton.ac.uk/comp3207/coursework1-2.git
Goal: Establish a working baseline with Express, Socket.IO, and static file handling.
Testing Consideration: No changes needed for tests in this section.
b. Install Dependencies and Verify Local Execution
Action:
Run npm install to install all dependencies.
Start the server locally with npm start and ensure it runs without errors.
Goal: Ensure the server and client can communicate locally.
c. Deploy to Cloud Platforms
Action: Deploy the server to Google App Engine using npm run gdeploy or to Heroku using npm run hdeploy.
Goal: Verify that the server runs correctly in the cloud environment.

2. Integrate Backend API Calls
a. Implement API Wrapper Functions with Validation
Action:
Create functions in the server code to interact with the Azure Functions API from Part 1.
Implement the following endpoints:
player/register
player/login
prompt/create
utils/get
Use axios or node-fetch to make HTTP requests.
Include validation checks and error handling to capture invalid inputs.
Goal: Enable the server to perform player registration, login, prompt submission, and prompt retrieval via API calls.
Testing Considerations:
Test 1.1 & 1.5: Ensure users cannot register or login with invalid usernames or passwords.
b. Handle Asynchronous API Calls Properly
Action: Use async/await or Promise chaining to manage asynchronous operations.
Goal: Ensure that API responses are correctly handled before proceeding in the game logic.
Testing Consideration: Provide meaningful feedback to clients when registration or login fails.
c. Validate API Responses
Action: Check API responses for success or failure and handle errors appropriately.
Goal: Maintain robustness and provide meaningful feedback to clients.

3. Define Game and Player State Management
a. Establish Server-Side State Variables
Action: Define data structures to hold:
Game State: Current phase of the game (e.g., Joining, Prompt Collection, Answer Submission, Voting, Results, Scores, Game Over).
Players: List of connected players with their details (username, score, state).
Audience Members: List of audience participants.
Prompts: Active prompts for the game.
Answers: Players' answers to prompts.
Votes: Votes cast by players and audience members.
Scores: Round and total scores for each player.
Goal: Centralize all game-related data on the server for easy management.
b. Implement Player States
Action: Define player-specific states to track their progress through the game phases.
Goal: Personalize the game flow for each player based on their actions.
c. Limit Number of Players and Manage Audience
Action:
Enforce a maximum of 8 players; any additional participants become audience members.
Modify player joining logic to enforce audience limits and roles.
Goal: Adhere to game design constraints and ensure proper role assignment.
Testing Considerations:
Test 2.5 & 4.1: Users joining after the player limit is reached become audience members.

4. Implement Socket.IO Event Handlers
a. Set Up Event Listeners with Validation
Action: Implement socket.on listeners for events:
'register'
'login'
'prompt'
'answer'
'vote'
'next' (or 'advance')
Goal: Receive and process messages from clients.
Testing Considerations:
Test 1.1 & 1.3: Prevent registration with invalid credentials or existing usernames.
b. Create Corresponding Handler Functions
Action: For each event, define a handler function (e.g., handleRegister, handleLogin, handlePrompt).
Goal: Structure the code for readability and maintainability.
c. Emit Events to Clients and Handle Errors
Action:
Use socket.emit and io.emit to send updates to individual clients or all connected clients.
Emit appropriate error events to clients using socket.emit('fail', message) when registration or login fails.
Goal: Keep clients in sync with the game state and provide clear feedback for corrective actions.

5. Implement Player Registration and Login
a. Handle Registration Requests with Validation
Action:
In handleRegister, receive username and password from the client.
Validate the username and password according to specified criteria (e.g., minimum length).
Check if the username already exists before attempting to register.
Call the player/register API endpoint.
Provide feedback to the client based on API response.
Goal: Allow new players to create accounts.
Testing Considerations:
Test 1.1: Prevent registration with invalid usernames or passwords.
Test 1.3: Prevent registration with an existing username.
b. Handle Login Requests with Validation
Action:
In handleLogin, receive username and password from the client.
Validate credentials before attempting to log in.
Call the player/login API endpoint.
On successful login:
Add the player to the game state.
Assign them a socket ID for communication.
If the game has already started or the player limit is reached, add them to the audience.
Goal: Authenticate players correctly and integrate them into the game.
Testing Considerations:
Test 1.5: Prevent login with invalid credentials.
Test 2.2: Ensure the admin player can join and is recognized as the admin.

6. Manage Game State Transitions
a. Define Game Phases
Phases:
Joining: Waiting for players to join.
Prompt Collection: Collect prompts from players and audience.
Answer Submission: Players submit answers to prompts.
Voting: Players and audience vote on answers.
Results: Display voting results for each prompt.
Scores: Display cumulative scores after each round.
Game Over: Display final scores and winner.
b. Implement State Transition Functions
Action: Create functions like startJoining, endJoining, startPromptCollection, etc.
Goal: Control the flow of the game through different phases.
c. Advance Game State and Implement Start Conditions
Action:
Implement a handleNext function that advances the game state when triggered by the admin.
Modify the game start logic to begin automatically after at least 3 players have joined or allow the admin to start the game manually.
Goal: Provide flexibility in starting the game while ensuring minimum player requirements.
Testing Considerations:
Test 2.4: The game begins after 3 players have joined and the admin can start the game.

7. Prompt Collection Phase
a. Collect Prompts from Participants Anytime
Action:
Allow both players and audience members to submit prompts at any point during the game.
In handlePrompt, accept prompt submissions regardless of the current game phase.
Goal: Collect prompts continuously for use in the current and future games.
Testing Considerations:
Test 2.6 & 2.7: Players and audience members can submit game prompts at any time.
b. Store and Display Prompts
Action:
Store submitted prompts locally and send them to the prompt/create API endpoint.
Update the display client to show the number of prompts submitted and by whom.
Goal: Provide feedback to participants that their prompts have been received.
c. End of Prompt Collection
Action: When the Prompt Collection phase ends, compile the list of prompts submitted.
Goal: Prepare prompts for assignment to players in the next phase.

8. Answer Submission Phase
a. Retrieve Past Prompts
Action:
Call the utils/get API endpoint to retrieve past prompts.
Ensure prompts are in the language suitable for the game.
Goal: Obtain existing prompts to use in the game.
b. Combine Prompts
Action: Create a list of prompts for the game, consisting of 50% past prompts and 50% new prompts.
Goal: Mix prompts for variety.
Testing Consideration:
Test 5.1: Ensure that 50% of game prompts are from players/audience.
c. Assign Prompts to Players
Action:
Assign 1-2 prompts to each player, each shared with one other player.
Ensure fair distribution and that players do not receive their own prompts.
Goal: Set up the prompts for which players will submit answers.
d. Handle Answer Submissions
Action:
In handleAnswer, receive answers from players.
Store answers in the game state.
Advance the player's state when they have submitted all required answers.
Goal: Collect all answers to proceed to the Voting phase.
Testing Consideration:
Test 3.1: Ensure players can submit answers to game prompts.

9. Voting Phase
a. Display Prompts and Answers
Action: For each prompt, display the prompt and the two submitted answers to all players and audience members.
Goal: Facilitate the voting process.
Testing Consideration:
Test 3.4: Ensure results are shown for each prompt, answer, and its votes.
b. Prevent Self-Voting
Action: Modify handleVote to prevent players from voting on prompts where they submitted an answer.
Goal: Maintain fairness in voting.
Testing Consideration:
Test 3.2: Prevent players from voting on their own prompts.
c. Collect Votes from Players and Audience
Action:
Accept votes from both players and audience members.
Ensure that votes are collected for all prompts in the round.
Advance player state after voting.
Goal: Gather all votes needed to determine results.
Testing Considerations:
Test 3.3: Ensure audience members can vote on answers.
d. Handle End of Voting
Action: Once all votes are collected for a prompt, calculate the votes for each answer.
Goal: Prepare data for displaying voting results.

10. Display Voting Results
a. Show Prompt, Answers, Authors, and Votes
Action: Update the display client to show the prompt, both answers, reveal which players submitted them, and display the number of votes each answer received.
Goal: Provide transparency and recognition.
Testing Considerations:
Test 3.4: Ensure results are displayed correctly for each prompt.
b. Calculate Round Scores Accurately
Action:
Implement the scoring formula:
mathematica
Copy code
Points = Round Number × Number of Votes × 100
Update round scores for each player accordingly.
Goal: Reward players based on their performance.
Testing Considerations:
Test 3.5 & 6.1: Ensure round scores are calculated correctly, even when scores are equal.

11. Display Total Scores
a. Aggregate Scores
Action: Sum up the round scores to update total scores for each player.
Goal: Keep track of cumulative performance.
b. Update and Display Leaderboard
Action:
Display the leaderboard, showing players ranked by their total scores.
Ensure players with equal scores are displayed in alphabetical order.
Goal: Inform players of their standings.
Testing Considerations:
Test 3.6: Ensure the final score table is produced and displayed correctly.
Test 3.5 & 3.8: Verify that specific players have correct scores and ordering.

12. Handle Game Over State
a. Implement Round Limit Logic
Action:
Set up the game to end after a specified number of rounds (e.g., three rounds).
After each round, determine if more rounds are left.
Goal: Decide whether to start a new round or end the game.
Testing Considerations:
Test 3.7 & 3.8: Ensure the game repeats rounds appropriately and ends after the final round.
b. Display Final Results
Action: If no more rounds are left, display the final leaderboard and declare the winner.
Goal: Conclude the game satisfactorily.

13. Client-Side Implementation
a. Interactive Client (Player Interface)
Technologies: VueJS, JavaScript
b. Implement Views and Components
Action: Create Vue components for each game phase:
Joining: Username/password input, login, and registration buttons.
Prompt Collection: Prompt submission form.
Answer Submission: Display assigned prompts and input fields for answers.
Voting: Display prompts and answers for voting.
Results: Show voting results for each prompt.
Scores: Display the leaderboard.
Game Over: Show final scores and winner.
Goal: Provide a dynamic and interactive user experience.
Testing Considerations:
Tests 1.2, 1.4, & 2.2: Ensure players can register, login, and join as either players or audience members.
Tests 2.6, 2.7, 3.1, 3.2, & 3.3: Ensure players and audience can submit prompts, answers, and votes as required.
c. Handle User Actions
Action: Implement methods to send events to the server via socket.emit.
Examples: register(), login(), submitPrompt(), submitAnswer(), castVote().
Goal: Facilitate communication between client and server.
d. Update Client State Based on Server Messages
Action: Use socket.on to receive updates from the server and modify client state accordingly.
Goal: Keep the client interface in sync with the game state.
e. Display Client Enhancements
Action:
Update the display client to show the number of prompts submitted and by whom.
Show the game loop waiting for players, including the URL and QR code.
Goal: Provide a central display that meets all test criteria.
Testing Considerations:
Test 2.1: Ensure the display shows the game loop waiting for players to join, with the URL and QR code.

14. Display Client Implementation
a. Master Display Interface
Technologies: VueJS, JavaScript
b. Implement Views for Each Game Phase
Action: Create components to display:
Waiting for Players: List of joined players and joining instructions.
Prompt Collection: Number of prompts submitted and by whom.
Answer Submission: Indicate which players have submitted answers.
Voting: Show the prompt and both answers without revealing authors.
Results: Display prompt, answers, authors, and votes received.
Scores: Show the leaderboard.
Game Over: Display final results and the podium.
Goal: Provide a central display for all participants.
c. Receive Updates from Server
Action: Use socket.on to receive game state updates and render accordingly.
Goal: Ensure real-time synchronization.

15. Relaying Game State
a. Update Individual Players
Action: Implement updatePlayer function on the server to send personalized game state to each player.
Goal: Provide player-specific information (e.g., assigned prompts).
b. Update All Participants
Action: Implement updateAll function to broadcast game state changes to all clients.
Ensure audience members receive prompts for voting but not for answering.
Goal: Keep everyone informed of the game's progress.
Testing Considerations:
Test 2.5 & 4.1: Ensure audience members have limited interactions compared to players.

16. Error Handling and Validation
a. Implement Error Handling Functions
Action: Create functions to handle errors and send appropriate feedback to clients.
Goal: Improve user experience by providing clear error messages.
b. Validate Inputs Rigorously
Action:
On both client and server sides, validate user inputs (e.g., prompt lengths, answer submissions).
Prevent invalid data from disrupting the game.
Goal: Ensure data integrity and prevent errors.
Testing Considerations:
Tests 1.1 & 1.5: Prevent invalid usernames and passwords during registration and login.
c. Handle Disconnections Gracefully
Action: Implement logic to handle player disconnections without compromising game integrity.
Goal: Maintain game integrity even if players drop out.

17. Testing and Debugging
a. Use Provided Test Suite Extensively
Action:
Download and run the test suite provided in the template.
Access the tester homepage at http://localhost:8181.
Goal: Validate the functionality and correctness of the implementation.
Testing Coverage:
Registration and Login Tests (1.1 - 1.5)
Game Start Up Tests (2.1 - 2.7)
Game Round Tests (3.1 - 3.8)
9th Player Audience Test (4.1)
50% Prompts Test (5.1)
4 Players Test (6.1)
b. Perform Unit and Integration Tests
Action: Write additional tests to cover various scenarios and edge cases.
Goal: Ensure robustness and reliability.
c. Manual Testing
Action: Simulate game scenarios with the specified number of players and actions.
Goal: Ensure real-world usage aligns with test expectations.
d. Debug and Fix Issues
Action: Use debugging tools and logs to identify and resolve errors.
Goal: Achieve a smooth and error-free game experience.
Testing Consideration: Address any test failures by debugging and correcting code.

18. Deployment and Finalization
a. Prepare for Deployment
Action: Ensure the application can be started with npm start.
Goal: Meet the technical requirements for deployment.
b. Deploy to Cloud Platforms
Action: Use npm run gdeploy or npm run hdeploy to deploy the application.
Goal: Make the game accessible to users.
c. Verify Deployed Application
Action:
Test the deployed application to ensure all functionalities work as expected.
Run through all tests on the deployed application to ensure consistency.
Goal: Confirm that the deployment was successful and did not introduce new issues.

19. Documentation and Code Quality
a. Comment Code Thoroughly
Action:
Add comments to explain complex logic and important sections.
Include comments explaining how code changes relate to specific tests.
Goal: Improve code readability and maintainability.
b. Follow Coding Standards
Action: Adhere to best practices for JavaScript and VueJS coding.
Goal: Ensure consistent and clean code.
c. Update README with Test Information
Action:
Provide instructions on how to run and deploy the application.
Document how each test case has been addressed in the README file.
Goal: Facilitate understanding for users and evaluators.

20. Final Review and Submission
a. Cross-Check Requirements and Test Coverage
Action:
Revisit the Part 2 specification and ensure all functional and technical requirements are met.
Revisit each test case and confirm that the application behavior aligns with expectations.
Goal: Avoid missing any critical features and ensure comprehensive test coverage.
b. Ensure Compliance with API Specification
Action: Verify that all API interactions conform exactly to the Part 1 specification.
Goal: Ensure compatibility with the testing environment.
c. Prepare Demonstration Scenarios
Action:
Set up scenarios to showcase all features during evaluation.
Demonstrate passing each test during evaluation.
Goal: Effectively demonstrate the application's compliance and capabilities.
Summary of Test Cases Addressed in the Pipeline
Registration and Login Tests (1.1 - 1.5): Implement input validation and error handling to prevent invalid registrations and logins.
Game Start Up Tests (2.1 - 2.7): Ensure the display shows the correct information, players can join, and the game starts appropriately.
Game Round Tests (3.1 - 3.8): Implement correct answer submission, voting logic, result display, and scoring calculations.
9th Player Audience Test (4.1): Enforce player limits and assign additional users to the audience role.
50% Prompts Test (5.1): Use a mix of API and player-submitted prompts in the game.
4 Players Test (6.1): Handle scenarios with 4 players, ensuring correct score calculations and display order when scores are equal.
