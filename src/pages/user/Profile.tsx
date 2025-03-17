// src/pages/user/Profile.tsx
import React from 'react';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Container,
    Divider,
    Flex,
    Heading,
    HStack,
    IconButton,
    Text,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack
} from '@chakra-ui/react';
import {useNavigate} from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import {FiEdit, FiHome, FiLogOut} from 'react-icons/fi';
import EditProfileModal from '../../components/user/EditProfileModal';

const Profile: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const toast = useToast();

    // 모달 상태 관리
    const { isOpen, onOpen, onClose } = useDisclosure();

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const textColor = useColorModeValue('gray.700', 'gray.200');

    // 모달이 성공적으로 닫혔을 때 실행할 함수
    const handleEditSuccess = () => {
        toast({
            title: "프로필 업데이트",
            description: "프로필 정보가 성공적으로 업데이트되었습니다.",
            status: "success",
            duration: 1000,
            isClosable: true,
        });
    };

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
        navigate('/');
    };

    // 홈으로 이동 핸들러
    const handleGoHome = () => {
        navigate('/');
    };

    // 사용자 가입일 포맷팅
    const formattedDate = new Date(user.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Container maxW="lg" py={12} pb={16}> {/* 하단 패딩 추가 (바텀 내비게이션 공간) */}
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
                        <HStack spacing={2}>
                            <IconButton
                                aria-label="홈으로"
                                variant="ghost"
                                color="white"
                                icon={<FiHome />}
                                onClick={handleGoHome}
                                _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                            />
                            <IconButton
                                aria-label="로그아웃"
                                variant="ghost"
                                color="white"
                                icon={<FiLogOut />}
                                onClick={handleLogout}
                                _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                            />
                        </HStack>
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
                        onClick={onOpen}
                        _hover={{ bg: '#2B9EBC' }}
                    >
                        프로필 수정
                    </Button>
                </CardFooter>
            </Card>

            {/* 프로필 수정 모달 */}
            <EditProfileModal
                isOpen={isOpen}
                onClose={onClose}
                userData={user}
                onSuccess={handleEditSuccess}
            />
        </Container>
    );
};

export default Profile;