import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  VISION_PROVIDER: z.enum(['gemini', 'claude']).default('gemini'),
  VISION_API_KEY: z.string().optional().default('')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

if (!env.VISION_API_KEY) {
  logger.warn('VISION_API_KEY is not set or empty in .env. Mock vision analysis will be used as a fallback.');
}
