import React from 'react';
import {
    Box,
    Button,
    ChakraProvider,
    Container,
    extendTheme,
    Flex,
    Heading,
    Icon,
    ThemeConfig,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import {Home, LogIn, MessageCircle, User} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import useAuthStore from "../stores/authStore.tsx";

// Define custom color theme type
interface SlackColors {
    purple: string;
    green: string;
    blue: string;
    yellow: string;
    red: string;
    gray: string;
    lightGray: string;
}

// Extend theme configuration
const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};

// Create theme with Slack-inspired colors
const theme = extendTheme({
    config,
    colors: {
        slack: {
            purple: '#4A154B',
            green: '#2BAC76',
            blue: '#36C5F0',
            yellow: '#ECB22E',
            red: '#E01E5A',
            gray: '#1D1C1D',
            lightGray: '#F8F8F8',
        } as SlackColors,
    },
    components: {
        Button: {
            baseStyle: {
                _hover: {
                    transform: 'scale(1.05)',
                    boxShadow: 'md'
                },
                transition: 'all 0.2s'
            }
        },
        Container: {
            baseStyle: {
                maxW: '150%', // Increase width by 1.5 times
            }
        }
    }
});

const HomePage: React.FC = () => {
    // Simulating authentication state
    const { isAuthenticated, logout } = useAuthStore();

    const navBgColor = useColorModeValue('slack.lightGray', 'slack.gray');
    const navTextColor = useColorModeValue('slack.gray', 'white');
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login");
    };

    const handleLogout = () => {
        // 로그아웃 수행
        logout();
    };

    return (
        <ChakraProvider theme={theme}>
            <Container
                maxW="150%"
                centerContent
                height="100vh"
                display="flex"
                flexDirection="column"
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
                        {!isAuthenticated ? <Button
                            colorScheme="slack"
                            variant="ghost"
                            size="lg"
                            leftIcon={<User />}
                            onClick={(() => navigate("/register"))}
                        >
                            회원가입
                        </Button> : <></>
                        }
                    </VStack>

                    {/* Bottom Navigation */}
                    <Flex
                        as="nav"
                        height="60px"
                        bg={navBgColor}
                        color={navTextColor}
                        alignItems="center"
                        justifyContent="space-around"
                        boxShadow="lg"
                    >
                        <Box as="button" p={2}>
                            <Icon as={Home} w={6} h={6} />
                        </Box>
                        <Box as="button" p={2}>
                            <Icon as={MessageCircle} w={6} h={6} />
                        </Box>
                        <Box as="button" p={2}>
                            {isAuthenticated ? (
                                <Icon as={User} w={6} h={6} />
                            ) : (
                                <Icon as={LogIn} w={6} h={6} />
                            )}
                        </Box>
                    </Flex>
                </Box>
            </Container>
        </ChakraProvider>
    );
};

export default HomePage;