import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as apiLogin, logout as apiLogout, register as apiRegister, getCurrentUser } from '../api/auth';
import { User } from '../types/auth';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<boolean>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const { user } = await apiLogin(email, password);
                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return true;
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || '로그인에 실패했습니다',
                        isLoading: false
                    });
                    return false;
                }
            },

            register: async (username, email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const { user } = await apiRegister(username, email, password);
                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return true;
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || '회원가입에 실패했습니다',
                        isLoading: false
                    });
                    return false;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await apiLogout();
                } finally {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                }
            },

            checkAuthStatus: async () => {
                // 이미 인증된 상태면 추가 확인 불필요
                if (get().isAuthenticated && get().user) {
                    return true;
                }

                set({ isLoading: true, error: null });
                try {
                    const user = await getCurrentUser();
                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return true;
                } catch (error) {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    return false;
                }
            },

            clearError: () => {
                set({ error: null });
            }
        }),
        {
            name: 'auth-storage',
            // 저장할 상태 선택
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);