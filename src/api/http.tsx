// src/api/apiClient.ts
import axios, {AxiosError} from 'axios';

// 로그아웃 함수 타입
type LogoutFunction = () => void;

// 로그아웃 핸들러 변수
let logoutHandler: LogoutFunction | null = null;

// 기본 설정된 axios 인스턴스 생성
const http = axios.create({
    baseURL:  import.meta.env.VITE_API_URL || 'http://localhost:8000', // 여기에 API 기본 URL todo 배포 시 url 변경
    withCredentials: true, // 이 설정이 쿠키를 자동으로 요청에 포함시킴
    headers: {
        'Content-Type': 'application/json',
    }
});

// 인증 인터셉터 추가
http.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // 401 Unauthorized or 403 Forbidden error handling
        if (error.response?.status === 401 || error.response?.status === 403) {
            // 등록된 로그아웃 핸들러가 있으면 실행
            if (logoutHandler) {
                logoutHandler();
            }

            // 로그아웃시, 리다이렉트
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// 로그아웃 핸들러 설정 함수
export const setLogoutHandler = (handler: LogoutFunction) => {
    logoutHandler = handler;
};

export default http;