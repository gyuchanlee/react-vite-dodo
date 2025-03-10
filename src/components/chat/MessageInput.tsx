import React, {useEffect, useRef} from 'react';
import './MessageInput.css';

interface MessageInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    disabled?: boolean;
    placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
                                                       value,
                                                       onChange,
                                                       onSubmit,
                                                       disabled = false,
                                                       placeholder = '메시지를 입력하세요...'
                                                   }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // 엔터키로 제출
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !disabled) {
                onSubmit();
            }
        }
    };

    // 폼 제출 핸들러
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim() && !disabled) {
            onSubmit();
        }
    };

    // 컴포넌트 마운트 시 입력란에 포커스
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <form className="message-input-container" onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                type="text"
                className="message-input"
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                placeholder={disabled ? '연결 중...' : placeholder}
                disabled={disabled}
            />
            <button
                type="submit"
                className="message-send-button"
                disabled={disabled || !value.trim()}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M22 2L11 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M22 2L15 22L11 13L2 9L22 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </form>
    );
};

export default MessageInput;