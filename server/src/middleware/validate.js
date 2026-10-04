import { AppError } from '../utils/AppError.js';

/**
 * Validates request parts (body, query, params) against a Zod schema
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errorDetails = result.error.errors
        .map((err) => `${err.path.join('.') || source}: ${err.message}`)
        .join(', ');

      return next(new AppError(`Validation error: ${errorDetails}`, 400, 'VALIDATION_ERROR'));
    }

    // Attach parsed/sanitized data back to request
    req[source] = result.data;
    next();
  };
}
