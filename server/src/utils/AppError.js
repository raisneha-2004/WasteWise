export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 500)
   * @param {string} errorCode - Machine-readable error code (e.g. 'VALIDATION_ERROR', 'AI_SERVICE_UNAVAILABLE')
   */
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
