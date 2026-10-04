import { Router } from 'express';
import { z } from 'zod';
import { getCenters } from '../controllers/centers.controller.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const centersQuerySchema = z.object({
  lat: z.string().regex(/^-?\d+(\.\d+)?$/, 'lat must be a valid float').optional(),
  lng: z.string().regex(/^-?\d+(\.\d+)?$/, 'lng must be a valid float').optional(),
  category: z.string().optional(),
  radiusKm: z.string().regex(/^\d+(\.\d+)?$/, 'radiusKm must be a positive number').optional(),
  page: z.string().regex(/^\d+$/, 'page must be an integer').optional(),
  limit: z.string().regex(/^\d+$/, 'limit must be an integer').optional()
});

/**
 * @route   GET /api/centers
 * @desc    Find recycling centers with haversine distance, category filters, radius filter and pagination
 * @access  Public
 */
router.get('/', validate(centersQuerySchema, 'query'), getCenters);

export default router;
