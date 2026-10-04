import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';

// Create pulsing blue user marker with double ripple rings
const createUserLocationIcon = () => {
  const html = `
    <div class="user-pulse-marker-wrapper">
      <div class="user-ripple-ring user-ripple-ring-1"></div>
      <div class="user-ripple-ring user-ripple-ring-2"></div>
      <div class="user-pulse-dot">
        <div class="user-pulse-inner-core"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-user-leaflet-pin',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22]
  });
};

const userLocationIcon = createUserLocationIcon();

export default function UserLocationMarker({ userLocation, radiusKm = 25 }) {
  if (!userLocation?.lat || !userLocation?.lng) return null;

  const radiusInMeters = (parseFloat(radiusKm) || 25) * 1000;

  return (
    <>
      {/* Translucent Radius Circle */}
      <Circle
        center={[userLocation.lat, userLocation.lng]}
        radius={radiusInMeters}
        pathOptions={{
          color: '#3b82f6',
          weight: 1.5,
          opacity: 0.4,
          dashArray: '6, 8',
          fillColor: '#3b82f6',
          fillOpacity: 0.05
        }}
      />

      {/* User Dot Marker */}
      <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
        <Popup className="glassmorphism-leaflet-popup">
          <div className="p-3 space-y-1 min-w-[180px]">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <Navigation className="w-3.5 h-3.5 shrink-0" />
              <span>Your Location</span>
            </div>
            <h4 className="text-white font-bold text-sm">
              {userLocation.city || 'Detected Position'}
            </h4>
            <p className="text-gray-400 text-xs">
              {userLocation.isDefault ? 'Using default coordinates (Noida)' : 'Accurate GPS Geolocation'}
            </p>
            <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-blue-300">
              Active search radius: <span className="font-bold">{radiusKm} km</span>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}
