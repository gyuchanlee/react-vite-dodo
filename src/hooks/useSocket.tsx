import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore.tsx';

interface UseSocketOptions {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: any) => void;
}

export function useSocket(roomId: number | null, options: UseSocketOptions = {}) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuthStore();
    const token = localStorage.getItem('token');

    // 소켓 초기화
    useEffect(() => {
        // 방이 선택되었고 사용자가 인증된 경우에만 소켓 연결
        if (roomId && user && token) {
            // 기존 연결 해제
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            // 새 연결 생성
            const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';
            const socket = io(SOCKET_URL, {
                query: {
                    token, //jwt 토큰
                    roomId
                },
                transports: ['websocket', 'polling'], // WebSocket 우선, 폴백으로 폴링 사용
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            // 이벤트 리스너 설정
            socket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
                options.onConnect?.();
            });

            socket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
                options.onDisconnect?.();
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
                options.onError?.(error);
            });

            socketRef.current = socket;

            // 컴포넌트 언마운트 또는 의존성 변경시 정리
            return () => {
                console.log('Disconnecting socket');
                socket.disconnect();
                setIsConnected(false);
            };
        }

        return undefined;
    }, [roomId, user, token, options.onConnect, options.onDisconnect, options.onError]);

// 이벤트 송신 메서드
    const emit = useCallback(<T,>(event: string, ...args: T[]) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, ...args);
        } else {
            console.warn('Socket not connected, cannot emit:', event);
        }
    }, [isConnected]);

// 이벤트 리스너 등록 메서드
    const on = useCallback(<T,>(event: string, callback: (...args: T[]) => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);

            // 리스너 제거 함수 반환
            return () => {
                socketRef.current?.off(event, callback);
            };
        }
        return () => {}; // 소켓이 없는 경우 더미 함수 반환
    }, []);

// 이벤트 리스너 제거 메서드
    const off = useCallback(<T,>(event: string, callback?: (...args: T[]) => void) => {
        if (socketRef.current) {
            if (callback) {
                socketRef.current.off(event, callback);
            } else {
                socketRef.current.off(event);
            }
        }
    }, []);

    return { isConnected, emit, on, off };
}