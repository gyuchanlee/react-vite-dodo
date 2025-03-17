// src/components/user/EditProfileModal.tsx
import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    VStack,
    useToast,
    InputGroup,
    InputRightElement,
    IconButton
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import useAuthStore from '../../stores/authStore';

interface User {
    email: string;
    username: string;
    profile?: string;
}

interface UpdateData {
    email: string;
    username: string;
    profile?: string;
    password?: string;
}

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userData: User;
    onSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, userData, onSuccess }) => {
    // 상태 관리
    const [formData, setFormData] = useState({
        username: userData.username,
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toast = useToast();
    const { updateUser, isLoading, error, clearError } = useAuthStore();

    // 입력값 변경
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // 에러 메시지 초기화
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // 스토어 에러 초기화
        if (error) {
            clearError();
        }
    };

    // 폼 유효성 검사
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = '사용자 이름을 입력해주세요';
        } else if (formData.username.length < 2 || formData.username.length > 20) {
            newErrors.username = '이름은 2자 이상 20자 이하로 입력해주세요';
        }

        // 비밀번호를 입력한 경우에만 유효성 검사
        if (formData.password) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/;
            if (!passwordRegex.test(formData.password)) {
                newErrors.password = '비밀번호는 8~16자리수여야 하며, 영문, 숫자, 특수문자를 1개 이상 포함해야 합니다';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 폼 제출 핸들러
    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            // API 요청 데이터 준비
            const updateData: UpdateData = {
                email: userData.email,
                username: formData.username,
                profile: userData.profile // 기존 프로필 데이터 유지
            };

            // 비밀번호가 입력된 경우에만 포함
            if (formData.password) {
                updateData.password = formData.password;
            }

            // API 호출
            const success = await updateUser(updateData);

            if (success) {
                onSuccess();
                onClose();
            } else if (error) {
                // 백엔드에서 반환한 에러 메시지 표시
                toast({
                    title: '프로필 업데이트 실패',
                    description: error,
                    status: 'error',
                    duration: 1000,
                    isClosable: true,
                });
            }
        } catch (err) {
            console.error('프로필 업데이트 실패:', err);
            toast({
                title: '프로필 업데이트 실패',
                description: '프로필 정보를 업데이트하는 중 오류가 발생했습니다.',
                status: 'error',
                duration: 1000,
                isClosable: true,
            });
        }
    };

    // 취소 핸들러
    const handleCancel = () => {
        onClose();
    };

    // 비밀번호 표시/숨김 토글
    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            motionPreset="slideInBottom"
            closeOnOverlayClick={true}
            closeOnEsc={true}
            size="md"
        >
            <ModalOverlay backdropFilter="blur(2px)" />
            <ModalContent>
                <ModalHeader color="slack.purple">프로필 수정</ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack spacing={4}>
                        {/* 이메일 (읽기 전용) */}
                        <FormControl>
                            <FormLabel fontWeight="bold">이메일</FormLabel>
                            <Input
                                value={userData.email}
                                isReadOnly
                                bg="gray.100"
                                cursor="not-allowed"
                            />
                        </FormControl>

                        {/* 사용자 이름 */}
                        <FormControl isInvalid={!!errors.username}>
                            <FormLabel fontWeight="bold">사용자 이름</FormLabel>
                            <Input
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                focusBorderColor="slack.green"
                            />
                            {errors.username && (
                                <FormErrorMessage>{errors.username}</FormErrorMessage>
                            )}
                        </FormControl>

                        {/* 비밀번호 */}
                        <FormControl isInvalid={!!errors.password}>
                            <FormLabel fontWeight="bold">새 비밀번호 (선택)</FormLabel>
                            <InputGroup>
                                <Input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="변경하지 않으려면 비워두세요"
                                    focusBorderColor="slack.green"
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                        variant="ghost"
                                        onClick={togglePassword}
                                        size="sm"
                                    />
                                </InputRightElement>
                            </InputGroup>
                            {errors.password && (
                                <FormErrorMessage>{errors.password}</FormErrorMessage>
                            )}
                        </FormControl>

                        {/* 비밀번호 확인 */}
                        <FormControl isInvalid={!!errors.confirmPassword}>
                            <FormLabel fontWeight="bold">비밀번호 확인</FormLabel>
                            <InputGroup>
                                <Input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="비밀번호 확인"
                                    focusBorderColor="slack.green"
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                        variant="ghost"
                                        onClick={toggleConfirmPassword}
                                        size="sm"
                                    />
                                </InputRightElement>
                            </InputGroup>
                            {errors.confirmPassword && (
                                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                            )}
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        colorScheme="gray"
                        mr={3}
                        onClick={handleCancel}
                    >
                        취소
                    </Button>
                    <Button
                        bg="slack.blue"
                        color="white"
                        _hover={{ bg: '#2B9EBC' }}
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        loadingText="저장 중..."
                    >
                        저장
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditProfileModal;