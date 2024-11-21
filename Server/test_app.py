# test_app.py

import unittest
import socketio
import time

class TestGameServer(unittest.TestCase):
    def setUp(self):
        self.sio = socketio.Client()
        self.error_message = ''
        self.registration_success = False
        self.login_success = False

        @self.sio.event
        def connect():
            print('Connected to server')

        @self.sio.event
        def disconnect():
            print('Disconnected from server')

        @self.sio.on('error')
        def on_error(message):
            self.error_message = message

        @self.sio.on('registrationSuccess')
        def on_registration_success():
            self.registration_success = True

        @self.sio.on('loginSuccess')
        def on_login_success(data):
            self.login_success = True

        try:
            self.sio.connect('http://localhost:8080')
            time.sleep(1)  # Wait for connection to establish
        except Exception as e:
            self.fail(f"Could not connect to server: {e}")

    def tearDown(self):
        self.sio.disconnect()

    def test_invalid_registration(self):
        # Test 1.1: Invalid username and password
        self.sio.emit('register', {'username': 'a', 'password': 'a'})
        time.sleep(1)  # Wait for response
        self.assertEqual(self.error_message, 'Username must be between 5 and 15 characters.')

    def test_valid_registration(self):
        # Test 1.2: Valid registration
        self.sio.emit('register', {'username': 'testuser', 'password': 'testpass123'})
        time.sleep(1)
        self.assertTrue(self.registration_success)

    def test_existing_user_registration(self):
        # Test 1.3: Register with existing username
        self.sio.emit('register', {'username': 'testuser', 'password': 'testpass123'})
        time.sleep(1)
        self.assertEqual(self.error_message, 'Username already exists')

    def test_successful_login(self):
        # Test 1.4: Successful login
        self.sio.emit('login', {'username': 'testuser', 'password': 'testpass123'})
        time.sleep(1)
        self.assertTrue(self.login_success)

    def test_invalid_login(self):
        # Test 1.5: Invalid login
        self.sio.emit('login', {'username': 'testuser', 'password': 'wrongpass'})
        time.sleep(1)
        self.assertEqual(self.error_message, 'Username or password incorrect')

if __name__ == '__main__':
    unittest.main()
