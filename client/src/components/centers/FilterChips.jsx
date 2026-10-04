import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownAZ, Navigation, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCategoryTheme } from '../../utils/categoryTheme.js';
import { formatNumber } from '../../utils/formatters.js';

const CATEGORY_LIST = [
  'All',
  'Plastic',
  'Paper',
  'Glass',
  'Metal',
  'Organic',
  'E-waste',
  'Hazardous',
  'Textile'
];

export default function FilterChips({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onToggleSort,
  radiusKm,
  onChangeRadius,
  totalResults = 0
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'hinglish';

  return (
    <div className="space-y-3">
      {/* Top Filter Bar: Chips & Count/Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Horizontal scrollable chips row */}
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
            {CATEGORY_LIST.map((cat) => {
              const isSelected = selectedCategory === cat;
              const theme = cat === 'All' ? null : getCategoryTheme(cat);
              const IconComponent = theme?.icon;
              const label = cat === 'All'
                ? t('centers_page.all_filter', 'All')
                : t(`category_names.${cat}`, cat);

              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white bg-dark-surface/80 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {/* Sliding animated background pill */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeFilterBubble"
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                        theme ? theme.activeGradient : 'from-eco-600 to-emerald-500'
                      } ${theme ? theme.activeGlow : 'shadow-[0_0_20px_rgba(16,185,129,0.5)]'}`}
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  {/* Content */}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {cat === 'All' ? (
                      <Sparkles className="w-3.5 h-3.5 text-eco-300" />
                    ) : IconComponent ? (
                      <IconComponent
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: isSelected ? '#ffffff' : theme.color }}
                      />
                    ) : (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white' : theme?.dot || 'bg-gray-400'
                        }`}
                      />
                    )}
                    <span>{label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Controls: Result Count, Radius & Sort */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
          {/* Result Count Badge */}
          <div className="px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-eco-400 animate-pulse" />
            <span>
              <strong className="text-white font-extrabold">{formatNumber(totalResults, currentLang)}</strong>{' '}
              {t('centers_page.centers_found', 'facilities found')}
            </span>
          </div>

          {/* Radius Selector */}
          <div className="flex items-center bg-dark-surface border border-white/10 rounded-2xl p-0.5 text-xs font-bold text-gray-300">
            {['10', '25', '50'].map((r) => (
              <button
                key={r}
                onClick={() => onChangeRadius(r)}
                className={`px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                  radiusKm === r
                    ? 'bg-eco-500/20 text-eco-300 border border-eco-500/30 font-extrabold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {formatNumber(r, currentLang)} km
              </button>
            ))}
          </div>

          {/* Sort Button */}
          <button
            onClick={onToggleSort}
            title={sortBy === 'distance' ? t('centers_page.sort_nearest', 'Nearest') : t('centers_page.sort_az', 'A-Z')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            {sortBy === 'distance' ? (
              <>
                <Navigation className="w-3.5 h-3.5 text-eco-400" />
                <span>{t('centers_page.sort_nearest', 'Nearest')}</span>
              </>
            ) : (
              <>
                <ArrowDownAZ className="w-3.5 h-3.5 text-eco-400" />
                <span>{t('centers_page.sort_az', 'A-Z')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
