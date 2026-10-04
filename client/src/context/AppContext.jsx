import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { AppContext } from './AppContextObject.js';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import i18n from '../i18n.js';

// Default coordinates: Noida Sector 54 (Central NCR)
const DEFAULT_COORDINATES = {
  lat: 28.5832,
  lng: 77.3481,
  city: 'Noida (Default)'
};

export function AppProvider({ children }) {
  const [language, setLanguage] = useLocalStorage('wastewise_lang', 'hinglish');
  const [history, setHistory] = useLocalStorage('wastewise_history', []);
  const [ecoPoints, setEcoPoints] = useLocalStorage('wastewise_points', 0);
  const [lastScannedItem, setLastScannedItem] = useState(null);

  // Sync i18n when language changes
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  // Geolocation state
  const [userLocation, setUserLocation] = useState({
    lat: DEFAULT_COORDINATES.lat,
    lng: DEFAULT_COORDINATES.lng,
    city: DEFAULT_COORDINATES.city,
    isDefault: true,
    loading: false
  });

  // Fetch real geolocation on initial mount
  useEffect(() => {
    getUserGeolocation();
  }, []);

  function getUserGeolocation() {
    if ('geolocation' in navigator) {
      setUserLocation((prev) => ({ ...prev, loading: true }));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            city: 'Current Location',
            isDefault: false,
            loading: false
          });
        },
        (error) => {
          console.warn('Geolocation permission denied or timed out:', error.message);
          setUserLocation({
            lat: DEFAULT_COORDINATES.lat,
            lng: DEFAULT_COORDINATES.lng,
            city: DEFAULT_COORDINATES.city,
            isDefault: true,
            loading: false
          });
        },
        { timeout: 8000 }
      );
    }
  }

  // Calculate Streak (Consecutive days with at least 1 scan)
  const calculateStreak = () => {
    if (!history || history.length === 0) return 0;

    const uniqueDates = Array.from(
      new Set(
        history.map((item) => new Date(item.date).toISOString().split('T')[0])
      )
    ).sort().reverse();

    if (uniqueDates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if user scanned today or yesterday to keep streak alive
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    let currentDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  };

  // Gamification Level Details
  const getLevelInfo = () => {
    if (ecoPoints >= 500) {
      return {
        level: 4,
        title: 'Forest Guardian',
        icon: '🌳',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        nextPoints: null,
        progress: 100
      };
    }
    if (ecoPoints >= 250) {
      return {
        level: 3,
        title: 'Tree',
        icon: '🌿',
        color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/30',
        nextPoints: 500,
        progress: Math.round(((ecoPoints - 250) / 250) * 100)
      };
    }
    if (ecoPoints >= 100) {
      return {
        level: 2,
        title: 'Sprout',
        icon: '🌱',
        color: 'text-teal-400',
        bg: 'bg-teal-500/10 border-teal-500/30',
        nextPoints: 250,
        progress: Math.round(((ecoPoints - 100) / 150) * 100)
      };
    }
    return {
      level: 1,
      title: 'Seedling',
      icon: '🌰',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      nextPoints: 100,
      progress: Math.round((ecoPoints / 100) * 100)
    };
  };

  /**
   * Add scan result to history
   */
  const addScanToHistory = (scanResult, thumbnail) => {
    const pointsGained = scanResult.ecoPoints?.totalPoints || 15;

    const newEntry = {
      id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      item: scanResult.item?.name || 'Waste Item',
      category: scanResult.category,
      bin: scanResult.bin,
      confidence: scanResult.confidence,
      impact: scanResult.impact,
      ecoPoints: pointsGained,
      date: new Date().toISOString(),
      thumbnail: thumbnail || null
    };

    setHistory((prev) => [newEntry, ...prev]);
    setEcoPoints((prev) => prev + pointsGained);
    setLastScannedItem({
      name: newEntry.item,
      category: newEntry.category
    });

    // Fire joyful celebratory confetti!
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b']
      });
    } catch {
      // Ignored if confetti fails
    }

    toast.success(`+${pointsGained} Eco-Points Earned! 🎉`, {
      style: {
        background: '#162329',
        color: '#34d399',
        border: '1px solid rgba(52, 211, 153, 0.3)'
      }
    });
  };

  const deleteScan = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    toast.success('Scan removed from history.', {
      style: { background: '#162329', color: '#e5e7eb' }
    });
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success('Scan history cleared.', {
      style: { background: '#162329', color: '#e5e7eb' }
    });
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        history,
        ecoPoints,
        lastScannedItem,
        userLocation,
        refreshLocation: getUserGeolocation,
        streak: calculateStreak(),
        levelInfo: getLevelInfo(),
        addScanToHistory,
        deleteScan,
        clearHistory
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
