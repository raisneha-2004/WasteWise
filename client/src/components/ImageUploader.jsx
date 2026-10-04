import React, { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Camera, UploadCloud, X, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { EASINGS } from '../utils/animations.js';

export default function ImageUploader({
  imagePreview,
  onImageSelected,
  onClear,
  isAnalyzing = false,
  isHighlighted = false
}) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isHighlighted && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('scan_page.invalid_image_toast', { defaultValue: 'Please select a valid image (JPEG, PNG, WebP).' }));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error(t('scan_page.file_too_large_toast', { defaultValue: 'File size is too large (max 15MB).' }));
      return;
    }
    onImageSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {imagePreview ? (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: EASINGS.easeOut }}
          className="relative rounded-3xl overflow-hidden border border-white/10 glass-panel shadow-2xl"
        >
          {/* Scanning Laser Line & Corner Brackets effect when analyzing */}
          {isAnalyzing && (
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              {/* Corner scan brackets */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-eco-400 shadow-[0_0_10px_#10b981] animate-pulse" />
              <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-eco-400 shadow-[0_0_10px_#10b981] animate-pulse" />
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-eco-400 shadow-[0_0_10px_#10b981] animate-pulse" />
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-eco-400 shadow-[0_0_10px_#10b981] animate-pulse" />

              {/* Sweeping Laser Line */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-eco-400 to-transparent shadow-[0_0_18px_#10b981] animate-laser" />

              {/* Subtle tint & center status badge */}
              <div className="absolute inset-0 bg-eco-500/10 backdrop-blur-[1px] flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-5 py-2.5 rounded-full bg-dark-bg/90 border border-eco-500/40 text-eco-400 font-semibold text-sm flex items-center gap-2.5 shadow-glow-lg"
                >
                  <RefreshCw className="w-4 h-4 animate-spin text-eco-400" />
                  <span>{t('scan_page.analyzing_overlay', { defaultValue: 'AI Identifying Waste & Materials...' })}</span>
                </motion.div>
              </div>
            </div>
          )}

          <img
            src={imagePreview}
            alt="Waste Item Preview"
            className="w-full h-72 md:h-96 object-cover object-center"
          />

          {!isAnalyzing && (
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-dark-bg/80 hover:bg-dark-bg border border-white/10 text-gray-200 text-xs font-medium backdrop-blur-md transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> {t('scan_page.retake', { defaultValue: 'Retake' })}
              </button>
              <button
                type="button"
                onClick={onClear}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 backdrop-blur-md transition-colors shadow-sm"
                title={t('scan_page.remove_image', { defaultValue: 'Remove image' })}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: isDragOver ? 1.025 : 1
                }
          }
          transition={{ duration: 0.2, ease: EASINGS.easeOut }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          ref={containerRef}
          className={`relative border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all duration-500 ${
            isDragOver
              ? 'border-eco-400 bg-eco-500/10 shadow-[0_0_35px_rgba(16,185,129,0.3)]'
              : isHighlighted
                ? 'border-eco-400 bg-eco-500/15 ring-4 ring-eco-400/40 shadow-[0_0_40px_rgba(16,185,129,0.35)]'
                : 'border-white/10 glass-panel hover:border-eco-500/40'
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <motion.div
              whileHover={shouldReduceMotion ? {} : { scale: 1.08, rotate: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="w-20 h-20 rounded-3xl bg-eco-500/10 border border-eco-500/20 text-eco-400 flex items-center justify-center mb-5 shadow-glow-sm"
            >
              <UploadCloud className="w-10 h-10" />
            </motion.div>

            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{t('scan_page.upload_title', { defaultValue: 'Upload or Snap Waste Photo' })}</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
              {t('scan_page.upload_desc', { defaultValue: 'Drag & drop your item here, browse from device, or capture directly with your camera.' })}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.04 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-eco-600 to-emerald-500 hover:from-eco-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-glow-sm flex items-center gap-2 transition-all duration-200"
              >
                <Camera className="w-4 h-4" /> {t('scan_page.open_camera', { defaultValue: 'Open Camera' })}
              </motion.button>

              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-semibold text-sm transition-all duration-200"
              >
                {t('scan_page.browse_files', { defaultValue: 'Browse Files' })}
              </motion.button>
            </div>

            <p className="text-[11px] text-gray-400 mt-4">{t('scan_page.supported_formats', { defaultValue: 'Supports JPEG, PNG, WebP up to 15MB (Auto-compressed)' })}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

