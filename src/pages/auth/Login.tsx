import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Text,
    Alert,
    AlertIcon,
    Flex,
    Image,
    Divider,
    useColorModeValue,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const Login: React.FC = () => {
    // 폼 상태 관리
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 인증 스토어에서 필요한 상태와 함수 가져오기
    const { login, isLoading, error, clearError } = useAuthStore();

    // 폼 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        if (!email || !password) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        // 로그인 시도
        const success = await login({ email, password });

        if (success) {
            // 로그인 성공 시 처리 (예: 리다이렉션)
            console.log('로그인 성공!');
        }
    };

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Container maxW="md" py={12}>
            <Box
                bg={bgColor}
                boxShadow="md"
                borderRadius="lg"
                p={8}
                border="1px"
                borderColor={borderColor}
            >
                <Flex direction="column" align="center" mb={6}>
                    {/* 앱 로고 또는 아이콘 */}
                    <Image
                        src="https://img.freepik.com/premium-vector/live-chat-icon-with-speech-bubble-customer-support-online-consultations_855620-580.jpg?w=740"
                        alt="로고"
                        boxSize="80px"
                        mb={4}
                    />
                    <Heading size="lg" color="slack.purple" textAlign="center">
                        동네 사랑방
                    </Heading>
                    <Text color="gray.500" mt={2} textAlign="center">
                        동네 사람들과 소통하세요
                    </Text>
                </Flex>

                {error && (
                    <Alert status="error" mb={4} borderRadius="md">
                        <AlertIcon />
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        <FormControl id="email" isRequired>
                            <FormLabel>이메일</FormLabel>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                size="lg"
                                borderColor="gray.300"
                                _hover={{ borderColor: 'slack.purple' }}
                                focusBorderColor="slack.purple"
                                disabled={isLoading}
                            />
                        </FormControl>

                        <FormControl id="password" isRequired>
                            <FormLabel>비밀번호</FormLabel>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 입력"
                                size="lg"
                                borderColor="gray.300"
                                _hover={{ borderColor: 'slack.purple' }}
                                focusBorderColor="slack.purple"
                                disabled={isLoading}
                            />
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="purple"
                            bg="slack.purple"
                            size="lg"
                            width="100%"
                            mt={4}
                            isLoading={isLoading}
                            loadingText="로그인 중..."
                            _hover={{ bg: '#3D0F3F' }}
                        >
                            로그인
                        </Button>

                        <Flex justifyContent="flex-end" w="100%">
                            <Link to="/forgot-password">
                                <Text color="slack.blue" fontSize="sm" fontWeight="medium">
                                    비밀번호를 잊으셨나요?
                                </Text>
                            </Link>
                        </Flex>
                    </Stack>
                </form>

                <Divider my={6} />

                <Box textAlign="center">
                    <Text color="gray.600" mb={4}>
                        계정이 없으신가요?
                    </Text>
                    <Link to="/register">
                        <Button
                            variant="outline"
                            colorScheme="green"
                            width="100%"
                            borderColor="slack.green"
                            color="slack.green"
                            _hover={{ bg: 'green.50' }}
                        >
                            새 계정 만들기
                        </Button>
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;