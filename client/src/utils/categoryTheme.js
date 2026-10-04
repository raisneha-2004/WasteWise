import React from 'react';
import {
  Package,
  FileText,
  Wine,
  Wrench,
  Leaf,
  Cpu,
  AlertTriangle,
  Shirt,
  HelpCircle
} from 'lucide-react';

export const CATEGORY_THEMES = {
  Plastic: {
    name: 'Plastic',
    color: '#3b82f6',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    badgeBg: 'bg-blue-950/40 border-blue-500/30 text-blue-300',
    activeGradient: 'from-blue-600 to-cyan-600',
    activeGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    dot: 'bg-blue-400',
    accentBar: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]',
    shadow: 'rgba(59, 130, 246, 0.45)',
    icon: Package,
    svgPath: '<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>'
  },
  Paper: {
    name: 'Paper',
    color: '#f59e0b',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    badgeBg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
    activeGradient: 'from-amber-600 to-yellow-600',
    activeGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
    dot: 'bg-amber-400',
    accentBar: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
    shadow: 'rgba(245, 158, 11, 0.45)',
    icon: FileText,
    svgPath: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>'
  },
  Glass: {
    name: 'Glass',
    color: '#14b8a6',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    badgeBg: 'bg-teal-950/40 border-teal-500/30 text-teal-300',
    activeGradient: 'from-teal-600 to-emerald-600',
    activeGlow: 'shadow-[0_0_20px_rgba(20,184,166,0.5)]',
    dot: 'bg-teal-400',
    accentBar: 'bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]',
    shadow: 'rgba(20, 184, 166, 0.45)',
    icon: Wine,
    svgPath: '<path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/>'
  },
  Metal: {
    name: 'Metal',
    color: '#94a3b8',
    border: 'border-slate-400/30',
    bg: 'bg-slate-400/10 text-slate-300 border-slate-400/30',
    badgeBg: 'bg-slate-900/40 border-slate-400/30 text-slate-300',
    activeGradient: 'from-slate-600 to-zinc-600',
    activeGlow: 'shadow-[0_0_20px_rgba(148,163,184,0.5)]',
    dot: 'bg-slate-400',
    accentBar: 'bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.6)]',
    shadow: 'rgba(148, 163, 184, 0.45)',
    icon: Wrench,
    svgPath: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'
  },
  Organic: {
    name: 'Organic',
    color: '#10b981',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    badgeBg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',
    activeGradient: 'from-emerald-600 to-green-600',
    activeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    dot: 'bg-emerald-400',
    accentBar: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    shadow: 'rgba(16, 185, 129, 0.45)',
    icon: Leaf,
    svgPath: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>'
  },
  'E-waste': {
    name: 'E-waste',
    color: '#a855f7',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    badgeBg: 'bg-purple-950/40 border-purple-500/30 text-purple-300',
    activeGradient: 'from-purple-600 to-violet-600',
    activeGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.5)]',
    dot: 'bg-purple-400',
    accentBar: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]',
    shadow: 'rgba(168, 85, 247, 0.45)',
    icon: Cpu,
    svgPath: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>'
  },
  Hazardous: {
    name: 'Hazardous',
    color: '#ef4444',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    badgeBg: 'bg-rose-950/40 border-rose-500/30 text-rose-300',
    activeGradient: 'from-rose-600 to-red-600',
    activeGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    dot: 'bg-rose-400',
    accentBar: 'bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]',
    shadow: 'rgba(239, 68, 68, 0.45)',
    icon: AlertTriangle,
    svgPath: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
  },
  Textile: {
    name: 'Textile',
    color: '#ec4899',
    border: 'border-pink-500/30',
    bg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    badgeBg: 'bg-pink-950/40 border-pink-500/30 text-pink-300',
    activeGradient: 'from-pink-600 to-rose-600',
    activeGlow: 'shadow-[0_0_20px_rgba(236,72,153,0.5)]',
    dot: 'bg-pink-400',
    accentBar: 'bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.6)]',
    shadow: 'rgba(236, 72, 153, 0.45)',
    icon: Shirt,
    svgPath: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>'
  },
  Other: {
    name: 'Other',
    color: '#6b7280',
    border: 'border-gray-500/30',
    bg: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    badgeBg: 'bg-gray-900/40 border-gray-500/30 text-gray-300',
    activeGradient: 'from-gray-600 to-slate-600',
    activeGlow: 'shadow-[0_0_20px_rgba(107,114,128,0.5)]',
    dot: 'bg-gray-400',
    accentBar: 'bg-gray-500 shadow-[0_0_12px_rgba(107,114,128,0.6)]',
    shadow: 'rgba(107, 114, 128, 0.45)',
    icon: HelpCircle,
    svgPath: '<circle cx="12" cy="12" r="10"/><path d="9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'
  }
};

/**
 * Returns theme info for a given category
 */
export function getCategoryTheme(category = 'Other') {
  if (!category) return CATEGORY_THEMES.Other;
  return CATEGORY_THEMES[category] || CATEGORY_THEMES.Other;
}

/**
 * Returns the primary category theme from a list of accepted categories
 */
export function getPrimaryCategory(categories = []) {
  if (!categories || categories.length === 0) return 'Other';
  return categories[0] || 'Other';
}

/**
 * Parses operating hours string and calculates if the facility is currently open
 * @param {string} timingsStr e.g. "Mon-Sat: 08:00 AM - 05:00 PM" or "24x7"
 * @returns {{ isOpen: boolean, label: string, color: string }}
 */
export function isOpenNow(timingsStr) {
  if (!timingsStr) {
    return { isOpen: true, label: 'Open', color: 'text-emerald-400', dot: 'bg-emerald-400' };
  }

  const str = timingsStr.toLowerCase();
  if (str.includes('24x7') || str.includes('24/7') || str.includes('24 hours')) {
    return { isOpen: true, label: 'Open 24/7', color: 'text-emerald-400', dot: 'bg-emerald-400' };
  }

  try {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Check if Sunday closed
    if (day === 0 && !str.includes('sun')) {
      return { isOpen: false, label: 'Closed today', color: 'text-rose-400', dot: 'bg-rose-400' };
    }

    // Attempt parsing times: e.g. "08:00 AM - 05:00 PM"
    const match = timingsStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)\s*-\s*(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!match) {
      return { isOpen: true, label: 'Open today', color: 'text-emerald-400', dot: 'bg-emerald-400' };
    }

    let [ , openHourStr, openMinStr, openPeriod, closeHourStr, closeMinStr, closePeriod ] = match;
    let openHour = parseInt(openHourStr, 10);
    let closeHour = parseInt(closeHourStr, 10);
    const openMin = parseInt(openMinStr, 10);
    const closeMin = parseInt(closeMinStr, 10);

    if (openPeriod.toLowerCase() === 'pm' && openHour !== 12) openHour += 12;
    if (openPeriod.toLowerCase() === 'am' && openHour === 12) openHour = 0;
    if (closePeriod.toLowerCase() === 'pm' && closeHour !== 12) closeHour += 12;
    if (closePeriod.toLowerCase() === 'am' && closeHour === 12) closeHour = 0;

    const currentMins = now.getHours() * 60 + now.getMinutes();
    const openTotalMins = openHour * 60 + openMin;
    const closeTotalMins = closeHour * 60 + closeMin;

    if (currentMins >= openTotalMins && currentMins <= closeTotalMins) {
      return { isOpen: true, label: 'Open now', color: 'text-emerald-400', dot: 'bg-emerald-400' };
    } else {
      return { isOpen: false, label: 'Closed now', color: 'text-rose-400', dot: 'bg-rose-400' };
    }
  } catch {
    return { isOpen: true, label: 'Open today', color: 'text-emerald-400', dot: 'bg-emerald-400' };
  }
}
