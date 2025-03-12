import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
// import { redirect } from "react-router-dom";
import ChatPage from "../pages/chat/ChatPage.tsx";
import HomePage from "../pages/HomePage.tsx";

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

const PLZ_SKIP = false; // 개발하는 동안 false

// 로컬 스토리지에서 인증 확인 함수 todo JWT 적용 후.
const checkAuth = () => {
    const user = localStorage.getItem('token');
    return !!user;
};

// 보호된 라우트를 위한 레이아웃 컴포넌트 todo 인증 로직 완성시키기
const ProtectedLayout = () => {
    // 인증 상태 확인
    if (PLZ_SKIP) {
        const isAuthenticated: boolean = checkAuth();

        // 인증되지 않은 경우 로그인 페이지로 리디렉션
        if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
        }
    }

    // 인증된 경우 자식 라우트 렌더링
    return <Outlet />;
};

// 이미 인증된 사용자를 위한
// const AuthRedirect = () => {
//     const isAuthenticated = checkAuth();
//
//     // 이미 인증된 경우 채팅 목록으로 리디렉션
//     if (isAuthenticated) {
//         return <Navigate to="/chats" replace />;
//     }
//
//     // 인증되지 않은 경우 자식 라우트 렌더링
//     return <Outlet />;
// };

// 라우터 로더 함수 - 인증 필요한 라우트에 사용
// const authLoader = () => {
//     const isAuthenticated = checkAuth();
//
//     if (!isAuthenticated) {
//         // 현재 경로를 state로 전달하여 로그인 후 리디렉션 가능하게 함
//         return redirect(`/login?redirect=${window.location.pathname}`);
//     }
//
//     return null; // 인증 성공 시 계속 진행
// };

// 메인 라우터 설정 todo 나중에 인증까지 넣어서 완료
const router = createBrowserRouter([
    {
        // 인증된 사용자를 위한 경로
        element: <ProtectedLayout />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                // todo 나중에 채팅방 리스트 찾기 해야댐
                path: "/chats",
                element: <ChatPage />,
                // loader 함수를 사용한 인증 검사 (선택적)
                // loader: authLoader,
            },
            {
                path: "/chats/:chatId",
                element: <ChatPage />,
                // loader: authLoader,
            },
        ],
    },
    // {
    //     // 인증되지 않은 사용자를 위한 경로
    //     element: <AuthRedirect />,
    //     children: [
    //         {
    //             path: "login",
    //             element: <LoginPage />,
    //         },
    //     ],
    // },
    {
        // 매치되지 않는 모든 경로
        path: "*",
        // element: <Navigate to="/" replace />,
        element: <NotFoundPage />,
    },
]);

export default router;