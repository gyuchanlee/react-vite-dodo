import axios from 'axios';

// Create and export the base API client without interceptors
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    withCredentials: true,
});