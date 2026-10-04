import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Camera,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Leaf,
  Award,
  Flame,
  Package,
  FileText,
  Wine,
  Cylinder,
  Cpu,
  TriangleAlert,
  Shirt,
  Trash2,
  ChevronDown,
  RefreshCw,
  Mic,
  Recycle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/useApp.js';
import { wasteApi } from '../services/api.js';
import StatCard from '../components/StatCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { EASINGS } from '../utils/animations.js';

const CURRENT_YEAR = new Date().getFullYear();

// Category Configuration with custom color identities, icons and theme metadata
const CATEGORY_CONFIG = {
  Plastic: {
    color: '#3B82F6',
    rgb: '59, 130, 246',
    icon: Package,
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    pillBg: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    glowColor: 'rgba(59, 130, 246, 0.15)',
    binName: 'Blue Bin'
  },
  Paper: {
    color: '#38BDF8',
    rgb: '56, 189, 248',
    icon: FileText,
    iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    pillBg: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    glowColor: 'rgba(56, 189, 248, 0.15)',
    binName: 'Blue Bin'
  },
  Glass: {
    color: '#14B8A6',
    rgb: '20, 184, 166',
    icon: Wine,
    iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/25',
    pillBg: 'bg-teal-500/10 text-teal-400 border-teal-500/25',
    glowColor: 'rgba(20, 184, 166, 0.15)',
    binName: 'Teal Bin'
  },
  Metal: {
    color: '#94A3B8',
    rgb: '148, 163, 184',
    icon: Cylinder,
    iconBg: 'bg-slate-400/10 text-slate-300 border-slate-400/25',
    pillBg: 'bg-slate-400/10 text-slate-300 border-slate-400/25',
    glowColor: 'rgba(148, 163, 184, 0.15)',
    binName: 'Grey Bin'
  },
  Organic: {
    color: '#10B981',
    rgb: '16, 185, 129',
    icon: Leaf,
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    pillBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    glowColor: 'rgba(16, 185, 129, 0.18)',
    binName: 'Green Bin'
  },
  'E-waste': {
    color: '#F59E0B',
    rgb: '245, 158, 11',
    icon: Cpu,
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    pillBg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    glowColor: 'rgba(245, 158, 11, 0.16)',
    binName: 'Orange Bin'
  },
  Hazardous: {
    color: '#EF4444',
    rgb: '239, 68, 68',
    icon: TriangleAlert,
    iconBg: 'bg-red-500/10 text-red-400 border-red-500/25',
    pillBg: 'bg-red-500/10 text-red-400 border-red-500/25',
    glowColor: 'rgba(239, 68, 68, 0.18)',
    binName: 'Red Bin',
    isHazardous: true
  },
  Textile: {
    color: '#A855F7',
    rgb: '168, 85, 247',
    icon: Shirt,
    iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    pillBg: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    glowColor: 'rgba(168, 85, 247, 0.16)',
    binName: 'Purple Bin'
  },
  Other: {
    color: '#6B7280',
    rgb: '107, 114, 128',
    icon: Trash2,
    iconBg: 'bg-gray-500/10 text-gray-400 border-gray-500/25',
    pillBg: 'bg-gray-500/10 text-gray-400 border-gray-500/25',
    glowColor: 'rgba(107, 114, 128, 0.12)',
    binName: 'Black Bin',
    isDim: true
  }
};

const DEFAULT_CATEGORIES = [
  { id: 'Plastic', name: 'Plastic', displayName: 'Plastic Waste', binColor: 'Blue', hexColor: '#3B82F6', recyclable: true, co2SavedPerKg: 1.5, description: 'PET bottles, HDPE jugs, containers, and packaging material.' },
  { id: 'Paper', name: 'Paper', displayName: 'Paper & Cardboard', binColor: 'Blue', hexColor: '#38BDF8', recyclable: true, co2SavedPerKg: 1.1, description: 'Newspapers, corrugated boxes, office stationery, and cartons.' },
  { id: 'Glass', name: 'Glass', displayName: 'Glass Items', binColor: 'Teal', hexColor: '#14B8A6', recyclable: true, co2SavedPerKg: 0.3, description: 'Glass jars, beverage bottles, cosmetic containers, and cullet.' },
  { id: 'Metal', name: 'Metal', displayName: 'Metals & Cans', binColor: 'Grey', hexColor: '#94A3B8', recyclable: true, co2SavedPerKg: 4.2, description: 'Aluminum beverage cans, tin food cans, foil trays, and scrap metals.' },
  { id: 'Organic', name: 'Organic', displayName: 'Organic & Biodegradable', binColor: 'Green', hexColor: '#10B981', compostable: true, co2SavedPerKg: 0.5, description: 'Fruit & vegetable peels, leftover food, tea leaves, and garden trimmings.' },
  { id: 'E-waste', name: 'E-waste', displayName: 'Electronic Waste', binColor: 'Orange', hexColor: '#F59E0B', recyclable: true, co2SavedPerKg: 3.8, description: 'Mobile phones, chargers, laptops, wires, PCB boards, and electronics.' },
  { id: 'Hazardous', name: 'Hazardous', displayName: 'Hazardous & Sanitary', binColor: 'Red', hexColor: '#EF4444', recyclable: false, co2SavedPerKg: 0.2, description: 'Batteries, paint cans, pesticides, expired medicines, and sanitaries.' },
  { id: 'Textile', name: 'Textile', displayName: 'Textile & Clothing', binColor: 'Purple', hexColor: '#A855F7', recyclable: true, co2SavedPerKg: 3.0, description: 'Discarded garments, bed linens, torn fabrics, and footwear.' },
  { id: 'Other', name: 'Other', displayName: 'Inert & General Waste', binColor: 'Black', hexColor: '#6B7280', recyclable: false, co2SavedPerKg: 0.0, description: 'Multi-layer laminate packets, broken ceramics, dust, and non-recyclables.' }
];

// 10 Real, Accurate Daily Eco Tips
const ECO_TIPS = [
  {
    tip: 'Rinse plastic containers & bottles before disposal — leftover residues can spoil an entire batch of recyclable polymers.',
    tag: 'Plastic Hygiene'
  },
  {
    tip: 'Greasy pizza boxes belong in compost or dry waste, not paper recycling, as oil prevents paper fiber repulping.',
    tag: 'Paper Recycling'
  },
  {
    tip: 'Never throw lithium-ion batteries into normal bins. Store them dry and drop them at certified E-waste collection points.',
    tag: 'Hazardous Safety'
  },
  {
    tip: 'Keep bottle caps screwed onto plastic bottles before recycling. Modern optical sorters separate caps from PET automatically.',
    tag: 'Smart Sorting'
  },
  {
    tip: 'Kitchen organic waste (peels, tea grounds, food scraps) produces nutrient-rich organic compost in just 3 to 4 weeks.',
    tag: 'Wet Waste'
  },
  {
    tip: 'Shredded paper fibers are too short for normal paper recycling. Add them directly to your home compost bin instead.',
    tag: 'Composting'
  },
  {
    tip: 'Clean and crush aluminum beverage cans — aluminum can be recycled infinitely with 95% less energy than raw bauxite.',
    tag: 'Metal Conservation'
  },
  {
    tip: 'Factory reset and wipe personal data from obsolete electronics before handing them over to certified municipal recyclers.',
    tag: 'E-Waste Prep'
  },
  {
    tip: 'Fluorescent tubes and CFL bulbs contain trace mercury vapors. Wrap them safely and dispose of them strictly as Hazardous Waste.',
    tag: 'Hazardous Care'
  },
  {
    tip: 'Donate clean, unsoiled garments to textile drives or upcycle old fabrics into reusable cleaning rags before discarding.',
    tag: 'Textile Upcycling'
  }
];

// FAQ items are now defined inside the component via i18n (see Home() function body)

// Blur-to-sharp word reveal animation variant
const wordBlurReveal = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: 0.15 + i * 0.14,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

export default function Home() {
  const { history, ecoPoints, streak, levelInfo, language } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeStepHighlight, setActiveStepHighlight] = useState(0);
  const [isStepHovered, setIsStepHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Eco Tip rotation based on current day of month (pure lazy initialization)
  const [currentTipIndex, setCurrentTipIndex] = useState(() => (new Date().getDate() % ECO_TIPS.length));

  // FAQ Accordion State (only one open at a time)
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // FAQ items built from i18n translations
  const FAQ_ITEMS = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
    { question: t('faq.q6'), answer: t('faq.a6') },
  ];

  // Compute live cumulative CO2 saved from history
  const totalCo2Saved = history.reduce((acc, curr) => {
    return acc + (curr.impact?.co2SavedKg || 0.05);
  }, 0);

  // Last 7 days scan counts for sparkline
  const last7DaysData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    (history || []).forEach((item) => {
      const itemDate = new Date(item.timestamp || item.date || Date.now());
      const diffDays = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        counts[6 - diffDays] += 1;
      }
    });
    return counts;
  }, [history]);

  // Trees equivalent (approx 21.77 kg CO2 / tree / year)
  const treesEquivalent = useMemo(() => {
    const trees = totalCo2Saved / 21.77;
    const rounded = Math.round(trees * 10) / 10;
    const displayNum = rounded >= 0.1 ? rounded.toFixed(1) : '0.1';
    return t('stats.trees_offset', { count: displayNum, defaultValue: `~${displayNum} trees offset` });
  }, [totalCo2Saved, t]);

  // Level progress percentage and subtitle
  const levelProgress = levelInfo?.progress || Math.min(100, Math.round(((ecoPoints % 100) / 100) * 100));
  const levelLabel = levelInfo?.nextPoints
    ? t('stats.pts_to_next', { count: levelInfo.nextPoints - ecoPoints, defaultValue: `${levelInfo.nextPoints - ecoPoints} pts to next rank` })
    : (levelInfo?.title || 'Eco Champion');

  // Streak weekday active dots (Mon-Sun)
  const streakDots = useMemo(() => {
    const dots = [false, false, false, false, false, false, false];
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const activeDays = new Set();
    (history || []).forEach((item) => {
      const d = new Date(item.timestamp || item.date || Date.now());
      const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        activeDays.add((d.getDay() + 6) % 7);
      }
    });
    for (let i = 0; i < 7; i++) {
      if (activeDays.has(i) || (streak > 0 && i <= currentDayOfWeek && i >= currentDayOfWeek - (streak - 1))) {
        dots[i] = true;
      }
    }
    return dots;
  }, [history, streak]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await wasteApi.getCategories();
        if (res?.data?.categories?.length > 0) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.warn('Failed to load categories legend from backend, using default fallback:', err.message);
      }
    }
    fetchCategories();
  }, []);

  // Auto-highlight step sequence every 2.2s (~6s loop), pausing on hover
  useEffect(() => {
    if (shouldReduceMotion || isStepHovered) return;
    const timer = setInterval(() => {
      setActiveStepHighlight((prev) => (prev + 1) % 3);
    }, 2200);
    return () => clearInterval(timer);
  }, [shouldReduceMotion, isStepHovered]);

  // Mouse parallax handler for desktop
  const handleHeroMouseMove = (e) => {
    if (shouldReduceMotion || window.innerWidth < 768) return;
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % ECO_TIPS.length);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const howItWorks = useMemo(() => [
    {
      step: '01',
      title: t('how_it_works.step1_title', { defaultValue: 'Snap & Upload' }),
      description: t('how_it_works.step1_desc', { defaultValue: 'Take a quick photo of any discarded item using your phone or upload an image from your files.' }),
      icon: Camera,
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      activeBorder: 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)]',
      hoverBorder: 'hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
      glow: 'rgba(16, 185, 129, 0.25)',
      to: '/scan',
      state: { highlightUpload: true },
      ariaLabel: t('home.step1_aria', { defaultValue: 'Go to Scan page - Snap and Upload waste photo' }),
      isReady: true
    },
    {
      step: '02',
      title: t('how_it_works.step2_title', { defaultValue: 'Vision AI Detection' }),
      description: t('how_it_works.step2_desc', { defaultValue: 'Our multimodal AI instantly identifies material, category, hazard warnings, and assigns the correct bin.' }),
      icon: Sparkles,
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      activeBorder: 'border-blue-500/60 shadow-[0_0_25px_rgba(59,130,246,0.25)]',
      hoverBorder: 'hover:border-blue-500/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
      glow: 'rgba(59, 130, 246, 0.25)',
      to: '/scan',
      state: { explainAi: true },
      ariaLabel: t('home.step2_aria', { defaultValue: 'Learn how Vision AI works and try a scan' }),
      isReady: true
    },
    {
      step: '03',
      title: t('how_it_works.step3_title', { defaultValue: 'Sort, Earn & Track' }),
      description: t('how_it_works.step3_desc', { defaultValue: 'Get step-by-step segregation guidance, unlock Eco-Points, and navigate to verified recycling centers nearby.' }),
      icon: ShieldCheck,
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      activeBorder: 'border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]',
      hoverBorder: 'hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
      glow: 'rgba(245, 158, 11, 0.25)',
      to: '/dashboard',
      secondaryAction: {
        to: '/centers',
        label: t('home.find_centers', { defaultValue: 'Find Centers' })
      },
      ariaLabel: t('home.step3_aria', { defaultValue: 'Go to Eco Dashboard - Sort, Earn and Track' }),
      isReady: true
    }
  ], [t]);

  const whyWasteWiseFeatures = [
    {
      title: t('home.feat1_title', { defaultValue: 'Multimodal Vision AI' }),
      description: t('home.feat1_desc', { defaultValue: 'Identifies complex discarded packaging, layered composites, and hazardous flags in milliseconds.' }),
      icon: Sparkles,
      color: '#10B981',
      badge: t('home.feat1_badge', { defaultValue: 'Real-time Detection' }),
      bgClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]'
    },
    {
      title: t('home.feat2_title', { defaultValue: 'Eco-Points & Habit Streaks' }),
      description: t('home.feat2_desc', { defaultValue: 'Earn points for verified segregation, climb municipal eco-tiers, and maintain daily habit streaks.' }),
      icon: Award,
      color: '#F59E0B',
      badge: t('home.feat2_badge', { defaultValue: 'Gamified Progress' }),
      bgClass: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]'
    },
    {
      title: t('home.feat3_title', { defaultValue: 'Nearby Recycling Centers' }),
      description: t('home.feat3_desc', { defaultValue: 'Instant geolocation locator for verified municipal drop-offs, kabadiwalas, and E-waste facilities.' }),
      icon: MapPin,
      color: '#14B8A6',
      badge: t('home.feat3_badge', { defaultValue: 'Live Map Routing' }),
      bgClass: 'bg-teal-500/10 text-teal-400 border-teal-500/25',
      glow: 'hover:shadow-[0_0_30px_rgba(20,184,166,0.2)]'
    },
    {
      title: t('home.feat4_title', { defaultValue: 'Voice AI & Multi-Language' }),
      description: t('home.feat4_desc', { defaultValue: 'Hands-free voice recognition with native support in English, Hindi (हिंदी), Hinglish, and more.' }),
      icon: Mic,
      color: '#A855F7',
      badge: t('home.feat4_badge', { defaultValue: 'Hands-Free Access' }),
      bgClass: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      glow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]'
    }
  ];

  return (
    <div className="space-y-20 pb-28 md:pb-36 relative overflow-hidden">
      {/* 1. AI-Themed Hero Section */}
      <section
        onMouseMove={handleHeroMouseMove}
        className="relative pt-8 md:pt-16 pb-12 overflow-hidden"
      >
        {/* Faint Dotted Grid Pattern Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-0" />

        {/* Ambient Drifting Emerald & Teal Gradient Blobs with Subtle Mouse Parallax */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              style={{
                transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 24}px, 0)`
              }}
              animate={{
                x: [0, 25, -20, 0],
                y: [0, -25, 15, 0]
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="hidden md:block absolute top-10 left-10 w-96 h-96 bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none -z-0"
            />
            <motion.div
              style={{
                transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, 0)`
              }}
              animate={{
                x: [0, -30, 25, 0],
                y: [0, 30, -20, 0]
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="hidden md:block absolute top-1/4 right-8 w-[450px] h-[320px] bg-teal-500/15 blur-[140px] rounded-full pointer-events-none -z-0"
            />
            <motion.div
              style={{
                transform: `translate3d(${mousePos.x * 16}px, ${mousePos.y * 16}px, 0)`
              }}
              animate={{
                x: [0, 20, -15, 0],
                y: [0, 15, -25, 0]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="hidden lg:block absolute bottom-4 left-1/3 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-0"
            />
          </>
        )}

        <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
          {/* Badge: Fade In + Slide Down */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASINGS.easeOut }}
            className="inline-flex items-center justify-center text-center px-4 md:px-5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs md:text-sm font-semibold mb-6 shadow-glow-sm backdrop-blur-md max-w-full"
          >
            <span>{t('hero.badge', { defaultValue: 'Har item ka sahi bin, ek photo mein' })}</span>
          </motion.div>

          {/* Headline with Vision AI Scanning Line + Floating Detection Tags */}
          <div className="relative inline-block w-full">
            {/* Horizontal Glowing Vision AI Laser Scan Line */}
            {!shouldReduceMotion && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                <div className="absolute top-0 bottom-0 w-32 -skew-x-12 animate-ai-scan bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent">
                  <div className="w-[2px] h-full mx-auto bg-emerald-400 shadow-[0_0_18px_#34d399]" />
                </div>
              </div>
            )}

            {/* Floating Vision AI Detection Tags (Desktop Only) */}
            {!shouldReduceMotion && (
              <>
                {/* Tag 1: Plastic 98% - Top Left */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.4, 0.9, 0.4],
                    y: [0, -6, 0]
                  }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  style={{
                    transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`
                  }}
                  className="hidden md:flex absolute -top-8 -left-4 lg:-left-12 items-center gap-1.5 px-2.5 py-1 rounded-md bg-dark-bg/85 border border-blue-500/40 text-blue-400 text-[10px] font-mono tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.25)] pointer-events-none z-20 backdrop-blur-md"
                >
                  <span className="w-1.5 h-1.5 rounded-sm bg-blue-400 animate-ping" />
                  <span>[+] Plastic: 98.4%</span>
                </motion.div>

                {/* Tag 2: Paper 95% - Top Right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.35, 0.85, 0.35],
                    y: [0, 8, 0]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                  style={{
                    transform: `translate3d(${mousePos.x * -10}px, ${mousePos.y * -10}px, 0)`
                  }}
                  className="hidden md:flex absolute -top-6 -right-4 lg:-right-10 items-center gap-1.5 px-2.5 py-1 rounded-md bg-dark-bg/85 border border-amber-500/40 text-amber-400 text-[10px] font-mono tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.25)] pointer-events-none z-20 backdrop-blur-md"
                >
                  <span className="w-1.5 h-1.5 rounded-sm bg-amber-400" />
                  <span>[+] Paper: 95.2%</span>
                </motion.div>

                {/* Tag 3: E-Waste 92% - Bottom Left */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.35, 0.8, 0.35],
                    y: [0, 6, 0]
                  }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 2.1 }}
                  style={{
                    transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 8}px, 0)`
                  }}
                  className="hidden md:flex absolute -bottom-8 left-2 lg:left-8 items-center gap-1.5 px-2.5 py-1 rounded-md bg-dark-bg/85 border border-purple-500/40 text-purple-400 text-[10px] font-mono tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.25)] pointer-events-none z-20 backdrop-blur-md"
                >
                  <span className="w-1.5 h-1.5 rounded-sm bg-purple-400" />
                  <span>[+] E-waste: 92.1%</span>
                </motion.div>

                {/* Tag 4: Organic 99% - Bottom Right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.4, 0.95, 0.4],
                    y: [0, -8, 0]
                  }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 2.8 }}
                  style={{
                    transform: `translate3d(${mousePos.x * -14}px, ${mousePos.y * -14}px, 0)`
                  }}
                  className="hidden md:flex absolute -bottom-6 right-2 lg:right-6 items-center gap-1.5 px-2.5 py-1 rounded-md bg-dark-bg/85 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.25)] pointer-events-none z-20 backdrop-blur-md"
                >
                  <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400 animate-pulse" />
                  <span>[+] Organic: 99.1%</span>
                </motion.div>
              </>
            )}

            {/* Staggered Word Reveal Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 flex flex-wrap justify-center gap-x-3.5 gap-y-1">
              <motion.span
                custom={0}
                variants={wordBlurReveal}
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="visible"
                className="inline-block"
              >
                {t('hero.title_snap', { defaultValue: 'Snap.' })}
              </motion.span>
              <motion.span
                custom={1}
                variants={wordBlurReveal}
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="visible"
                className="inline-block"
              >
                {t('hero.title_sort', { defaultValue: 'Sort.' })}
              </motion.span>
              <motion.span
                custom={2}
                variants={wordBlurReveal}
                initial={shouldReduceMotion ? false : 'hidden'}
                animate="visible"
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 animate-text-shimmer"
              >
                {t('hero.title_save', { defaultValue: 'Save the planet.' })}
              </motion.span>
            </h1>
          </div>

          {/* Subtext with Smooth Staggered Reveal */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4, ease: EASINGS.easeOut }}
            className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t('hero.subtitle', { defaultValue: 'Confused about which bin that cup or cable belongs to? Let our Vision AI identify materials in seconds, avoid landfill contamination, and earn Eco-Points.' })}
          </motion.p>

          {/* CTA Action Buttons with Glow, Shimmer Sweep & Micro-Interactions */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.55, ease: EASINGS.easeOut }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Scan Button with Shimmer Sweep & Press Scale */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/scan"
                className="relative w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-eco-600 via-emerald-500 to-teal-500 hover:from-eco-500 hover:to-emerald-400 text-white font-bold text-base md:text-lg animate-button-glow flex items-center justify-center gap-3 transition-all duration-200 group shadow-glow-lg overflow-hidden"
              >
                {!shouldReduceMotion && (
                  <span className="absolute top-0 bottom-0 w-24 -skew-x-12 animate-button-shine bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                )}

                <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
                <span className="relative z-10">{t('hero.cta_scan', { defaultValue: 'Scan Waste Item Now' })}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200 relative z-10" />
              </Link>
            </motion.div>

            {/* Find Centers Button with Icon Bounce */}
            <motion.div
              whileHover={shouldReduceMotion ? {} : { y: -3, scale: 1.02 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/centers"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 border border-white/10 text-gray-200 font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-200 group backdrop-blur-md shadow-sm"
              >
                <MapPin className="w-5 h-5 text-emerald-400 group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-200" />
                <span>{t('hero.cta_centers', { defaultValue: 'Find Centers Near Me' })}</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Micro-Interaction: Animated Scroll Down Indicator */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-14 hidden sm:flex flex-col items-center justify-center gap-2 text-gray-500 pointer-events-none"
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400/80">
              {t('home.scroll_explore', { defaultValue: 'Scroll to Explore' })}
            </span>
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, 5, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1 backdrop-blur-sm"
            >
              <div className="w-1 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Live Eco Stats Bar (From LocalStorage) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
          <StatCard
            label={t('stats.total_scans', { defaultValue: 'Total Scans' })}
            value={history.length}
            subtext={t('stats.total_scans_sub', { defaultValue: 'Items segregated' })}
            icon={TrendingUp}
            color="blue"
            to={history.length > 0 ? '/history' : '/scan'}
            ariaLabel={t('stats.view_scans_aria', { defaultValue: 'View scan history' })}
            indicatorType="sparkline"
            sparklineData={last7DaysData}
            isEmpty={history.length === 0}
            emptyCta={t('stats.first_scan_cta', { defaultValue: 'Scan your first item' })}
            viewLabel={t('stats.view', { defaultValue: 'View' })}
            language={language}
            delay={0}
          />
          <StatCard
            label={t('stats.co2_diverted', { defaultValue: 'CO2 Diverted' })}
            value={Math.round(totalCo2Saved * 100) / 100}
            unit={t('stats.unit_kg', { defaultValue: 'kg' })}
            subtext={t('stats.co2_sub', { defaultValue: 'Emissions saved' })}
            icon={Leaf}
            color="eco"
            to={totalCo2Saved > 0 ? '/dashboard#co2' : '/scan'}
            ariaLabel={t('stats.view_co2_aria', { defaultValue: 'View CO2 emissions chart' })}
            indicatorType="co2_trees"
            treesEquivalent={treesEquivalent}
            isEmpty={totalCo2Saved === 0 && history.length === 0}
            emptyCta={t('stats.first_scan_cta', { defaultValue: 'Scan your first item' })}
            viewLabel={t('stats.view', { defaultValue: 'View' })}
            language={language}
            delay={0.08}
          />
          <StatCard
            label={t('stats.eco_points', { defaultValue: 'Eco-Points' })}
            value={ecoPoints}
            unit={t('stats.unit_pts', { defaultValue: 'pts' })}
            subtext={t('stats.eco_points_sub', { defaultValue: 'Reward points earned' })}
            icon={Award}
            color="amber"
            to={ecoPoints > 0 ? '/dashboard#levels' : '/scan'}
            ariaLabel={t('stats.view_points_aria', { defaultValue: 'View Eco-Points level progress' })}
            indicatorType="level_bar"
            levelProgress={levelProgress}
            levelLabel={levelLabel}
            isEmpty={ecoPoints === 0}
            emptyCta={t('stats.first_scan_cta', { defaultValue: 'Scan your first item' })}
            viewLabel={t('stats.view', { defaultValue: 'View' })}
            language={language}
            delay={0.16}
          />
          <StatCard
            label={t('stats.streak', { defaultValue: 'Active Streak' })}
            value={streak}
            unit={streak === 1 ? t('stats.unit_day', { defaultValue: 'Day' }) : t('stats.unit_days', { defaultValue: 'Days' })}
            subtext={t('stats.streak_sub', { defaultValue: 'Days in a row' })}
            icon={Flame}
            color="purple"
            to={streak > 0 ? '/dashboard#streak' : '/scan'}
            ariaLabel={t('stats.view_streak_aria', { defaultValue: 'View streak and badges' })}
            indicatorType="streak_dots"
            streakDots={streakDots}
            isEmpty={streak === 0}
            emptyCta={t('stats.first_scan_cta', { defaultValue: 'Scan your first item' })}
            viewLabel={t('stats.view', { defaultValue: 'View' })}
            language={language}
            delay={0.24}
          />
        </div>
      </section>

      {/* 3. "How WasteWise Works" Section with Traveling Dot Connector & Equal Heights */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 relative scroll-mt-24">
        {!shouldReduceMotion && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-emerald-500/[0.06] blur-[130px] rounded-full pointer-events-none -z-0" />
        )}

        <Reveal direction="up" className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ letterSpacing: '0.1em', opacity: 0 }}
            whileInView={{ letterSpacing: '0.22em', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASINGS.easeOut }}
            className="text-xs uppercase font-bold text-emerald-400 inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2 shadow-sm"
          >
            {t('how_it_works.heading_tag', { defaultValue: 'Zero Confusion' })}
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-1 tracking-tight">
            {t('how_it_works.title', { defaultValue: 'How WasteWise Works' })}
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-2.5 leading-relaxed">
            {t('how_it_works.subtitle', { defaultValue: 'Proper segregation made seamless in three frictionless steps.' })}
          </p>
        </Reveal>

        <div className="relative">
          {/* Animated Horizontal Connector Line (Desktop) with Traveling Glow Dot */}
          <div className="hidden md:block absolute top-[70px] left-20 right-20 h-[2px] pointer-events-none z-0">
            <div
              className={`w-full h-full rounded-full transition-all duration-500 ${
                isStepHovered
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.6)]'
                  : 'bg-gradient-to-r from-emerald-500/20 via-blue-500/25 to-amber-500/20'
              }`}
            />
            {!shouldReduceMotion && (
              <motion.div
                animate={{ left: ['0%', '100%'] }}
                transition={{ duration: isStepHovered ? 2.5 : 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399] -ml-1.5 transition-all duration-300 ${
                  isStepHovered ? 'w-4 h-4 shadow-[0_0_22px_#10b981]' : 'w-3 h-3'
                }`}
              />
            )}
          </div>

          <div
            onMouseEnter={() => setIsStepHovered(true)}
            onMouseLeave={() => setIsStepHovered(false)}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-stretch"
          >
            {howItWorks.map((item, index) => {
              const isAutoHighlighted = activeStepHighlight === index && !isStepHovered;

              return (
                <Link
                  key={item.step}
                  to={item.to}
                  state={item.state}
                  aria-label={item.ariaLabel}
                  className="flex flex-col h-full rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b101b] transition-shadow duration-200"
                >
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.12, ease: EASINGS.easeOut }}
                    whileHover={shouldReduceMotion ? {} : { y: -6 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    className={`glass-panel p-6 md:p-7 rounded-3xl border transition-all duration-300 relative group flex flex-col justify-between h-full shadow-lg overflow-hidden cursor-pointer ${
                      isAutoHighlighted
                        ? item.activeBorder
                        : `border-white/10 ${item.hoverBorder} hover:bg-white/[0.07]`
                    }`}
                  >
                    <div
                      className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20 group-hover:opacity-50 transition-opacity duration-300"
                      style={{ backgroundColor: item.glow }}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-6">
                        {index === 0 ? (
                          <div className={`relative p-3.5 rounded-2xl border ${item.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm overflow-hidden`}>
                            {!shouldReduceMotion && (
                              <motion.div
                                animate={{ opacity: [0, 0.7, 0], scale: [0.8, 1.4, 1.6] }}
                                transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 0.5 }}
                                className="absolute inset-0 rounded-2xl bg-emerald-400/25 pointer-events-none"
                              />
                            )}
                            <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                          </div>
                        ) : index === 1 ? (
                          <div className={`relative p-3.5 rounded-2xl border ${item.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm overflow-hidden`}>
                            {!shouldReduceMotion && (
                              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                <div className="w-full h-[2px] bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-laser" />
                              </div>
                            )}
                            <motion.div
                              animate={
                                shouldReduceMotion
                                  ? {}
                                  : { rotate: [0, 15, -15, 0], scale: [1, 1.12, 1] }
                              }
                              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                              <Sparkles className="w-6 h-6" />
                            </motion.div>
                          </div>
                        ) : (
                          <div className={`relative p-3.5 rounded-2xl border ${item.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm overflow-hidden`}>
                            <motion.div
                              animate={
                                shouldReduceMotion
                                  ? {}
                                  : { scale: [1, 1.08, 1] }
                              }
                              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                              <ShieldCheck className="w-6 h-6 text-amber-400" />
                            </motion.div>
                          </div>
                        )}

                        <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white/40 via-emerald-400/30 to-teal-300/10 group-hover:from-white/90 group-hover:via-emerald-400/80 group-hover:to-teal-300/60 opacity-60 group-hover:opacity-100 transition-all duration-300">
                          {item.step}
                        </span>
                      </div>

                      <h3 className="text-lg md:text-xl font-bold text-white mb-2.5 tracking-tight group-hover:text-emerald-300 transition-colors duration-200">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span>
                        {t('home.phase_label', { defaultValue: 'Phase' })} {item.step}
                      </span>
                      {item.secondaryAction ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(item.secondaryAction.to);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all hover:scale-105"
                            title={item.secondaryAction.label}
                          >
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{item.secondaryAction.label}</span>
                          </button>
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold group-hover:translate-x-1.5 transition-transform duration-200">
                            <span>{item.isReady ? t('home.step_ready', { defaultValue: 'Ready' }) : t('home.step_coming_soon', { defaultValue: 'Coming Soon' })}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold group-hover:translate-x-1.5 transition-transform duration-200">
                          <span>{item.isReady ? t('home.step_ready', { defaultValue: 'Ready' }) : t('home.step_coming_soon', { defaultValue: 'Coming Soon' })}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Section: Waste Categories Preview with Auto-scrolling Marquee */}
      <section id="waste-categories" className="max-w-7xl mx-auto px-4 relative scroll-mt-24">
        <Reveal direction="up" className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 shadow-glow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('home.know_bins', { defaultValue: 'Know Your Bins' })}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {t('home.categories_title', { defaultValue: '9 Categories, One Smart Scan' })}
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-2">
            {t('home.categories_sub', { defaultValue: 'Instant material detection mapped to standard Indian municipal color codes.' })}
          </p>
        </Reveal>

        {/* Marquee Track Container */}
        <div className="relative overflow-hidden py-3">
          {/* Edge Fade Masks for desktop */}
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0b1114] to-transparent z-10 pointer-events-none" />
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0b1114] to-transparent z-10 pointer-events-none" />

          {/* Marquee Content */}
          <div className="flex overflow-x-auto no-scrollbar md:overflow-visible gap-4 pb-4 md:pb-0 scroll-smooth">
            <div className="animate-marquee flex gap-4 items-center">
              {/* Render two sets of chips for seamless infinite loop on desktop */}
              {[...categories, ...categories].map((cat, idx) => {
                const meta = CATEGORY_CONFIG[cat.id] || CATEGORY_CONFIG.Other;
                const Icon = meta.icon;
                const localizedCategoryName = t(`category_names.${cat.name}`, { defaultValue: cat.name });
                const localizedBinName = t(`bin_names.${cat.binColor || meta.binName}`, { defaultValue: meta.binName });

                return (
                  <motion.div
                    key={`${cat.id}-${idx}`}
                    whileHover={shouldReduceMotion ? {} : { y: -3, scale: 1.03 }}
                    onClick={() => navigate('/scan')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate('/scan');
                      }
                    }}
                    className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group shadow-sm backdrop-blur-md"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${meta.iconBg}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="text-left pr-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {localizedCategoryName}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: meta.color }}
                          title={`${cat.binColor} Bin`}
                        />
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {localizedBinName}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Why WasteWise (Feature Cards) */}
      <section className="max-w-7xl mx-auto px-4 relative">
        <Reveal direction="up" className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold text-emerald-400 inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2 shadow-sm">
            {t('home.why_wastewise', { defaultValue: 'Why WasteWise' })}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {t('home.why_title', { defaultValue: 'AI Precision Meets Everyday Sustainability' })}
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-2">
            {t('home.why_sub', { defaultValue: 'Built for citizens, communities, and municipal zero-waste compliance.' })}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {whyWasteWiseFeatures.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1, ease: EASINGS.easeOut }}
                whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.01 }}
                className={`glass-panel p-6 md:p-7 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group ${feat.glow}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 group-hover:rotate-6 ${feat.bgClass}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>{t('home.engine_label', { defaultValue: 'WasteWise Engine' })}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>{t('home.explore', { defaultValue: 'Explore' })}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 6. Section: Eco Tip of the Day */}
      <section className="max-w-4xl mx-auto px-4">
        <Reveal direction="up">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/20 via-white/[0.02] to-transparent relative overflow-hidden shadow-glow-sm">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">{t('home.eco_tip_title', { defaultValue: 'Eco Tip of the Day' })}</h3>
                  <p className="text-xs text-gray-400">{t('home.eco_tip_sub', { defaultValue: 'Verified zero-waste & recycling habits' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  {t('home.tip_count', { current: currentTipIndex + 1, total: 10, defaultValue: `Tip #${currentTipIndex + 1} of 10` })}
                </span>
                <button
                  type="button"
                  onClick={handleNextTip}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 transition-all active:scale-95 group"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-180 transition-transform duration-300" />
                  <span>{t('home.next_tip', { defaultValue: 'Next Tip' })}</span>
                </button>
              </div>
            </div>

            {/* Tip Display with Smooth Fade Transition */}
            {(() => {
              const localizedTips = t('eco_tips_list', { returnObjects: true });
              const currentTip = Array.isArray(localizedTips) && localizedTips[currentTipIndex]
                ? localizedTips[currentTipIndex]
                : (ECO_TIPS[currentTipIndex % ECO_TIPS.length] || ECO_TIPS[0]);

              return (
                <div className="relative min-h-[68px] flex items-center z-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTipIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="w-full"
                    >
                      <p className="text-base md:text-lg text-gray-200 font-medium leading-relaxed">
                        “{currentTip.tip}”
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                          {t('home.tip_category', { defaultValue: 'Category:' })}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">
                          {currentTip.tag}
                        </span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              );
            })()}
          </div>
        </Reveal>
      </section>

      {/* 7. Section: FAQ Accordion */}
      <section id="faq-section" className="max-w-4xl mx-auto px-4 scroll-mt-24">
        <Reveal direction="up" className="text-center mb-10">
          <span className="text-xs uppercase font-bold text-emerald-400 inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2 shadow-sm">
            {t('faq.badge', { defaultValue: 'Your Questions Answered' })}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            {t('faq.title', { defaultValue: 'Frequently Asked Questions' })}
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {t('faq.subtitle', { defaultValue: 'Clear, straight answers on waste segregation and recycling.' })}
          </p>
        </Reveal>

        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;

            return (
              <motion.div
                key={item.question}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className="glass-panel rounded-2xl border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 md:p-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                  aria-expanded={isOpen}
                >
                  <span className="text-base md:text-lg font-bold text-white hover:text-emerald-300 transition-colors">
                    {item.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-shrink-0 p-1 rounded-full bg-white/5 text-gray-400"
                  >
                    <ChevronDown className="w-5 h-5 text-emerald-400" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 md:px-6 md:pb-6 pt-1 text-sm md:text-base text-gray-300 leading-relaxed border-t border-white/5">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 8. Section: Redesigned Bottom CTA Banner (Distinct from Hero) */}
      <section className="max-w-7xl mx-auto px-4">
        <Reveal direction="up">
          <div className="rounded-3xl bg-gradient-to-br from-[#0c191d] via-[#0f1f24] to-[#0d1c21] border border-emerald-500/30 p-8 md:p-12 lg:p-14 relative overflow-hidden shadow-glow-lg">
            {/* Soft Ambient Glow Blob */}
            {!shouldReduceMotion && (
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
            )}
            {!shouldReduceMotion && (
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500/15 blur-[120px] rounded-full pointer-events-none" />
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              {/* Left Side: Copy & Actions */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('home.instant_vision', { defaultValue: 'Instant Vision Analysis' })}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                  {t('home.bottom_title', { defaultValue: 'Your next scan could save a landfill.' })}
                </h2>
                
                <p className="text-base sm:text-lg text-gray-300 mb-8 font-medium">
                  {t('home.bottom_subtitle', { defaultValue: 'Takes 5 seconds. No signup needed.' })}
                </p>

                {/* Single Primary Action + Subtle Secondary Link */}
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-5">
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { y: -2 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    className="w-full sm:w-auto"
                  >
                    <Link
                      to="/scan"
                      className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200 group shadow-md hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                    >
                      <Camera className="w-5 h-5 text-gray-950 group-hover:scale-110 transition-transform duration-200" />
                      <span>{t('home.try_first_scan', { defaultValue: 'Try Your First Scan' })}</span>
                      <ArrowRight className="w-4 h-4 text-gray-950 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </motion.div>

                  <Link
                    to="/centers"
                    className="text-sm font-semibold text-gray-400 hover:text-emerald-400 inline-flex items-center gap-1.5 transition-colors group/link py-2"
                  >
                    <span>{t('home.or_explore_centers', { defaultValue: 'or explore recycling centers' })}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover/link:translate-x-1 group-hover/link:text-emerald-400 transition-all duration-200" />
                  </Link>
                </div>
              </div>

              {/* Right Side: Phone-Style Interactive Scanner Mockup (Desktop Only) */}
              <div className="hidden md:flex flex-shrink-0 items-center justify-center">
                <div className="relative w-64 h-72 rounded-[2rem] bg-gradient-to-b from-[#14232a] to-[#0b1317] border-2 border-white/10 p-3.5 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden">
                  {/* Speaker / Notch Pill */}
                  <div className="w-16 h-1 bg-white/20 rounded-full mx-auto" />

                  {/* Camera Viewfinder Area with Corner Brackets & Laser */}
                  <div className="relative flex-1 my-3 rounded-2xl bg-dark-bg/60 border border-white/5 flex items-center justify-center overflow-hidden">
                    {/* Corner Frame Brackets */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br" />

                    {/* Animated Scanning Laser Line */}
                    {!shouldReduceMotion && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="w-full h-[2px] bg-emerald-400 shadow-[0_0_12px_#34d399] animate-laser" />
                      </div>
                    )}

                    {/* Center Bottle Outline */}
                    <div className="w-16 h-24 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
                      <Package className="w-8 h-8 text-white/30" />
                    </div>

                    {/* Floating Detection Pill */}
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? {}
                          : { y: [0, -4, 0] }
                      }
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute bottom-4 left-3 right-3 px-2.5 py-1.5 rounded-xl bg-dark-bg/90 border border-blue-500/40 text-blue-400 text-[11px] font-mono flex items-center justify-between shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-md"
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        <span>{t('category_names.Plastic', { defaultValue: 'Plastic' })}</span>
                      </span>
                      <span className="text-gray-300 font-sans text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30">
                        {t('bin_names.blue_bin', { defaultValue: 'Blue Bin' })}
                      </span>
                    </motion.div>
                  </div>

                  {/* Bottom Camera Button Mockup */}
                  <div className="flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-emerald-400/60 p-0.5 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-emerald-400/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
