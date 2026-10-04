import { Router } from 'express';
import { z } from 'zod';
import { askAssistant } from '../controllers/assistant.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const assistantQuerySchema = z.object({
  question: z.string().min(2, 'Question must be at least 2 characters long').max(500, 'Question too long'),
  language: z.string().optional().default('hinglish'),
  context: z
    .object({
      lastItem: z.string().optional(),
      category: z.string().optional()
    })
    .optional()
    .default({})
});

/**
 * @route   POST /api/assistant/ask
 * @desc    Ask waste sorting, recycling, and disposal questions in Hinglish or English (max 2 sentences)
 * @access  Public
 */
router.post('/ask', validate(assistantQuerySchema, 'body'), askAssistant);

export default router;
