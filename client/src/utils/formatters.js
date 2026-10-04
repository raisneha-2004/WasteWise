import { getSpeechLangConfig } from './speechLangMap.js';

/**
 * Maps app language code to standard BCP-47 locale for Intl formatters
 */
export function getIntlLocale(language = 'hinglish') {
  const config = getSpeechLangConfig(language);
  return config.locale || 'en-IN';
}

/**
 * Formats numbers into localized strings
 * @param {number} value
 * @param {string} [language='hinglish']
 * @param {Intl.NumberFormatOptions} [options]
 */
export function formatNumber(value, language = 'hinglish', options = {}) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  try {
    const locale = getIntlLocale(language);
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return Number(value).toLocaleString();
  }
}

/**
 * Formats dates into localized strings
 * @param {string|Date} date
 * @param {string} [language='hinglish']
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export function formatDate(date, language = 'hinglish', options = { dateStyle: 'medium', timeStyle: 'short' }) {
  if (!date) return '';
  try {
    const d = new Date(date);
    const locale = getIntlLocale(language);
    return new Intl.DateTimeFormat(locale, options).format(d);
  } catch {
    return new Date(date).toLocaleDateString();
  }
}

/**
 * Formats distance with localized decimal formatting
 */
export function formatDistance(distanceKm, language = 'hinglish') {
  if (distanceKm === null || distanceKm === undefined) return '';
  const num = formatNumber(Number(distanceKm).toFixed(2), language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  });
  return `${num} km`;
}
