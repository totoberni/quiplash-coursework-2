// server/utils/apiUtils.js

const axios = require('axios');

const BACKEND_ENDPOINT = process.env.BACKEND_ENDPOINT || 'http://localhost:8181';

module.exports = {
  // Existing methods...

  async registerPlayer(username, password) {
    try {
      const response = await axios.post(`${BACKEND_ENDPOINT}/auth/register`, {
        username,
        password,
      });
      return response.data; // Expected to have { success: Boolean, message: String }
    } catch (error) {
      console.error('API registerPlayer Error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.response ? error.response.data.message : 'Registration failed.' };
    }
  },

  async loginPlayer(username, password) {
    try {
      const response = await axios.post(`${BACKEND_ENDPOINT}/auth/login`, {
        username,
        password,
      });
      return response.data; // Expected to have { success: Boolean, message: String }
    } catch (error) {
      console.error('API loginPlayer Error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.response ? error.response.data.message : 'Login failed.' };
    }
  },

  async createPrompt(username, promptText) {
    try {
      const response = await axios.post(`${BACKEND_ENDPOINT}/prompt/create`, {
        username,
        prompt: promptText,
      });
      return response.data; // Expected to have { success: Boolean, message: String }
    } catch (error) {
      console.error('API createPrompt Error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.response ? error.response.data.message : 'Prompt creation failed.' };
    }
  },

  // Existing methods...

  async getPodium() {
    try {
      const response = await axios.post(`${BACKEND_ENDPOINT}/utils/podium`, {});
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deletePlayer(username) {
    try {
      const response = await axios.post(`${BACKEND_ENDPOINT}/player/delete`, {
        username,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async editPlayer(username, data) {
    try {
      const response = await axios.post(`${BACKEND_ENDPOINT}/player/edit`, {
        username,
        ...data,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deletePrompt(promptId) {
    try {
      const response = await axios.post(`${BACKEND_ENDPOINT}/prompt/delete`, {
        promptId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async suggestPrompt(keyword) {
    try {
      const response = await axios.post(`${BACKEND_ENDPOINT}/prompt/suggest`, {
        keyword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};