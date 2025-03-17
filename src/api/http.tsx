// src/api/apiClient.ts
import axios from 'axios';

// 기본 설정된 axios 인스턴스 생성
const http = axios.create({
    baseURL:  import.meta.env.VITE_API_URL || 'http://localhost:8000', // 여기에 API 기본 URL todo 배포 시 url 변경
    withCredentials: true, // 이 설정이 쿠키를 자동으로 요청에 포함시킴
    headers: {
        'Content-Type': 'application/json',
    }
});

// 필요하다면 인터셉터로 요청/응답을 처리할 수 있음
http.interceptors.response.use(
    response => response,
    error => {
        // 401 에러 처리 등 가능
        return Promise.reject(error);
    }
);

export default http;