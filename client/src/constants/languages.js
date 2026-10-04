/**
 * Multi-Language Configuration for WasteWise AI
 * Easily add new languages by adding a single line to the LANGUAGES array.
 */
export const LANGUAGES = [
  {
    code: 'hinglish',
    label: 'Hinglish',
    nativeLabel: 'Hinglish',
    speechLocale: 'hi-IN',
    promptName: 'Hinglish (Hindi written in Roman script mixed with English words, friendly Indian colloquial style)'
  },
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    speechLocale: 'en-IN',
    promptName: 'English (clear, concise, natural)'
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    speechLocale: 'hi-IN',
    promptName: 'Hindi (हिन्दी in Devanagari script)'
  },
  {
    code: 'bn',
    label: 'Bengali',
    nativeLabel: 'বাংলা',
    speechLocale: 'bn-IN',
    promptName: 'Bengali (বাংলা script)'
  },
  {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    speechLocale: 'ta-IN',
    promptName: 'Tamil (தமிழ் script)'
  },
  {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    speechLocale: 'te-IN',
    promptName: 'Telugu (తెలుగు script)'
  },
  {
    code: 'mr',
    label: 'Marathi',
    nativeLabel: 'मराठी',
    speechLocale: 'mr-IN',
    promptName: 'Marathi (मराठी in Devanagari script)'
  },
  {
    code: 'gu',
    label: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
    speechLocale: 'gu-IN',
    promptName: 'Gujarati (ગુજરાતી script)'
  },
  {
    code: 'pa',
    label: 'Punjabi',
    nativeLabel: 'ਪੰਜਾਬੀ',
    speechLocale: 'pa-IN',
    promptName: 'Punjabi (ਪੰਜਾਬੀ in Gurmukhi script)'
  },
  {
    code: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    speechLocale: 'kn-IN',
    promptName: 'Kannada (ಕನ್ನಡ script)'
  }
];

export const DEFAULT_LANGUAGE = 'hinglish';

/**
 * Returns configuration object for a given language code
 * @param {string} code
 * @returns {typeof LANGUAGES[0]}
 */
export function getLanguageConfig(code) {
  const normalized = (code || '').toLowerCase();
  return LANGUAGES.find((l) => l.code === normalized) || LANGUAGES[0];
}
