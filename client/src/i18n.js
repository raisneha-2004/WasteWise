import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import bn from './locales/bn.json';
import en from './locales/en.json';
import gu from './locales/gu.json';
import hi from './locales/hi.json';
import hinglish from './locales/hinglish.json';
import kn from './locales/kn.json';
import mr from './locales/mr.json';
import pa from './locales/pa.json';
import ta from './locales/ta.json';
import te from './locales/te.json';

const resources = {
  bn: { translation: bn },
  en: { translation: en },
  gu: { translation: gu },
  hi: { translation: hi },
  hinglish: { translation: hinglish },
  kn: { translation: kn },
  mr: { translation: mr },
  pa: { translation: pa },
  ta: { translation: ta },
  te: { translation: te }
};

// Initial language detection: check localStorage first, else browser language
let savedLang = 'hinglish';
try {
  const local = localStorage.getItem('wastewise_lang');
  if (local) {
    savedLang = JSON.parse(local);
  } else if (typeof navigator !== 'undefined') {
    const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (navLang.startsWith('hi')) savedLang = 'hi';
    else if (navLang.startsWith('bn')) savedLang = 'bn';
    else if (navLang.startsWith('ta')) savedLang = 'ta';
    else if (navLang.startsWith('te')) savedLang = 'te';
    else if (navLang.startsWith('mr')) savedLang = 'mr';
    else if (navLang.startsWith('gu')) savedLang = 'gu';
    else if (navLang.startsWith('pa')) savedLang = 'pa';
    else if (navLang.startsWith('kn')) savedLang = 'kn';
    else if (navLang.startsWith('en')) savedLang = 'en';
    else savedLang = 'hinglish';
  }
} catch {
  savedLang = 'hinglish';
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || 'hinglish',
    fallbackLng: 'hinglish',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
