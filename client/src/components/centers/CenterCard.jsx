import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Car,
  Footprints,
  Share2,
  Check,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCategoryTheme, getPrimaryCategory, isOpenNow } from '../../utils/categoryTheme.js';
import { formatDistance } from '../../utils/formatters.js';
import CategoryBadge from '../CategoryBadge.jsx';
import toast from 'react-hot-toast';

const CenterCard = forwardRef(function CenterCard(
  { center, isSelected = false, onSelect, index = 0 },
  ref
) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'hinglish';
  const [copied, setCopied] = useState(false);

  const primaryCat = getPrimaryCategory(center.acceptedCategories);
  const primaryTheme = getCategoryTheme(primaryCat);
  const openStatus = isOpenNow(center.timings);

  const handleShare = (e) => {
    e.stopPropagation();
    const shareText = `${center.name}\n📍 ${center.address}\n🕒 ${center.timings || ''}\nhttps://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success(t('centers_page.copied_toast', 'Location details copied to clipboard!'), {
        id: 'center-copy',
        style: { background: '#162329', color: '#10b981' }
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isWalkingDistance = center.distanceKm !== null && center.distanceKm <= 2.0;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.04, 0.25)
      }}
      whileHover={{ y: -3 }}
      onClick={() => onSelect && onSelect(center)}
      className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-gradient-to-br from-eco-950/40 via-dark-surface to-dark-bg border-2 border-eco-500 shadow-[0_0_25px_rgba(16,185,129,0.22)]'
          : 'glass-panel border border-white/10 hover:border-eco-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]'
      }`}
    >
      {/* Left accent color bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${primaryTheme.accentBar}`}
      />

      {/* Top row: Type badge + Distance pill */}
      <div className="flex items-start justify-between gap-3 pl-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-eco-400 bg-eco-500/10 border border-eco-500/20 px-2.5 py-0.5 rounded-full">
            {center.type}
          </span>
          {center.verified && (
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> {t('centers_page.verified', 'Verified')}
            </span>
          )}
        </div>

        {center.distanceKm !== null && center.distanceKm !== undefined && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-dark-bg/90 border border-white/10 text-xs font-bold text-eco-300 shrink-0 group-hover:border-eco-500/40 transition-colors">
            {isWalkingDistance ? (
              <Footprints className="w-3 h-3 text-eco-400" />
            ) : (
              <Car className="w-3 h-3 text-eco-400" />
            )}
            <span>{formatDistance(center.distanceKm, currentLang)}</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-white mt-2 pl-1.5 leading-snug group-hover:text-eco-300 transition-colors">
        {center.name}
      </h3>

      {/* Address */}
      <p className="text-xs text-gray-300/80 mt-1.5 pl-1.5 flex items-start gap-1.5 line-clamp-2 leading-relaxed">
        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
        <span>{center.address}</span>
      </p>

      {/* Accepted Category chips */}
      {center.acceptedCategories && center.acceptedCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pl-1.5">
          {center.acceptedCategories.slice(0, 3).map((cat) => (
            <CategoryBadge key={cat} category={cat} size="xs" />
          ))}
          {center.acceptedCategories.length > 3 && (
            <span className="text-[10px] font-bold text-gray-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
              +{center.acceptedCategories.length - 3} {t('centers_page.more', 'more')}
            </span>
          )}
        </div>
      )}

      {/* Footer Info: Timings, Live Status & Action Buttons */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 pl-1.5 text-xs">
        {center.timings ? (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${openStatus.dot} animate-pulse shrink-0`} />
            <span className={`font-bold text-[11px] ${openStatus.color}`}>
              {openStatus.isOpen ? t('centers_page.open_now', 'Open now') : t('centers_page.closed_now', 'Closed now')}
            </span>
            <span className="text-gray-400 text-[11px] hidden sm:inline-block">
              • {center.timings}
            </span>
          </div>
        ) : (
          <div className="text-gray-400 text-[11px]">{t('centers_page.verified', 'Verified')}</div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          {center.contact && (
            <a
              href={`tel:${center.contact.replace(/\s+/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              title={`${t('centers_page.call_btn', 'Call')} ${center.contact}`}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-eco-400" />
            </a>
          )}

          <button
            onClick={handleShare}
            title={t('centers_page.share_btn', 'Share')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-eco-400" />
            )}
          </button>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-eco-500/30 bg-eco-500/10 hover:bg-eco-500/20 text-eco-300 hover:text-white font-bold text-xs transition-all duration-200 group/btn"
          >
            <span>{t('centers_page.directions_btn', 'Directions')}</span>
            <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </motion.div>
  );
});

export default CenterCard;
