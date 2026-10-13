import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ factoryConfig, userPosition }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [factoryConfig.latitude, factoryConfig.longitude],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Factory marker
    const factoryIcon = L.divIcon({
      html: `<div style="
        width: 36px; height: 36px; background: linear-gradient(135deg, #0d9488, #059669);
        border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
        border: 3px solid white; box-shadow: 0 3px 12px rgba(0,0,0,0.4);
        display: flex; align-items: center; justify-content: center;
      "><span style="transform: rotate(45deg); font-size: 16px;">🏭</span></div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -40],
    });

    L.marker([factoryConfig.latitude, factoryConfig.longitude], { icon: factoryIcon })
      .addTo(map)
      .bindPopup(`<b>🏭 AFOODS Factory</b><br>${factoryConfig.address || 'Ấp Đông Hoà, Xã Kim Sơn, Đồng Tháp'}`);

    // Geofence circle
    circleRef.current = L.circle([factoryConfig.latitude, factoryConfig.longitude], {
      radius: factoryConfig.radius_meters,
      color: '#0d9488',
      fillColor: '#0d9488',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '8, 6',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [factoryConfig]);

  // Update user position marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userPosition) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userPosition.lat, userPosition.lng]);
    } else {
      const userIcon = L.divIcon({
        html: `<div style="
          width: 14px; height: 14px; background: #6366f1;
          border-radius: 50%; border: 3px solid white;
          box-shadow: 0 0 12px rgba(99,102,241,0.6);
        "></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      userMarkerRef.current = L.marker([userPosition.lat, userPosition.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('📍 Vị trí của bạn');
    }

    // Pan to show both points
    const bounds = L.latLngBounds(
      [factoryConfig.latitude, factoryConfig.longitude],
      [userPosition.lat, userPosition.lng]
    );
    mapInstanceRef.current.fitBounds(bounds.pad(0.3));
  }, [userPosition, factoryConfig]);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/50" style={{ height: '280px' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
