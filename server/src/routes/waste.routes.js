import { Router } from 'express';
import { z } from 'zod';
import { analyzeWaste, confirmCategory } from '../controllers/waste.controller.js';
import { uploadWasteImage } from '../middleware/upload.js';
import { analyzeRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Validation schema for confirmation
const confirmSchema = z.object({
  itemName: z.string().min(1, 'Item name cannot be empty').optional(),
  category: z.string().min(1, 'Category is required'),
  language: z.string().optional().default('hinglish'),
  lat: z.number().optional(),
  lng: z.number().optional()
});

/**
 * @route   POST /api/waste/analyze
 * @desc    Upload waste photo, run Vision AI classification, and return disposal steps, impact & nearby centers
 * @access  Public (Rate limited to 20 req/15 min)
 */
router.post('/analyze', analyzeRateLimiter, uploadWasteImage, analyzeWaste);

/**
 * @route   POST /api/waste/confirm
 * @desc    Recalculate recommendations when a user corrects/confirms an item category
 * @access  Public
 */
router.post('/confirm', validate(confirmSchema, 'body'), confirmCategory);

export default router;
