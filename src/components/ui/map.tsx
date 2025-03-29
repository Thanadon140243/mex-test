import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface BranchLocation {
  name: string;
  location: string;
  owner: string;
  lat: number;
  lng: number;
}

const Map: React.FC = () => {
  const [branchLocations, setBranchLocations] = useState<BranchLocation[]>([]);

  useEffect(() => {
    // Mock API call to fetch branch locations
    const fetchBranchLocations = async () => {
      // TODO: Replace with actual API call
      const mockBranchLocations: BranchLocation[] = [
        { name: 'สาขา 1', location: 'กรุงเทพ', owner: 'นาย ก', lat: 13.7563, lng: 100.5018 },
        { name: 'สาขา 2', location: 'เชียงใหม่', owner: 'นาง ข', lat: 18.7883, lng: 98.9853 },
        // Add more mock branch locations here
      ];

      setBranchLocations(mockBranchLocations);
    };

    fetchBranchLocations();
  }, []);

  // Custom icon for markers
  const customIcon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    shadowSize: [41, 41],
  });

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">แผนที่สาขา</h3>
      <MapContainer center={[13.7563, 100.5018]} zoom={6} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {branchLocations.map((branch, index) => (
          <Marker key={index} position={[branch.lat, branch.lng]} icon={customIcon}>
            <Popup>
              <strong>{branch.name}</strong><br />
              ที่ตั้ง: {branch.location}<br />
              เจ้าของ: {branch.owner}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;