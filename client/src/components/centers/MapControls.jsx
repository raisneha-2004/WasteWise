import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Plus, Minus, Navigation, Maximize2 } from 'lucide-react';

/**
 * Controller to handle programmatic smooth pan/zoom/fitBounds
 */
export function MapBoundsController({ centers = [], selectedCenter, userLocation }) {
  const map = useMap();

  // Fly to selected center when chosen
  useEffect(() => {
    if (selectedCenter?.lat && selectedCenter?.lng) {
      map.flyTo([selectedCenter.lat, selectedCenter.lng], 15, {
        animate: true,
        duration: 1.2
      });
    }
  }, [selectedCenter, map]);

  // Fit bounds whenever centers list updates
  useEffect(() => {
    if (!centers || centers.length === 0) return;

    const points = centers
      .filter((c) => c.lat && c.lng)
      .map((c) => [c.lat, c.lng]);

    if (userLocation?.lat && userLocation?.lng) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 14,
        animate: true,
        duration: 1.0
      });
    }
  }, [centers, userLocation?.lat, userLocation?.lng, map]);

  return null;
}

/**
 * Custom glassmorphism floating map buttons (Zoom In, Zoom Out, Recenter to User, Fit All)
 */
export function CustomMapControls({ userLocation, onResetView }) {
  const map = useMap();

  const handleZoomIn = (e) => {
    e.stopPropagation();
    map.zoomIn();
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    map.zoomOut();
  };

  const handleRecenterUser = (e) => {
    e.stopPropagation();
    if (userLocation?.lat && userLocation?.lng) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, {
        animate: true,
        duration: 1.2
      });
    }
  };

  const handleFitAll = (e) => {
    e.stopPropagation();
    if (onResetView) onResetView();
  };

  return (
    <div className="absolute bottom-6 right-6 z-[800] flex flex-col items-center gap-2 pointer-events-auto">
      {/* Recenter / Locate Button */}
      <button
        onClick={handleRecenterUser}
        title="Go to your location"
        className="w-10 h-10 rounded-2xl bg-dark-bg/85 backdrop-blur-xl border border-white/15 hover:border-blue-400 text-blue-400 hover:text-blue-300 shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
      >
        <Navigation className="w-4 h-4" />
      </button>

      {/* Zoom In & Out Box */}
      <div className="flex flex-col rounded-2xl bg-dark-bg/85 backdrop-blur-xl border border-white/15 shadow-xl overflow-hidden">
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors border-b border-white/10 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Fit All Button */}
      {onResetView && (
        <button
          onClick={handleFitAll}
          title="Fit all centers"
          className="w-10 h-10 rounded-2xl bg-dark-bg/85 backdrop-blur-xl border border-white/15 hover:border-eco-400 text-eco-400 hover:text-eco-300 shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
