import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Calendar, Award, PackageOpen, Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/useApp.js';
import { formatDate, formatNumber } from '../utils/formatters.js';
import CategoryBadge from '../components/CategoryBadge.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useNavigate } from 'react-router-dom';

const CATEGORY_OPTIONS = [
  'All',
  'Plastic',
  'Paper',
  'Glass',
  'Metal',
  'Organic',
  'E-waste',
  'Hazardous',
  'Textile',
  'Other'
];

export default function History() {
  const { history, deleteScan, clearHistory, language } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Filter and search history
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.item?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleConfirmClear = () => {
    clearHistory();
    setIsClearModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6 pb-24">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-500/10 border border-eco-500/20 text-eco-400 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('history_page.badge', { defaultValue: 'Local Activity Vault' })}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {t('history_page.title', { defaultValue: 'Scan History' })}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            {t('history_page.subtitle', { defaultValue: 'Browse through your segregated items and earned eco-points.' })}
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>{t('history_page.clear_all', { defaultValue: 'Clear All History' })}</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('history_page.search_placeholder', { defaultValue: 'Search items by name or category...' })}
            className="w-full bg-dark-surface border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-eco-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-eco-600 text-white shadow-glow-sm'
                  : 'bg-dark-surface border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {cat === 'All' ? t('categories.all', { defaultValue: 'All' }) : t(`category_names.${cat}`, { defaultValue: cat })}
            </button>
          ))}
        </div>
      </div>

      {/* History Items Grid / List with AnimatePresence for smooth slide-out deletion */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title={history.length === 0 ? t('history_page.empty_title', { defaultValue: 'No Scans Recorded' }) : t('history_page.no_match_title', { defaultValue: 'No Matching Items' })}
          description={
            history.length === 0
              ? t('history_page.empty_desc', { defaultValue: 'You have not scanned any waste items yet. Your device history will appear here once you take a photo.' })
              : t('history_page.no_match_desc', { defaultValue: 'Try clearing your search query or choosing another category filter.' })
          }
          actionLabel={history.length === 0 ? t('history_page.scan_first', { defaultValue: 'Scan Your First Item' }) : t('history_page.reset_search', { defaultValue: 'Reset Search' })}
          onAction={() => (history.length === 0 ? navigate('/scan') : setSearchQuery(''))}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredHistory.map((scan, index) => (
              <motion.div
                key={scan.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -35, scale: 0.92, transition: { duration: 0.25, ease: 'easeIn' } }}
                transition={{ duration: 0.35, delay: index < 9 ? index * 0.05 : 0 }}
                whileHover={{ y: -3 }}
                className="glass-panel p-4 rounded-3xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="flex gap-3.5 items-start">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-dark-surface border border-white/10 shrink-0">
                    {scan.thumbnail ? (
                      <img
                        src={scan.thumbnail}
                        alt={scan.item}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-eco-400 bg-eco-500/10">
                        <Leaf className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <CategoryBadge category={scan.category} size="sm" />
                      <button
                        onClick={() => deleteScan(scan.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title={t('history_page.delete_record', { defaultValue: 'Delete record' })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="font-bold text-white text-sm truncate">{scan.item}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatDate(scan.date, language, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {t('history_page.bin_label', { defaultValue: 'Bin:' })} <strong className="text-white">{scan.bin?.name || scan.bin?.color}</strong>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" />
                    +{formatNumber(scan.ecoPoints || 15, language)} {t('history_page.pts', { defaultValue: 'pts' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title={t('history_page.clear_modal_title', { defaultValue: 'Clear All Scan History?' })}
        footer={
          <>
            <button
              onClick={() => setIsClearModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
            >
              {t('history_page.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              onClick={handleConfirmClear}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors"
            >
              {t('history_page.confirm_clear', { defaultValue: 'Yes, Clear All' })}
            </button>
          </>
        }
      >
        <p>
          {t('history_page.clear_modal_desc', { defaultValue: 'Are you sure you want to delete all past scan records from this browser? This action cannot be undone.' })}
        </p>
      </Modal>
    </div>
  );
}

