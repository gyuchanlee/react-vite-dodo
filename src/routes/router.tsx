import {createBrowserRouter, Navigate, Outlet} from "react-router-dom";
// import { redirect } from "react-router-dom";
import ChatPage from "../pages/chat/ChatPage.tsx";
import HomePage from "../pages/HomePage.tsx";
import Login from "../pages/auth/Login.tsx";
import Profile from "../pages/user/Profile.tsx";
import Register from "../pages/auth/Register.tsx";
import useAuthStore from "../stores/authStore.tsx";
import ChatListPage from "../pages/chat/ChatListPage.tsx";
import MainLayout from "../layouts/MainLayout.tsx";


// 에러페이지
const NotFoundPage = () => {
    return (
        <div style={{
            padding: '50px',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto'
        }}>
            <h1>페이지를 찾을 수 없습니다</h1>
            <p>요청하신 주소는 존재하지 않습니다.</p>
            <a
                href="/"
                style={{
                    display: 'inline-block',
                    marginTop: '20px',
                    padding: '10px 15px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                }}
            >
                홈으로 돌아가기
            </a>
        </div>
    );
};

const PLZ_SKIP = true; // 권한없이 개발하는 동안 false

// 보호된 라우트를 위한 레이아웃 컴포넌트
const ProtectedLayout = () => {
    const { isAuthenticated } = useAuthStore();

    // 인증 상태 확인
    if (PLZ_SKIP) {
        // 인증되지 않은 경우 로그인 페이지로 리디렉션
        if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
        }
    }

    // 인증된 경우 자식 라우트 렌더링
    return <Outlet />;
};

// 메인 라우터 설정
const router = createBrowserRouter([
    {
        // 루트 경로에 바텀 네비게이션 레이아웃 적용
        element: <MainLayout />,
        children: [
            // 인증이 필요한 경로들
            {
                element: <ProtectedLayout />,
                children: [
                    {
                        path: "/chats",
                        element: <ChatListPage />,
                    },
                    {
                        path: "/chats/:id",
                        element: <ChatPage />,
                    },
                    {
                        path: "/profile",
                        element: <Profile />,
                    },
                ],
            },
            // 인증이 필요하지 않은 경로들
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/register",
                element: <Register />
            },
        ],
    },
    // 에러 페이지 (바텀 네비게이션 없이)
    {
        path: "*",
        element: <NotFoundPage />,
    },
]);

export default router;