import { create } from 'zustand';
import { getMessages, getRoomUsers } from '../api/chat';
import { Message, ChatUser, TypingStatus } from '../types/chat';

interface ChatState {
    messages: Record<string, Message[]>; // roomId를 키로 사용하는 메시지 맵
    roomUsers: Record<string, ChatUser[]>; // roomId를 키로 사용하는 사용자 맵
    typingUsers: Record<string, TypingStatus[]>; // roomId를 키로 사용하는 타이핑 상태 맵
    isLoading: boolean;
    error: string | null;

    // 액션
    fetchMessages: (roomId: number, limit?: number) => Promise<void>;
    fetchRoomUsers: (roomId: number) => Promise<void>;
    addMessage: (message: Message) => void;
    updateTypingStatus: (roomId: number, userId: number, username: string, isTyping: boolean) => void;
    updateUserStatus: (roomId: string, userId: number, isOnline: boolean) => void;
    updateUsers: (roomId: number, users: ChatUser[]) => void;
    clearMessages: (roomId: number) => void;
    clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: {},
    roomUsers: {},
    typingUsers: {},
    isLoading: false,
    error: null,

    // 메시지 불러오기
    fetchMessages: async (roomId, limit = 50) => {
        set({ isLoading: true, error: null });
        try {
            const messages = await getMessages(roomId, limit);
            set(state => ({
                messages: {
                    ...state.messages,
                    [roomId]: messages
                },
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || '메시지를 불러오는데 실패했습니다',
                isLoading: false
            });
        }
    },

    // 채팅방 사용자 불러오기
    fetchRoomUsers: async (roomId) => {
        set({ isLoading: true, error: null });
        try {
            const users = await getRoomUsers(roomId);
            set(state => ({
                roomUsers: {
                    ...state.roomUsers,
                    [roomId]: users
                },
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || '사용자 목록을 불러오는데 실패했습니다',
                isLoading: false
            });
        }
    },

    // 새 메시지 추가
    addMessage: (message) => {
        const { roomId } = message;

        set(state => {
            // 해당 방의 메시지 목록
            const roomMessages = [...(state.messages[roomId] || [])];

            // 중복 메시지 방지
            if (!roomMessages.some(m => m.id === message.id)) {
                roomMessages.push(message);
            }

            return {
                messages: {
                    ...state.messages,
                    [roomId]: roomMessages
                }
            };
        });
    },

    // 타이핑 상태 업데이트
    updateTypingStatus: (roomId, userId, username, isTyping) => {
        set(state => {
            // 해당 방의 타이핑 사용자 목록
            const roomTypingUsers = [...(state.typingUsers[roomId] || [])];

            const userIndex = roomTypingUsers.findIndex(u => u.userId === userId);

            if (isTyping && userIndex === -1) {
                // 타이핑 시작하는 경우 목록에 추가
                roomTypingUsers.push({ userId, username, isTyping });
            } else if (!isTyping && userIndex !== -1) {
                // 타이핑 중지하는 경우 목록에서 제거
                roomTypingUsers.splice(userIndex, 1);
            }

            // 사용자 목록에도 타이핑 상태 업데이트
            const roomUsers = [...(state.roomUsers[roomId] || [])];
            const userRoomIndex = roomUsers.findIndex(u => u.id === userId);

            if (userRoomIndex !== -1) {
                roomUsers[userRoomIndex] = {
                    ...roomUsers[userRoomIndex],
                    isTyping
                };
            }

            return {
                typingUsers: {
                    ...state.typingUsers,
                    [roomId]: roomTypingUsers
                },
                roomUsers: {
                    ...state.roomUsers,
                    [roomId]: roomUsers
                }
            };
        });
    },

    // 사용자 온라인 상태 업데이트
    updateUserStatus: (roomId, userId, isOnline) => {
        set(state => {
            // 해당 방의 사용자 목록
            const roomUsers = [...(state.roomUsers[roomId] || [])];

            const userIndex = roomUsers.findIndex(u => u.id === userId);

            if (userIndex !== -1) {
                // 사용자가 목록에 있으면 상태 업데이트
                roomUsers[userIndex] = {
                    ...roomUsers[userIndex],
                    isOnline
                };
            }

            return {
                roomUsers: {
                    ...state.roomUsers,
                    [roomId]: roomUsers
                }
            };
        });
    },

    // 사용자 목록 업데이트 (전체 교체)
    updateUsers: (roomId, users) => {
        set(state => ({
            roomUsers: {
                ...state.roomUsers,
                [roomId]: users
            }
        }));
    },

    // 메시지 초기화
    clearMessages: (roomId) => {
        set(state => ({
            messages: {
                ...state.messages,
                [roomId]: []
            }
        }));
    },

    // 에러 초기화
    clearError: () => {
        set({ error: null });
    }
}));

// 선택자 함수
export const chatSelectors = {
    // 특정 채팅방의 메시지
    roomMessages: (roomId: number | undefined) => (state: ChatState) =>
        roomId ? state.messages[roomId] || [] : [],

    // 특정 채팅방의 사용자
    roomUsers: (roomId: number | undefined) => (state: ChatState) =>
        roomId ? state.roomUsers[roomId] || [] : [],

    // 특정 채팅방에서 타이핑 중인 사용자
    typingUsers: (roomId: number | undefined) => (state: ChatState) =>
        roomId ? state.typingUsers[roomId] || [] : [],

    // 특정 채팅방에서 온라인 사용자 수
    onlineUserCount: (roomId: number | undefined) => (state: ChatState) => {
        if (!roomId) return 0;
        return (state.roomUsers[roomId] || []).filter(user => user.isOnline).length;
    }
};