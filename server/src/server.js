import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`=======================================================`);
  logger.info(`  ♻️  WasteWise AI Backend is running on port: ${PORT} `);
  logger.info(`  🌐  Base URL: http://localhost:${PORT}             `);
  logger.info(`  🌱  Environment: ${env.NODE_ENV}                   `);
  logger.info(`  🤖  Vision Provider: ${env.VISION_PROVIDER}         `);
  logger.info(`=======================================================`);
});

// Handle unhandled Promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception caught (prevented server crash):', err);
});

// Graceful shutdown on termination signals
const handleShutdown = (signal) => {
  logger.info(`${signal} signal received. Closing HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default server;
