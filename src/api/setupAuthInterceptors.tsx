import {AxiosError} from 'axios';
import {api} from './api';

export function setupAuthInterceptors(logoutCallback: () => void) {
    
    api.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            // 401 Unauthorized or 403 Forbidden error handling
            if (error.response?.status === 401 || error.response?.status === 403) {
                logoutCallback();
                
                // 로그아웃시, 리다이렉트
                window.location.href = '/login';
            }

            return Promise.reject(error);
        }
    );
}

export {api};