import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore();

    // 로딩 중일 때 로딩 표시
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner">
                        <div className="spinner-circle"></div>
                    </div>
                    <p className="loading-text">로딩 중...</p>
                </div>
            </div>
        );
    }

    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 인증된 경우 자식 컴포넌트 렌더링
    return <>{children}</>;
};

export default ProtectedRoute;