import { calculateImpactSummary } from '../services/impact.service.js';

/**
 * Controller to calculate aggregated impact summary from scan history
 */
export async function getImpactSummary(req, res, next) {
  try {
    // Accommodate both { history: [...] } or array directly in body
    const history = Array.isArray(req.body) ? req.body : req.body.history || [];

    const summary = calculateImpactSummary(history);

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
}
