import crypto from 'crypto';
import sharp from 'sharp';
import NodeCache from 'node-cache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { VALID_CATEGORIES, normalizeCategory } from './classifier.service.js';

// Cache with 24 hours TTL and hourly check
const imagePredictionCache = new NodeCache({
  stdTTL: 24 * 60 * 60,
  checkperiod: 60 * 60,
  maxKeys: 1000
});

// Timeout constant (20 seconds)
const AI_TIMEOUT_MS = 20000;

/**
 * Computes SHA-256 hash of a buffer
 * @param {Buffer} buffer
 * @returns {string}
 */
export function computeImageHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Resizes image to max 1024px width/height and compresses to JPEG
 * @param {Buffer} buffer
 * @returns {Promise<{ processedBuffer: Buffer, mimeType: string }>}
 */
export async function preprocessImage(buffer) {
  try {
    const processedBuffer = await sharp(buffer)
      .rotate() // Auto-orient based on EXIF
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    return {
      processedBuffer,
      mimeType: 'image/jpeg'
    };
  } catch (err) {
    logger.warn('Sharp image preprocessing error, falling back to original buffer', err.message);
    return {
      processedBuffer: buffer,
      mimeType: 'image/jpeg'
    };
  }
}

const LANGUAGE_PROMPT_INSTRUCTIONS = {
  hinglish: 'Output itemName, material, hazardReason, and condition in conversational Hinglish (Roman script Hindi-English mix, e.g. "Khali Plastic ki Bottle").',
  hi: 'Output itemName, material, hazardReason, and condition in Hindi (हिन्दी in Devanagari script, e.g. "खाली प्लास्टिक की बोतल").',
  bn: 'Output itemName, material, hazardReason, and condition in Bengali (বাংলা script).',
  ta: 'Output itemName, material, hazardReason, and condition in Tamil (தமிழ் script).',
  te: 'Output itemName, material, hazardReason, and condition in Telugu (తెలుగు script).',
  mr: 'Output itemName, material, hazardReason, and condition in Marathi (मराठी in Devanagari script).',
  gu: 'Output itemName, material, hazardReason, and condition in Gujarati (ગુજરાતી script).',
  pa: 'Output itemName, material, hazardReason, and condition in Punjabi (ਪੰਜਾਬੀ in Gurmukhi script).',
  kn: 'Output itemName, material, hazardReason, and condition in Kannada (ಕನ್ನಡ script).',
  en: 'Output itemName, material, hazardReason, and condition in English.'
};

/**
 * Builds the strict system prompt for Vision AI with target language
 */
function buildVisionPrompt(language = 'hinglish') {
  const langKey = (language || 'hinglish').toLowerCase();
  const langInstruction = LANGUAGE_PROMPT_INSTRUCTIONS[langKey] || LANGUAGE_PROMPT_INSTRUCTIONS.hinglish;

  return `You are a high-precision Waste Management & Materials Classifier AI.
Analyze the uploaded image and identify the primary waste item.

Language Requirement:
${langInstruction}
CRITICAL: The JSON keys must remain in English, and the "category" value MUST be chosen strictly from the allowed English categories below.

Allowed Categories (You MUST pick one EXACTLY as written):
${JSON.stringify(VALID_CATEGORIES)}

You must return a single, valid JSON object with NO markdown formatting, NO backticks, and NO extra commentary.
The JSON must follow this exact schema:
{
  "itemName": "Specific name of the waste item in the requested language",
  "category": "One of: Plastic | Paper | Glass | Metal | Organic | E-waste | Hazardous | Textile | Other",
  "confidence": A decimal number between 0.00 and 1.00 indicating classification confidence,
  "material": "Primary material composition in the requested language",
  "isHazardous": true or false,
  "hazardReason": "Short explanation in the requested language if hazardous, or 'None'",
  "condition": "Condition of the item (e.g. Clean, Dirty, Crushed, Broken, Intact) in the requested language",
  "alternativeCategories": ["Optional alternative category 1", "Optional alternative category 2"]
}`;
}

/**
 * Cleans markdown code blocks (```json ... ```) from model response and extracts valid JSON
 * @param {string} raw
 * @returns {string}
 */
function extractJsonString(raw) {
  if (!raw) return '';
  let cleaned = raw.trim();
  // Strip code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  cleaned = cleaned.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  // Try extracting outermost JSON object if extra text exists
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.substring(firstBrace, lastBrace + 1).trim();
  }

  return cleaned.trim();
}

/**
 * Calls Gemini Vision API with a timeout
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @param {string} [language='hinglish']
 * @returns {Promise<any>}
 */
async function callGeminiVision(imageBuffer, mimeType, language = 'hinglish') {
  if (!env.VISION_API_KEY) {
    console.error('[WasteWise Vision] ❌ VISION_API_KEY is empty or not set in server/.env.');
    throw new Error('MISSING_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(env.VISION_API_KEY);
  // Use gemini-2.5-flash for fast, modern and accurate vision analysis
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = buildVisionPrompt(language);
  const base64Data = imageBuffer.toString('base64');
  logger.debug(`Sending image to Gemini — size: ${Math.round(base64Data.length * 0.75 / 1024)} KB, mimeType: ${mimeType}, lang: ${language}`);

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType || 'image/jpeg'
    }
  };

  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('AI_TIMEOUT'));
    }, AI_TIMEOUT_MS);
    if (timer.unref) timer.unref();
  });

  let result;
  try {
    result = await Promise.race([model.generateContent([prompt, imagePart]), timeoutPromise]);
  } catch (apiErr) {
    // Extract HTTP status code from Google API errors
    const status = apiErr?.status || apiErr?.httpStatus || apiErr?.response?.status;
    if (status === 400) console.error('[WasteWise Vision] ❌ HTTP 400 Bad Request — check image format/size or prompt structure.');
    else if (status === 401 || status === 403) console.error('[WasteWise Vision] ❌ HTTP', status, '— API key is invalid or lacks permissions. Check VISION_API_KEY in server/.env.');
    else if (status === 429) console.error('[WasteWise Vision] ❌ HTTP 429 — Rate limit exceeded. Wait and retry.');
    else if (status === 500) console.error('[WasteWise Vision] ❌ HTTP 500 — Gemini server error.');
    else console.error('[WasteWise Vision] ❌ API call failed:', apiErr?.message || apiErr);
    throw apiErr;
  }

  let responseText;
  try {
    responseText = result.response.text();
  } catch (textErr) {
    console.error('[WasteWise Vision] ❌ Could not extract text from Gemini response:', textErr.message);
    return createFallbackResult('Empty text in AI response');
  }

  logger.debug(`Gemini raw response: ${responseText?.substring(0, 300)}...`);

  const jsonStr = extractJsonString(responseText);
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (parseErr) {
    logger.warn('[WasteWise Vision] ⚠️ JSON parse failed on model output. Using fallback Other category.', parseErr.message);
    parsed = createFallbackResult('JSON parse failed on AI response');
  }

  return parsed;
}

/**
 * Fallback response if AI is unavailable or key is absent
 * @param {string} reason
 */
function createFallbackResult(reason = 'AI Vision unavailable') {
  return {
    itemName: 'Unidentified Waste Item',
    category: 'Other',
    confidence: 0.35,
    material: 'Mixed / Indeterminate Material',
    isHazardous: false,
    hazardReason: 'Could not determine hazard profile automatically.',
    condition: 'Unknown',
    alternativeCategories: ['Plastic', 'Organic', 'Paper'],
    _isFallback: true,
    _fallbackReason: reason
  };
}

/**
 * Validates AI result structure
 * @param {any} data
 * @returns {boolean}
 */
function isValidPrediction(data) {
  return (
    data &&
    typeof data.itemName === 'string' &&
    typeof data.category === 'string' &&
    typeof data.confidence === 'number'
  );
}

/**
 * Main service method: processes image buffer, checks cache, calls AI with retry, and formats result
 * @param {Buffer} rawBuffer
 * @param {string} [language='hinglish']
 * @returns {Promise<{ prediction: any, fromCache: boolean, imageHash: string }>}
 */
export async function analyzeWasteImage(rawBuffer, language = 'hinglish') {
  const imageHash = computeImageHash(rawBuffer);
  const cacheKey = `${imageHash}_${(language || 'hinglish').toLowerCase()}`;

  // 1. Check in-memory cache
  const cachedPrediction = imagePredictionCache.get(cacheKey);
  if (cachedPrediction) {
    logger.info(`Cache hit for image hash: ${imageHash.substring(0, 10)}... (Lang: ${language})`);
    return {
      prediction: cachedPrediction,
      fromCache: true,
      imageHash
    };
  }

  // 2. Preprocess & compress image
  const { processedBuffer, mimeType } = await preprocessImage(rawBuffer);
  logger.info(`Image preprocessed — buffer size: ${Math.round(processedBuffer.length / 1024)} KB, lang: ${language}`);

  let prediction = null;
  let lastError = null;
  let attempts = 0;
  const maxAttempts = 2; // 1 initial + 1 retry

  while (attempts < maxAttempts && !prediction) {
    attempts++;
    try {
      logger.info(`Sending image to Vision AI (Attempt ${attempts}/${maxAttempts}, Lang: ${language})...`);
      const rawPrediction = await callGeminiVision(processedBuffer, mimeType, language);

      if (isValidPrediction(rawPrediction)) {
        // Normalize category to guarantee it matches wasteCategories.json
        const normalized = normalizeCategory(rawPrediction.category);
        prediction = {
          ...rawPrediction,
          category: normalized,
          confidence: Math.max(0, Math.min(1, Number(Number(rawPrediction.confidence).toFixed(2))))
        };

        // ── DEV-ONLY DEBUG LOG (removed in production) ──
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `\x1b[32m[WasteWise DEBUG]\x1b[0m Detected: "${rawPrediction.category}" → normalized: "${normalized}" | confidence: ${prediction.confidence} | bin: from disposalRules["${normalized}"]`
          );
        }

        logger.info(`Vision AI result — category: ${normalized}, confidence: ${prediction.confidence}`);
      } else {
        logger.warn(`Attempt ${attempts}: AI returned malformed prediction:`, JSON.stringify(rawPrediction));
        console.error('[WasteWise Vision] ❌ Malformed AI response (missing itemName/category/confidence):', rawPrediction);
        lastError = new Error('MALFORMED_RESPONSE');
      }
    } catch (err) {
      lastError = err;
      logger.warn(`Attempt ${attempts} failed: ${err.message}`);

      const status = err?.status || err?.httpStatus || err?.response?.status;
      if (err.message === 'MISSING_API_KEY' || status === 401 || status === 403 || status === 429) {
        // No point retrying without key or when quota exceeded — throw immediately
        console.error(`[WasteWise Vision] ❌ Aborting retry: ${err.message || 'Auth/Quota Error (status ' + status + ')'}`);
        throw err;
      }
    }
  }

  if (!prediction) {
    // All attempts exhausted — throw so the controller returns a proper error to the frontend
    console.error(`[WasteWise Vision] ❌ All ${maxAttempts} attempt(s) failed. Last error: ${lastError?.message}`);
    throw lastError || new Error('VISION_ANALYSIS_FAILED');
  }

  // 3. Cache successful prediction
  imagePredictionCache.set(cacheKey, prediction);

  return {
    prediction,
    fromCache: false,
    imageHash
  };
}
