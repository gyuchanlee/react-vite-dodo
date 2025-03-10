import React, { useEffect, useRef } from 'react';
import { Message } from '../../types/chat';
import './MessageList.css';

interface MessageListProps {
    messages: Message[];
    currentUserId: string | undefined;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 새 메시지 도착 시 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // 날짜 포맷팅
    const formatTime = (timestamp: number): string => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 날짜 포맷팅 (전체)
    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleDateString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // 메시지 그룹화 (동일 사용자, 5분 이내 연속 메시지)
    const groupedMessages = messages.reduce<{
        date: string;
        groups: {
            userId: string;
            username: string;
            messages: { id: string; content: string; timestamp: number }[];
        }[]
    }[]>((acc, message) => {
        const messageDate = formatDate(message.timestamp);

        // 날짜 그룹 찾기
        let dateGroup = acc.find(group => group.date === messageDate);

        // 없으면 새 날짜 그룹 생성
        if (!dateGroup) {
            dateGroup = { date: messageDate, groups: [] };
            acc.push(dateGroup);
        }

        // 시스템 메시지는 항상 독립적인 그룹으로 처리
        if (message.userId === 'system') {
            dateGroup.groups.push({
                userId: 'system',
                username: 'System',
                messages: [{
                    id: message.id,
                    content: message.content,
                    timestamp: message.timestamp
                }]
            });
            return acc;
        }

        // 마지막 메시지 그룹
        const lastGroup = dateGroup.groups[dateGroup.groups.length - 1];

        // 동일 사용자의 연속된 메시지이고 5분 이내인 경우 그룹에 추가
        if (
            lastGroup &&
            lastGroup.userId === message.userId &&
            message.timestamp - lastGroup.messages[lastGroup.messages.length - 1].timestamp < 5 * 60 * 1000
        ) {
            lastGroup.messages.push({
                id: message.id,
                content: message.content,
                timestamp: message.timestamp
            });
        } else {
            // 새 그룹 시작
            dateGroup.groups.push({
                userId: message.userId,
                username: message.username,
                messages: [{
                    id: message.id,
                    content: message.content,
                    timestamp: message.timestamp
                }]
            });
        }

        return acc;
    }, []);

    // 빈 메시지 목록 처리
    if (messages.length === 0) {
        return (
            <div className="messages-empty">
                <p>아직 메시지가 없습니다.</p>
                <p>첫 메시지를 보내보세요!</p>
            </div>
        );
    }

    return (
        <div className="messages-list">
            {groupedMessages.map((dateGroup) => (
                <div key={dateGroup.date} className="message-date-group">
                    <div className="message-date">
                        <span>{dateGroup.date}</span>
                    </div>

                    {dateGroup.groups.map((group, groupIndex) => (
                        <div
                            key={`${group.userId}-${groupIndex}`}
                            className={`message-group ${
                                group.userId === 'system'
                                    ? 'system-group'
                                    : group.userId === currentUserId
                                        ? 'my-group'
                                        : 'other-group'
                            }`}
                        >
                            {/* 시스템 메시지가 아닌 경우 사용자 정보 표시 */}
                            {group.userId !== 'system' && (
                                <div className="message-user-info">
                                    <div className="message-avatar">
                                        {group.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="message-username">
                                        {group.username}
                                    </div>
                                </div>
                            )}

                            <div className="message-content-group">
                                {group.messages.map((message, messageIndex) => (
                                    <div key={message.id} className="message-bubble">
                                        <div className="message-content">{message.content}</div>
                                        {messageIndex === group.messages.length - 1 && (
                                            <div className="message-time">{formatTime(message.timestamp)}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;