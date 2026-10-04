import React, { useState } from 'react';
import { Popup } from 'react-leaflet';
import { MapPin, Navigation, Phone, Clock, Share2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/useApp.js';
import { isOpenNow } from '../../utils/categoryTheme.js';
import { formatDistance } from '../../utils/formatters.js';
import CategoryBadge from '../CategoryBadge.jsx';
import toast from 'react-hot-toast';

export default function CenterPopup({ center }) {
  const { t } = useTranslation();
  const { language } = useApp();
  const [copied, setCopied] = useState(false);
  const openStatus = isOpenNow(center.timings);

  const handleShare = (e) => {
    e.stopPropagation();
    const shareText = `${center.name}\n📍 ${center.address}\n🕒 ${center.timings || ''}\nhttps://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success(t('centers_page.copied_toast', { defaultValue: 'Location & details copied to clipboard!' }), {
        id: 'share-center-toast',
        style: { background: '#162329', color: '#10b981' }
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Popup className="glassmorphism-leaflet-popup" maxWidth={320} minWidth={260}>
      <div className="p-3.5 space-y-3">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-eco-400 bg-eco-500/10 border border-eco-500/20 px-2 py-0.5 rounded-full">
                {center.type}
              </span>
              {center.verified && (
                <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-0.5">
                  <Check className="w-3 h-3 text-emerald-400" /> {t('centers_page.verified', { defaultValue: 'Verified' })}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white mt-1 leading-snug">
              {center.name}
            </h4>
          </div>

          {center.distanceKm !== null && center.distanceKm !== undefined && (
            <div className="px-2 py-1 rounded-xl bg-dark-bg/90 border border-eco-500/30 text-eco-300 font-extrabold text-xs shrink-0 shadow-glow-sm">
              {formatDistance(center.distanceKm, language)}
            </div>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-gray-300 leading-relaxed">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{center.address}</span>
        </div>

        {/* Timings & Open/Closed Live Status */}
        {center.timings && (
          <div className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-gray-300 text-[11px] truncate">
              <Clock className="w-3 h-3 text-eco-400 shrink-0" />
              <span className="truncate">{center.timings}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${openStatus.dot} animate-pulse`} />
              <span className={`text-[10px] font-bold ${openStatus.color}`}>
                {openStatus.isOpen ? t('centers_page.open_now', { defaultValue: 'Open Now' }) : t('centers_page.closed', { defaultValue: 'Closed' })}
              </span>
            </div>
          </div>
        )}

        {/* Accepted Categories */}
        {center.acceptedCategories && center.acceptedCategories.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              {t('centers_page.accepted_materials', { defaultValue: 'Accepted Materials:' })}
            </div>
            <div className="flex flex-wrap gap-1">
              {center.acceptedCategories.slice(0, 4).map((cat) => (
                <CategoryBadge key={cat} category={cat} size="xs" />
              ))}
              {center.acceptedCategories.length > 4 && (
                <span className="text-[10px] font-bold text-gray-400 px-1.5 py-0.5 rounded-full bg-white/5">
                  +{center.acceptedCategories.length - 4} {t('centers_page.more', { defaultValue: 'more' })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-eco-600 to-emerald-500 hover:from-eco-500 hover:to-emerald-400 text-white text-xs font-bold transition-all shadow-glow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{t('centers_page.directions', { defaultValue: 'Directions' })}</span>
          </a>

          {center.contact && (
            <a
              href={`tel:${center.contact.replace(/\s+/g, '')}`}
              title={t('centers_page.call_facility', { defaultValue: 'Call Facility' })}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-eco-400" />
            </a>
          )}

          <button
            onClick={handleShare}
            title={t('centers_page.share', { defaultValue: 'Share or Copy Info' })}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-eco-400" />
            )}
          </button>
        </div>
      </div>
    </Popup>
  );
}
