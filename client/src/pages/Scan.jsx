import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  KeyRound,
  X,
  Camera,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/useApp.js';
import { wasteApi } from '../services/api.js';
import { compressImage } from '../utils/imageCompress.js';
import ImageUploader from '../components/ImageUploader.jsx';
import ResultCard from '../components/ResultCard.jsx';
import toast from 'react-hot-toast';
import { EASINGS } from '../utils/animations.js';

export default function Scan() {
  const { t } = useTranslation();
  const location = useLocation();
  const { language, userLocation, addScanToHistory } = useApp();

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailBase64, setThumbnailBase64] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null); // { code, message, hint? }
  const [showAiModal, setShowAiModal] = useState(() => Boolean(location.state?.explainAi || location.search.includes('explain=ai')));
  const [highlightUpload, setHighlightUpload] = useState(() => Boolean(location.state?.highlightUpload || location.search.includes('upload=true')));

  useEffect(() => {
    if (location.state?.explainAi || location.search.includes('explain=ai')) {
      setShowAiModal(true);
    }
    if (location.state?.highlightUpload || location.search.includes('upload=true')) {
      setHighlightUpload(true);
    }
  }, [location.state, location.search]);

  useEffect(() => {
    if (highlightUpload) {
      const timer = setTimeout(() => {
        setHighlightUpload(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [highlightUpload]);

  // File selection & compression
  const handleImageSelected = async (file) => {
    setSelectedFile(file);
    setScanResult(null);
    setScanError(null);

    // Create immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Compress client-side for fast upload & thumbnail for localStorage
    try {
      const { compressedBlob, thumbnailBase64: thumb } = await compressImage(file, 1024, 1024, 0.82);
      setSelectedFile(compressedBlob);
      setThumbnailBase64(thumb);
    } catch (err) {
      console.warn('Client-side compression skipped:', err);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setThumbnailBase64(null);
    setScanResult(null);
    setScanError(null);
  };

  // Submit image to Vision AI API
  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error(t('scan_page.select_prompt', { defaultValue: 'Please select or capture a photo first.' }));
      return;
    }

    setIsAnalyzing(true);
    setScanResult(null);
    setScanError(null);

    const formData = new FormData();
    formData.append('image', selectedFile, 'waste-item.jpg');
    formData.append('language', language);

    if (userLocation?.lat && userLocation?.lng) {
      formData.append('lat', userLocation.lat.toString());
      formData.append('lng', userLocation.lng.toString());
    }

    try {
      const response = await wasteApi.analyze(formData);

      // Server returned { success: false, error: {...} } (non-HTTP-error but logical failure)
      if (!response?.success && response?.error) {
        console.error('[WasteWise Scan] Server returned error:', response.error);
        setScanError(response.error);
        return;
      }

      if (response?.data) {
        const resultData = response.data;
        setScanResult(resultData);
        // Auto-save to localStorage history
        addScanToHistory(resultData, thumbnailBase64 || imagePreview);
      }
    } catch (err) {
      const serverError = err?.response?.data?.error || err?.response?.data;
      const status = err?.response?.status;
      console.error('[WasteWise Scan] Analyze failed:', err?.message, '| Server:', serverError);

      if (!err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        // 1. Server unreachable error
        setScanError({
          code: 'SERVER_UNREACHABLE',
          title: t('scan_page.error_unreachable_title', { defaultValue: 'Scan Failed: Server Unreachable' }),
          message: t('scan_page.error_unreachable_msg', { defaultValue: 'Could not reach the server. Please try again in a moment.' }),
          hint: t('scan_page.error_unreachable_hint', { defaultValue: 'Check your internet connection and verify that the backend service is active.' })
        });
      } else if (
        serverError?.code === 'VISION_KEY_ERROR' ||
        serverError?.code === 'VISION_KEY_MISSING' ||
        serverError?.code === 'VISION_QUOTA_EXCEEDED' ||
        status === 401 ||
        status === 403 ||
        status === 429
      ) {
        // 2. API key / quota error
        const isQuota = serverError?.code === 'VISION_QUOTA_EXCEEDED' || status === 429;
        setScanError({
          code: isQuota ? 'VISION_QUOTA_EXCEEDED' : 'VISION_KEY_ERROR',
          title: isQuota ? t('scan_page.error_quota_title', { defaultValue: 'Scan Failed: AI Quota Exceeded' }) : t('scan_page.error_key_title', { defaultValue: 'Scan Failed: Vision AI Key Issue' }),
          message:
            serverError?.message ||
            (isQuota
              ? t('scan_page.error_quota_msg', { defaultValue: 'Vision AI API rate limit or quota exceeded. Please wait a moment and try again.' })
              : t('scan_page.error_key_msg', { defaultValue: 'Vision AI is not configured or API key is invalid. Please verify VISION_API_KEY in server/.env.' })),
          hint:
            serverError?.hint ||
            t('scan_page.error_key_hint', { defaultValue: 'Get a free Gemini API key from https://aistudio.google.com/apikey and paste it into server/.env.' })
        });
      } else if (serverError?.code === 'VISION_TIMEOUT' || err.code === 'ECONNABORTED' || status === 504) {
        // 3. AI Timeout
        setScanError({
          code: 'VISION_TIMEOUT',
          title: t('scan_page.error_timeout_title', { defaultValue: 'Scan Failed: AI Timed Out' }),
          message: serverError?.message || t('scan_page.error_timeout_msg', { defaultValue: 'The AI took too long to analyze this image. Please try again.' }),
          hint: t('scan_page.error_timeout_hint', { defaultValue: 'Try capturing a clearer photo with good lighting or check your internet connection.' })
        });
      } else if (
        serverError?.code === 'VISION_INVALID_RESPONSE' ||
        serverError?.code === 'MALFORMED_RESPONSE' ||
        serverError?.code === 'INVALID_FILE_TYPE' ||
        serverError?.code === 'FILE_TOO_LARGE' ||
        serverError?.code === 'INVALID_IMAGE_SIGNATURE' ||
        status === 400 ||
        status === 422
      ) {
        // 4. Invalid response / unrecognized waste
        setScanError({
          code: serverError?.code || 'VISION_INVALID_RESPONSE',
          title: t('scan_page.error_unrecognized_title', { defaultValue: 'Scan Failed: Unrecognized Item' }),
          message:
            serverError?.message ||
            t('scan_page.error_unrecognized_msg', { defaultValue: 'Could not identify a recognizable waste item from this image. Please upload a clear photo.' }),
          hint:
            serverError?.hint ||
            t('scan_page.error_unrecognized_hint', { defaultValue: 'Ensure the waste object (bottle, paper, battery, can, etc.) is centered and clearly visible.' })
        });
      } else {
        // 5. Generic scan failure
        setScanError({
          code: serverError?.code || 'VISION_FAILED',
          title: t('scan_page.error_failed_title', { defaultValue: 'Scan Failed' }),
          message: serverError?.message || t('scan_page.error_failed_msg', { defaultValue: 'Scan failed — the AI could not analyze this image. Please try again.' }),
          hint: serverError?.hint || t('scan_page.error_failed_hint', { defaultValue: 'Try taking a closer and clearer photo of the waste item.' })
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // When user manually confirms / corrects category if confidence was low
  const handleConfirmCategory = async (newCategory) => {
    if (!newCategory || isConfirming) return;

    setIsConfirming(true);
    try {
      const payload = {
        itemName: scanResult?.item?.name || `${newCategory} Item`,
        category: newCategory,
        language,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      };

      const response = await wasteApi.confirm(payload);
      if (response?.data) {
        setScanResult(response.data);
        toast.success(t('scan_page.category_updated_toast', { category: t(`category_names.${newCategory}`, { defaultValue: newCategory }), defaultValue: `Category updated to ${newCategory}!` }), {
          style: { background: '#162329', color: '#10b981' }
        });
      }
    } catch (err) {
      console.error('Confirmation error:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  // Re-fetch localized recommendations when global language changes and result exists
  useEffect(() => {
    if (!scanResult?.item?.name) return;
    let isCancelled = false;

    async function updateLanguageRecommendations() {
      try {
        const payload = {
          itemName: scanResult.item?.name,
          category: scanResult.category,
          language,
          lat: userLocation?.lat,
          lng: userLocation?.lng
        };
        const response = await wasteApi.confirm(payload);
        if (response?.data && !isCancelled) {
          setScanResult(response.data);
        }
      } catch (err) {
        console.warn('Language update fetch failed:', err);
      }
    }

    updateLanguageRecommendations();
    return () => {
      isCancelled = true;
    };
  }, [language, scanResult?.item?.name, scanResult?.category, userLocation?.lat, userLocation?.lng]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-8 pb-24">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco-500/10 border border-eco-500/20 text-eco-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('scan_page.badge', { defaultValue: 'AI Sorting Assistant' })}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 text-xs font-semibold transition-all hover:scale-105"
            >
              <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('scan_page.how_ai_works_btn', { defaultValue: 'How AI Works' })}</span>
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {t('scan_page.title', { defaultValue: 'Scan & Segregate Waste' })}
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            {t('scan_page.subtitle', { defaultValue: 'Capture clear photo of container, packaging, electronic, or food scrap.' })}
          </p>
        </div>

        {(scanResult || scanError) && (
          <button
            onClick={handleClear}
            className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-eco-400" />
            <span>{t('scan_page.scan_another', { defaultValue: 'Scan Another Item' })}</span>
          </button>
        )}
      </div>

      {/* Image Uploader & Camera Area */}
      <div className="space-y-4">
        <ImageUploader
          imagePreview={imagePreview}
          onImageSelected={handleImageSelected}
          onClear={handleClear}
          isAnalyzing={isAnalyzing}
          isHighlighted={highlightUpload}
        />

        {/* Action Button */}
        {imagePreview && !scanResult && !scanError && (
          <div className="flex justify-center pt-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-eco-600 to-emerald-500 hover:from-eco-500 hover:to-emerald-400 disabled:opacity-50 text-white font-bold text-base animate-button-glow flex items-center justify-center gap-3 transition-colors duration-200"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{t('scan_page.analyzing', { defaultValue: 'Processing with Vision AI...' })}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{t('scan_page.analyze_button', { defaultValue: 'Analyze Item with WasteWise AI' })}</span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* ── SCAN ERROR STATE ── */}
      {scanError && !scanResult && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel rounded-3xl border border-red-500/25 bg-red-950/10 p-6 md:p-8 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-start gap-4 relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center">
              {scanError.code === 'VISION_KEY_ERROR' || scanError.code === 'VISION_KEY_MISSING'
                ? <KeyRound className="w-6 h-6 text-red-400" />
                : <AlertCircle className="w-6 h-6 text-red-400" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1">
                {scanError.title || t('scan_page.error_failed_title', { defaultValue: 'Scan Failed' })}
              </h3>
              <p className="text-sm text-red-300/90 leading-relaxed mb-1">
                {scanError.message}
              </p>
              {scanError.hint && (
                <p className="text-xs text-gray-400 mt-1">
                  💡 {scanError.hint}
                </p>
              )}
              {(scanError.code === 'VISION_KEY_ERROR' || scanError.code === 'VISION_KEY_MISSING') && (
                <div className="mt-3 p-3 rounded-xl bg-black/30 border border-white/5 text-xs font-mono text-gray-300 leading-relaxed">
                  <span className="text-gray-500"># server/.env</span>
                  <br />
                  <span className="text-emerald-400">VISION_API_KEY</span>=<span className="text-amber-300">your_gemini_api_key_here</span>
                </div>
              )}
            </div>
          </div>

          {/* Retry Button */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3 relative z-10">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setScanError(null);
                handleAnalyze();
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              {t('scan_page.try_again', { defaultValue: 'Try Again' })}
            </motion.button>
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('scan_page.choose_different', { defaultValue: 'Choose a Different Photo' })}
            </button>
          </div>
        </motion.div>
      )}

      {/* Analysis Result Card */}
      {scanResult && (
        <ResultCard
          result={scanResult}
          onConfirmCategory={handleConfirmCategory}
          isConfirming={isConfirming}
        />
      )}

      {/* AI Explanation Modal / Panel (Triggered by Card 02 from Home or header button) */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ duration: 0.28, ease: EASINGS.easeOut }}
              className="relative w-full max-w-2xl glass-panel bg-[#0b101b]/95 border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Glow backdrop effects */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-glow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                      {t('scan_page.how_ai_works_title', { defaultValue: 'How WasteWise Vision AI Works' })}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                      {t('scan_page.how_ai_works_sub', { defaultValue: 'Multimodal neural inspection for zero-confusion sorting' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Pillars of Vision AI */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 relative z-10 custom-scrollbar">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5 hover:border-emerald-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">
                      {t('scan_page.ai_step1_title', { defaultValue: '1. Photo & Visual Feature Extraction' })}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t('scan_page.ai_step1_desc', { defaultValue: 'Analyzes visual textures, packaging logos, material reflections, translucency, and barcode shapes in milliseconds.' })}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5 hover:border-blue-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">
                      {t('scan_page.ai_step2_title', { defaultValue: '2. Material & Category Classification' })}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t('scan_page.ai_step2_desc', { defaultValue: 'Identifies plastic polymers (PET, HDPE, PP), cardboard, metals, glass, e-waste circuits, or organic biodegradable matter.' })}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5 hover:border-rose-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">
                      {t('scan_page.ai_step3_title', { defaultValue: '3. Hazard & Contamination Flagging' })}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t('scan_page.ai_step3_desc', { defaultValue: 'Instantly alerts on lithium battery fire risks, chemical toxins, broken sharp edges, or bio-medical contamination.' })}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5 hover:border-amber-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">
                      {t('scan_page.ai_step4_title', { defaultValue: '4. Municipal Bin & Location Guidance' })}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t('scan_page.ai_step4_desc', { defaultValue: 'Maps item directly to Indian municipal color codes (Wet Green, Dry Blue, Hazardous Red) and calculates eco-points reward.' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer with "Try a Scan" button */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                <span className="text-xs text-gray-400 text-center sm:text-left">
                  {t('scan_page.ai_ready_text', { defaultValue: 'Ready to segregate your first discarded item?' })}
                </span>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setShowAiModal(false);
                    setHighlightUpload(true);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-eco-600 to-emerald-500 hover:from-eco-500 hover:to-emerald-400 text-white font-bold text-sm shadow-glow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t('scan_page.try_scan_button', { defaultValue: 'Try a Scan' })}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
