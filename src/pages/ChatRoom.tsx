import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useAuthStore} from '../stores/authStore';
import {useRoomsStore} from '../stores/chatRoomStore';
import {chatSelectors, useChatStore} from '../stores/chatStore';
import {useSocket} from '../hooks/useSocket';
import MessageList from '../components/chat/MessageList';
import UserList from '../components/chat/UserList';
import MessageInput from '../components/chat/MessageInput';
import {ChatUser, Message, TypingStatus} from '../types/chat';
import './ChatRoom.css';
// @ts-ignore
import { Timeout } from 'node:timers';

const ChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const parsedRoomId = roomId ? Number(roomId) : undefined;
    const navigate = useNavigate();

    // 인증 상태
    const { user, isAuthenticated } = useAuthStore();

    // 채팅방 상태
    const currentRoom = useRoomsStore(state =>
        roomId ? state.rooms.find(r => r.id === parsedRoomId) : null
    );
    const setCurrentRoom = useRoomsStore(state => state.setCurrentRoom);
    const leaveRoom = useRoomsStore(state => state.leaveRoom);

    // 채팅 상태
    const fetchMessages = useChatStore(state => state.fetchMessages);
    const fetchRoomUsers = useChatStore(state => state.fetchRoomUsers);
    const addMessage = useChatStore(state => state.addMessage);
    const updateTypingStatus = useChatStore(state => state.updateTypingStatus);
    const updateUserStatus = useChatStore(state => state.updateUserStatus);
    const messages = useChatStore(roomId ? chatSelectors.roomMessages(parsedRoomId) : () => []);
    const roomUsers = useChatStore(roomId ? chatSelectors.roomUsers(parsedRoomId) : () => []);

    // 로컬 상태
    const [messageInput, setMessageInput] = useState('');
    const typingTimerRef = useRef<Timeout | null>(null);

    // 소켓 연결
    const { isConnected, emit, on } = useSocket(roomId || null, {
        onConnect: () => {
            console.log(`Connected to room: ${roomId}`);
        },
        onDisconnect: () => {
            console.log(`Disconnected from room: ${roomId}`);
        },
        onError: (error) => {
            console.error('Socket error:', error);
        }
    });

    // 인증 상태 확인 및 리다이렉트
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // 채팅방 선택
    useEffect(() => {
        if (roomId) {
            setCurrentRoom(roomId);

            return () => {
                setCurrentRoom(null);
            };
        }
    }, [roomId, setCurrentRoom]);

    // 메시지 및 사용자 목록 불러오기
    useEffect(() => {
        if (roomId) {
            fetchMessages(roomId);
            fetchRoomUsers(roomId);
        }
    }, [roomId, fetchMessages, fetchRoomUsers]);

    // 소켓 이벤트 리스너 설정
    useEffect(() => {
        if (!isConnected || !roomId) return;

        // 새 메시지 수신
        const messageHandler = (message: Message) => {
            addMessage(message);
        };

        // 사용자 입장
        const userJoinHandler = (joinedUser: ChatUser) => {
            updateUserStatus(roomId, joinedUser.id, true);
        };

        // 사용자 퇴장
        const userLeaveHandler = (userId: string) => {
            updateUserStatus(roomId, userId, false);
        };

        // 타이핑 상태
        const typingHandler = (typingStatus: TypingStatus) => {
            updateTypingStatus(
                roomId,
                typingStatus.userId,
                typingStatus.username,
                typingStatus.isTyping
            );
        };

        // 이벤트 리스너 등록
        const removeMessageListener = on('message', messageHandler);
        const removeUserJoinListener = on('user_joined', userJoinHandler);
        const removeUserLeaveListener = on('user_left', userLeaveHandler);
        const removeTypingListener = on('typing', typingHandler);

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            removeMessageListener();
            removeUserJoinListener();
            removeUserLeaveListener();
            removeTypingListener();
        };
    }, [
        isConnected,
        roomId,
        on,
        addMessage,
        updateUserStatus,
        updateTypingStatus
    ]);

    // 방 나가기 처리
    const handleLeaveRoom = async () => {
        if (!roomId) return;

        const success = await leaveRoom(roomId);
        if (success) {
            navigate('/rooms', { replace: true });
        }
    };

    // 메시지 전송 처리
    const handleSendMessage = () => {
        if (!messageInput.trim() || !isConnected || !roomId || !user) return;

        emit('send_message', {
            content: messageInput,
            roomId
        });

        setMessageInput('');

        // 타이핑 상태 해제
        clearTypingStatus();
    };

    // 타이핑 상태 처리
    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);

        if (!isConnected || !roomId || !user) return;

        // 타이핑 상태 전송
        emit('typing', {
            isTyping: true,
            roomId
        });

        // 이전 타이머 취소
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
        }

        // 타이핑 중지 타이머 설정
        typingTimerRef.current = setTimeout(() => {
            clearTypingStatus();
        }, 3000);
    };

    // 타이핑 상태 해제
    const clearTypingStatus = () => {
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = null;
        }

        if (isConnected && roomId && user) {
            emit('typing', {
                isTyping: false,
                roomId
            });
        }
    };

    // 룸 ID가 없으면 방 목록으로 리다이렉트
    if (!roomId) {
        navigate('/rooms', { replace: true });
        return null;
    }

    return (
        <div className="chat-room-container">
            <div className="chat-room-header">
                <div className="room-info">
                    <h2>{currentRoom?.name || '채팅방'}</h2>
                    <p className="room-description">{currentRoom?.description}</p>
                </div>

                <div className="room-actions">
                    <div className="connection-status">
                        {isConnected ? '연결됨' : '연결 중...'}
                    </div>
                    <button
                        className="leave-room-button"
                        onClick={handleLeaveRoom}
                    >
                        나가기
                    </button>
                </div>
            </div>

            <div className="chat-room-content">
                <MessageList
                    messages={messages}
                    currentUserId={user?.id}
                />
                <UserList
                    users={roomUsers}
                    currentUserId={user?.id}
                />
            </div>

            <MessageInput
                value={messageInput}
                onChange={handleTyping}
                onSubmit={handleSendMessage}
                disabled={!isConnected}
                placeholder="메시지를 입력하세요..."
            />
        </div>
    );
};

export default ChatRoom;