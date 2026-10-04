import { getSpeechLangConfig } from './speechLangMap.js';
import toast from 'react-hot-toast';

let cachedVoices = [];

// Initialize voices cache and handle async voice list loading
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Finds best matching speech synthesis voice for a locale
 */
export function findBestVoice(targetLocale, fallbackLocales = []) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const searchList = [targetLocale, ...fallbackLocales];

  for (const locale of searchList) {
    if (!locale) continue;
    const cleanLocale = locale.toLowerCase().replace('_', '-');
    const langPrefix = cleanLocale.split('-')[0];

    // 1. Exact match (e.g. ta-IN, bn-IN, hi-IN)
    const exact = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === cleanLocale);
    if (exact) return exact;

    // 2. Language prefix match (e.g. ta, bn, hi)
    const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixMatch) return prefixMatch;
  }

  // 3. Any Indian voice or default
  const indianVoice = voices.find((v) => v.lang.includes('IN') || v.name.includes('India'));
  return indianVoice || voices[0] || null;
}

/**
 * Speaks text aloud using Web Speech API Text-to-Speech (TTS)
 * @param {Object} options
 * @param {string} options.text - Main text to speak
 * @param {string} [options.nativeText] - Devanagari/native script text (for Hinglish/Hindi audio)
 * @param {string} [options.language='hinglish'] - Selected language code
 * @param {Function} [options.onStart] - Callback when speaking starts
 * @param {Function} [options.onEnd] - Callback when speaking completes
 * @param {Function} [options.onError] - Callback on error
 */
export function speakText({
  text,
  nativeText,
  language = 'hinglish',
  onStart,
  onEnd,
  onError
}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported on this browser.');
    if (onError) onError(new Error('SPEECH_NOT_SUPPORTED'));
    return;
  }

  // Abort any ongoing speech first
  window.speechSynthesis.cancel();

  const config = getSpeechLangConfig(language);
  const textToSpeak = (config.useNativeText && nativeText) ? nativeText : text;

  if (!textToSpeak || !textToSpeak.trim()) {
    if (onEnd) onEnd();
    return;
  }

  // Clean text from emojis, markdown symbols, asterisks, etc.
  const cleanSpeechText = textToSpeak
    .replace(/[*_~`#>\\]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
  utterance.lang = config.locale || 'hi-IN';
  utterance.rate = 0.95; // Crisp, clear pace
  utterance.pitch = 1.0;

  const bestVoice = findBestVoice(config.locale, config.fallbackLocales);
  if (bestVoice) {
    utterance.voice = bestVoice;
  } else if (language !== 'en' && language !== 'hinglish') {
    // Show friendly notice if native voice for regional language is missing on client machine
    toast(`Using available voice for ${config.label}. (Native voice pack not installed on device)`, {
      id: 'voice-missing-notice',
      duration: 3000,
      icon: '🔊',
      style: { background: '#162329', color: '#93c5fd', fontSize: '12px' }
    });
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    // Don't warn on manual cancellation
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      console.warn('TTS utterance error:', e.error);
    }
    if (onEnd) onEnd();
    if (onError) onError(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any ongoing text-to-speech audio
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks if Speech Recognition is supported
 */
export function isSpeechRecognitionSupported() {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

/**
 * Creates and initializes SpeechRecognition instance for speech-to-text
 */
export function createSpeechRecognizer({
  onResult,
  onError,
  onEnd,
  language = 'hinglish'
}) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();

  const config = getSpeechLangConfig(language);
  recognizer.continuous = false;
  recognizer.interimResults = false;
  recognizer.lang = config.locale || 'hi-IN';

  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognizer.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognizer.onend = () => {
    if (onEnd) onEnd();
  };

  return recognizer;
}
