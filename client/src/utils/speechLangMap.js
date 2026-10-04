/**
 * BCP-47 Language and Voice Mappings for Web Speech API (TTS and STT)
 */
export const SPEECH_LANG_MAP = {
  hinglish: {
    locale: 'hi-IN',
    fallbackLocales: ['hi-IN', 'en-IN', 'en-US'],
    label: 'Hinglish (Hindi Audio)',
    useNativeText: true
  },
  en: {
    locale: 'en-IN',
    fallbackLocales: ['en-IN', 'en-GB', 'en-US'],
    label: 'Indian English',
    useNativeText: false
  },
  hi: {
    locale: 'hi-IN',
    fallbackLocales: ['hi-IN', 'en-IN'],
    label: 'Hindi (हिन्दी)',
    useNativeText: true
  },
  bn: {
    locale: 'bn-IN',
    fallbackLocales: ['bn-BD', 'bn-IN', 'hi-IN', 'en-IN'],
    label: 'Bengali (বাংলা)',
    useNativeText: false
  },
  ta: {
    locale: 'ta-IN',
    fallbackLocales: ['ta-LK', 'ta-IN', 'en-IN', 'hi-IN'],
    label: 'Tamil (தமிழ்)',
    useNativeText: false
  },
  te: {
    locale: 'te-IN',
    fallbackLocales: ['te-IN', 'en-IN', 'hi-IN'],
    label: 'Telugu (తెలుగు)',
    useNativeText: false
  },
  mr: {
    locale: 'mr-IN',
    fallbackLocales: ['mr-IN', 'hi-IN', 'en-IN'],
    label: 'Marathi (मराठी)',
    useNativeText: false
  },
  gu: {
    locale: 'gu-IN',
    fallbackLocales: ['gu-IN', 'hi-IN', 'en-IN'],
    label: 'Gujarati (ગુજરાતી)',
    useNativeText: false
  },
  pa: {
    locale: 'pa-IN',
    fallbackLocales: ['pa-IN', 'hi-IN', 'en-IN'],
    label: 'Punjabi (ਪੰਜਾਬੀ)',
    useNativeText: false
  },
  kn: {
    locale: 'kn-IN',
    fallbackLocales: ['kn-IN', 'en-IN', 'hi-IN'],
    label: 'Kannada (ಕನ್ನಡ)',
    useNativeText: false
  }
};

/**
 * Returns speech mapping details for a language code
 */
export function getSpeechLangConfig(langCode = 'hinglish') {
  const code = (langCode || 'hinglish').toLowerCase();
  return SPEECH_LANG_MAP[code] || SPEECH_LANG_MAP.hinglish;
}
