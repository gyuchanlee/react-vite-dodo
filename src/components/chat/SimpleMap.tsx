import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SimpleMap = () => {
    return (
        <div style={{ height: '400px', width: '100%' }}>
            <MapContainer
                center={[37.5665, 126.9780]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[37.5665, 126.9780]}>
                    <Popup>Seoul, Korea</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default SimpleMap;