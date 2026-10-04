import { env } from '../config/env.js';

/**
 * Controller for health check and server status
 */
export function getHealth(req, res) {
  const uptimeSeconds = process.uptime();
  const memory = process.memoryUsage();

  return res.status(200).json({
    status: 'ok',
    success: true,
    data: {
      status: 'healthy',
      service: 'WasteWise AI Backend',
      version: '1.0.0',
      uptimeSeconds: Math.floor(uptimeSeconds),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      vision: {
        provider: env.VISION_PROVIDER,
        isKeyConfigured: Boolean(env.VISION_API_KEY)
      },
      memory: {
        rssMb: Math.round((memory.rss / (1024 * 1024)) * 100) / 100,
        heapUsedMb: Math.round((memory.heapUsed / (1024 * 1024)) * 100) / 100
      }
    }
  });
}
