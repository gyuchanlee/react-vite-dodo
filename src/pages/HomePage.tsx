// src/pages/HomePage.tsx
import React from 'react';
import {
    Box,
    Button,
    Container,
    Heading,
    VStack,
    useColorModeValue
} from '@chakra-ui/react';
import { LogIn, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from "../stores/authStore";

const HomePage: React.FC = () => {
    // Simulating authentication state
    const { isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login");
    };

    const handleLogout = () => {
        // 로그아웃 수행
        logout();
    };

    return (
        <Container
            maxW="150%"
            centerContent
            height="calc(100vh - 60px)" // 바텀 네비게이션 높이만큼 뺌
            display="flex"
            flexDirection="column"
            padding="0"
            margin="0"
        >
            <Box
                width="100%"
                height="100%"
                display="flex"
                flexDirection="column"
                bg={useColorModeValue('white', 'slack.gray')}
            >
                {/* Main Content */}
                <VStack
                    flex="1"
                    justify="center"
                    spacing={6}
                    p={4}
                    textAlign="center"
                    width="100%"
                >
                    <Heading
                        color="slack.purple"
                        size="2xl"
                        mb={8}
                    >
                        동네 사랑방
                    </Heading>

                    <Button
                        colorScheme="slack"
                        variant="solid"
                        size="lg"
                        leftIcon={<MessageCircle />}
                        bg="slack.blue"
                        _hover={{ bg: 'slack.green' }}
                        onClick={() => navigate('/chats')}
                    >
                        채팅방 입장
                    </Button>

                    {!isAuthenticated ? (
                        <Button
                            colorScheme="slack"
                            variant="outline"
                            size="lg"
                            leftIcon={<LogIn />}
                            borderColor="slack.purple"
                            color="slack.purple"
                            onClick={handleLogin}
                        >
                            로그인
                        </Button>
                    ) : (
                        <Button
                            colorScheme="slack"
                            variant="outline"
                            size="lg"
                            leftIcon={<LogIn />}
                            borderColor="slack.red"
                            color="slack.red"
                            onClick={handleLogout}
                        >
                            로그아웃
                        </Button>
                    )}
                    {!isAuthenticated ? (
                        <Button
                            colorScheme="slack"
                            variant="ghost"
                            size="lg"
                            leftIcon={<User />}
                            onClick={(() => navigate("/register"))}
                        >
                            회원가입
                        </Button>
                    ) : <></>}
                </VStack>
            </Box>
        </Container>
    );
};

export default HomePage;