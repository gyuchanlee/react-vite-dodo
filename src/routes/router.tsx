import {createBrowserRouter, Navigate, Outlet} from "react-router-dom";
// import { redirect } from "react-router-dom";
import ChatPage from "../pages/chat/ChatPage.tsx";
import HomePage from "../pages/HomePage.tsx";
import Login from "../pages/auth/Login.tsx";
import Profile from "../pages/user/Profile.tsx";
import Register from "../pages/auth/Register.tsx";
import useAuthStore from "../stores/authStore.tsx";
import ChatListPage from "../pages/chat/ChatListPage.tsx";

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

// 메인 라우터 설정 todo 나중에 인증까지 넣어서 완료
const router = createBrowserRouter([
    {
        // 인증된 사용자를 위한 경로
        element: <ProtectedLayout />,
        children: [
            {
                path: "/chats",
                element: <ChatListPage />,
                // loader 함수를 사용한 인증 검사 (선택적)
                // loader: authLoader,
            },
            {
                path: "/chats/:id",
                element: <ChatPage />,
                // loader: authLoader,
            },
            {
                path: "/profile",
                element: <Profile />,
                // loader: authLoader,
            },
        ],
    },
    // 모든 사용자에게 열려있음
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
    {
        // 매치되지 않는 모든 경로
        path: "*",
        // element: <Navigate to="/" replace />,
        element: <NotFoundPage />,
    },
]);

export default router;