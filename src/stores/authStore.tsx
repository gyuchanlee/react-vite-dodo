import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import axios from 'axios';
import http, { setLogoutHandler } from "../api/http.tsx";

// 사용자 타입 정의
interface User {
    username: string;
    email: string;
    profile?: string;
    createdAt: string;
}

// 로그인 요청 데이터 타입
interface LoginCredentials {
    email: string;
    password: string;
}

// 회원가입 요청 데이터 타입
interface RegisterData {
    email: string;
    username: string;
    password: string;
    profile?: string;
}

// 사용자 정보 업데이트 요청 데이터 타입
interface UserUpdateData {
    email: string;
    username?: string;
    password?: string;
    profile?: string;
}

// 인증 상태 저장소 타입
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // 액션
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => void;
    register: (data: RegisterData) => Promise<boolean>;
    updateUser: (data: UserUpdateData) => Promise<boolean>;
    clearError: () => void;
}


// Zustand 스토어 생성 및 persist 적용
const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => {

            // 로그아웃 핸들러 등록
            setLogoutHandler(() => {
                const logout = get().logout;
                logout();
            });

            return {
                // 초기 상태
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,

                // 로그인 함수
                login: async (credentials: LoginCredentials) => {
                    set({ isLoading: true, error: null });

                    try {
                        // 백엔드 API 호출
                        const response = await http.post('/api/auth/login', credentials);

                        // 로그인 성공 시 사용자 정보 설정
                        set({
                            user: response.data,
                            isAuthenticated: true,
                            isLoading: false,
                        });

                        return true;
                    } catch (error) {
                        // 오류 처리
                        let errorMessage = '로그인에 실패했습니다.';

                        if (axios.isAxiosError(error) && error.response) {
                            // 검증 에러인 경우 (errors 객체가 있는 경우)
                            if (error.response.data.errors) {
                                // 모든 에러 메시지를 하나의 문자열로 합침
                                errorMessage = Object.values(error.response.data.errors).join('\n');
                            } else {
                                // 일반 에러 메시지
                                errorMessage = error.response.data.message || errorMessage;
                            }
                        }

                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: errorMessage,
                        });

                        return false;
                    }
                },

                // 로그아웃 함수
                logout: async () => {
                    try {
                        // 백엔드 로그아웃 API 호출
                        await http.post('/api/auth/logout');
                    } catch (error) {
                        console.error('로그아웃 API 호출 중 오류:', error);
                    }

                    // 로컬 상태 초기화
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: null,
                    });
                },

                // 회원가입 함수
                register: async (data: RegisterData) => {
                    set({ isLoading: true, error: null });

                    try {
                        // 백엔드 API 호출
                        await http.post('/api/users/', data);

                        // 회원가입 성공
                        set({ isLoading: false });
                        return true;
                    } catch (error) {
                        // 오류 처리
                        let errorMessage = '회원가입에 실패했습니다.';

                        if (axios.isAxiosError(error) && error.response) {
                            // 검증 에러인 경우 (errors 객체가 있는 경우)
                            if (error.response.data.errors) {
                                // 모든 에러 메시지를 하나의 문자열로 합침
                                errorMessage = Object.values(error.response.data.errors).join('\n');
                            } else {
                                // 일반 에러 메시지
                                errorMessage = error.response.data.message || errorMessage;
                            }
                        }

                        set({
                            isLoading: false,
                            error: errorMessage,
                        });

                        return false;
                    }
                },

                // 사용자 정보 업데이트 함수 (백엔드 API 호출)
                updateUser: async (data: UserUpdateData) => {
                    set({ isLoading: true, error: null });

                    try {
                        // 백엔드 API 호출 - /api/users/{email} 형식으로 PUT 요청
                        const response = await http.put(`/api/users/${data.email}`, data);

                        // 업데이트된 사용자 정보
                        const updatedUser = response.data;

                        // 상태 업데이트
                        set({
                            user: updatedUser,
                            isLoading: false
                        });

                        return true;
                    } catch (error) {
                        // 오류 처리
                        let errorMessage = '프로필 업데이트에 실패했습니다.';

                        if (axios.isAxiosError(error) && error.response) {
                            // 검증 에러인 경우 (errors 객체가 있는 경우)
                            if (error.response.data.errors) {
                                // 모든 에러 메시지를 하나의 문자열로 합침
                                errorMessage = Object.values(error.response.data.errors).join('\n');
                            } else {
                                // 일반 에러 메시지
                                errorMessage = error.response.data.message || errorMessage;
                            }
                        }

                        set({
                            isLoading: false,
                            error: errorMessage,
                        });

                        return false;
                    }
                },

                // 오류 상태 초기화
                clearError: () => set({ error: null }),
            };
        },
        {
            // localStorage에 저장할 때 사용할 키 이름
            name: 'auth-storage',

            // 저장할 상태 선택 (민감한 정보나 일시적인 상태는 제외)
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;