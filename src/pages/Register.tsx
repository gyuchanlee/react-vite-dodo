import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './Register.css';

const Register: React.FC = () => {
    const navigate = useNavigate();

    // 인증 상태
    const { register, isLoading, error, isAuthenticated, clearError } = useAuthStore();

    // 폼 상태
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');

    // 인증 상태 확인 및 리다이렉트
    useEffect(() => {
        // 이미 로그인된 경우 채팅방 목록으로 이동
        if (isAuthenticated) {
            navigate('/rooms', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // 에러 상태 초기화
    useEffect(() => {
        // 컴포넌트 마운트 시 에러 상태 초기화
        clearError();

        return () => {
            // 컴포넌트 언마운트 시 에러 상태 초기화
            clearError();
        };
    }, [clearError]);

    // 폼 검증
    const validateForm = (): boolean => {
        // 사용자명 검증
        if (!username.trim()) {
            setFormError('사용자명을 입력해주세요.');
            return false;
        }

        if (username.length < 2 || username.length > 20) {
            setFormError('사용자명은 2자 이상 20자 이하여야 합니다.');
            return false;
        }

        // 이메일 형식 검증
        if (!email.trim()) {
            setFormError('이메일을 입력해주세요.');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setFormError('유효한 이메일 형식이 아닙니다.');
            return false;
        }

        // 비밀번호 검증
        if (!password.trim()) {
            setFormError('비밀번호를 입력해주세요.');
            return false;
        }

        if (password.length < 6) {
            setFormError('비밀번호는 6자 이상이어야 합니다.');
            return false;
        }

        // 비밀번호 확인 검증
        if (password !== confirmPassword) {
            setFormError('비밀번호가 일치하지 않습니다.');
            return false;
        }

        setFormError('');
        return true;
    };

    // 회원가입 처리
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const success = await register(username, email, password);
        if (success) {
            navigate('/rooms', { replace: true });
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1>회원가입</h1>
                    <p>채팅 앱에 가입하고 다양한 대화에 참여하세요</p>
                </div>

                <form className="register-form" onSubmit={handleSubmit}>
                    {(formError || error) && (
                        <div className="error-message">
                            {formError || error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">사용자명</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="사용자명을 입력하세요"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일 주소를 입력하세요"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">비밀번호 확인</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호를 다시 입력하세요"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                        disabled={isLoading}
                    >
                        {isLoading ? '가입 중...' : '회원가입'}
                    </button>
                </form>

                <div className="login-link">
                    <p>
                        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;