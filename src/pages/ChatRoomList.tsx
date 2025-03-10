import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useRoomsStore } from '../stores/chatRoomStore';
import { ChatRoom } from '../types/chat';
import './ChatRoomList.css';

const ChatRoomList: React.FC = () => {
    const navigate = useNavigate();

    // 인증 상태
    const { user, isAuthenticated } = useAuthStore();

    // 채팅방 상태
    const rooms = useRoomsStore(state => state.rooms);
    const isLoading = useRoomsStore(state => state.isLoading);
    const error = useRoomsStore(state => state.error);
    const fetchRooms = useRoomsStore(state => state.fetchRooms);
    const joinRoom = useRoomsStore(state => state.joinRoom);
    const createRoom = useRoomsStore(state => state.createRoom);

    // 새 방 생성 모달 상태
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDescription, setNewRoomDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    // 로고 메뉴 상태
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // 인증 상태 확인 및 리다이렉트
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // 채팅방 목록 불러오기
    useEffect(() => {
        if (isAuthenticated) {
            fetchRooms();
        }
    }, [isAuthenticated, fetchRooms]);

    // 내가 참여 중인 방과 가능한 방 분류
    const joinedRooms = rooms.filter(room => room.isJoined);
    const availableRooms = rooms.filter(room => !room.isJoined);

    // 채팅방 입장 핸들러
    const handleJoinRoom = async (room: ChatRoom) => {
        if (room.isJoined) {
            // 이미 참여 중인 방은 바로 입장
            navigate(`/rooms/${room.id}`);
        } else {
            // 참여하지 않은 방은 먼저 참여 처리
            const success = await joinRoom(room.id);
            if (success) {
                navigate(`/rooms/${room.id}`);
            }
        }
    };

    // 새 방 생성 핸들러
    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newRoomName.trim()) return;

        const newRoom = await createRoom(
            newRoomName.trim(),
            newRoomDescription.trim(),
            isPrivate
        );

        if (newRoom) {
            // 생성된 방으로 이동
            navigate(`/rooms/${newRoom.id}`);

            // 상태 초기화
            setNewRoomName('');
            setNewRoomDescription('');
            setIsPrivate(false);
            setShowCreateModal(false);
        }
    };

    // 로그아웃 핸들러
    const handleLogout = async () => {
        const logout = useAuthStore.getState().logout;
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="room-list-page">
            <header className="room-list-header">
                <h1>채팅방 목록</h1>

                <div className="user-menu">
                    <div className="user-info" onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}>
                        <div className="user-avatar">
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name">{user?.username}</span>
                    </div>

                    {showLogoutConfirm && (
                        <div className="logout-confirm">
                            <p>로그아웃 하시겠습니까?</p>
                            <div className="logout-actions">
                                <button
                                    className="logout-button"
                                    onClick={handleLogout}
                                >
                                    로그아웃
                                </button>
                                <button
                                    className="cancel-button"
                                    onClick={() => setShowLogoutConfirm(false)}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="room-list-content">
                {isLoading ? (
                    <div className="loading-indicator">채팅방 목록을 불러오는 중...</div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={fetchRooms}>다시 시도</button>
                    </div>
                ) : (
                    <>
                        {/* 내가 참여 중인 방 */}
                        <section className="room-section">
                            <div className="section-header">
                                <h2>참여 중인 채팅방</h2>
                                <span className="room-count">{joinedRooms.length}</span>
                            </div>

                            {joinedRooms.length === 0 ? (
                                <p className="empty-message">참여 중인 채팅방이 없습니다.</p>
                            ) : (
                                <div className="room-grid">
                                    {joinedRooms.map(room => (
                                        <div
                                            key={room.id}
                                            className="room-card joined"
                                            onClick={() => handleJoinRoom(room)}
                                        >
                                            <div className="room-card-header">
                                                <h3>{room.name}</h3>
                                                {room.isPrivate && <span className="private-badge">비공개</span>}
                                            </div>
                                            <p className="room-description">
                                                {room.description || '설명 없음'}
                                            </p>
                                            <div className="room-meta">
                        <span className="room-participants">
                          참여자 {room.participantsCount}명
                        </span>
                                                <span className="enter-label">입장하기 →</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* 참여 가능한 방 */}
                        <section className="room-section">
                            <div className="section-header">
                                <h2>참여 가능한 채팅방</h2>
                                <span className="room-count">{availableRooms.length}</span>
                            </div>

                            {availableRooms.length === 0 ? (
                                <p className="empty-message">참여 가능한 채팅방이 없습니다.</p>
                            ) : (
                                <div className="room-grid">
                                    {availableRooms.map(room => (
                                        <div
                                            key={room.id}
                                            className="room-card available"
                                            onClick={() => handleJoinRoom(room)}
                                        >
                                            <div className="room-card-header">
                                                <h3>{room.name}</h3>
                                                {room.isPrivate && <span className="private-badge">비공개</span>}
                                            </div>
                                            <p className="room-description">
                                                {room.description || '설명 없음'}
                                            </p>
                                            <div className="room-meta">
                        <span className="room-participants">
                          참여자 {room.participantsCount}명
                        </span>
                                                <span className="join-label">참여하기 →</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            {/* 새 방 생성 버튼 */}
            <button
                className="create-room-button"
                onClick={() => setShowCreateModal(true)}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {/* 새 방 생성 모달 */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="create-room-modal">
                        <h2>새 채팅방 만들기</h2>

                        <form onSubmit={handleCreateRoom}>
                            <div className="form-group">
                                <label htmlFor="roomName">방 이름</label>
                                <input
                                    type="text"
                                    id="roomName"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="채팅방 이름을 입력하세요"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="roomDescription">설명 (선택사항)</label>
                                <textarea
                                    id="roomDescription"
                                    value={newRoomDescription}
                                    onChange={(e) => setNewRoomDescription(e.target.value)}
                                    placeholder="채팅방에 대한 설명을 입력하세요"
                                    rows={3}
                                />
                            </div>

                            <div className="form-group checkbox">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                />
                                <label htmlFor="isPrivate">비공개 채팅방</label>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="create-button"
                                    disabled={!newRoomName.trim()}
                                >
                                    생성하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatRoomList;