// src/api/interceptors.ts
import {AxiosError, AxiosInstance} from 'axios';
import useAuthStore from '../stores/authStore'; // Zustand 스토어 경로에 맞게 수정

// 인증 인터셉터 설정 함수
export const setupAuthInterceptors = (axiosInstance: AxiosInstance) => {
    // 응답 인터셉터
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            // 401 Unauthorized 에러 처리
            if (error.response?.status === 401 || error.response?.status === 403) {
                // 스토어에서 로그아웃 함수 호출 (비동기 상태 업데이트)
                const logout = useAuthStore.getState().logout;
                logout();

                // 필요하다면 로그인 페이지로 리다이렉트
                window.location.href = '/login';
            }

            return Promise.reject(error);
        }
    );

    return axiosInstance;
};