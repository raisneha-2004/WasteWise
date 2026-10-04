import React from 'react';
import { Trash2 } from 'lucide-react';

const BIN_COLORS = {
  Blue: {
    bg: 'bg-blue-600/20',
    border: 'border-blue-500',
    text: 'text-blue-400',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.35)]',
    badge: 'bg-blue-500/20 text-blue-300'
  },
  Green: {
    bg: 'bg-emerald-600/20',
    border: 'border-emerald-500',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.35)]',
    badge: 'bg-emerald-500/20 text-emerald-300'
  },
  Red: {
    bg: 'bg-rose-600/20',
    border: 'border-rose-500',
    text: 'text-rose-400',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.35)]',
    badge: 'bg-rose-500/20 text-rose-300'
  },
  Orange: {
    bg: 'bg-orange-600/20',
    border: 'border-orange-500',
    text: 'text-orange-400',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.35)]',
    badge: 'bg-orange-500/20 text-orange-300'
  },
  Teal: {
    bg: 'bg-teal-600/20',
    border: 'border-teal-500',
    text: 'text-teal-400',
    glow: 'shadow-[0_0_30px_rgba(20,184,166,0.35)]',
    badge: 'bg-teal-500/20 text-teal-300'
  },
  Purple: {
    bg: 'bg-purple-600/20',
    border: 'border-purple-500',
    text: 'text-purple-400',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.35)]',
    badge: 'bg-purple-500/20 text-purple-300'
  },
  Grey: {
    bg: 'bg-slate-600/20',
    border: 'border-slate-400',
    text: 'text-slate-300',
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.3)]',
    badge: 'bg-slate-500/20 text-slate-300'
  },
  Black: {
    bg: 'bg-gray-800/40',
    border: 'border-gray-600',
    text: 'text-gray-300',
    glow: 'shadow-[0_0_30px_rgba(75,85,99,0.3)]',
    badge: 'bg-gray-700/40 text-gray-300'
  }
};

export default function BinVisual({ color = 'Blue', name = 'Dry Waste Bin', size = 'lg' }) {
  const binStyle = BIN_COLORS[color] || BIN_COLORS['Blue'];

  const containerSizes = {
    sm: 'p-3 gap-2',
    md: 'p-4 gap-3',
    lg: 'p-6 gap-4'
  }[size] || 'p-6 gap-4';

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  }[size] || 'w-14 h-14';

  return (
    <div
      className={`relative flex items-center justify-between rounded-2xl border ${binStyle.bg} ${binStyle.border} ${binStyle.glow} ${containerSizes} transition-all duration-300`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center justify-center rounded-xl bg-dark-bg/80 border border-white/10 ${binStyle.text} p-3`}
        >
          <Trash2 className={`${iconSizes} stroke-[2.2]`} />
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Recommended Bin</span>
          <h4 className="text-lg md:text-xl font-bold text-white tracking-tight">{name}</h4>
        </div>
      </div>

      <div
        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/10 ${binStyle.badge}`}
      >
        {color} Bin
      </div>
    </div>
  );
}
