import { create } from 'zustand';
import { getRooms, getRoom, createRoom, joinRoom, leaveRoom } from '../api/chat';
import { ChatRoom } from '../types/chat';

interface RoomsState {
    rooms: ChatRoom[];
    currentRoomId: string | null;
    isLoading: boolean;
    error: string | null;

    fetchRooms: () => Promise<void>;
    fetchRoom: (roomId: string) => Promise<ChatRoom | null>;
    createRoom: (name: string, description?: string, isPrivate?: boolean) => Promise<ChatRoom | null>;
    joinRoom: (roomId: string) => Promise<boolean>;
    leaveRoom: (roomId: string) => Promise<boolean>;
    setCurrentRoom: (roomId: string | null) => void;
    clearError: () => void;
}

export const useRoomsStore = create<RoomsState>((set, get) => ({
    rooms: [],
    currentRoomId: null,
    isLoading: false,
    error: null,

    fetchRooms: async () => {
        set({ isLoading: true, error: null });
        try {
            const rooms = await getRooms();
            set({ rooms, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || '채팅방 목록을 불러오는데 실패했습니다',
                isLoading: false
            });
        }
    },

    fetchRoom: async (roomId) => {
        set({ isLoading: true, error: null });
        try {
            const room = await getRoom(roomId);
            // 기존 목록에 추가 또는 업데이트
            set(state => {
                const roomIndex = state.rooms.findIndex(r => r.id === roomId);

                if (roomIndex >= 0) {
                    // 기존 방 업데이트
                    const updatedRooms = [...state.rooms];
                    updatedRooms[roomIndex] = room;
                    return { rooms: updatedRooms, isLoading: false };
                } else {
                    // 새 방 추가
                    return { rooms: [...state.rooms, room], isLoading: false };
                }
            });

            return room;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || '채팅방 정보를 불러오는데 실패했습니다',
                isLoading: false
            });
            return null;
        }
    },

    createRoom: async (name, description = '', isPrivate = false) => {
        set({ isLoading: true, error: null });
        try {
            const newRoom = await createRoom(name, description, isPrivate);
            set(state => ({
                rooms: [...state.rooms, newRoom],
                currentRoomId: newRoom.id,
                isLoading: false
            }));
            return newRoom;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || '채팅방 생성에 실패했습니다',
                isLoading: false
            });
            return null;
        }
    },

    joinRoom: async (roomId) => {
        set({ isLoading: true, error: null });
        try {
            await joinRoom(roomId);

            // 참여 상태 업데이트
            set(state => {
                const updatedRooms = state.rooms.map(room =>
                    room.id === roomId ? { ...room, isJoined: true } : room
                );
                return { rooms: updatedRooms, isLoading: false };
            });

            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || '채팅방 입장에 실패했습니다',
                isLoading: false
            });
            return false;
        }
    },

    leaveRoom: async (roomId) => {
        set({ isLoading: true, error: null });
        try {
            await leaveRoom(roomId);

            // 참여 상태 업데이트
            set(state => {
                const updatedRooms = state.rooms.map(room =>
                    room.id === roomId ? { ...room, isJoined: false } : room
                );

                // 현재 방에서 나가는 경우 currentRoomId 초기화
                const newState: Partial<RoomsState> = {
                    rooms: updatedRooms,
                    isLoading: false
                };

                if (state.currentRoomId === roomId) {
                    newState.currentRoomId = null;
                }

                return newState;
            });

            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || '채팅방 퇴장에 실패했습니다',
                isLoading: false
            });
            return false;
        }
    },

    setCurrentRoom: (roomId) => {
        set({ currentRoomId: roomId });
    },

    clearError: () => {
        set({ error: null });
    }
}));

// 선택자 함수
export const roomsSelectors = {
    currentRoom: (state: RoomsState) =>
        state.currentRoomId ? state.rooms.find(room => room.id === state.currentRoomId) : null,

    joinedRooms: (state: RoomsState) =>
        state.rooms.filter(room => room.isJoined),

    availableRooms: (state: RoomsState) =>
        state.rooms.filter(room => !room.isJoined),
};