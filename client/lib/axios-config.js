import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5296/api',
  withCredentials: true,
});

export default api;
