import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Vite에서 마커 아이콘 문제 해결
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// 타입 정의
interface ChatRoom {
    chatRoomId: number;
    name: string;
    description: string;
    participantsCount: number;
    isPrivate: boolean;
    latitude?: number;
    longitude?: number;
    distance?: number;
}

interface UserLocation {
    lat: number | null;
    lng: number | null;
}

interface LeafletMapViewProps {
    userLocation: UserLocation;
    filteredChatRooms: ChatRoom[];
    isLoadingLocation: boolean;
    locationError: string | null;
    FIXED_RADIUS: number;
    enterChatRoom: (chatRoomId: number) => void;
    formatDistance: (distance: number | undefined) => string | null;
}

const LeafletMapView: React.FC<LeafletMapViewProps> = ({
                                                           userLocation,
                                                           filteredChatRooms,
                                                           isLoadingLocation,
                                                           locationError,
                                                           FIXED_RADIUS,
                                                           enterChatRoom,
                                                           formatDistance
                                                       }) => {

    // 기본 위치 (서울) 추가
    const defaultLocation = { lat: 37.5665, lng: 126.9780 };
    const safeLocation = userLocation?.lat && userLocation?.lng
        ? { lat: userLocation.lat, lng: userLocation.lng }
        : defaultLocation;

    // 로딩 및 오류 상태 통합 처리
    if (isLoadingLocation || locationError || !safeLocation.lat || !safeLocation.lng) {
        console.warn('Map rendering blocked:', {
            isLoadingLocation,
            locationError,
            lat: safeLocation.lat,
            lng: safeLocation.lng
        });
        return (
            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
                <p style={{ color: '#6b7280' }}>
                    {isLoadingLocation
                        ? "위치 정보를 로드 중입니다..."
                        : locationError || "위치 정보를 사용할 수 없습니다."}
                </p>
            </div>
        );
    }

    // 같은 위치의 채팅방을 그룹화
    const groupChatRoomsByLocation = (rooms: ChatRoom[]) => {
        const locationGroups: { [key: string]: ChatRoom[] } = {};

        rooms.forEach(room => {
            if (room.latitude && room.longitude) {
                const key = `${room.latitude}-${room.longitude}`;
                if (!locationGroups[key]) {
                    locationGroups[key] = [];
                }
                locationGroups[key].push(room);
            }
        });

        return locationGroups;
    };

    // 유효한 채팅방 필터링 및 그룹화
    const validChatRooms = filteredChatRooms.filter(
        room => room.latitude && room.longitude && room.distance !== undefined
    );
    const chatRoomGroups = groupChatRoomsByLocation(validChatRooms);

    return (
        <div style={{ width: '100%', height: '60vh' }}>
            <MapContainer
                key={`${safeLocation.lat}-${safeLocation.lng}`}
                center={[safeLocation.lat, safeLocation.lng]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 사용자 위치 마커 */}
                <Marker position={[safeLocation.lat, safeLocation.lng]}>
                    <Popup>내 위치</Popup>
                </Marker>

                {/* 반경 원 */}
                <Circle
                    center={[safeLocation.lat, safeLocation.lng]}
                    radius={FIXED_RADIUS * 1000} // km to meters
                    pathOptions={{
                        color: 'blue',
                        fillColor: 'rgba(0, 0, 255, 0.1)'
                    }}
                />

                {/* 채팅방 마커 */}
                {Object.entries(chatRoomGroups).map(([locationKey, rooms]) => {
                    // 같은 위치의 마커들을 약간 흩뿌리기
                    const jitterFactor = rooms.length > 1 ? 0.0001 : 0;
                    const lat = rooms[0].latitude! + (Math.random() - 0.5) * jitterFactor;
                    const lng = rooms[0].longitude! + (Math.random() - 0.5) * jitterFactor;

                    return (
                        <Marker
                            key={locationKey}
                            position={[lat, lng]}
                        >
                            <Popup>
                                <div style={{
                                    padding: '0.5rem',
                                    maxHeight: '300px',
                                    overflowY: 'auto'
                                }}>
                                    {rooms.map((room) => (
                                        <div
                                            key={room.chatRoomId}
                                            style={{
                                                marginBottom: '0.5rem',
                                                borderBottom: '1px solid #e0e0e0'
                                            }}
                                        >
                                            <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                                                {room.name}
                                            </h3>
                                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                                {room.description}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                                참여자: {room.participantsCount}명
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                                {formatDistance(room.distance)}
                                            </p>
                                            <button
                                                style={{
                                                    width: '100%',
                                                    padding: '0.25rem 0',
                                                    backgroundColor: '#22c55e',
                                                    color: 'white',
                                                    borderRadius: '0.375rem',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    marginBottom: '0.5rem'
                                                }}
                                                onClick={() => enterChatRoom(room.chatRoomId)}
                                            >
                                                입장하기
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default LeafletMapView;