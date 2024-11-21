// server/utils/apiUtils.js

const axios = require('axios');

const BACKEND_ENDPOINT = process.env.BACKEND_ENDPOINT || 'http://localhost:8181';

module.exports.registerPlayer = async (username, password) => {
  try {
    const response = await axios.post(`${BACKEND_ENDPOINT}/player/register`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('API Register Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error;
  }
};

module.exports.loginPlayer = async (username, password) => {
  try {
    const response = await axios.post(`${BACKEND_ENDPOINT}/player/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('API Login Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error;
  }
};

module.exports.createPrompt = async (username, promptText) => {
  try {
    const response = await axios.post(`${BACKEND_ENDPOINT}/prompt/create`, {
      text: promptText,
      username: username,
    });
    return response.data;
  } catch (error) {
    console.error('API Create Prompt Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error;
  }
};

module.exports.getPrompts = async (players, language) => {
  try {
    const response = await axios.post(`${BACKEND_ENDPOINT}/utils/get`, {
      players: players,
      language: language,
    });
    return response.data;
  } catch (error) {
    console.error('API Get Prompts Error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : error;
  }
};
