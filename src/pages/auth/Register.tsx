import React, { useState, useRef } from 'react';
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
    Icon,
    Center,
    Avatar,
    AvatarBadge
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiUpload, FiX } from 'react-icons/fi';
import useAuthStore from '../../stores/authStore';

interface RegisterFormData {
    email: string;
    username: string;
    password: string;
    passwordConfirm: string;
    profileImage?: File | null;
}

const Register: React.FC = () => {
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        username: '',
        password: '',
        passwordConfirm: '',
        profileImage: null
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();
    const toast = useToast();

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // 파일 크기 제한 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: '파일 크기 초과',
                    description: '프로필 이미지는 5MB 이하만 가능합니다.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            // 이미지 파일 타입 검사
            if (!file.type.match('image.*')) {
                toast({
                    title: '파일 형식 오류',
                    description: '이미지 파일만 업로드 가능합니다.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            // 미리보기 이미지 설정
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);

            // 폼 데이터에 이미지 파일 저장
            setFormData(prev => ({
                ...prev,
                profileImage: file
            }));
        }
    };

    const removeImage = () => {
        setPreviewImage(null);
        setFormData(prev => ({
            ...prev,
            profileImage: null
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // 비밀번호 유효성 검사
    const validatePassword = () => {
        return formData.password.length >= 8;
    };

    // 비밀번호 확인 일치 여부
    const passwordsMatch = () => {
        return formData.password === formData.passwordConfirm;
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

        // FormData 객체 생성 (이미지 업로드를 위해)
        const formDataToSend = new FormData();
        formDataToSend.append('email', formData.email);
        formDataToSend.append('username', formData.username);
        formDataToSend.append('password', formData.password);

        // 프로필 이미지가 있다면 추가
        if (formData.profileImage) {
            // formDataToSend.append('profileImage', formData.profileImage);
        }

        // 회원가입 요청 (useAuthStore의 register 함수를 FormData를 처리할 수 있도록 수정해야 함)
        const success = await register(formDataToSend);

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
                        src="https://via.placeholder.com/100"
                        alt="로고"
                        boxSize="80px"
                        mb={4}
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
                        <FormControl id="profileImage">
                            <FormLabel>프로필 이미지</FormLabel>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                style={{ display: 'none' }}
                                disabled={isLoading}
                            />

                            <Center>
                                {previewImage ? (
                                    <Box position="relative">
                                        <Avatar
                                            size="2xl"
                                            src={previewImage}
                                            name={formData.username || '사용자'}
                                            mb={2}
                                        >
                                            <AvatarBadge
                                                boxSize="1.5em"
                                                bg="red.500"
                                                borderColor="white"
                                                cursor="pointer"
                                                onClick={removeImage}
                                            >
                                                <Icon as={FiX} color="white" />
                                            </AvatarBadge>
                                        </Avatar>
                                    </Box>
                                ) : (
                                    <Box
                                        onClick={triggerFileInput}
                                        cursor="pointer"
                                        borderWidth={2}
                                        borderStyle="dashed"
                                        borderColor="gray.300"
                                        borderRadius="full"
                                        p={10}
                                        _hover={{ borderColor: 'slack.purple' }}
                                        transition="border-color 0.2s"
                                    >
                                        <Flex direction="column" align="center">
                                            <Icon as={FiUpload} fontSize="3xl" color="gray.400" mb={2} />
                                            <Text color="gray.500" fontSize="sm">프로필 이미지 추가</Text>
                                        </Flex>
                                    </Box>
                                )}
                            </Center>

                            {!previewImage && (
                                <Button
                                    mt={2}
                                    size="sm"
                                    leftIcon={<FiUpload />}
                                    onClick={triggerFileInput}
                                    variant="outline"
                                    colorScheme="purple"
                                    w="full"
                                    disabled={isLoading}
                                >
                                    이미지 업로드
                                </Button>
                            )}
                            <FormHelperText textAlign="center">
                                JPG, PNG 파일 (최대 5MB)
                            </FormHelperText>
                        </FormControl>

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

                        <FormControl id="passwordConfirm" isRequired isInvalid={formData.passwordConfirm.length > 0 && !passwordsMatch()}>
                            <FormLabel>비밀번호 확인</FormLabel>
                            <InputGroup size="lg">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="passwordConfirm"
                                    value={formData.passwordConfirm}
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
                                {formData.passwordConfirm && (
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