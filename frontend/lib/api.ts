import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:4000',
});

// Automatically add JWT token to all requests
api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;