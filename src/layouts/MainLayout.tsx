// src/layouts/MainLayout.tsx
import React from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {Box, ChakraProvider, extendTheme, Flex, Icon, ThemeConfig, useColorModeValue} from '@chakra-ui/react';
import {Home, LogIn, MessageCircle, User} from 'lucide-react';
import useAuthStore from '../stores/authStore';

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

const MainLayout: React.FC = () => {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const navBgColor = useColorModeValue('slack.lightGray', 'slack.gray');
    const navTextColor = useColorModeValue('slack.gray', 'white');

    return (
        <ChakraProvider theme={theme}>
            <Box
                minHeight="100vh"
                display="flex"
                flexDirection="column"
                width="100%"
                maxWidth="100%"
            >
                {/* Main Content - 원래 크기 유지 */}
                <Box
                    flex="1"
                    width="100%"
                    maxWidth="100%"
                >
                    <Outlet />
                </Box>

                {/* Bottom Navigation */}
                <Flex
                    as="nav"
                    height="60px"
                    bg={navBgColor}
                    color={navTextColor}
                    alignItems="center"
                    justifyContent="space-around"
                    boxShadow="lg"
                    width="100%"
                    position="sticky"
                    bottom="0"
                    zIndex="1"
                >
                    <Box as="button" p={2} onClick={() => navigate('/')}>
                        <Icon as={Home} w={6} h={6} />
                    </Box>
                    <Box as="button" p={2} onClick={() => navigate('/chats')}>
                        <Icon as={MessageCircle} w={6} h={6} />
                    </Box>
                    <Box as="button" p={2} onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}>
                        {isAuthenticated ? (
                            <Icon as={User} w={6} h={6} />
                        ) : (
                            <Icon as={LogIn} w={6} h={6} />
                        )}
                    </Box>
                </Flex>
            </Box>
        </ChakraProvider>
    );
};

export default MainLayout;