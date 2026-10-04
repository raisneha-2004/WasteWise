import { Router } from 'express';
import { z } from 'zod';
import { getImpactSummary } from '../controllers/impact.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const scanItemSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  weightKg: z.number().positive().optional(),
  date: z.string().optional()
});

const impactSummarySchema = z.union([
  z.object({
    history: z.array(scanItemSchema)
  }),
  z.array(scanItemSchema)
]);

/**
 * @route   POST /api/impact/summary
 * @desc    Calculate CO2 saved, category breakdown, weekly trend, trees-equivalent and badges from client history
 * @access  Public
 */
router.post('/summary', validate(impactSummarySchema, 'body'), getImpactSummary);

export default router;
