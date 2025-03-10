import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomList from './pages/ChatRoomList';
import ChatRoom from './pages/ChatRoom';
import ProtectedRoute from './components/common/ProtectedRouter';
import './App.css';

const App: React.FC = () => {
    const { checkAuthStatus } = useAuthStore();

    // 앱 초기화 시 인증 상태 확인
    useEffect(() => {
        const initAuth = async () => {
            await checkAuthStatus();
        };

        initAuth();
    }, [checkAuthStatus]);

    return (
        <Router>
            <div className="app">
                <Routes>
                    {/* 인증 라우트 */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* 보호된 라우트 */}
                    <Route
                        path="/rooms"
                        element={
                            <ProtectedRoute>
                                <RoomList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/rooms/:roomId"
                        element={
                            <ProtectedRoute>
                                <ChatRoom />
                            </ProtectedRoute>
                        }
                    />

                    {/* 기본 리다이렉트 */}
                    <Route path="/" element={<Navigate to="/rooms" replace />} />
                    <Route path="*" element={<Navigate to="/rooms" replace />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;