import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative w-full ${maxWidth} glass-panel rounded-3xl p-6 shadow-2xl border border-white/10 z-10`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-gray-300 text-sm leading-relaxed mb-6">{children}</div>

            {footer && <div className="flex justify-end gap-3 pt-3 border-t border-white/5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
