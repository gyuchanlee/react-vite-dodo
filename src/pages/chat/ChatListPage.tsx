import React, { lazy, Suspense, useEffect, useState} from "react";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Divider,
    Flex,
    Heading,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue,
    useDisclosure,
    useToast,
    VStack
} from "@chakra-ui/react";
import {AddIcon, ArrowBackIcon, ChatIcon} from "@chakra-ui/icons";
import {useNavigate} from "react-router-dom";
import http from "../../api/http.tsx";
// 지연로딩
const LeafletMapView = lazy(() => import('../../components/chat/LeafletMapView'));

// 고정 검색 반경 설정 (km)
const FIXED_RADIUS = 1;

// 채팅방 타입 정의 (위치 정보 추가)
interface ChatRoom {
    chatRoomId: number;
    name: string;
    description: string;
    participantsCount: number;
    isPrivate: boolean;
    // 위치 정보 추가
    latitude?: number;
    longitude?: number;
    // 계산된 사용자로부터의 거리
    distance?: number;
}

// 사용자 위치 타입
interface UserLocation {
    lat: number | null;
    lng: number | null;
}

const ChatListPage: React.FC = () => {
    // 채팅방 목록
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    // 새 채팅방 이름
    const [newRoomName, setNewRoomName] = useState<string>("");
    // 검색어
    const [searchTerm, setSearchTerm] = useState<string>("");
    // 모달 상태 관리
    const { isOpen, onOpen, onClose } = useDisclosure();
    // 토스트 알림
    const toast = useToast();
    // 페이지 이동
    const navigate = useNavigate();
    // 사용자 위치
    const [userLocation, setUserLocation] = useState<UserLocation>({ lat: null, lng: null });
    // 위치 오류
    const [locationError, setLocationError] = useState<string | null>(null);
    // 위치 로딩 상태
    const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
    // 새 채팅방 설명
    const [newRoomDescription, setNewRoomDescription] = useState<string>("");
    // 새 채팅방 비공개 여부
    const [isNewRoomPrivate, setIsNewRoomPrivate] = useState<boolean>(false);
    // 탭 상태 관리 추가
    const [activeTab, setActiveTab] = useState(0);

    // 사용자 위치 가져오기
    useEffect(() => {
        if (navigator.geolocation) {
            setIsLoadingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation({ lat, lng });
                    fetchNearbyChatRooms(lat, lng);
                    setIsLoadingLocation(false);
                },
                (error) => {
                    setLocationError(`위치 정보를 가져올 수 없습니다: ${error.message}`);
                    setIsLoadingLocation(false);
                    // 위치 정보를 얻지 못하더라도 일반 채팅방은 로드
                    fetchChatRooms();
                    // 사용자에게 위치 정보 필요성 알림
                    toast({
                        title: "위치 정보 필요",
                        description: "채팅방 기능을 완전히 사용하려면 위치 정보 권한이 필요합니다.",
                        status: "warning",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            );
        } else {
            setLocationError("브라우저가 위치 정보를 지원하지 않습니다.");
            setIsLoadingLocation(false);
            // 위치 정보를 얻지 못하더라도 일반 채팅방은 로드
            fetchChatRooms();
        }
    }, []);

    // 채팅방 목록 가져오기 (일반)
    const fetchChatRooms = async () => {
        try {
            // 백엔드 API를 통해 채팅방 목록 요청
            const response = await http.get("/api/chat");
            setChatRooms(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("채팅방 목록 로드 실패:", error);
            toast({
                title: "로드 실패",
                description: "채팅방 목록을 불러오는데 실패했습니다.",
                status: "error",
                duration: 500,
                isClosable: true,
            });
        }
    };

    // 두 지점 사이의 거리 계산 (Haversine 공식)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // 지구 반경 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // 킬로미터 단위 거리
    };

    // 주변 채팅방 필터링 (프론트엔드에서 계산) - 고정 반경 사용
    const fetchNearbyChatRooms = async (lat: number, lng: number) => {
        try {
            // 기존 API를 통해 모든 채팅방 목록 요청
            const response = await http.get("/api/chat");

            // 채팅방과 사용자 간의 거리 계산 및 반경 내 필터링
            const roomsWithDistance = response.data.map((room: ChatRoom) => {
                // 채팅방에 위도/경도가 있는 경우에만 거리 계산
                if (room.latitude && room.longitude) {
                    const distance = calculateDistance(lat, lng, room.latitude, room.longitude);
                    return { ...room, distance };
                }
                // 위치 정보가 없는 채팅방은 distance를 undefined로 설정
                return room;
            });

            // 거리 정보가 있는 채팅방 중 고정 반경 내에 있는 채팅방만 필터링 (또는 거리 정보가 없는 채팅방은 포함)
            const filteredRooms = roomsWithDistance.filter((room: ChatRoom) =>
                !room.distance || room.distance <= FIXED_RADIUS
            );

            setChatRooms(filteredRooms);
        } catch (error) {
            console.error("채팅방 검색 실패:", error);
            toast({
                title: "검색 실패",
                description: "채팅방을 검색하는데 실패했습니다.",
                status: "error",
                duration: 500,
                isClosable: true,
            });
        }
    };

    // 채팅방 생성
    const createChatRoom = async () => {
        if (!newRoomName.trim()) {
            toast({
                title: "알림",
                description: "채팅방 이름을 입력해주세요.",
                status: "warning",
                duration: 500,
                isClosable: true,
            });
            return;
        }

        if (!userLocation.lat || !userLocation.lng) {
            toast({
                title: "알림",
                description: "위치 정보가 필요합니다. 위치 권한을 허용해주세요.",
                status: "warning",
                duration: 500,
                isClosable: true,
            });
            return;
        }

        try {
            const chatRoomCreateDto = {
                name: newRoomName,
                description: newRoomDescription,
                isPrivate: isNewRoomPrivate,
                latitude: userLocation.lat,
                longitude: userLocation.lng
            };

            await http.post("/api/chat", chatRoomCreateDto);

            toast({
                title: "성공",
                description: "새 채팅방이 생성되었습니다.",
                status: "success",
                duration: 500,
                isClosable: true,
            });

            // 모달 닫기 및 입력값 초기화
            onClose();
            setNewRoomName("");
            setNewRoomDescription("");
            setIsNewRoomPrivate(false);

            // 채팅방 목록 다시 불러오기
            if (userLocation.lat && userLocation.lng) {
                fetchNearbyChatRooms(userLocation.lat, userLocation.lng);
            } else {
                fetchChatRooms();
            }
        } catch (error) {
            console.error("채팅방 생성 실패:", error);
            toast({
                title: "생성 실패",
                description: "채팅방을 생성하는데 실패했습니다.",
                status: "error",
                duration: 500,
                isClosable: true,
            });
        }
    };

    // 채팅방 입장
    const enterChatRoom = async (chatRoomId: number) => {
        try {
            // 채팅방 입장 API 호출
            await http.post(`/api/chat/${chatRoomId}/joinUser`);

            // 채팅방 페이지로 이동
            navigate(`/chats/${chatRoomId}`);
        } catch (error) {
            console.error("채팅방 입장 실패:", error);
            toast({
                title: "입장 실패",
                description: "채팅방에 입장하는데 실패했습니다.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    // 검색어 변경 핸들러
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // 필터링된 채팅방 목록
    const filteredChatRooms = chatRooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 색상 설정
    const bgColor = useColorModeValue("white", "gray.800");
    const headerBg = useColorModeValue("slack.purple", "slack.gray");
    const hoverBg = useColorModeValue("gray.50", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");

    // 거리 표시 함수 - 거리가 있거나 0인 경우 모두 처리
    const formatDistance = (distance: number | undefined) => {
        if (distance !== undefined) {
            return `거리: ${distance.toFixed(2)}km`;
        }
        return null;
    };

    return (
        <Container maxW="container.md" py={5}>
            <Box bg={bgColor} borderRadius="md" overflow="hidden" boxShadow="lg">
                {/* 헤더 */}
                <Box p={4} bg={headerBg} color="white">
                    <Flex align="center" justify="space-between">
                        <Flex align="center">
                            {/* 홈으로 이동하는 버튼 */}
                            <IconButton
                                icon={<ArrowBackIcon />}
                                aria-label="홈으로 돌아가기"
                                variant="ghost"
                                colorScheme="whiteAlpha"
                                mr={2}
                                _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                                onClick={() => navigate("/")}
                            />
                            <ChatIcon mr={2} />
                            <Heading size="md">채팅방 목록</Heading>
                        </Flex>
                        <Button
                            leftIcon={<AddIcon />}
                            colorScheme="green"
                            variant="solid"
                            size="sm"
                            onClick={onOpen}
                        >
                            새 채팅방
                        </Button>
                    </Flex>
                </Box>

                {/* 위치 기반 정보 및 컨트롤 */}
                {!locationError && userLocation.lat && userLocation.lng && (
                    <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
                        <Flex direction="column">
                            <Text fontSize="sm" mb={2}>검색 반경: {FIXED_RADIUS}km 내 채팅방이 표시됩니다.</Text>
                        </Flex>
                    </Box>
                )}

                {/* 검색 바 */}
                <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
                    <Input
                        placeholder="채팅방 검색..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        focusBorderColor="slack.green"
                    />
                </Box>

                {/* 지도/목록 탭 */}
                <Tabs
                    isFitted
                    colorScheme="green"
                    onChange={(index) => setActiveTab(index)}
                >
                    <TabList>
                        <Tab>목록 보기</Tab>
                        <Tab>지도 보기</Tab>
                    </TabList>

                    <TabPanels>
                        {/* 목록 보기 탭 */}
                        <TabPanel p={0}>
                            <Box maxH="60vh" overflowY="auto">
                                {filteredChatRooms.length > 0 ? (
                                    <VStack spacing={0} align="stretch">
                                        {filteredChatRooms.map((room) => (
                                            <React.Fragment key={room.chatRoomId}>
                                                <Box
                                                    p={4}
                                                    _hover={{ bg: hoverBg, cursor: "pointer" }}
                                                    onClick={() => enterChatRoom(room.chatRoomId)}
                                                >
                                                    <Flex justify="space-between" align="start">
                                                        <Box>
                                                            <Flex align="center">
                                                                <Heading size="sm">{room.name}</Heading>
                                                                {room.isPrivate && (
                                                                    <Text fontSize="xs" bg="gray.200" color="gray.700" px={2} py={1} borderRadius="full" ml={2}>
                                                                        비공개
                                                                    </Text>
                                                                )}
                                                            </Flex>
                                                            <Text fontSize="sm" color="gray.500" noOfLines={1} mt={1}>
                                                                {room.description}
                                                            </Text>
                                                            {room.distance !== undefined && (
                                                                <Text fontSize="xs" color="gray.500" mt={1}>
                                                                    거리: {room.distance.toFixed(2)}km
                                                                </Text>
                                                            )}
                                                        </Box>
                                                        <Box textAlign="right">
                                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                                참여자 {room.participantsCount}명
                                                            </Text>
                                                        </Box>
                                                    </Flex>
                                                </Box>
                                                <Divider />
                                            </React.Fragment>
                                        ))}
                                    </VStack>
                                ) : (
                                    <Box p={10} textAlign="center">
                                        <Text color="gray.500">채팅방이 없습니다.</Text>
                                    </Box>
                                )}
                            </Box>
                        </TabPanel>

                        <TabPanel p={0}>
                            {activeTab === 1 ? (
                                <Suspense fallback={
                                    <Box p={10} textAlign="center" height="60vh" display="flex" alignItems="center" justifyContent="center">
                                        <Spinner size="xl" color="green.500" mr={4} />
                                        <Text color="gray.500">지도를 로드하는 중입니다...</Text>
                                    </Box>
                                }>
                                    <LeafletMapView
                                        userLocation={userLocation}
                                        filteredChatRooms={filteredChatRooms}
                                        isLoadingLocation={isLoadingLocation}
                                        locationError={locationError}
                                        FIXED_RADIUS={FIXED_RADIUS}
                                        enterChatRoom={enterChatRoom}
                                        formatDistance={formatDistance}
                                    />
                                </Suspense>
                            ) : null}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>

            {/* 새 채팅방 생성 모달 */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>새 채팅방 생성</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <Input
                                placeholder="채팅방 이름"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                focusBorderColor="slack.green"
                            />
                            <Input
                                placeholder="채팅방 설명"
                                value={newRoomDescription}
                                onChange={(e) => setNewRoomDescription(e.target.value)}
                                focusBorderColor="slack.green"
                            />
                            <Checkbox
                                id="isPrivate"
                                isChecked={isNewRoomPrivate}
                                onChange={(e) => setIsNewRoomPrivate(e.target.checked)}
                                colorScheme="green"
                            >
                                비공개 채팅방
                            </Checkbox>
                            {userLocation.lat && userLocation.lng && (
                                <Text fontSize="sm" color="gray.500">
                                    채팅방은 현재 위치 ({userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)})에 생성됩니다.
                                </Text>
                            )}
                            {(!userLocation.lat || !userLocation.lng) && (
                                <Text fontSize="sm" color="red.500">
                                    위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.
                                </Text>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            취소
                        </Button>
                        <Button
                            colorScheme="green"
                            onClick={createChatRoom}
                            isDisabled={!userLocation.lat || !userLocation.lng}
                        >
                            생성
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default ChatListPage;