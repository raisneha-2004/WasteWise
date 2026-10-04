import rateLimit from 'express-rate-limit';

/**
 * Custom rate limit handler returning standardized error JSON
 */
function rateLimitHandler(message, code = 'RATE_LIMIT_EXCEEDED') {
  return (req, res, next, options) => {
    res.status(options.statusCode).json({
      success: false,
      error: {
        code,
        message
      }
    });
  };
}

/**
 * Strict rate limiter for AI analysis endpoint (20 requests per 15 mins per IP)
 */
export const analyzeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler(
    'Too many waste analysis requests from this IP. Please wait 15 minutes before trying again.',
    'ANALYZE_RATE_LIMIT_EXCEEDED'
  )
});

/**
 * Standard rate limiter for general endpoints (100 requests per 15 mins per IP)
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler(
    'Too many requests from this IP. Please try again after a few minutes.',
    'RATE_LIMIT_EXCEEDED'
  )
});
