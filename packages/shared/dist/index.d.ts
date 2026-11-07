import { z } from 'zod';

declare const SCHEMA_VERSION: 1;
declare const MEMBERSHIP_ROLES: readonly ["owner", "admin", "viewer"];
declare const TELEMETRY_TOPIC_FILTER = "tenants/+/devices/+/telemetry";

declare const resourceIdSchema: z.ZodString;
declare const deviceTelemetrySchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    eventId: z.ZodUUID;
    tenantId: z.ZodString;
    deviceId: z.ZodString;
    timestamp: z.ZodISODateTime;
    metrics: z.ZodObject<{
        temperatureC: z.ZodNumber;
        humidityPercent: z.ZodNumber;
        motionDetected: z.ZodBoolean;
        batteryPercent: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;

type DeviceTelemetry = z.infer<typeof deviceTelemetrySchema>;
type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export { type DeviceTelemetry, MEMBERSHIP_ROLES, type MembershipRole, SCHEMA_VERSION, TELEMETRY_TOPIC_FILTER, deviceTelemetrySchema, resourceIdSchema };
