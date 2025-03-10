import http from './http';
import { ChatRoom, Message, ChatUser } from '../types/chat';

// 채팅방 관련 API
export const getRooms = async (): Promise<ChatRoom[]> => {
    const response = await http.get<ChatRoom[]>('/rooms');
    return response.data;
};

export const getRoom = async (roomId: number): Promise<ChatRoom> => {
    const response = await http.get<ChatRoom>(`/rooms/${roomId}`);
    return response.data;
};

export const createRoom = async (name: string, description?: string, isPrivate = false): Promise<ChatRoom> => {
    const response = await http.post<ChatRoom>('/rooms', { name, description, isPrivate });
    return response.data;
};

export const joinRoom = async (roomId: number): Promise<boolean> => {
    await http.post(`/rooms/${roomId}/join`);
    return true;
};

export const leaveRoom = async (roomId: number): Promise<boolean> => {
    await http.post(`/rooms/${roomId}/leave`);
    return true;
};

// 메시지 관련 API
export const getMessages = async (roomId: number, limit = 50, before?: string): Promise<Message[]> => {
    const params = { limit, before };
    const response = await http.get<Message[]>(`/rooms/${roomId}/messages`, { params });
    return response.data;
};

// 채팅방 사용자 관련 API -> chat_room_users 테이블 쿼리
export const getRoomUsers = async (roomId: number): Promise<ChatUser[]> => {
    const response = await http.get<ChatUser[]>(`/rooms/${roomId}/users`);
    return response.data;
};