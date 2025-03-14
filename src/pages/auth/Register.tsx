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
    InputGroup,
    InputRightElement,
    useToast,
    FormHelperText,
    HStack,
    Icon
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import useAuthStore from '../../stores/authStore';

// Updated interface per request
interface RegisterData {
    email: string;
    username: string;
    password: string;
    profile?: string;
}

const Register: React.FC = () => {
    const [formData, setFormData] = useState<RegisterData>({
        email: '',
        username: '',
        password: '',
        // Default profile is now optional
    });

    // For password confirmation (not part of the sent data)
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();
    const toast = useToast();

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'passwordConfirm') {
            setPasswordConfirm(value);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // 비밀번호 유효성 검사
    const validatePassword = () => {
        return formData.password.length >= 8;
    };

    // 비밀번호 확인 일치 여부
    const passwordsMatch = () => {
        return formData.password === passwordConfirm;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        // 유효성 검사
        if (!formData.email || !formData.username || !formData.password) {
            toast({
                title: '입력 오류',
                description: '모든 필수 항목을 입력해주세요.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!validatePassword()) {
            toast({
                title: '비밀번호 오류',
                description: '비밀번호는 8자 이상이어야 합니다.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (!passwordsMatch()) {
            toast({
                title: '비밀번호 불일치',
                description: '비밀번호가 일치하지 않습니다.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // 회원가입 요청
        const success = await register(formData);

        if (success) {
            toast({
                title: '회원가입 성공!',
                description: '로그인 페이지로 이동합니다.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            navigate('/login');
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
                        onClick={() => navigate("/")}
                        cursor="pointer"
                        _hover={{ transform: "scale(1.05)" }}
                        transition="transform 0.2s"
                    />
                    <Heading size="lg" color="slack.purple" textAlign="center">
                        새로운 계정 만들기
                    </Heading>
                    <Text color="gray.500" mt={2} textAlign="center">
                        이웃 함께 소통하세요
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
                        {/* 프로필 이미지 기능은 주석 처리되었습니다 */}
                        {/* <FormControl id="profileImage">
                            <FormLabel>프로필 이미지</FormLabel>
                            ...
                        </FormControl> */}

                        <FormControl id="email" isRequired>
                            <FormLabel>이메일</FormLabel>
                            <Input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your@email.com"
                                size="lg"
                                borderColor="gray.300"
                                _hover={{ borderColor: 'slack.purple' }}
                                focusBorderColor="slack.purple"
                                disabled={isLoading}
                            />
                        </FormControl>

                        <FormControl id="username" isRequired>
                            <FormLabel>사용자 이름</FormLabel>
                            <Input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="사용자 이름 입력"
                                size="lg"
                                borderColor="gray.300"
                                _hover={{ borderColor: 'slack.purple' }}
                                focusBorderColor="slack.purple"
                                disabled={isLoading}
                            />
                        </FormControl>

                        <FormControl id="password" isRequired isInvalid={formData.password.length > 0 && !validatePassword()}>
                            <FormLabel>비밀번호</FormLabel>
                            <InputGroup size="lg">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="비밀번호 입력 (8자 이상)"
                                    borderColor="gray.300"
                                    _hover={{ borderColor: 'slack.purple' }}
                                    focusBorderColor="slack.purple"
                                    disabled={isLoading}
                                />
                                <InputRightElement width="4.5rem">
                                    <Button
                                        h="1.75rem"
                                        size="sm"
                                        variant="ghost"
                                        onClick={toggleShowPassword}
                                    >
                                        {showPassword ?
                                            <Icon as={FiEyeOff} color="gray.500" /> :
                                            <Icon as={FiEye} color="gray.500" />
                                        }
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                            <FormHelperText display="flex" alignItems="center">
                                {formData.password && (
                                    <>
                                        {validatePassword() ? (
                                            <HStack>
                                                <Icon as={FiCheckCircle} color="green.500" />
                                                <Text color="green.500">안전한 비밀번호입니다</Text>
                                            </HStack>
                                        ) : (
                                            <HStack>
                                                <Icon as={FiAlertCircle} color="red.500" />
                                                <Text color="red.500">비밀번호는 8자 이상이어야 합니다</Text>
                                            </HStack>
                                        )}
                                    </>
                                )}
                            </FormHelperText>
                        </FormControl>

                        <FormControl id="passwordConfirm" isRequired isInvalid={passwordConfirm.length > 0 && !passwordsMatch()}>
                            <FormLabel>비밀번호 확인</FormLabel>
                            <InputGroup size="lg">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="passwordConfirm"
                                    value={passwordConfirm}
                                    onChange={handleChange}
                                    placeholder="비밀번호 재입력"
                                    borderColor="gray.300"
                                    _hover={{ borderColor: 'slack.purple' }}
                                    focusBorderColor="slack.purple"
                                    disabled={isLoading}
                                />
                                <InputRightElement width="4.5rem">
                                    <Button
                                        h="1.75rem"
                                        size="sm"
                                        variant="ghost"
                                        onClick={toggleShowConfirmPassword}
                                    >
                                        {showConfirmPassword ?
                                            <Icon as={FiEyeOff} color="gray.500" /> :
                                            <Icon as={FiEye} color="gray.500" />
                                        }
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                            <FormHelperText display="flex" alignItems="center">
                                {passwordConfirm && (
                                    <>
                                        {passwordsMatch() ? (
                                            <HStack>
                                                <Icon as={FiCheckCircle} color="green.500" />
                                                <Text color="green.500">비밀번호가 일치합니다</Text>
                                            </HStack>
                                        ) : (
                                            <HStack>
                                                <Icon as={FiAlertCircle} color="red.500" />
                                                <Text color="red.500">비밀번호가 일치하지 않습니다</Text>
                                            </HStack>
                                        )}
                                    </>
                                )}
                            </FormHelperText>
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="green"
                            bg="slack.green"
                            size="lg"
                            width="100%"
                            mt={4}
                            isLoading={isLoading}
                            loadingText="처리 중..."
                            _hover={{ bg: '#239A67' }}
                        >
                            가입하기
                        </Button>
                    </Stack>
                </form>

                <Divider my={6} />

                <Box textAlign="center">
                    <Text color="gray.600" mb={4}>
                        이미 계정이 있으신가요?
                    </Text>
                    <Link to="/login">
                        <Button
                            variant="outline"
                            colorScheme="purple"
                            width="100%"
                            borderColor="slack.purple"
                            color="slack.purple"
                            _hover={{ bg: 'purple.50' }}
                        >
                            로그인하기
                        </Button>
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default Register;