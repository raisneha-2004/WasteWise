import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Recycle,
  Camera,
  MapPin,
  BarChart3,
  History,
  Award,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/useApp.js';
import LanguageSelector from './LanguageSelector.jsx';

export default function Navbar() {
  const location = useLocation();
  const { t } = useTranslation();
  const { ecoPoints, levelInfo } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isFirstPathRef = useRef(true);
  const shouldReduceMotion = useReducedMotion();

  // Scroll listener for sticky navbar background and shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isFirstPathRef.current) {
      isFirstPathRef.current = false;
      return;
    }
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: t('nav.home', 'Home'), icon: Home },
    { to: '/scan', label: t('nav.scan', 'Scan Waste'), icon: Camera },
    { to: '/centers', label: t('nav.centers', 'Recycling Centers'), icon: MapPin },
    { to: '/dashboard', label: t('nav.dashboard', 'Impact Dashboard'), icon: BarChart3 },
    { to: '/history', label: t('nav.history', 'History'), icon: History }
  ];

  return (
    <motion.header
      initial={shouldReduceMotion ? { opacity: 1 } : { y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-neutral-950/80 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
          : 'bg-neutral-950/40 backdrop-blur-xl'
      }`}
    >
      {/* Bottom Gradient Border Line (Transparent -> Emerald -> Transparent) */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between relative">
        {/* 1. Logo Block */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 rounded-2xl p-1 -ml-1 transition-all"
        >
          {/* Gradient Emerald Tile with Glowing Border */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-500/20 p-[1px] border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_22px_rgba(16,185,129,0.35)] transition-all duration-300">
            <div className="w-full h-full bg-[#0b1215]/80 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
              <Recycle className="w-5 h-5 text-emerald-400 group-hover:rotate-45 group-hover:scale-105 transition-transform duration-300" />
            </div>
          </div>

          <div>
            <span className="font-extrabold text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-emerald-300 tracking-tight block">
              WasteWise
            </span>
            <p className="text-[10px] text-gray-400 tracking-wider font-medium hidden sm:block -mt-0.5">
              Snap • Sort • Save
            </p>
          </div>
        </Link>

        {/* 2. Desktop Nav Links (Shared Glassmorphism Pill) */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/10 backdrop-blur-2xl shadow-inner relative"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;

            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Active Sliding Background Pill (layoutId) */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-[0_0_18px_rgba(16,185,129,0.35)] -z-0"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 420, damping: 32 }
                    }
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  {Icon && (
                    <Icon
                      className={`w-[18px] h-[18px] transition-transform duration-200 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-emerald-400 group-hover:-translate-y-0.5'
                      }`}
                    />
                  )}
                  <span>{link.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Right Status & Gamification Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Gamified Level Badge */}
          <motion.div
            key={levelInfo.level}
            initial={false}
            animate={shouldReduceMotion ? {} : { scale: [1, 1.15, 1] }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-full border text-xs font-bold transition-all shadow-sm ${levelInfo.bg} ${levelInfo.color} hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]`}
            title={`Level ${levelInfo.level}: ${levelInfo.title}`}
          >
            <span>{levelInfo.icon}</span>
            <span className="hidden md:inline">{levelInfo.title}</span>
            <span className="md:hidden">Lv.{levelInfo.level}</span>
          </motion.div>

          {/* Eco Points Pill */}
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.12)] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
            title="Total Eco-Points Earned"
          >
            <motion.div
              key={ecoPoints}
              initial={false}
              animate={shouldReduceMotion ? {} : { scale: [1, 1.22, 1] }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>{ecoPoints} pts</span>
            </motion.div>
          </Link>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 transition-colors"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Dropdown Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden border-t border-white/10 bg-neutral-950/95 backdrop-blur-2xl shadow-2xl px-4 py-3"
          >
            <div className="flex flex-col space-y-1 max-w-md mx-auto">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-glow-sm'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-emerald-400'
                        }`}
                      />
                    )}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
