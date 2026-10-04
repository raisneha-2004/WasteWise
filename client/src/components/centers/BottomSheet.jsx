import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ListFilter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/useApp.js';
import { formatNumber } from '../../utils/formatters.js';

export default function BottomSheet({ children, totalCount = 0, isOpen = true }) {
  const { t } = useTranslation();
  const { language } = useApp();
  const [sheetState, setSheetState] = useState('half'); // 'collapsed' | 'half' | 'expanded'

  const heights = {
    collapsed: 'h-[110px]',
    half: 'h-[50vh]',
    expanded: 'h-[82vh]'
  };

  const toggleSheet = () => {
    if (sheetState === 'collapsed') setSheetState('half');
    else if (sheetState === 'half') setSheetState('expanded');
    else setSheetState('half');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      layout
      transition={{ type: 'spring', damping: 30, stiffness: 350 }}
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-dark-bg/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl shadow-[0_-15px_40px_rgba(0,0,0,0.7)] flex flex-col transition-all duration-300 ${heights[sheetState]}`}
    >
      {/* Drag Bar & Header */}
      <div
        onClick={toggleSheet}
        className="w-full py-2.5 px-4 flex flex-col items-center justify-center cursor-pointer select-none border-b border-white/5"
      >
        <div className="w-12 h-1.5 rounded-full bg-white/20 mb-2 hover:bg-white/40 transition-colors" />
        <div className="w-full flex items-center justify-between text-xs text-gray-300 font-bold px-2">
          <div className="flex items-center gap-1.5 text-eco-400">
            <ListFilter className="w-4 h-4" />
            <span>{t('centers_page.facilities_count', { count: totalCount, defaultValue: `Recycling Facilities (${formatNumber(totalCount, language)})` })}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              {sheetState === 'expanded' 
                ? t('centers_page.collapse', { defaultValue: 'Collapse' }) 
                : sheetState === 'half' 
                ? t('centers_page.full_list', { defaultValue: 'Full List' }) 
                : t('centers_page.expand', { defaultValue: 'Expand' })}
            </span>
            {sheetState === 'expanded' ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Sheet Content: Scrollable list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-28">
        {children}
      </div>
    </motion.div>
  );
}

