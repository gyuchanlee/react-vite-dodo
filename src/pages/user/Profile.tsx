import React from 'react';
import {
    Box,
    Button,
    Container,
    Divider,
    Flex,
    Heading,
    Text,
    Avatar,
    VStack,
    HStack,
    Badge,
    useColorModeValue,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    IconButton
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { FiEdit, FiLogOut } from 'react-icons/fi';

const Profile: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.700', 'gray.200');

    // 인증되지 않은 사용자 처리
    if (!isAuthenticated || !user) {
        return (
            <Container maxW="lg" py={12}>
                <Box
                    bg={bgColor}
                    boxShadow="md"
                    borderRadius="lg"
                    p={8}
                    border="1px"
                    borderColor={borderColor}
                    textAlign="center"
                >
                    <Heading size="lg" mb={6} color="slack.purple">
                        접근 권한이 없습니다
                    </Heading>
                    <Text mb={8} color={textColor}>
                        이 페이지를 보려면 로그인이 필요합니다.
                    </Text>
                    <Button
                        colorScheme="purple"
                        bg="slack.purple"
                        onClick={() => navigate('/login')}
                        size="lg"
                        _hover={{ bg: '#3D0F3F' }}
                    >
                        로그인 페이지로 이동
                    </Button>
                </Box>
            </Container>
        );
    }

    // 로그아웃 핸들러
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // 사용자 가입일 포맷팅
    const formattedDate = new Date(user.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Container maxW="lg" py={12}>
            <Card
                bg={bgColor}
                boxShadow="md"
                borderRadius="lg"
                overflow="hidden"
                border="1px"
                borderColor={borderColor}
            >
                <CardHeader bg="slack.purple" px={6} py={5}>
                    <Flex justify="space-between" align="center">
                        <Heading size="md" color="white">
                            사용자 프로필
                        </Heading>
                        <IconButton
                            aria-label="로그아웃"
                            variant="ghost"
                            color="white"
                            icon={<FiLogOut />}
                            onClick={handleLogout}
                            _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                        />
                    </Flex>
                </CardHeader>

                <CardBody p={0}>
                    <Flex direction="column" align="center" pt={8} pb={4}>
                        <Avatar
                            size="2xl"
                            name={user.username}
                            bg="slack.green"
                            color="white"
                            mb={4}
                        />
                        <Heading size="lg" color="slack.purple">
                            {user.username}
                        </Heading>
                        <Badge colorScheme="green" mt={2}>
                            Active
                        </Badge>
                    </Flex>

                    <Divider />

                    <VStack spacing={4} align="start" p={6}>
                        <HStack w="full">
                            <Text fontWeight="bold" color="gray.500" w="120px">
                                이메일:
                            </Text>
                            <Text color={textColor}>{user.email}</Text>
                        </HStack>

                        {user.profile && (
                            <HStack w="full" alignItems="flex-start">
                                <Text fontWeight="bold" color="gray.500" w="120px">
                                    프로필:
                                </Text>
                                <Text color={textColor}>{user.profile}</Text>
                            </HStack>
                        )}

                        <HStack w="full">
                            <Text fontWeight="bold" color="gray.500" w="120px">
                                가입일:
                            </Text>
                            <Text color={textColor}>{formattedDate}</Text>
                        </HStack>
                    </VStack>
                </CardBody>

                <CardFooter bg="gray.50" borderTop="1px" borderColor={borderColor} p={4}>
                    <Button
                        leftIcon={<FiEdit />}
                        colorScheme="blue"
                        bg="slack.blue"
                        size="md"
                        width="full"
                        _hover={{ bg: '#2B9EBC' }}
                    >
                        프로필 수정
                    </Button>
                </CardFooter>
            </Card>
        </Container>
    );
};

export default Profile;