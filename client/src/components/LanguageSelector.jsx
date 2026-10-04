import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useApp } from '../context/useApp.js';
import { LANGUAGES } from '../constants/languages.js';

export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-full bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 border border-white/10 text-xs font-semibold text-gray-200 transition-all active:scale-95 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Change Language"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-medium">{compact ? currentLang.label : currentLang.nativeLabel}</span>
        <ChevronDown
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-400' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-52 max-h-72 overflow-y-auto rounded-2xl bg-[#0e1619] border border-white/15 shadow-2xl p-1.5 z-50 backdrop-blur-2xl focus:outline-none"
          >
            <div className="px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-400 border-b border-white/5 mb-1">
              Select Language
            </div>
            <div className="space-y-0.5">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-semibold">{lang.nativeLabel}</span>
                      <span className="text-[10px] text-gray-400">{lang.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
