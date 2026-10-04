import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Compass,
  RefreshCw,
  AlertCircle,
  SearchX
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/useApp.js';
import { centersApi } from '../services/api.js';
import { formatNumber } from '../utils/formatters.js';
import CentersMap from '../components/centers/CentersMap.jsx';
import CenterCard from '../components/centers/CenterCard.jsx';
import FilterChips from '../components/centers/FilterChips.jsx';
import BottomSheet from '../components/centers/BottomSheet.jsx';
import { CentersLoadingState } from '../components/centers/CenterSkeleton.jsx';
import toast from 'react-hot-toast';

export default function Centers() {
  const { t } = useTranslation();
  const { language, userLocation, refreshLocation } = useApp();

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [radiusKm, setRadiusKm] = useState('25');
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'name'
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Map of card refs for auto-scrolling on marker click
  const cardRefs = useRef(new Map());
  const listContainerRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;
    async function loadCenters() {
      setLoading(true);
      setError(null);
      try {
        const params = {
          lat: userLocation?.lat,
          lng: userLocation?.lng,
          radiusKm: radiusKm || '25',
          limit: 50
        };

        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }

        const res = await centersApi.getCenters(params);
        if (isCancelled) return;
        const rawCenters = res.data?.centers || [];
        setCenters(rawCenters);

        setSelectedCenter((prev) => (prev && !rawCenters.some((c) => c.id === prev.id) ? null : prev));
      } catch (err) {
        if (!isCancelled) {
          console.warn('Failed to load centers:', err);
          setError(t('centers_page.error_connect', { defaultValue: 'Could not connect to recycling database. Please try again.' }));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadCenters();
    return () => {
      isCancelled = true;
    };
  }, [userLocation?.lat, userLocation?.lng, radiusKm, selectedCategory, t]);

  // Client-side sorting (Nearest vs A-Z)
  const sortedCenters = useMemo(() => {
    const list = [...centers];
    if (sortBy === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    // Default: distance
    return list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [centers, sortBy]);

  const handleToggleSort = () => {
    setSortBy((prev) => (prev === 'distance' ? 'name' : 'distance'));
  };

  const handleSelectCenter = (center) => {
    setSelectedCenter(center);

    // Scroll corresponding card into view in the desktop list
    if (center?.id && cardRefs.current.has(center.id)) {
      const cardEl = cardRefs.current.get(center.id);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleRefreshLocation = async () => {
    setIsLocating(true);
    try {
      await refreshLocation();
      toast.success(t('centers_page.gps_success', { defaultValue: 'Location updated successfully!' }), {
        id: 'gps-toast',
        style: { background: '#162329', color: '#10b981' }
      });
    } catch {
      toast.error(t('centers_page.gps_error', { defaultValue: 'Could not get GPS location. Using default.' }), {
        id: 'gps-toast',
        style: { background: '#162329', color: '#f87171' }
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleExpandRadius = () => {
    setRadiusKm('50');
    setSelectedCategory('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6 pb-28">
      {/* ── HEADER AREA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Top pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-500/10 border border-eco-500/20 text-eco-400 text-xs font-bold mb-2 shadow-glow-sm">
            <Compass className="w-3.5 h-3.5 text-eco-400" />
            <span>{t('centers_page.badge', { defaultValue: 'Interactive Recycling Map' })}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {t('centers_page.title', { defaultValue: 'Recycling & Disposal Centers' })}
          </h1>

          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mt-1 flex-wrap">
            <span>{t('centers_page.subtitle', { defaultValue: 'Authorized material recovery facilities, e-waste drop points & compost plants.' })}</span>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span className="text-eco-400 font-semibold">
              {formatNumber(centers.length, language)} {t('centers_page.facilities_within', { radius: formatNumber(radiusKm, language), defaultValue: `facilities within ${radiusKm} km` })}
            </span>
          </div>
        </div>

        {/* Geolocation Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {userLocation?.isDefault ? (
            <button
              onClick={handleRefreshLocation}
              disabled={isLocating}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{t('centers_page.default_location', { defaultValue: 'Default: Noida (Retry GPS)' })}</span>
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          ) : (
            <button
              onClick={handleRefreshLocation}
              disabled={isLocating}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 transition-all cursor-pointer shadow-glow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('centers_page.active_location', { city: userLocation.city || 'GPS', defaultValue: `Location Active: ${userLocation.city || 'GPS'}` })}</span>
              <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER & SORT BAR ── */}
      <FilterChips
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        sortBy={sortBy}
        onToggleSort={handleToggleSort}
        radiusKm={radiusKm}
        onChangeRadius={setRadiusKm}
        totalResults={sortedCenters.length}
      />

      {/* ── DESKTOP & TABLET TWO-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Scrollable Facilities List (5 Columns) */}
        <div
          ref={listContainerRef}
          className="hidden lg:block lg:col-span-5 space-y-3.5 max-h-[calc(100vh-160px)] min-h-[580px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-eco-600/40 hover:scrollbar-thumb-eco-500"
        >
          {loading ? (
            <CentersLoadingState />
          ) : error ? (
            <div className="glass-panel p-8 rounded-3xl border border-red-500/20 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <h3 className="text-white font-bold text-base">{t('centers_page.unable_to_load', { defaultValue: 'Unable to load centers' })}</h3>
              <p className="text-xs text-gray-400">{error}</p>
              <button
                onClick={fetchCenters}
                className="px-4 py-2 rounded-xl bg-eco-600 hover:bg-eco-500 text-white font-bold text-xs transition-colors"
              >
                {t('centers_page.retry', { defaultValue: 'Retry' })}
              </button>
            </div>
          ) : sortedCenters.length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
                <SearchX className="w-7 h-7 text-eco-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-bold text-base">
                  {t('centers_page.no_centers_found', { defaultValue: 'No Centers Found' })}
                </h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                  {t('centers_page.no_centers_desc', { radius: formatNumber(radiusKm, language), defaultValue: `No verified facility found in ${radiusKm} km radius.` })}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleExpandRadius}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-eco-600 to-emerald-500 text-white font-bold text-xs shadow-glow-sm hover:from-eco-500 hover:to-emerald-400 transition-all"
                >
                  {t('centers_page.expand_radius', { defaultValue: 'Expand radius (50 km)' })}
                </button>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold"
                >
                  {t('centers_page.show_all', { defaultValue: 'Show All' })}
                </button>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {sortedCenters.map((center, index) => (
                <CenterCard
                  key={center.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(center.id, el);
                    else cardRefs.current.delete(center.id);
                  }}
                  center={center}
                  isSelected={selectedCenter?.id === center.id}
                  onSelect={handleSelectCenter}
                  index={index}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Right Side: Sticky Leaflet Interactive Map (7 Columns on Desktop, Full Width on Mobile) */}
        <div className="lg:col-span-7 h-[460px] sm:h-[520px] lg:h-[calc(100vh-160px)] lg:min-h-[580px] lg:sticky lg:top-24">
          <CentersMap
            centers={sortedCenters}
            selectedCenter={selectedCenter}
            onSelectCenter={handleSelectCenter}
            userLocation={userLocation}
            radiusKm={radiusKm}
          />
        </div>
      </div>

      {/* ── MOBILE DRAGGABLE BOTTOM SHEET ── */}
      <BottomSheet totalCount={sortedCenters.length}>
        {loading ? (
          <CentersLoadingState />
        ) : sortedCenters.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <SearchX className="w-8 h-8 text-eco-400 mx-auto" />
            <p className="text-xs text-gray-300">
              {t('centers_page.no_centers_nearby', { defaultValue: 'No centers found nearby for this category.' })}
            </p>
            <button
              onClick={handleExpandRadius}
              className="px-4 py-2 rounded-xl bg-eco-600 text-white text-xs font-bold shadow-glow-sm"
            >
              {t('centers_page.expand_radius', { defaultValue: 'Expand radius (50 km)' })}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCenters.map((center, index) => (
              <CenterCard
                key={center.id}
                center={center}
                isSelected={selectedCenter?.id === center.id}
                onSelect={handleSelectCenter}
                index={index}
              />
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
