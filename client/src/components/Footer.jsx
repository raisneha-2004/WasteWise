import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import {
  Recycle,
  Leaf,
  Camera,
  MapPin,
  Award,
  TriangleAlert,
  ArrowRight,
  ArrowUp,
  Sparkles,
  ShieldCheck,
  Lock,
  MessageSquare,
  Globe,
  Lightbulb,
  X,
  Send,
  Star,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/useApp.js';
import toast from 'react-hot-toast';
import { EASINGS } from '../utils/animations.js';

const CURRENT_YEAR = new Date().getFullYear();

const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'हिन्दी (Hindi)',
  hinglish: 'Hinglish',
  bn: 'বাংলা (Bengali)',
  ta: 'தமிழ் (Tamil)',
  te: 'తెలుగు (Telugu)',
  mr: 'मराठी (Marathi)',
  gu: 'ગુજરાતી (Gujarati)',
  kn: 'ಕನ್ನಡ (Kannada)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)'
};

const ROTATING_TIPS = [
  {
    tipKey: 'footer.tip_1',
    defaultTip: 'Gile aur sookhe kachre ko hamesha alag rakhein taaki organic waste easily compost ban sake.',
    tagKey: 'footer.tip_1_tag',
    defaultTag: 'Segregation'
  },
  {
    tipKey: 'footer.tip_2',
    defaultTip: 'E-waste aur lithium batteries ko kabhi regular dustbin mein na daalein — inhein authorized center bhejein.',
    tagKey: 'footer.tip_2_tag',
    defaultTag: 'Hazardous'
  },
  {
    tipKey: 'footer.tip_3',
    defaultTip: 'Plastic bottles aur food containers ko recycle karne se pehle halka sa paani se rinse karein.',
    tagKey: 'footer.tip_3_tag',
    defaultTag: 'Recycling'
  },
  {
    tipKey: 'footer.tip_4',
    defaultTip: 'Single-use plastic packets ko ecobricks ya dry recyclables collection mein dispose karein.',
    tagKey: 'footer.tip_4_tag',
    defaultTag: 'Plastic Waste'
  }
];

const DID_YOU_KNOW_FACTS = [
  {
    factKey: 'footer.fact_1',
    defaultFact: '1 ton recycled paper saves 17 trees, 7,000 gallons of water & 4,000 kWh of electricity!'
  },
  {
    factKey: 'footer.fact_2',
    defaultFact: 'Glass takes over 1 million years to decompose, but can be recycled endlessly with zero loss in purity.'
  },
  {
    factKey: 'footer.fact_3',
    defaultFact: 'Recycling one aluminum can saves enough energy to run a TV for three continuous hours.'
  }
];

export default function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { history, language } = useApp();
  const shouldReduceMotion = useReducedMotion();

  // Scroll Progress Line
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Modals state
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Random tip & fact on page load
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * ROTATING_TIPS.length));
  const [factIndex] = useState(() => Math.floor(Math.random() * DID_YOU_KNOW_FACTS.length));

  // Compute live cumulative CO2 from localStorage history
  const totalCo2Saved = (history || []).reduce((acc, curr) => {
    return acc + (curr.impact?.co2SavedKg || 0.05);
  }, 0);

  const totalScansCount = (history || []).length;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectionNavigation = (sectionId) => {
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error(t('footer.feedback_empty', { defaultValue: 'Please write a short message before submitting.' }));
      return;
    }

    setIsSubmittingFeedback(true);
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      setIsFeedbackOpen(false);
      setFeedbackText('');
      toast.success(t('footer.feedback_success', { defaultValue: 'Thank you for your feedback! 💚' }));
    }, 600);
  };

  const currentTip = ROTATING_TIPS[tipIndex];
  const currentFact = DID_YOU_KNOW_FACTS[factIndex];

  return (
    <div className="relative mt-20 border-t border-white/5 bg-[#080d12]/95 backdrop-blur-xl overflow-hidden text-gray-300 z-10">
      {/* 1. Scroll-Progress Gradient Line at the very top edge of Footer */}
      <motion.div
        style={{ scaleX }}
        className="origin-left h-[2.5px] w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_#10b981] absolute top-0 left-0 right-0 z-20"
      />

      {/* Background Ambient Glowing Orbs (Desktop Only) */}
      {!shouldReduceMotion && (
        <>
          <div className="hidden md:block absolute -top-24 left-1/4 w-96 h-96 bg-emerald-500/[0.04] blur-[120px] rounded-full pointer-events-none -z-0" />
          <div className="hidden md:block absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/[0.04] blur-[120px] rounded-full pointer-events-none -z-0" />
        </>
      )}

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 md:pb-10 relative z-10">
        {/* ── TOP CALL-TO-ACTION BAND ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASINGS.easeOut }}
          className="relative rounded-3xl p-6 sm:p-8 md:p-10 mb-14 glass-panel border border-emerald-500/25 bg-gradient-to-r from-emerald-950/30 via-white/[0.02] to-teal-950/30 shadow-glow-sm overflow-hidden"
        >
          {/* Subtle floating leaf decoration */}
          {!shouldReduceMotion && (
            <div className="absolute -right-6 -bottom-6 w-32 h-32 text-emerald-500/10 pointer-events-none rotate-12">
              <Leaf className="w-full h-full" />
            </div>
          )}

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('footer.cta_badge', { defaultValue: 'Ready to Segregate?' })}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                {t('footer.cta_title', { defaultValue: 'Next item scan karne ko ready?' })}
              </h3>
              <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                {t('footer.cta_sub', { defaultValue: 'Take a 5-second snapshot and get instant municipal bin directions, hazard flags & Eco-Points.' })}
              </p>
            </div>

            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
              className="flex-shrink-0 w-full sm:w-auto"
            >
              <Link
                to="/scan"
                aria-label={t('footer.cta_btn_aria', { defaultValue: 'Scan waste item now' })}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base shadow-glow-md flex items-center justify-center gap-2.5 transition-all group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d12]"
              >
                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>{t('footer.cta_btn', { defaultValue: 'Scan Waste Item Now' })}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* ── 4-COLUMN FOOTER GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/5">
          {/* Column 1: Brand + Mission + Live Impact */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="flex flex-col justify-between"
          >
            <div>
              <Link
                to="/"
                aria-label="WasteWise AI Home"
                className="inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center border border-emerald-400/40 shadow-glow-sm group-hover:scale-105 transition-transform">
                  <Recycle className="w-5 h-5 text-dark-bg font-bold" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  Waste<span className="text-emerald-400">Wise</span>
                </span>
              </Link>

              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                {t('footer.mission', { defaultValue: 'AI se har item ko sahi bin tak pahunchana, taaki kam kachra landfill mein jaye.' })}
              </p>
            </div>

            {/* Live Impact Strip */}
            <div className="mt-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 glass-panel">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {t('footer.live_telemetry', { defaultValue: 'Live Telemetry' })}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-200">
                <span className="text-emerald-300 font-bold">{totalScansCount}</span> {t('footer.scans_label', { defaultValue: 'scans' })} • <span className="text-emerald-300 font-bold">{Math.round(totalCo2Saved * 10) / 10} kg</span> {t('footer.co2_saved_label', { defaultValue: 'CO2 saved' })}
              </p>
            </div>
          </motion.div>

          {/* Column 2: Explore (Navbar se ALAG interactive links) */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{t('footer.col_explore', { defaultValue: 'Explore' })}</span>
            </h4>

            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation('how-it-works')}
                  className="text-gray-400 hover:text-emerald-400 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-400/70" />
                  <span>{t('footer.link_how_it_works', { defaultValue: 'How it works' })}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation('waste-categories')}
                  className="text-gray-400 hover:text-emerald-400 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-400/70" />
                  <span>{t('footer.link_categories_guide', { defaultValue: 'Waste categories guide' })}</span>
                </button>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-400 hover:text-emerald-400 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-400/70" />
                  <span>{t('footer.link_eco_points', { defaultValue: 'Eco-points & levels' })}</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSectionNavigation('faq-section')}
                  className="text-gray-400 hover:text-emerald-400 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-400/70" />
                  <span>{t('footer.link_faqs', { defaultValue: 'Frequently Asked Questions' })}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(true)}
                  className="text-emerald-400/90 hover:text-emerald-300 hover:translate-x-1 inline-flex items-center gap-1.5 transition-all font-semibold focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded cursor-pointer"
                >
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>{t('footer.link_privacy_note', { defaultValue: 'Privacy & data guarantee' })}</span>
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Column 3: Quick Tips + Did You Know Card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span>{t('footer.col_tips', { defaultValue: 'Quick Eco-Tip' })}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setTipIndex((prev) => (prev + 1) % ROTATING_TIPS.length)}
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {t('footer.next_tip', { defaultValue: 'Next →' })}
                </button>
              </div>

              {/* Rotating tip body */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 mb-4 text-xs leading-relaxed">
                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  <span>{t(currentTip.tagKey, { defaultValue: currentTip.defaultTag })}</span>
                  <span className="text-gray-500 font-mono">#{tipIndex + 1}/{ROTATING_TIPS.length}</span>
                </div>
                <p className="text-gray-300">
                  “{t(currentTip.tipKey, { defaultValue: currentTip.defaultTip })}”
                </p>
              </div>
            </div>

            {/* Did You Know? Mini Fact Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/20 to-transparent border border-blue-500/20 text-xs">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] mb-1">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{t('footer.did_you_know', { defaultValue: 'Did You Know?' })}</span>
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                {t(currentFact.factKey, { defaultValue: currentFact.defaultFact })}
              </p>
            </div>
          </motion.div>

          {/* Column 4: Quick Actions & Eco Utilities */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="flex flex-col justify-between"
          >
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3.5 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>{t('footer.quickActions', { defaultValue: 'Quick Actions' })}</span>
              </h4>

              <div className="space-y-2 mb-3">
                {/* 1. Primary Button: Scan Waste Item */}
                <Link
                  to="/scan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-glow-xs flex items-center justify-between transition-all group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span className="flex items-center gap-2">
                    <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{t('footer.scanNow', { defaultValue: 'Scan Waste Item' })}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* 2. Secondary Button: Find Recycling Centers */}
                <Link
                  to="/centers"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-gray-200 font-semibold text-xs flex items-center justify-between transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 group-hover:-translate-y-0.5 transition-transform" />
                    <span>{t('footer.findCenters', { defaultValue: 'Find Recycling Centers' })}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* 3. Link Row: My Eco-Points */}
                <Link
                  to="/dashboard"
                  className="w-full px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-300 font-semibold text-xs flex items-center justify-between transition-all group focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
                >
                  <span className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('footer.myPoints', { defaultValue: 'My Eco-Points' })}</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-400/80 group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </Link>
              </div>

              {/* 4. Hazardous Waste Alert Mini Card */}
              <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/25 mb-3 text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] mb-1">
                  <TriangleAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('footer.hazardTitle', { defaultValue: 'Hazardous Waste Alert' })}</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">
                  {t('footer.hazardDesc', { defaultValue: 'Batteries, bulbs, expired medicines aur e-waste ko kabhi normal dustbin mein mat daalo. Nearest authorised center dhundo.' })}
                </p>
              </div>

              {/* 5. Feedback Button */}
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="w-full px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{t('footer.give_feedback', { defaultValue: 'Give feedback' })}</span>
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>

            {/* 6. Built by Sneha Rai & Social Profiles (GitHub & LinkedIn) */}
            <div className="pt-2.5 mt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span className="text-[11px] font-medium">{t('footer.builtBy', { defaultValue: 'Built by Sneha Rai' })}</span>
              <div className="flex items-center gap-1.5">
                {/* GitHub */}
                <a
                  href="https://github.com/raisneha-2004"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Sneha Rai on GitHub"
                  title="Sneha Rai on GitHub"
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-gray-300 hover:text-emerald-300 flex items-center justify-center transition-all hover:scale-105 shadow-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com/in/sneha-rai-a7157231a"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Sneha Rai on LinkedIn"
                  title="Sneha Rai on LinkedIn"
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/40 text-gray-300 hover:text-blue-300 flex items-center justify-center transition-all hover:scale-105 shadow-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── BOTTOM BAR (No repeated nav links) ── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="text-center sm:text-left">
            © {CURRENT_YEAR} WasteWise AI. {t('footer.made_with_love', { defaultValue: 'Made with 💚 for a cleaner planet.' })}
          </p>

          <div className="flex items-center gap-4">
            {/* Active Language Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[11px]">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>{LANGUAGE_NAMES[language] || language}</span>
            </div>

            {/* Back to top button */}
            <motion.button
              whileHover={shouldReduceMotion ? {} : { y: -2 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-bold text-[11px] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>{t('footer.back_to_top', { defaultValue: 'Back to top' })}</span>
            </motion.button>
          </div>
        </div>
      </footer>

      {/* ── PRIVACY & DATA GUARANTEE MODAL ── */}
      <AnimatePresence>
        {isPrivacyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.25, ease: EASINGS.easeOut }}
              className="relative w-full max-w-lg glass-panel bg-[#0b101b]/95 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {t('footer.privacy_title', { defaultValue: 'Privacy & Data Note' })}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {t('footer.privacy_sub', { defaultValue: 'Zero server image storage guarantee' })}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">{t('footer.privacy_rule1_title', { defaultValue: 'No Image Storage:' })}</strong>{' '}
                    {t('footer.privacy_rule1_desc', { defaultValue: 'Aapki photos server par permanently store nahi hoti. Gemini Vision analysis ke baad image memory se turant clear ho jaati hai.' })}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">{t('footer.privacy_rule2_title', { defaultValue: 'Local Device Only:' })}</strong>{' '}
                    {t('footer.privacy_rule2_desc', { defaultValue: 'Aapka scan history aur Eco-Points sirf aapke browser ke LocalStorage mein rehte hain.' })}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">{t('footer.privacy_rule3_title', { defaultValue: 'No Accounts Needed:' })}</strong>{' '}
                    {t('footer.privacy_rule3_desc', { defaultValue: 'Koi signup ya personal details required nahi hain.' })}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  {t('footer.got_it', { defaultValue: 'Got it' })}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── USER FEEDBACK MODAL ── */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.25, ease: EASINGS.easeOut }}
              className="relative w-full max-w-md glass-panel bg-[#0b101b]/95 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {t('footer.feedback_title', { defaultValue: 'Give Feedback' })}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {t('footer.feedback_sub', { defaultValue: 'Help us improve WasteWise AI' })}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {/* Rating stars */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    {t('footer.rating_label', { defaultValue: 'Your Experience Rating' })}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text area */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    {t('footer.feedback_message_label', { defaultValue: 'Suggestions or Thoughts' })}
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={t('footer.feedback_placeholder', {
                      defaultValue: 'What features would you love to see next? How was your scanning experience?'
                    })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-gray-100 text-xs focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {t('common.cancel', { defaultValue: 'Cancel' })}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-gray-950 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingFeedback ? t('footer.sending', { defaultValue: 'Sending...' }) : t('footer.submit_feedback', { defaultValue: 'Submit Feedback' })}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
