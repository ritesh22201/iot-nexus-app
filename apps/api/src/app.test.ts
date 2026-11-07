import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { loadConfig } from './config/env.js';

const environment = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
};
let app: FastifyInstance | undefined;
afterEach(async () => {
  await app?.close();
});

describe('API foundation', () => {
  it('distinguishes process health from future integration readiness', async () => {
    app = await buildApp(loadConfig(environment));
    const health = await app.inject('/health');
    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({ status: 'ok', service: 'iot-nexus-api' });
    const ready = await app.inject('/ready');
    expect(ready.json()).toEqual({
      status: 'ready',
      scope: 'scaffold',
      integrations: 'not-connected',
    });
  });
  it('allows only the configured browser origin', async () => {
    app = await buildApp(loadConfig(environment));
    const allowed = await app.inject({
      url: '/health',
      headers: { origin: 'http://localhost:3000' },
    });
    const denied = await app.inject({
      url: '/health',
      headers: { origin: 'https://untrusted.example' },
    });
    expect(allowed.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
  it('rejects unsafe configuration without leaking values', () => {
    expect(() =>
      loadConfig({ ...environment, NODE_ENV: 'production' }),
    ).toThrow('Invalid API configuration');
    expect(() =>
      loadConfig({ ...environment, FIREBASE_PROJECT_ID: 'live-project' }),
    ).toThrow();
    expect(() => loadConfig({ ...environment, CORS_ORIGINS: '*' })).toThrow();
    expect(() => loadConfig({ NODE_ENV: 'development' })).toThrow();
  });
});
