import http from './http';
import {AuthResponse, User} from '../types/auth';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>('/auth/login', { email, password });
    const { token } = response.data;

    // 토큰 저장
    localStorage.setItem('token', token);

    return response.data;
};

export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>('/auth/register', { username, email, password });
    const { token } = response.data;

    // 토큰 저장
    localStorage.setItem('token', token);

    return response.data;
};

export const logout = async (): Promise<void> => {
    try {
        await http.post('/auth/logout');
    } finally {
        // 토큰 제거
        localStorage.removeItem('token');
    }
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await http.get<User>('/auth/me'); // 현재 인증된 사용자 정보를 요청하는 엔드포인트
    return response.data;
};

export const checkAuth = async (): Promise<boolean> => {
    try {
        await getCurrentUser();
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return false;
    }
};