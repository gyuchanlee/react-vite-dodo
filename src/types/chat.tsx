export interface ChatRoom {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    createdBy: string;
    participantsCount: number;
    isPrivate: boolean;
    isJoined?: boolean;
}

export interface Message {
    id: number;
    roomId: number;
    userId: number;
    username: string;
    content: string;
    createdAt: string;
}

export interface ChatUser {
    id: number;
    username: string;
    isOnline: boolean;
    isTyping: boolean;
    joinedAt: string;
}

export interface TypingStatus {
    userId: number;
    username: string;
    isTyping: boolean;
}