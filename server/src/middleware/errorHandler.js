import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Centralized Express error-handling middleware
 */
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred on the server.';

  // Handle standard JSON syntax error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = 'Malformed JSON payload provided.';
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    errorCode = 'UPLOAD_ERROR';
  }

  // Handle AI timeout or connection errors
  if (err.name === 'AbortError' || err.message?.includes('timeout')) {
    statusCode = 504;
    errorCode = 'AI_TIMEOUT';
    message = 'The Vision AI service timed out while processing the image. Please try again.';
  }

  // Log error (with stack trace for non-operational or 500s)
  if (statusCode >= 500) {
    logger.error(`[${errorCode}] ${message}`, {
      url: req.originalUrl,
      method: req.method,
      stack: err.stack
    });
  } else {
    logger.warn(`[${errorCode}] ${message} (Path: ${req.originalUrl})`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message
    }
  });
}
