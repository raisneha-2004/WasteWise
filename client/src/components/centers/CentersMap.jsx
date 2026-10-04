import React, { useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import UserLocationMarker from './UserLocationMarker.jsx';
import CenterPopup from './CenterPopup.jsx';
import { MapBoundsController, CustomMapControls } from './MapControls.jsx';
import { createCenterDivIcon, createClusterCustomIcon } from './MapMarker.js';

// Prevent Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: ''
});

export default function CentersMap({
  centers = [],
  selectedCenter,
  onSelectCenter,
  userLocation,
  radiusKm = 25
}) {
  const mapRef = useRef(null);

  // Memoize marker icons to avoid recreating on each re-render
  const markerIcons = useMemo(() => {
    const map = new Map();
    centers.forEach((center, idx) => {
      const isSelected = selectedCenter?.id === center.id;
      const icon = createCenterDivIcon({
        categories: center.acceptedCategories,
        isSelected,
        index: idx
      });
      map.set(`${center.id}-${isSelected}`, icon);
    });
    return map;
  }, [centers, selectedCenter?.id]);

  const handleResetView = () => {
    if (mapRef.current) {
      const points = centers
        .filter((c) => c.lat && c.lng)
        .map((c) => [c.lat, c.lng]);

      if (userLocation?.lat && userLocation?.lng) {
        points.push([userLocation.lat, userLocation.lng]);
      }

      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        mapRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 14, animate: true });
      }
    }
  };

  const useClustering = centers.length > 10;

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-emerald-500/20 shadow-[0_0_35px_rgba(16,185,129,0.08)] bg-dark-bg">
      {/* Soft Vignette Overlay for aesthetics */}
      <div className="pointer-events-none absolute inset-0 z-[750] rounded-3xl shadow-[inset_0_0_50px_rgba(0,0,0,0.7)]" />

      {/* Map Container */}
      <MapContainer
        ref={mapRef}
        center={[userLocation?.lat || 28.58, userLocation?.lng || 77.34]}
        zoom={12}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* OpenStreetMap Standard Tiles with Dark Theme CSS Filter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-map-tiles"
          maxZoom={19}
        />

        {/* User Location Pulsing Dot & Radius Circle */}
        <UserLocationMarker userLocation={userLocation} radiusKm={radiusKm} />

        {/* Markers with or without clustering */}
        {useClustering ? (
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={45}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
          >
            {centers.map((center) => {
              const isSelected = selectedCenter?.id === center.id;
              const icon = markerIcons.get(`${center.id}-${isSelected}`);

              return (
                <Marker
                  key={center.id}
                  position={[center.lat, center.lng]}
                  icon={icon || createCenterDivIcon({ categories: center.acceptedCategories, isSelected })}
                  eventHandlers={{
                    click: () => onSelectCenter && onSelectCenter(center)
                  }}
                >
                  <CenterPopup center={center} />
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        ) : (
          centers.map((center) => {
            const isSelected = selectedCenter?.id === center.id;
            const icon = markerIcons.get(`${center.id}-${isSelected}`);

            return (
              <Marker
                key={center.id}
                position={[center.lat, center.lng]}
                icon={icon || createCenterDivIcon({ categories: center.acceptedCategories, isSelected })}
                eventHandlers={{
                  click: () => onSelectCenter && onSelectCenter(center)
                }}
              >
                <CenterPopup center={center} />
              </Marker>
            );
          })
        )}

        {/* Bounds & Fly-To Synchronizer */}
        <MapBoundsController
          centers={centers}
          selectedCenter={selectedCenter}
          userLocation={userLocation}
        />

        {/* Custom Glass Zoom & Recenter Controls */}
        <CustomMapControls
          userLocation={userLocation}
          onResetView={handleResetView}
        />
      </MapContainer>
    </div>
  );
}
