// src/constants/index.ts
var SCHEMA_VERSION = 1;
var MEMBERSHIP_ROLES = ["owner", "admin", "viewer"];
var TELEMETRY_TOPIC_FILTER = "tenants/+/devices/+/telemetry";

// src/schemas/device-telemetry.ts
import { z } from "zod";
var resourceIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/);
var deviceTelemetrySchema = z.strictObject({
  schemaVersion: z.literal(SCHEMA_VERSION),
  eventId: z.uuid(),
  tenantId: resourceIdSchema,
  deviceId: resourceIdSchema,
  timestamp: z.iso.datetime({ offset: false }),
  metrics: z.strictObject({
    temperatureC: z.number().min(-50).max(125),
    humidityPercent: z.number().min(0).max(100),
    motionDetected: z.boolean(),
    batteryPercent: z.number().min(0).max(100)
  })
});
export {
  MEMBERSHIP_ROLES,
  SCHEMA_VERSION,
  TELEMETRY_TOPIC_FILTER,
  deviceTelemetrySchema,
  resourceIdSchema
};
