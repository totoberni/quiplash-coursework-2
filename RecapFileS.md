1. Project Recap
Overview: The project is a two-part web application development endeavor aimed at creating a multiplayer game similar to Quiplash.

Part 1: Backend Implementation

Technologies Used:
Azure Functions (v2) with Python for serverless backend logic.
CosmosDB as the persistence layer for storing player profiles and prompts.
Functionalities Implemented:
Player Management: Registration, login, and profile updates.
Prompt Management: Creation, deletion, and retrieval of game prompts.
Game Utilities: Suggestion of prompts using Azure OpenAI services and generation of leaderboards.
Deployment: The backend is deployed on Azure, ensuring all APIs are accessible and functional as per the specifications.
Part 2: Frontend and Game Logic Implementation

Technologies Used:
NodeJS and Express for the server.
Socket.IO for real-time WebSocket communication.
VueJS and JavaScript for building interactive client interfaces.
Google App Engine and/or Heroku for deploying the server.
Functionalities to Implement:
Client Interfaces:
Player Client: For individual player interactions such as registering, logging in, submitting prompts, answers, and voting.
Display Client: A master display for showcasing game progress, prompts, answers, voting results, and leaderboards to all participants.
Game State Management: Maintaining and transitioning game states across rounds, handling player and audience interactions, and updating scores.
Integration with Part 1 APIs: Leveraging the backend APIs for user authentication, prompt management, and leaderboard generation.
Deployment: The frontend and server are to be deployed on platforms like Google App Engine or Heroku, ensuring seamless interaction between clients and the server.
Project Structure:

Backend (Part 1): Azure Functions handling API endpoints.
Frontend (Part 2): NodeJS server managing game logic and client-server communication, VueJS-based client interfaces for players and display.
2. Detailed Pipeline of Operations
To successfully achieve the project specifications for Part 2, follow the pipeline below:

A. Preparation and Initial Setup
Clone the Template Application:
bash
Copy code
git clone https://git.soton.ac.uk/comp3207/coursework1-2.git
Install Dependencies:
bash
Copy code
cd coursework1-2
npm install
Verify Initial Functionality:
Run the application locally using:
bash
Copy code
npm start
Ensure both client and display interfaces are accessible and the chat functionality works as expected.
B. File Structure Enhancement
Current Project Structure:

css
Copy code
root/
│
├── node_modules/
├── public/
│   ├── auth.js
│   ├── background.jpg
│   ├── game.js
│   └── main.css
├── views/
│   ├── chat.ejs
│   ├── client.ejs
│   ├── display.ejs
│   ├── footer.ejs
│   └── header.ejs
├── app.js
├── app.yaml
├── package-lock.json
├── package.json
├── Procfile
└── test_app.py
Final Project Structure (After Enhancements):

perl
Copy code
root/
│
├── node_modules/
├── public/
│   ├── auth.js
│   ├── background.jpg
│   ├── game.js
│   ├── main.css
│   ├── client.js                # New: Client-side game logic
│   ├── display.js               # New: Display client-side logic
│   └── assets/                  # New: Directory for images, icons, etc.
│       ├── logo.png
│       └── ...
├── views/
│   ├── chat.ejs
│   ├── client.ejs
│   ├── display.ejs
│   ├── footer.ejs
│   ├── header.ejs
│   ├── lobby.ejs                # New: Lobby view for waiting players
│   ├── game.ejs                 # New: Main game view
│   └── results.ejs              # New: Results and leaderboard view
├── server/
│   ├── controllers/             # New: Logic for handling different game actions
│   │   ├── authController.js
│   │   ├── promptController.js
│   │   ├── gameController.js
│   │   └── voteController.js
│   ├── models/                  # New: Data models for game state
│   │   ├── playerModel.js
│   │   ├── promptModel.js
│   │   └── gameStateModel.js
│   ├── routes/                  # New: API routes
│   │   ├── authRoutes.js
│   │   ├── promptRoutes.js
│   │   └── gameRoutes.js
│   ├── utils/                   # New: Utility functions
│   │   ├── socketUtils.js
│   │   ├── apiUtils.js
│   │   └── gameLogic.js
│   └── server.js                # New: Enhanced server setup
├── app.js
├── app.yaml
├── package-lock.json
├── package.json
├── Procfile
└── test_app.py
C. Creating and Editing Files
1. Public Folder Enhancements
Create New Files:

client.js: Handles client-side game interactions (e.g., submitting prompts, answers, voting).
display.js: Manages the display client’s interactions and updates (e.g., showing prompts, answers, scores).
assets/: Directory for storing images, icons, and other static assets.
Edit Existing Files:

game.js: Refactor to integrate with new game logic and Socket.IO events.
main.css: Update styles to accommodate new UI components for lobby, game stages, and results.
2. Views Folder Enhancements
Create New Files:

lobby.ejs: Interface for waiting players to join before the game starts.
game.ejs: Main game interface where players interact (submit answers, vote).
results.ejs: Display voting results, scores, and the final podium.
Edit Existing Files:

client.ejs: Update to include new UI components and link to client.js.
display.ejs: Enhance to reflect real-time game progress and integrate with display.js.
chat.ejs: Modify if needed to support additional functionalities beyond basic chat.
3. Server Enhancements
Create New Directories and Files:

Controllers:
authController.js: Handle player registration and login via Part 1 APIs.
promptController.js: Manage prompt submissions and retrieval.
gameController.js: Oversee game state transitions and logic.
voteController.js: Handle voting processes and score calculations.
Models:
playerModel.js: Define player-related data structures.
promptModel.js: Define prompt-related data structures.
gameStateModel.js: Maintain the current state of the game.
Routes:
authRoutes.js: API endpoints for authentication.
promptRoutes.js: API endpoints for prompt management.
gameRoutes.js: API endpoints for game actions.
Utils:
socketUtils.js: Manage Socket.IO event handling.
apiUtils.js: Facilitate communication with Part 1 APIs.
gameLogic.js: Implement the core game logic (e.g., assigning prompts, scoring).
Create server.js:

Initialize Express server with enhanced routing.
Integrate Socket.IO with game logic controllers.
Manage game state and client connections.
4. Updating app.js
Refactor to Delegate Responsibilities:
Move chat handling to server/controllers/chatController.js.
Import and use routes from the routes directory.
Integrate the new server.js for handling game logic and Socket.IO events.
5. Enhancing game.js
Integrate with VueJS Components:
Update methods to handle new Socket.IO events (e.g., game state updates, prompt assignments).
Implement reactive data properties for game-specific states (e.g., current prompt, answers, votes).
6. Updating package.json
Add Necessary Dependencies:

vue: For building reactive client interfaces.
socket.io-client: For client-side Socket.IO integration.
axios: For making API calls to Part 1 backend.
Other dependencies as needed for new functionalities.
Update Scripts:

json
Copy code
"scripts": {
  "start": "node server/server.js",
  "gdeploy": "gcloud app deploy",
  "hdeploy": "heroku deploy"
}
7. Configuring app.yaml
Ensure Proper Deployment Settings:
Specify runtime (e.g., NodeJS version).
Configure environment variables for backend API endpoints and credentials.
Example:
yaml
Copy code
runtime: nodejs16
env_variables:
  BACKEND_ENDPOINT: 'https://your-backend-api.azurewebsites.net'
  SOCKET_IO_KEY: 'your-socket-io-key'
  # Add other necessary environment variables
8. Creating server/server.js
Set Up Enhanced Server:
javascript
Copy code
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

// Import Controllers
const authController = require('./controllers/authController');
const promptController = require('./controllers/promptController');
const gameController = require('./controllers/gameController');
const voteController = require('./controllers/voteController');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(__dirname, '../public')));

// Routes
app.use('/auth', authController);
app.use('/prompt', promptController);
app.use('/game', gameController);
app.use('/vote', voteController);

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle game-specific events
  socket.on('register', (data) => gameController.handleRegister(socket, data));
  socket.on('login', (data) => gameController.handleLogin(socket, data));
  socket.on('submitPrompt', (data) => gameController.handleSubmitPrompt(socket, data));
  socket.on('submitAnswer', (data) => gameController.handleSubmitAnswer(socket, data));
  socket.on('vote', (data) => voteController.handleVote(socket, data));
  socket.on('advance', () => gameController.handleAdvance(socket));

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    gameController.handleDisconnect(socket);
  });
});

// Start Server
const PORT = process.env.PORT || 8080;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
9. Developing Controllers and Utilities
Controllers:
Implement functions to handle various game actions, interfacing with Part 1 APIs using axios.
Utils:
socketUtils.js: Abstract Socket.IO event emissions and listener setups.
apiUtils.js: Handle API calls to Azure Functions for player and prompt management.
gameLogic.js: Core functions for managing game state transitions, assigning prompts, tallying votes, and calculating scores.
10. Updating VueJS Components
Client-Side (client.js):

State Management:
Add reactive properties for game state, player state, prompts, answers, votes, and scores.
Methods:
Implement methods to handle registering, logging in, submitting prompts, answers, voting, and receiving game state updates from the server.
Socket Integration:
Connect to Socket.IO server and handle incoming events to update the UI accordingly.
Display Client (display.js):

State Management:
Manage a global game state to display prompts, answers, voting results, and leaderboards.
Methods:
Listen for server emissions related to game progress and update the display accordingly.
Socket Integration:
Connect to Socket.IO server and handle real-time updates.
11. Enhancing EJS Views
header.ejs & footer.ejs:

Update to include necessary scripts (e.g., VueJS, Socket.IO client) and stylesheets.
lobby.ejs:

Interface for players to join the game, displaying current players and a start game button for the admin.
game.ejs:

Main game interface where players can submit answers, view prompts, and participate in voting.
results.ejs:

Display voting results, round scores, and the final podium at the end of the game.
12. Finalizing the Project Structure
Ensure that all newly created and edited files are correctly placed within their respective directories. The final structure should support seamless interaction between the server, clients, and the backend APIs.

D. Final Project Structure Visualization
csharp
Copy code
root/
│
├── node_modules/
├── public/
│   ├── auth.js
│   ├── background.jpg
│   ├── game.js
│   ├── main.css
│   ├── client.js                # New
│   ├── display.js               # New
│   └── assets/                  # New
│       ├── logo.png
│       └── ...
├── views/
│   ├── chat.ejs
│   ├── client.ejs
│   ├── display.ejs
│   ├── footer.ejs
│   ├── header.ejs
│   ├── lobby.ejs                # New
│   ├── game.ejs                 # New
│   └── results.ejs              # New
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── promptController.js
│   │   ├── gameController.js
│   │   └── voteController.js
│   ├── models/
│   │   ├── playerModel.js
│   │   ├── promptModel.js
│   │   └── gameStateModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── promptRoutes.js
│   │   └── gameRoutes.js
│   ├── utils/
│   │   ├── socketUtils.js
│   │   ├── apiUtils.js
│   │   └── gameLogic.js
│   └── server.js
├── app.js
├── app.yaml
├── package-lock.json
├── package.json
├── Procfile
└── test_app.py
E. Integration and Testing
Integrate Frontend with Server:

Ensure that VueJS components communicate effectively with the NodeJS server via Socket.IO.
Test real-time interactions such as registering, logging in, submitting prompts, answering, and voting.
Connect to Part 1 APIs:

Utilize axios within controllers to interact with Azure Functions for player and prompt management.
Handle API responses and update game state accordingly.
Deploy to Cloud Platforms:

Google App Engine:
bash
Copy code
npm run gdeploy
Heroku:
bash
Copy code
npm run hdeploy
Verify deployment by accessing the client and display interfaces and ensuring all functionalities work as expected.
Testing:

Utilize the provided test suite to validate functionalities such as registration, login, game startup, prompt submission, game rounds, voting, and handling audience members.
Document test results in the required report format, ensuring alignment with expected outcomes.
Maintain and Update Views:

Continuously refine EJS templates to enhance UI/UX based on testing feedback.
Ensure synchronization between server state and client displays.
Enhance Public Assets:

Add necessary static assets (images, icons) to improve the visual appeal.
Optimize main.css for responsive and interactive designs.
F. Submission Preparation
Zip the Project:

Ensure the node_modules folder is excluded.
Include all necessary files and directories (public, views, server, app.js, app.yaml, etc.).
Name the zip file as part2.zip.
Create Instructions File:

Provide clear instructions on how to deploy and run the application.
Include any additional notes or configurations required.
Prepare the Report:

Follow the provided report template.
Document how each test case is handled, including evidence such as screenshots and calculations for scores.
Final Verification:

Double-check that the application runs seamlessly with npm start and deploys correctly with npm gdeploy or npm hdeploy.
Ensure all API integrations are functioning as per Part 1 specifications.
By following this detailed pipeline, you will systematically enhance the existing project structure, implement the required functionalities, and ensure compliance with the project specifications for Part 2.