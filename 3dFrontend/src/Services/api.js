// src/services/api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Replace with your backend URL if different

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
