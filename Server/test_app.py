# test_app.py

import unittest
import socketio
import time
import threading
import logging

# Enable detailed logging
logging.basicConfig(level=logging.DEBUG)

class TestGameServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """
        Optional: Start the server programmatically if desired.
        Currently, it's assumed that the server is started manually.
        """
        pass

    def setUp(self):
        self.sio = socketio.Client(logger=True, engineio_logger=True)
        self.error_message = ''
        self.registration_success = False
        self.login_success = False
        self.connected_event = threading.Event()
        self.disconnected_event = threading.Event()

        @self.sio.event
        def connect():
            print('Connected to server')
            self.connected_event.set()

        @self.sio.event
        def disconnect():
            print('Disconnected from server')
            self.disconnected_event.set()

        @self.sio.on('error')
        def on_error(message):
            print(f"Received error: {message}")
            self.error_message = message

        @self.sio.on('registrationSuccess')
        def on_registration_success():
            print('Registration successful')
            self.registration_success = True

        @self.sio.on('loginSuccess')
        def on_login_success(data):
            print('Login successful')
            self.login_success = True

        try:
            self.sio.connect('https://localhost:8080', transports=['websocket'], wait_timeout=5, retry=False)
            connected = self.connected_event.wait(timeout=5)
            if not connected:
                self.fail("Could not connect to server within timeout.")
            # Register 'testuser' to ensure it exists for existing user registration test
            self.sio.emit('register', {'username': 'testuser', 'password': 'testpass123'})
            registration_event = threading.Event()

            @self.sio.on('registrationSuccess')
            def on_registration_success_event():
                self.registration_success = True
                registration_event.set()

            @self.sio.on('error')
            def on_registration_error_event(message):
                self.error_message = message
                registration_event.set()

            registration_event.wait(timeout=5)
        except Exception as e:
            self.fail(f"Could not connect to server: {e}")

    def tearDown(self):
        self.sio.disconnect()
        disconnected = self.disconnected_event.wait(timeout=5)
        if not disconnected:
            print("Did not disconnect gracefully.")

    def test_invalid_registration(self):
        # Test 1.1: Invalid username and password
        registration_event = threading.Event()

        @self.sio.on('error')
        def on_error_event(message):
            self.error_message = message
            registration_event.set()

        self.sio.emit('register', {'username': 'a', 'password': 'a'})
        registration_event.wait(timeout=5)
        self.assertEqual(self.error_message, 'Username must be between 5 and 15 characters.')

    def test_valid_registration(self):
        # Test 1.2: Valid registration
        registration_event = threading.Event()

        @self.sio.on('registrationSuccess')
        def on_registration_success_event():
            self.registration_success = True
            registration_event.set()

        self.sio.emit('register', {'username': 'newuser', 'password': 'newpass123'})
        registration_event.wait(timeout=5)
        self.assertTrue(self.registration_success)

    def test_existing_user_registration(self):
        # Test 1.3: Register with existing username
        registration_event = threading.Event()

        @self.sio.on('error')
        def on_error_event(message):
            self.error_message = message
            registration_event.set()

        self.sio.emit('register', {'username': 'testuser', 'password': 'testpass123'})
        registration_event.wait(timeout=5)
        self.assertEqual(self.error_message, 'Username already exists')

    def test_successful_login(self):
        # Test 1.4: Successful login
        login_event = threading.Event()

        @self.sio.on('loginSuccess')
        def on_login_success_event(data):
            self.login_success = True
            login_event.set()

        self.sio.emit('login', {'username': 'testuser', 'password': 'testpass123'})
        login_event.wait(timeout=5)
        self.assertTrue(self.login_success)

    def test_invalid_login(self):
        # Test 1.5: Invalid login
        login_event = threading.Event()

        @self.sio.on('error')
        def on_login_error_event(message):
            self.error_message = message
            login_event.set()

        self.sio.emit('login', {'username': 'testuser', 'password': 'wrongpass'})
        login_event.wait(timeout=5)
        self.assertEqual(self.error_message, 'Username or password incorrect')

if __name__ == '__main__':
    unittest.main()