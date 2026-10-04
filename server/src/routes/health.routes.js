import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Get backend operational status, uptime, and system diagnostics
 * @access  Public
 */
router.get('/', getHealth);

export default router;
