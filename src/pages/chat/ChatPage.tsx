import axios from "axios";
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
import {ArrowForwardIcon, ChatIcon, ArrowBackIcon} from "@chakra-ui/icons";
import {useNavigate} from "react-router-dom";

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
                messageId: 1,
                username: "테스트1",
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

    // 웹소켓 연결 함수
    const connect = () => {
        const socket = new WebSocket("ws://localhost:8080/ws");
        stompClient.current = Stomp.over(socket);
        stompClient.current.connect({}, () => {
           // 메시지 수신 (roomId 임시 1) todo roomId 정보 받아서 알맞는 채팅방 보여주기
           stompClient.current.subscribe(`/sub/chatroom/1`, (message: { body: string; }) => {
               // 누군가 발송했던 메시지를 리스트에 추가 (메시지 리스트 최신화)
               const newMessage = JSON.parse(message.body);
               console.log('#########################')
               console.log(newMessage)
               setMessages((preMessages) => [...preMessages, newMessage]);

               // 다른 사용자의 메세지일 경우 알림 todo 임의 아이디 설정
               if (newMessage.username !== "테스트1") {
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
            const res = await axios.get("http://localhost:8080/api/chat/1");
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
        <Container maxW="container.md" p={0} height="100vh">
            <Flex direction="column" h="100%" bg={bgColor} borderRadius="md" overflow="hidden" boxShadow="lg">
                {/* 채팅 헤더 */}
                <Box p={4} bg={headerBg} color="white">
                    <Flex align="center">
                        <Button
                            variant="ghost"
                            color="white"
                            mr={2}
                            onClick={() => navigate("/")}
                            _hover={{ bg: "rgba(255,255,255,0.2)" }}
                        >
                            <ArrowBackIcon boxSize={6} />
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
                    p={4}
                    bg={messageAreaBg}
                    css={{
                        "&::-webkit-scrollbar": {
                            width: "8px",
                        },
                        "&::-webkit-scrollbar-track": {
                            width: "10px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: "#CBD5E0",
                            borderRadius: "24px",
                        },
                    }}
                >
                    <VStack spacing={4} align="stretch">
                        {messages.map((item, index) => (
                            // todo isMine 부분은 접속한 유저의 이름 넣기
                            <MessageItem key={index} message={item} isMine={item.username === "테스트1"} />
                        ))}
                        <div ref={messagesEndRef} />
                    </VStack>
                </Box>

                {/* 메시지 입력 영역 */}
                <Box p={4} borderTopWidth="1px" bg="white">
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
                    px={4}
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