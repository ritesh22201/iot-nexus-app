import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import type { ApiConfig } from './config/env.js';

export async function buildApp(config: ApiConfig) {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    },
    bodyLimit: 64 * 1024,
    // Enable proxy trust only after a trusted production proxy is configured.
    trustProxy: false,
  });
  await app.register(cors, { origin: config.CORS_ORIGINS, credentials: false });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  app.setErrorHandler((error, request, reply) => {
    const candidateStatus =
      error && typeof error === 'object' && 'statusCode' in error
        ? error.statusCode
        : undefined;
    const statusCode =
      typeof candidateStatus === 'number' &&
      candidateStatus >= 400 &&
      candidateStatus < 500
        ? candidateStatus
        : 500;
    if (statusCode === 500) request.log.error({ err: error }, 'Request failed');
    return reply.code(statusCode).send({
      error: statusCode === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message:
        statusCode === 500
          ? 'An unexpected error occurred'
          : 'Request could not be processed',
      requestId: request.id,
    });
  });
  app.get('/health', async () => ({ status: 'ok', service: 'iot-nexus-api' }));
  app.get('/ready', async () => ({
    status: 'ready',
    scope: 'scaffold',
    integrations: 'not-connected',
  }));
  // Add authenticated modules here in Phase 1; infrastructure is deliberately not connected.
  return app;
}
