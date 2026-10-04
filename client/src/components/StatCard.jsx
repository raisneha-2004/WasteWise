import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Flame, Sparkles, TrendingUp, Leaf } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter.jsx';

const THEMES = {
  blue: {
    accent: 'blue',
    color: '#3B82F6',
    border: 'border-blue-500/20 hover:border-blue-400/60',
    ring: 'focus-visible:ring-blue-400',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.22)]',
    iconGlow: 'shadow-[0_0_18px_rgba(59,130,246,0.35)]',
    cornerGradient: 'from-blue-500/15 via-blue-500/5 to-transparent',
    textAccent: 'text-blue-400',
    chipBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20'
  },
  eco: {
    accent: 'emerald',
    color: '#10B981',
    border: 'border-emerald-500/20 hover:border-emerald-400/60',
    ring: 'focus-visible:ring-emerald-400',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.22)]',
    iconGlow: 'shadow-[0_0_18px_rgba(16,185,129,0.35)]',
    cornerGradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    textAccent: 'text-emerald-400',
    chipBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  },
  green: {
    accent: 'emerald',
    color: '#10B981',
    border: 'border-emerald-500/20 hover:border-emerald-400/60',
    ring: 'focus-visible:ring-emerald-400',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.22)]',
    iconGlow: 'shadow-[0_0_18px_rgba(16,185,129,0.35)]',
    cornerGradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    textAccent: 'text-emerald-400',
    chipBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  },
  amber: {
    accent: 'amber',
    color: '#F59E0B',
    border: 'border-amber-500/20 hover:border-amber-400/60',
    ring: 'focus-visible:ring-amber-400',
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.22)]',
    iconGlow: 'shadow-[0_0_18px_rgba(245,158,11,0.35)]',
    cornerGradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
    textAccent: 'text-amber-400',
    chipBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
  },
  purple: {
    accent: 'purple',
    color: '#A855F7',
    border: 'border-purple-500/20 hover:border-purple-400/60',
    ring: 'focus-visible:ring-purple-400',
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.22)]',
    iconGlow: 'shadow-[0_0_18px_rgba(168,85,247,0.35)]',
    cornerGradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
    textAccent: 'text-purple-400',
    chipBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
  }
};

export default function StatCard({
  title,
  label,
  value,
  unit,
  subtitle,
  subtext,
  icon: Icon,
  color = 'eco',
  to,
  ariaLabel,
  indicatorType, // 'sparkline' | 'co2_trees' | 'level_bar' | 'streak_dots'
  sparklineData = [0, 0, 0, 0, 0, 0, 0],
  treesEquivalent,
  levelProgress = 0,
  levelLabel,
  streakDots = [false, false, false, false, false, false, false],
  isEmpty = false,
  emptyCta,
  viewLabel = 'View',
  language,
  className = '',
  delay = 0
}) {
  const displayTitle = label || title;
  const displaySubtitle = subtext || subtitle;
  const theme = THEMES[color] || THEMES.eco;
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const isStreakCard = color === 'purple' || (displayTitle && displayTitle.toLowerCase().includes('streak'));
  const isEcoPointsCard = color === 'amber' || (displayTitle && displayTitle.toLowerCase().includes('point'));

  // If empty and user hasn't specified custom link, default to /scan
  const destination = isEmpty ? '/scan' : to;

  const cardContent = (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={shouldReduceMotion ? {} : { y: -6 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative glass-panel p-4 sm:p-5 md:p-6 rounded-3xl transition-all duration-300 border bg-white/[0.02] hover:bg-white/[0.06] overflow-hidden flex flex-col justify-between h-full shadow-lg ${theme.border} ${theme.glow} ${className}`}
    >
      {/* Corner Ambient Glow */}
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${theme.cornerGradient} blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60`}
      />

      <div>
        {/* Top Header Row with Label & Icon */}
        <div className="flex items-start justify-between gap-2 relative z-10 mb-2">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest truncate">
            {displayTitle}
          </p>

          {Icon && (
            <motion.div
              whileHover={shouldReduceMotion ? {} : { rotate: 8, scale: 1.12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className={`p-2.5 sm:p-3 rounded-2xl border ${theme.iconBg} ${theme.iconGlow} transition-transform duration-300 flex items-center justify-center shrink-0 shadow-sm`}
            >
              {isStreakCard ? (
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          rotate: [0, -4, 4, -2, 0],
                          scale: [1, 1.12, 0.95, 1.08, 1],
                          opacity: [0.9, 1, 0.85, 1]
                        }
                  }
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </motion.div>
              ) : isEcoPointsCard ? (
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.08, 1]
                        }
                  }
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </motion.div>
              ) : (
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
              )}
            </motion.div>
          )}
        </div>

        {/* Large Number + Unit */}
        <div className="relative z-10">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-none">
              <AnimatedCounter value={value} language={language} duration={1.2} />
            </h3>
            {unit && (
              <span className="text-xs sm:text-sm font-bold text-gray-400 tracking-normal">
                {unit}
              </span>
            )}
          </div>
          {displaySubtitle && (
            <p className="text-[11px] sm:text-xs text-gray-400 mt-1 font-medium line-clamp-1">
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* Custom Mini Visual Indicator */}
        <div className="relative z-10">
          {indicatorType === 'sparkline' && (
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-end gap-1.5 h-6">
              {sparklineData.map((count, idx) => {
                const maxVal = Math.max(1, ...sparklineData);
                const barHeightPct = Math.max(18, Math.min(100, Math.round((count / maxVal) * 100)));
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-500/25 group-hover:bg-blue-400 rounded-t transition-all duration-300"
                    style={{ height: `${barHeightPct}%` }}
                    title={`${count} scans`}
                  />
                );
              })}
              <span className="text-[9px] font-bold font-mono text-blue-400/80 ml-1">7d</span>
            </div>
          )}

          {indicatorType === 'co2_trees' && (
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
              <span className="text-xs">🌳</span>
              <span className="truncate">
                {treesEquivalent ? `${treesEquivalent}` : '~0.2 trees saved'}
              </span>
            </div>
          )}

          {indicatorType === 'level_bar' && (
            <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                <span className="truncate">{levelLabel || 'Next Level'}</span>
                <span>{levelProgress}%</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(6, Math.min(100, levelProgress))}%` }}
                />
              </div>
            </div>
          )}

          {indicatorType === 'streak_dots' && (
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-400">Week Activity</span>
              <div className="flex items-center gap-1">
                {streakDots.map((isActive, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-purple-400 shadow-[0_0_8px_#c084fc] scale-110'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sub-Action Bar (Slides in arrow on hover) */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-gray-500 relative z-10">
        <span className="text-[10px] font-medium text-gray-400 group-hover:text-gray-200 transition-colors truncate">
          {isEmpty ? (emptyCta || 'Scan your first item') : (displaySubtitle || 'View analytics')}
        </span>
        <span className={`flex items-center gap-1 ${theme.textAccent} font-bold opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200`}>
          <span>{viewLabel}</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );

  if (destination) {
    return (
      <Link
        to={destination}
        aria-label={ariaLabel || `${displayTitle}: ${value} ${unit || ''}`}
        tabIndex={0}
        className={`block rounded-3xl outline-none transition-shadow ${theme.ring} focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b101b] h-full`}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
