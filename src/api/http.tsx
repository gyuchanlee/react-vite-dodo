// src/api/http.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const http = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 요청 타임아웃 10초
});

// 요청 인터셉터: 토큰 추가
http.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 응답 인터셉터: 토큰 만료 처리
http.interceptors.response.use(
    response => response,
    error => {
        // 401 에러 처리
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default http;