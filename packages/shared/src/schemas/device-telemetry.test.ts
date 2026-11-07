import { describe, expect, it } from 'vitest';
import { deviceTelemetrySchema } from './device-telemetry.js';

const valid = {
  schemaVersion: 1,
  eventId: 'a6446db9-a428-44e1-86bc-72b11e75fb2f',
  tenantId: 'tenant-demo',
  deviceId: 'virtual-001',
  timestamp: '2026-11-07T12:00:00.000Z',
  metrics: {
    temperatureC: 24.5,
    humidityPercent: 55,
    motionDetected: false,
    batteryPercent: 90,
  },
};

describe('telemetry contract', () => {
  it('accepts a UTC telemetry event', () => {
    expect(deviceTelemetrySchema.parse(valid)).toEqual(valid);
  });
  it.each([
    { ...valid, schemaVersion: 2 },
    { ...valid, tenantId: 'tenant/other' },
    { ...valid, deviceId: '+' },
    { ...valid, eventId: 'not-a-uuid' },
    { ...valid, timestamp: '2026-11-07T12:00:00+05:30' },
    { ...valid, timestamp: '2026-02-30T12:00:00Z' },
    { ...valid, extra: true },
    { ...valid, metrics: { ...valid.metrics, humidityPercent: 101 } },
    { ...valid, metrics: { ...valid.metrics, batteryPercent: -1 } },
    { ...valid, metrics: { ...valid.metrics, temperatureC: '24' } },
    { ...valid, metrics: { ...valid.metrics, temperatureC: Infinity } },
    { ...valid, metrics: { ...valid.metrics, unexpected: 42 } },
  ])('rejects malformed, out-of-range, or ambiguous payloads %#', (payload) => {
    expect(deviceTelemetrySchema.safeParse(payload).success).toBe(false);
  });
});
