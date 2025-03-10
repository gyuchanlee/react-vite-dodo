import React from 'react';
import { ChatUser } from '../../types/chat';
import './UserList.css';

interface UserListProps {
    users: ChatUser[];
    currentUserId?: number;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
    // 온라인/오프라인 사용자로 분류
    const onlineUsers = users.filter(user => user.isOnline);
    const offlineUsers = users.filter(user => !user.isOnline);

    return (
        <div className="user-list">
            <div className="user-list-header">
                <h3>접속자 목록 ({onlineUsers.length})</h3>
            </div>

            <div className="user-list-content">
                {onlineUsers.length === 0 && offlineUsers.length === 0 ? (
                    <div className="user-list-empty">사용자가 없습니다.</div>
                ) : (
                    <>
                        {/* 온라인 사용자 */}
                        <div className="user-category">
                            <h4>온라인 ({onlineUsers.length})</h4>
                            <ul>
                                {onlineUsers.map(user => (
                                    <li
                                        key={user.id}
                                        className={`
                      user-item online 
                      ${user.id === currentUserId ? 'current-user' : ''}
                      ${user.isTyping ? 'typing' : ''}
                    `}
                                    >
                                        <div className="user-avatar">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-info">
                                            <div className="user-name">
                                                {user.username}
                                                {user.id === currentUserId && <span className="user-me">(나)</span>}
                                            </div>
                                            {user.isTyping && (
                                                <div className="typing-indicator">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 오프라인 사용자 */}
                        {offlineUsers.length > 0 && (
                            <div className="user-category">
                                <h4>오프라인 ({offlineUsers.length})</h4>
                                <ul>
                                    {offlineUsers.map(user => (
                                        <li
                                            key={user.id}
                                            className={`
                        user-item offline
                        ${user.id === currentUserId ? 'current-user' : ''}
                      `}
                                        >
                                            <div className="user-avatar offline">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <div className="user-name">
                                                    {user.username}
                                                    {user.id === currentUserId && <span className="user-me">(나)</span>}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserList;