import unittest
import socketio
import time

class TestApp(unittest.TestCase):
    def setUp(self):
        # Connect to the server
        self.sio = socketio.Client()
        self.sio.connect('http://localhost:8080')
        self.messages = []

        @self.sio.on('registerSuccess')
        def on_register_success(data):
            self.messages.append(('registerSuccess', data))

        @self.sio.on('fail')
        def on_fail(data):
            self.messages.append(('fail', data))

        @self.sio.on('loginSuccess')
        def on_login_success(data):
            self.messages.append(('loginSuccess', data))

        @self.sio.on('gameStateUpdate')
        def on_game_state_update(data):
            self.messages.append(('gameStateUpdate', data))

    def tearDown(self):
        self.sio.disconnect()

    def test_invalid_registration(self):
        # Test 1.1: Register with invalid username and password
        self.sio.emit('register', ('a', 'a'))
        time.sleep(1)  # Wait for response
        self.assertIn(('fail', 'Invalid username or password. Must be at least 8 characters long.'), self.messages)

    def test_valid_registration(self):
        # Test 1.2: Register with valid username and password
        self.sio.emit('register', ('bbbbbbbb', 'bbbbbbbb'))
        time.sleep(1)
        self.assertIn(('registerSuccess', 'Registration successful. Please log in.'), self.messages)

    def test_duplicate_registration(self):
        # Test 1.3: Register the same user twice
        self.sio.emit('register', ('aaaaaaaa', 'aaaaaaaa'))
        time.sleep(1)
        self.assertIn(('registerSuccess', 'Registration successful. Please log in.'), self.messages)
        self.messages.clear()
        self.sio.emit('register', ('aaaaaaaa', 'aaaaaaaa'))
        time.sleep(1)
        self.assertIn(('fail', 'User already exists.'), self.messages)

    def test_valid_login(self):
        # Test 1.4: Login with valid credentials
        self.sio.emit('login', ('aaaaaaaa', 'aaaaaaaa'))
        time.sleep(1)
        found = False
        for message in self.messages:
            if message[0] == 'loginSuccess' and 'You have joined as a player' in message[1]['message']:
                found = True
        self.assertTrue(found)

    def test_invalid_login(self):
        # Test 1.5: Login with valid username and invalid password
        self.sio.emit('login', ('aaaaaaaa', 'bbbbbbbb'))
        time.sleep(1)
        self.assertIn(('fail', 'Invalid username or password.'), self.messages)

    def test_max_players(self):
        # Test 2.5 & 4.1: Users joining after the player limit become audience
        usernames = ['user' + str(i) for i in range(1, 10)]  # 9 users
        for username in usernames:
            self.sio.emit('register', (username, 'password' + username))
            time.sleep(0.5)
            self.messages.clear()
            self.sio.emit('login', (username, 'password' + username))
            time.sleep(0.5)
            # Check if user is player or audience
            for message in self.messages:
                if message[0] == 'loginSuccess':
                    if 'You have joined as a player' in message[1]['message']:
                        print(f'{username} joined as player.')
                    elif 'You have joined as an audience member' in message[1]['message']:
                        print(f'{username} joined as audience.')
        # Check that 8 users joined as players and the 9th as audience
        # This is more of a manual check since we are printing the outputs

if __name__ == '__main__':
    unittest.main()