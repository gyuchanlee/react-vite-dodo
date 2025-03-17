import React, {useEffect, useRef, useState} from "react";
import {Stomp} from "@stomp/stompjs";
import {
    Avatar,
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    Spacer,
    Text,
    useColorModeValue,
    useToast,
    VStack
} from "@chakra-ui/react";
import {ArrowBackIcon, ArrowForwardIcon, ChatIcon} from "@chakra-ui/icons";
import { useNavigate, useParams } from "react-router-dom";
import http from "../../api/http.tsx";
import useAuthStore from "../../stores/authStore.tsx";

// 메시지 타입 정의
interface Message {
    messageId: number;
    username: string;
    content: string;
}

export default function ChatPage() {

    // 웹소켓 연결 객체
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stompClient = useRef<any>(null);
    // 메시지 리스트
    const [messages, setMessages] = useState<Message[]>([]);
    // 사용자 입력을 저장할 변수
    const [inputValue, setInputValue] = useState<string>('');
    // 메시지 컨테이너 ref
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // 토스트 알림
    const toast = useToast();
    const navigate = useNavigate();
    // zustand
    const email = useAuthStore((state) => state.user?.email);
    const username = useAuthStore((state) => state.user?.username);
    const isAuthenticated  = useAuthStore((state) => state.isAuthenticated );
    // 주소 url 에서 가져오기
    const { id } = useParams();
    const chatRoomId = id ? parseInt(id, 10) : undefined;

    // 입력 필드 변화에마다 밸류 업뎃
    const handleInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setInputValue(e.target.value);
    };

    // 엔터 키 처리
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    // 메시지 전송
    const sendMessage = () => {
        // connected 상태인지 확인 추가
        if (stompClient.current && stompClient.current.connected && inputValue) {
            const body = {
                email: email,
                chatRoomId: chatRoomId,
                content: inputValue
            };
            stompClient.current.send(`/pub/message`, {}, JSON.stringify(body));
            setInputValue('');
        } else if (!inputValue) {
            // 빈 메시지는 무시
            return;
        }  else {
            console.log("WebSocket is not connected@@@@@@@@@");
            // 연결 오류 토스트 표시
            toast({
                title: "연결 오류",
                description: "채팅 서버에 연결되어 있지 않습니다. 재연결 중...",
                status: "error",
                duration: 1000,
                isClosable: true,
            });
            // 연결이 안되어 있다면 다시 연결 시도
            connect();
        }
    };

    // 스크롤을 맨 아래로 이동
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 새로운 메시지가 오면 스크롤 이동
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 초기 설정
    useEffect(() => {
        connect();
        fetchMessages();
        // 컴포넌트 언마운트 시 웹소켓 연결 해제
        return () => disconnect();
    }, []);

    // isAuthenticated -> 만료되어서 로그아웃되었을 경우 대비
    useEffect(() => {
        // 인증 상태가 변경되면 처리
        if (!isAuthenticated) {
            // 소켓 연결 해제 로직
            if (stompClient.current && stompClient.current.connected) {
                stompClient.current.disconnect();
            }
        } else if (isAuthenticated) {
            // 연결 로직
            connect();
        }
    }, [isAuthenticated]);

    // 웹소켓 연결 함수
    const connect = () => {
        const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws"; // todo 배포 시 url 변경
        const socket = new WebSocket(wsUrl);
        stompClient.current = Stomp.over(socket);
        stompClient.current.connect({}, () => {
            // 메시지 수신
            stompClient.current.subscribe(`/sub/chatroom/${chatRoomId}`, (message: { body: string; }) => {
                // 누군가 발송했던 메시지를 리스트에 추가 (메시지 리스트 최신화)
                const newMessage = JSON.parse(message.body);
                console.log('#########################')
                console.log(newMessage)
                setMessages((preMessages) => [...preMessages, newMessage]);

                // 다른 사용자의 메세지일 경우 알림
                if (newMessage.username !== username) {
                    toast({
                        title: `${newMessage.username}님의 메시지`,
                        description: newMessage.content,
                        status: "info",
                        duration: 500,
                        isClosable: true,
                    });
                }
            })
            // 연결 성공 토스트
            toast({
                title: "연결 성공",
                description: "채팅 서버에 연결되었습니다.",
                status: "success",
                duration: 500,
                isClosable: true,
            });
        });
    }

    // 기존에 저장되어 있는 채팅리스트를 axios를 통해 http로 가져옴.
    // 임시로 더미 데이터 사용 todo 백엔드 메시지 가져오기
    const fetchMessages = async () => {
        try {
            const res = await http.get(`/api/chat/${chatRoomId}`);
            setMessages(res.data);
        } catch (error) {
            console.log(error);
            toast({
                title: "메시지 로드 오류",
                description: "채팅 내역을 불러오는데 실패했습니다.",
                status: "error",
                duration: 500,
                isClosable: true,
            });
        }
    };

    // 연결 해제 함수
    const disconnect = () => {
        if (stompClient.current) {
            stompClient.current.disconnect();
        }
    };

    // 배경색 설정
    const bgColor = useColorModeValue("white", "gray.800");
    const headerBg = useColorModeValue("slack.purple", "slack.gray");
    const messageAreaBg = useColorModeValue("gray.50", "gray.700");


    return (
        <Container
            maxW="container.md"
            p={0}
            height="calc(100vh - 60px)" // 바텀 네비게이션 높이(60px)만큼 빼줌
            pt={2} // 상단에 약간의 패딩 추가
            pb={2} // 하단에 약간의 패딩 추가
        >
            <Flex
                direction="column"
                h="100%"
                bg={bgColor}
                borderRadius="md"
                overflow="hidden"
                boxShadow="lg"
            >
                {/* 채팅 헤더 */}
                <Box p={3} bg={headerBg} color="white"> {/* 헤더 패딩 줄임 */}
                    <Flex align="center">
                        <Button
                            variant="ghost"
                            color="white"
                            mr={2}
                            size="sm" // 버튼 크기 줄임
                            onClick={() => navigate("/chats")}
                            _hover={{ bg: "rgba(255,255,255,0.2)" }}
                        >
                            <ArrowBackIcon boxSize={5} /> {/* 아이콘 크기 줄임 */}
                        </Button>
                        <ChatIcon mr={2} />
                        <Heading size="md">실시간 채팅</Heading>
                        <Spacer />
                        <Text fontSize="sm">
                            {messages.length} 메시지
                        </Text>
                    </Flex>
                </Box>

                {/* 메시지 영역 */}
                <Box
                    flex="1"
                    overflowY="auto"
                    p={3} // 패딩 줄임
                    bg={messageAreaBg}
                    css={{
                        "&::-webkit-scrollbar": {
                            width: "6px", // 스크롤바 너비 줄임
                        },
                        "&::-webkit-scrollbar-track": {
                            width: "8px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: "#CBD5E0",
                            borderRadius: "24px",
                        },
                    }}
                >
                    <VStack spacing={3} align="stretch"> {/* 간격 줄임 */}
                        {messages.map((item, index) => (
                            <MessageItem key={index} message={item} isMine={item.username === username} />
                        ))}
                        <div ref={messagesEndRef} />
                    </VStack>
                </Box>

                {/* 메시지 입력 영역 */}
                <Box p={3} borderTopWidth="1px" bg="white"> {/* 패딩 줄임 */}
                    <InputGroup size="md">
                        <Input
                            placeholder="메시지를 입력하세요..."
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyPress}
                            focusBorderColor="slack.green"
                            pr="4.5rem"
                        />
                        <InputRightElement width="4.5rem">
                            <Button
                                h="2.38rem"
                                size="sm"
                                colorScheme="green"
                                onClick={sendMessage}
                                rightIcon={<ArrowForwardIcon />}
                            >
                                전송
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </Box>
            </Flex>
        </Container>
    );
}

// 메시지 아이템 컴포넌트
interface MessageItemProps {
    message: Message;
    isMine: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isMine }) => {
    // 메시지 발신자에 따른 색상
    const bgColor = isMine ? "slack.green" : "white";
    const textColor = isMine ? "white" : "black";
    const borderColor = !isMine ? "gray.200" : "transparent";

    return (
        <Flex justify={isMine ? "flex-end" : "flex-start"}>
            <Box maxW="70%">
                {!isMine && (
                    <Flex align="center" mb={1}>
                        <Avatar size="xs" name={message.username} bg="slack.blue" mr={2} />
                        <Text fontWeight="bold" fontSize="sm">
                            {message.username}
                        </Text>
                    </Flex>
                )}
                <Box
                    bg={bgColor}
                    color={textColor}
                    px={3} // 패딩 줄임
                    py={2}
                    borderRadius="lg"
                    borderTopRightRadius={isMine ? 0 : "lg"}
                    borderTopLeftRadius={!isMine ? 0 : "lg"}
                    borderWidth={!isMine ? "1px" : "0"}
                    borderColor={borderColor}
                    shadow="sm"
                >
                    <Text>{message.content}</Text>
                </Box>
                <Text fontSize="xs" color="gray.500" textAlign={isMine ? "right" : "left"} mt={1}>
                    {/* todo 나중에 카톡처럼 안읽은 사람 표시하기 */}
                    #{message.messageId}
                </Text>
            </Box>
        </Flex>
    );
};