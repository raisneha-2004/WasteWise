import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Leaf,
  Award,
  Sparkles,
  MapPin,
  ExternalLink,
  HelpCircle,
  Check,
  Lightbulb,
  Camera,
  Package,
  FileText,
  GlassWater,
  Layers,
  Cpu,
  TriangleAlert,
  Shirt,
  CircleDot,
  BadgeCheck
} from 'lucide-react';
import BinVisual from './BinVisual.jsx';
import AnimatedCounter from './AnimatedCounter.jsx';
import { speakText, stopSpeaking } from '../utils/speech.js';
import { formatNumber, formatDistance } from '../utils/formatters.js';
import { EASINGS, hazardShake } from '../utils/animations.js';
import { useApp } from '../context/useApp.js';
import toast from 'react-hot-toast';

// ── Category meta: color tokens + lucide icons ──
const CATEGORY_META = {
  Plastic: {
    icon: Package,
    pill: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    glow: 'rgba(59,130,246,0.35)',
    ring: 'ring-blue-400/60',
    chipSelected: 'bg-blue-500/25 border-blue-400/70 text-blue-200 shadow-[0_0_14px_rgba(59,130,246,0.4)]',
    dot: 'bg-blue-400'
  },
  Paper: {
    icon: FileText,
    pill: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    glow: 'rgba(14,165,233,0.35)',
    ring: 'ring-sky-400/60',
    chipSelected: 'bg-sky-500/25 border-sky-400/70 text-sky-200 shadow-[0_0_14px_rgba(14,165,233,0.4)]',
    dot: 'bg-sky-400'
  },
  Glass: {
    icon: GlassWater,
    pill: 'bg-teal-500/15 text-teal-300 border-teal-500/40',
    glow: 'rgba(20,184,166,0.35)',
    ring: 'ring-teal-400/60',
    chipSelected: 'bg-teal-500/25 border-teal-400/70 text-teal-200 shadow-[0_0_14px_rgba(20,184,166,0.4)]',
    dot: 'bg-teal-400'
  },
  Metal: {
    icon: Layers,
    pill: 'bg-slate-400/15 text-slate-300 border-slate-400/40',
    glow: 'rgba(148,163,184,0.3)',
    ring: 'ring-slate-300/60',
    chipSelected: 'bg-slate-400/25 border-slate-300/70 text-slate-200 shadow-[0_0_14px_rgba(148,163,184,0.35)]',
    dot: 'bg-slate-300'
  },
  Organic: {
    icon: Leaf,
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    glow: 'rgba(160,185,129,0.35)',
    ring: 'ring-emerald-400/60',
    chipSelected: 'bg-emerald-500/25 border-emerald-400/70 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.4)]',
    dot: 'bg-emerald-400'
  },
  'E-waste': {
    icon: Cpu,
    pill: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    glow: 'rgba(245,158,11,0.35)',
    ring: 'ring-amber-400/60',
    chipSelected: 'bg-amber-500/25 border-amber-400/70 text-amber-200 shadow-[0_0_14px_rgba(245,158,11,0.4)]',
    dot: 'bg-amber-400'
  },
  Hazardous: {
    icon: TriangleAlert,
    pill: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    glow: 'rgba(244,63,94,0.35)',
    ring: 'ring-rose-400/60',
    chipSelected: 'bg-rose-500/25 border-rose-400/70 text-rose-200 shadow-[0_0_14px_rgba(244,63,94,0.4)]',
    dot: 'bg-rose-400'
  },
  Textile: {
    icon: Shirt,
    pill: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    glow: 'rgba(168,85,247,0.35)',
    ring: 'ring-purple-400/60',
    chipSelected: 'bg-purple-500/25 border-purple-400/70 text-purple-200 shadow-[0_0_14px_rgba(168,85,247,0.4)]',
    dot: 'bg-purple-400'
  },
  Other: {
    icon: CircleDot,
    pill: 'bg-gray-500/15 text-gray-300 border-gray-500/40',
    glow: 'rgba(107,114,128,0.3)',
    ring: 'ring-gray-400/60',
    chipSelected: 'bg-gray-500/25 border-gray-400/70 text-gray-200 shadow-[0_0_14px_rgba(107,114,128,0.35)]',
    dot: 'bg-gray-400'
  }
};

const AVAILABLE_CATEGORIES = [
  'Plastic', 'Paper', 'Glass', 'Metal', 'Organic',
  'E-waste', 'Hazardous', 'Textile', 'Other'
];

// Animated equalizer bars (3 bars, bouncing while audio plays)
function EqualizerBars() {
  return (
    <span className="flex items-end gap-[3px] h-4">
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-emerald-400"
          animate={{ scaleY: [0.4, 1, 0.5, 0.9, 0.3, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          style={{ originY: 1, height: '14px' }}
        />
      ))}
    </span>
  );
}

// Animated confidence percentage counter
function AnimatedPct({ value, duration = 1 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.round(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}</>;
}

export default function ResultCard({
  result,
  onConfirmCategory,
  isConfirming = false
}) {
  const { t } = useTranslation();
  const { language } = useApp();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [focusedChip, setFocusedChip] = useState(null);
  const chipRefs = useRef([]);
  const shouldReduceMotion = useReducedMotion();

  // Stop speech if unmounted or language changes
  useEffect(() => {
    return () => {
      stopSpeaking();
      setIsSpeaking(false);
    };
  }, [language]);

  // Trigger celebration confetti once when result appears
  useEffect(() => {
    if (!result || shouldReduceMotion) return;
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#3b82f6'],
        disableForReducedMotion: true
      });
    } catch (e) {
      console.warn('Confetti trigger failed:', e);
    }
  }, [result, shouldReduceMotion]);

  if (!result) return null;

  const {
    item,
    category,
    confidence = 0.8,
    needsConfirmation = false,
    bin,
    steps = [],
    dos = [],
    donts = [],
    hazard,
    impact,
    ecoPoints,
    nearbyCenters = [],
    tip,
    speechText,
    speechTextNative
  } = result;

  const confidencePct = Math.round(confidence * 100);
  const isLowConf = confidencePct < 50;
  const isMedConf = confidencePct >= 50 && confidencePct < 80;
  const isHighConf = confidencePct >= 80;

  const confBarClass = isHighConf
    ? 'from-emerald-400 to-emerald-500'
    : isMedConf
    ? 'from-amber-400 to-amber-500'
    : 'from-rose-400 to-rose-500';

  const confGlow = isHighConf
    ? '0 0 16px rgba(16,185,129,0.5)'
    : isMedConf
    ? '0 0 16px rgba(245,158,11,0.45)'
    : '0 0 16px rgba(244,63,94,0.45)';

  const confLabel = isHighConf 
    ? t('result.high_confidence', { defaultValue: 'High Confidence' }) 
    : isMedConf 
    ? t('result.medium_confidence', { defaultValue: 'Medium Confidence' }) 
    : t('result.low_confidence', { defaultValue: 'Low Confidence' });
    
  const confLabelColor = isHighConf ? 'text-emerald-400' : isMedConf ? 'text-amber-400' : 'text-rose-400';

  const meta = CATEGORY_META[category] || CATEGORY_META['Other'];
  const CatIcon = meta.icon;

  const translatedCategory = t(`category_names.${category}`, { defaultValue: category });

  // Audio handler — clicking while playing stops it
  const handleListen = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    // Prepare speech text
    let targetText = speechText;
    let targetNative = speechTextNative;

    if (!targetText) {
      targetText = `${item?.name || translatedCategory}. ${bin?.name || bin?.color}. ${steps.slice(0, 3).join('. ')}`;
    }

    speakText({
      text: targetText,
      nativeText: targetNative,
      language: language,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  // Keyboard navigation for category chips
  const handleChipKeyDown = (e, idx) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (idx + 1) % AVAILABLE_CATEGORIES.length;
      chipRefs.current[next]?.focus();
      setFocusedChip(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (idx - 1 + AVAILABLE_CATEGORIES.length) % AVAILABLE_CATEGORIES.length;
      chipRefs.current[prev]?.focus();
      setFocusedChip(prev);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleConfirmWithToast(AVAILABLE_CATEGORIES[idx]);
    }
  };

  const handleConfirmWithToast = (cat) => {
    if (isConfirming) return;
    if (onConfirmCategory) {
      onConfirmCategory(cat);
    }
    toast.success('Thanks! Category updated.', {
      icon: '✅',
      style: { background: '#0d1f1a', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }
    });
  };

  const fadeUp = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay, ease: EASINGS.easeOut } };

  return (
    <motion.div
      {...(shouldReduceMotion ? {} : {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASINGS.easeOut }
      })}
      className="space-y-5"
    >
      {/* ═══ HEADER CARD ═══ */}
      <motion.div
        {...fadeUp(0.06)}
        className="glass-panel rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl"
        style={{ boxShadow: `0 0 60px -12px ${meta.glow}, 0 0 0 1px rgba(255,255,255,0.06)` }}
      >
        {/* Category radial glow */}
        <div
          className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, ${meta.glow} 0%, transparent 70%)` }}
        />
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6">
          {/* Top row: category pill + tag + listen */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10">
            <div className="flex-1 min-w-0">
              {/* Category pill with icon */}
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-sm ${meta.pill}`}
                  style={{ boxShadow: `0 0 12px ${meta.glow}` }}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {category}
                </span>

                {/* Glass tag chip */}
                {item?.material && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] text-gray-300 text-xs font-medium backdrop-blur-sm">
                    {item.material}
                  </span>
                )}
              </div>

              {/* Title with blur-to-sharp fade-up */}
              <motion.h2
                {...(shouldReduceMotion ? {} : {
                  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
                  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  transition: { duration: 0.5, delay: 0.12, ease: EASINGS.easeOut }
                })}
                className="text-2xl md:text-3xl font-extrabold text-white tracking-tight"
              >
                {item?.name || translatedCategory || t('result.title', { defaultValue: 'Identified Waste' })}
              </motion.h2>
            </div>

            {/* Listen button */}
            <button
              onClick={handleListen}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border text-sm font-semibold flex items-center gap-2.5 transition-all duration-200 ${
                isSpeaking
                  ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                  : 'bg-white/[0.06] hover:bg-white/[0.10] border-white/10 text-gray-200 hover:border-white/20'
              }`}
              title={isSpeaking ? t('result.stop_audio', { defaultValue: 'Stop audio' }) : t('result.listen', { defaultValue: 'Listen in current language' })}
            >
              {isSpeaking ? (
                <>
                  <EqualizerBars />
                  <span>{t('result.playing', { defaultValue: 'Playing...' })}</span>
                  <VolumeX className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>{t('result.listen', { defaultValue: 'Listen' })}</span>
                </>
              )}
            </button>
          </div>

          {/* ── Confidence bar ── */}
          <div className="pt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">{t('result.confidence_title', { defaultValue: 'AI Identification Confidence' })}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${confLabelColor}`}>{confLabel}</span>
                <span className="font-bold text-white tabular-nums">
                  <AnimatedPct value={confidencePct} duration={0.9} />%
                </span>
              </div>
            </div>
            <div className="w-full bg-white/[0.06] h-2.5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={shouldReduceMotion ? { width: `${confidencePct}%` } : { width: 0 }}
                animate={{ width: `${confidencePct}%` }}
                transition={{ duration: 0.9, delay: 0.2, ease: EASINGS.easeOut }}
                className={`h-full rounded-full bg-gradient-to-r ${confBarClass}`}
                style={{ boxShadow: confGlow }}
              />
            </div>
          </div>

          {/* ── Low-confidence banner ── */}
          <AnimatePresence>
            {isLowConf && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="mt-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/25 shrink-0">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-200 mb-2">
                      {t('result.low_conf_warning', { defaultValue: 'Not sure about this one. Try a clearer photo for a better result.' })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-gray-300 text-xs">
                        {t('result.tip_lighting', { defaultValue: '📸 Use good lighting' })}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-gray-300 text-xs">
                        {t('result.tip_closer', { defaultValue: '🔍 Get closer to the item' })}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-gray-300 text-xs">
                        {t('result.tip_clutter', { defaultValue: '🗑️ Remove background clutter' })}
                      </span>
                    </div>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {t('result.scan_again', { defaultValue: 'Scan Again' })}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Category chips (confirmation radiogroup) ── */}
          {(needsConfirmation || isLowConf) && (
            <motion.div
              {...(shouldReduceMotion ? {} : {
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.4, delay: 0.38 }
              })}
              className="mt-4 p-4 rounded-2xl bg-amber-500/[0.07] border border-amber-500/25"
            >
              <p className="text-xs font-semibold text-amber-300 mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                {t('result.confirm_prompt', {
                  category: translatedCategory,
                  defaultValue: `Is this ${translatedCategory}? Confirm or correct:`
                })}
              </p>

              <div role="radiogroup" aria-label="Select waste category" className="flex flex-wrap gap-2">
                {AVAILABLE_CATEGORIES.map((cat, idx) => {
                  const catMeta = CATEGORY_META[cat] || CATEGORY_META['Other'];
                  const CatChipIcon = catMeta.icon;
                  const isSelected = cat === category;
                  const catTranslated = t(`category_names.${cat}`, { defaultValue: cat });
                  return (
                    <button
                      key={cat}
                      ref={(el) => (chipRefs.current[idx] = el)}
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isConfirming}
                      tabIndex={isSelected || focusedChip === idx ? 0 : -1}
                      onClick={() => handleConfirmWithToast(cat)}
                      onKeyDown={(e) => handleChipKeyDown(e, idx)}
                      onFocus={() => setFocusedChip(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 ${catMeta.ring} ${
                        isSelected
                          ? catMeta.chipSelected
                          : 'bg-white/[0.04] border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/[0.07]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${catMeta.dot}`} />
                      <CatChipIcon className="w-3 h-3 shrink-0" />
                      {catTranslated}
                      {isSelected && <BadgeCheck className="w-3.5 h-3.5 shrink-0 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ═══ BIN VISUAL ═══ */}
      <motion.div {...fadeUp(0.14)}>
        <BinVisual color={bin?.color} name={bin?.name} hexColor={bin?.hexColor} size="lg" />
      </motion.div>

      {/* ═══ HAZARD WARNING ═══ */}
      {hazard?.isHazardous && (
        <motion.div
          variants={shouldReduceMotion ? {} : hazardShake}
          animate={shouldReduceMotion ? {} : 'animate'}
          className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-start gap-3.5 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.2)]"
        >
          <AlertTriangle className="w-6 h-6 shrink-0 text-rose-400 mt-0.5 animate-pulse" />
          <div>
            <h4 className="font-bold text-sm text-rose-200 uppercase tracking-wider">{t('result.hazard_detected', { defaultValue: 'Hazard Detected' })}</h4>
            <p className="text-sm mt-1 leading-relaxed text-rose-300/90">{hazard.reason || hazard.warning}</p>
          </div>
        </motion.div>
      )}

      {/* ═══ DISPOSAL STEPS ═══ */}
      <motion.div {...fadeUp(0.2)} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h4 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{t('result.disposal_instructions', { defaultValue: 'Disposal Instructions' })}</span>
        </h4>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 + idx * 0.08, duration: 0.35 }}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs shrink-0">
                {formatNumber(idx + 1, language)}
              </span>
              <p className="text-sm text-gray-200 leading-relaxed">{step}</p>
            </motion.div>
          ))}
        </div>

        {/* Dos & Don'ts */}
        {(dos?.length > 0 || donts?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            {dos?.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> {t('result.dos', { defaultValue: "Do's" })}
                </span>
                <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                  {dos.slice(0, 3).map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
            {donts?.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> {t('result.donts', { defaultValue: "Don'ts" })}
                </span>
                <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
                  {donts.slice(0, 3).map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ═══ ECO-POINTS & CO2 ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          {...fadeUp(0.26)}
          className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center gap-4 relative overflow-hidden"
        >
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium">{t('result.eco_points_earned', { defaultValue: 'Eco-Points Earned' })}</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl md:text-3xl font-extrabold text-amber-300">
                +<AnimatedCounter value={ecoPoints?.totalPoints || 15} duration={1} />
              </span>
              <span className="text-xs text-amber-400/80 font-medium">{t('result.points', { defaultValue: 'Points' })}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{t('result.saved_to_profile', { defaultValue: 'Saved to your eco profile' })}</p>
          </div>
        </motion.div>

        <motion.div
          {...fadeUp(0.3)}
          className="glass-panel p-5 rounded-3xl border border-white/10 flex items-center gap-4 relative overflow-hidden"
        >
          <div className="p-3.5 rounded-2xl bg-eco-500/10 border border-eco-500/20 text-eco-400 shrink-0">
            <Leaf className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-medium">{t('result.estimated_co2_saved', { defaultValue: 'Estimated CO2 Saved' })}</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl md:text-3xl font-extrabold text-eco-300">
                <AnimatedCounter value={impact?.co2SavedKg || 0.05} duration={1} />
              </span>
              <span className="text-xs text-eco-400/80 font-medium">{t('result.co2_unit', { defaultValue: 'kg CO2e' })}</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              ~{impact?.treesEquivalent || 0.002} {t('result.trees_equiv', { defaultValue: 'trees equivalent' })}
            </p>
          </div>
        </motion.div>
      </div>

      {/* ═══ ECO TIP ═══ */}
      {tip && (
        <motion.div
          {...fadeUp(0.34)}
          className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 text-xs text-gray-300"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <p><strong className="text-white">{t('result.eco_tip', { defaultValue: 'Eco Tip:' })} </strong>{tip}</p>
        </motion.div>
      )}

      {/* ═══ NEARBY CENTERS ═══ */}
      {nearbyCenters?.length > 0 && (
        <motion.div {...fadeUp(0.38)} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span>{t('result.nearest_centers', { defaultValue: 'Nearest Matching Centers' })}</span>
            </h4>
            <span className="text-xs text-gray-400">{t('result.within_ncr', { defaultValue: 'Within NCR' })}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nearbyCenters.slice(0, 3).map((ctr) => (
              <motion.div
                key={ctr.id}
                whileHover={shouldReduceMotion ? {} : { y: -3 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <h5 className="font-bold text-sm text-white line-clamp-1">{ctr.name}</h5>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{ctr.address}</p>
                  {ctr.distanceKm !== null && (
                    <span className="inline-block mt-2 text-xs font-semibold text-emerald-400">
                      📍 {formatDistance(ctr.distanceKm, language)}
                    </span>
                  )}
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${ctr.lat},${ctr.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-dark-bg/80 py-1.5 px-3 rounded-xl border border-white/10 hover:border-emerald-500/50 transition-colors"
                >
                  <span>{t('result.directions', { defaultValue: 'Directions' })}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

