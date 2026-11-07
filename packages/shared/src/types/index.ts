import type { z } from 'zod';
import type { deviceTelemetrySchema } from '../schemas/device-telemetry.js';
import type { MEMBERSHIP_ROLES } from '../constants/index.js';

export type DeviceTelemetry = z.infer<typeof deviceTelemetrySchema>;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];
