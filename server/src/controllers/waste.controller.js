import { analyzeWasteImage } from '../services/vision.service.js';
import { normalizeCategory, needsUserConfirmation, getAllCategories } from '../services/classifier.service.js';
import { getDisposalRecommendation, calculateEcoPoints } from '../services/recommendation.service.js';
import { calculateItemImpact } from '../services/impact.service.js';
import { getTopNearestCenters } from '../services/centers.service.js';
import { AppError } from '../utils/AppError.js';

/**
 * Controller to analyze uploaded waste image and assemble full sorting recommendations
 */
export async function analyzeWaste(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      throw new AppError('No image uploaded. Please upload a file with key "image".', 400, 'NO_IMAGE_PROVIDED');
    }

    const language = (req.body.language || 'en').toLowerCase();
    const lat = req.body.lat !== undefined && req.body.lat !== '' ? parseFloat(req.body.lat) : null;
    const lng = req.body.lng !== undefined && req.body.lng !== '' ? parseFloat(req.body.lng) : null;

    // 1. Send image to Vision AI Service (with cache & retry)
    let prediction, fromCache;
    try {
      ({ prediction, fromCache } = await analyzeWasteImage(req.file.buffer, language));
    } catch (visionErr) {
      // Surface specific, user-friendly errors for common failure modes
      const status = visionErr?.status || visionErr?.httpStatus || visionErr?.response?.status;
      const errMsg = (visionErr?.message || '').toLowerCase();

      if (visionErr.message === 'MISSING_API_KEY' || status === 401 || status === 403 || errMsg.includes('api key') || errMsg.includes('permission')) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'VISION_KEY_ERROR',
            message: 'Vision AI is not configured or API key is invalid. Please verify VISION_API_KEY in server/.env.',
            hint: 'Get a free Gemini API key at https://aistudio.google.com/apikey'
          }
        });
      }

      if (status === 429 || errMsg.includes('quota') || errMsg.includes('rate limit') || errMsg.includes('resource_exhausted')) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'VISION_QUOTA_EXCEEDED',
            message: 'Vision AI rate limit or API quota exceeded. Please wait a moment before trying again.',
            hint: 'Check your Google AI Studio quota limits.'
          }
        });
      }

      if (visionErr.message === 'AI_TIMEOUT') {
        return res.status(504).json({
          success: false,
          error: {
            code: 'VISION_TIMEOUT',
            message: 'The AI took too long to respond. Please try again with a smaller or clearer image.'
          }
        });
      }

      if (visionErr.message === 'MALFORMED_RESPONSE' || visionErr.message === 'JSON_PARSE_FAILED' || visionErr.message === 'EMPTY_RESPONSE') {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VISION_INVALID_RESPONSE',
            message: 'Could not identify a clear waste item from the image. Please upload a clear photo of the object.',
            hint: 'Ensure good lighting and that the waste item is centered.'
          }
        });
      }

      // Generic vision failure — log and propagate
      return res.status(503).json({
        success: false,
        error: {
          code: 'VISION_FAILED',
          message: 'Scan failed — the AI could not analyze this image. Please try again with a clearer photo.',
          detail: visionErr.message
        }
      });
    }

    const category = normalizeCategory(prediction.category);
    const confidence = typeof prediction.confidence === 'number' ? prediction.confidence : 0.4;
    const isNeedsConfirmation = needsUserConfirmation(confidence);

    // 2. Fetch disposal rules & localized guidance
    const recommendation = getDisposalRecommendation(
      category,
      language,
      prediction.isHazardous,
      prediction.hazardReason
    );

    // 3. Calculate environmental impact
    const impact = calculateItemImpact(category);

    // 4. Calculate gamified eco-points
    const ecoPoints = calculateEcoPoints(category, prediction.isHazardous, confidence);

    // 5. Look up nearest recycling centers if geolocation coordinates are present
    let nearbyCenters = [];
    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      nearbyCenters = getTopNearestCenters(lat, lng, category, 3);
    }

    // 6. Return unified JSON structure
    return res.status(200).json({
      success: true,
      data: {
        item: {
          name: prediction.itemName,
          material: prediction.material || 'Mixed',
          condition: prediction.condition || 'Used',
          alternativeCategories: prediction.alternativeCategories || []
        },
        category,
        confidence,
        needsConfirmation: isNeedsConfirmation,
        bin: recommendation.bin,
        steps: recommendation.steps,
        dos: recommendation.dos,
        donts: recommendation.donts,
        hazard: recommendation.hazard,
        impact,
        ecoPoints,
        nearbyCenters,
        tip: recommendation.tip,
        speechText: recommendation.speechText,
        speechTextNative: recommendation.speechTextNative,
        meta: {
          fromCache,
          language
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller to recalculate recommendation after user manually confirms or corrects category
 */
export async function confirmCategory(req, res, next) {
  try {
    const { itemName, category: rawCategory, language = 'hinglish', lat, lng } = req.body;

    const category = normalizeCategory(rawCategory);
    const confidence = 1.0; // Confirmed by human user
    const needsConfirmation = false;

    const recommendation = getDisposalRecommendation(category, language, false);
    const impact = calculateItemImpact(category);
    const ecoPoints = calculateEcoPoints(category, false, 1.0);

    let nearbyCenters = [];
    if (typeof lat === 'number' && typeof lng === 'number') {
      nearbyCenters = getTopNearestCenters(lat, lng, category, 3);
    }

    return res.status(200).json({
      success: true,
      data: {
        item: {
          name: itemName || `${category} Item`,
          material: `${category} Material`,
          condition: 'User Confirmed',
          alternativeCategories: []
        },
        category,
        confidence,
        needsConfirmation,
        bin: recommendation.bin,
        steps: recommendation.steps,
        dos: recommendation.dos,
        donts: recommendation.donts,
        hazard: recommendation.hazard,
        impact,
        ecoPoints,
        nearbyCenters,
        tip: recommendation.tip,
        speechText: recommendation.speechText,
        speechTextNative: recommendation.speechTextNative,
        meta: {
          confirmedByUser: true,
          language
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller to list all waste categories
 */
export async function getCategories(req, res, next) {
  try {
    const categories = getAllCategories();
    return res.status(200).json({
      success: true,
      data: {
        categories
      }
    });
  } catch (err) {
    next(err);
  }
}
