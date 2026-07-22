import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api/students',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// CRUCIAL: This line fixes the "does not provide an export named 'default'" error!
export default API;