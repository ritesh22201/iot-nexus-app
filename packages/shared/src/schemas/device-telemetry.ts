import { z } from 'zod';
import { SCHEMA_VERSION } from '../constants/index.js';

// IDs are also path segments; forbid slashes, MQTT wildcards, and whitespace.
export const resourceIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/);

export const deviceTelemetrySchema = z.strictObject({
  schemaVersion: z.literal(SCHEMA_VERSION),
  eventId: z.uuid(),
  tenantId: resourceIdSchema,
  deviceId: resourceIdSchema,
  timestamp: z.iso.datetime({ offset: false }),
  metrics: z.strictObject({
    temperatureC: z.number().min(-50).max(125),
    humidityPercent: z.number().min(0).max(100),
    motionDetected: z.boolean(),
    batteryPercent: z.number().min(0).max(100),
  }),
});
