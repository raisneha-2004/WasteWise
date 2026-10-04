import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { AppError } from './utils/AppError.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';

import wasteRoutes from './routes/waste.routes.js';
import centersRoutes from './routes/centers.routes.js';
import impactRoutes from './routes/impact.routes.js';
import assistantRoutes from './routes/assistant.routes.js';
import healthRoutes from './routes/health.routes.js';
import { getCategories } from './controllers/waste.controller.js';

import { logger } from './utils/logger.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// Dynamic CORS configuration (Handles Vercel, Netlify, Render & Localhost)
const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  env.FRONTEND_URL,
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
]
  .filter(Boolean)
  .flatMap((url) => url.split(',').map((u) => u.trim().replace(/\/+$/, '')));

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow non-browser requests (curl, server-to-server, mobile)
  if (env.NODE_ENV === 'development') return true;

  const normalized = origin.replace(/\/+$/, '');

  // 1. Direct match in configured origins or localhost
  if (
    configuredOrigins.includes(normalized) ||
    normalized.includes('localhost') ||
    normalized.includes('127.0.0.1')
  ) {
    return true;
  }

  // 2. Allow any Vercel, Netlify, or Render domain
  try {
    const hostname = new URL(origin).hostname;
    if (
      hostname.endsWith('.vercel.app') ||
      hostname.endsWith('.netlify.app') ||
      hostname.endsWith('.onrender.com')
    ) {
      return true;
    }
  } catch {
    // Ignore URL parse error
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      logger.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(new AppError(`CORS policy: Access denied for origin ${origin}.`, 403, 'CORS_ERROR'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);

// HTTP request logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// Global General Rate Limiter (100 reqs/15m)
app.use(generalRateLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Root Information
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'WasteWise AI API',
      version: '1.0.0',
      description: 'Intelligent Waste Segregation & Environmental Impact Backend',
      endpoints: {
        analyzeWaste: 'POST /api/waste/analyze (multipart image upload)',
        confirmCategory: 'POST /api/waste/confirm',
        getCategories: 'GET /api/categories',
        getCenters: 'GET /api/centers?lat=&lng=&category=&radiusKm=',
        getImpactSummary: 'POST /api/impact/summary',
        askAssistant: 'POST /api/assistant/ask',
        healthCheck: 'GET /api/health'
      }
    }
  });
});

// Mount Routes
app.use('/api/waste', wasteRoutes);
app.use('/api/centers', centersRoutes);
app.get('/api/categories', getCategories);
app.use('/api/impact', impactRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/health', healthRoutes);

// Catch-all for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}. Endpoint not found.`, 404, 'NOT_FOUND'));
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
