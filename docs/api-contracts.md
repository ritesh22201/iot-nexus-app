# API contracts

## Implemented

Base URL in development: `http://127.0.0.1:3001`. JSON responses. No authentication is required for process health endpoints.

| Endpoint      | Status | Body                                                                          |
| ------------- | ------ | ----------------------------------------------------------------------------- |
| `GET /health` | 200    | `{ "status": "ok", "service": "iot-nexus-api" }`                              |
| `GET /ready`  | 200    | `{ "status": "ready", "scope": "scaffold", "integrations": "not-connected" }` |

Readiness is explicitly limited to Phase 0 process initialization. Add real dependency checks and return 503 for unavailable required integrations in later phases.

Unexpected errors return a sanitized `{ error, message, requestId }` body; server logs include the internal error. Fastify/plugin-generated errors such as not-found, rate-limit, and CORS may retain their standard envelopes. Normalize those when the versioned application API is introduced. Default body limit is 64 KiB and in-memory per-IP rate limiting is 100 requests/minute; tune/distribute limits and configure trusted proxies before scaling.

## Planned authenticated HTTP API

All routes below are design proposals and currently return 404. Use `/v1`, shared Zod DTOs, `Authorization: Bearer <Firebase ID token>`, verified membership, tenant scoping, and server-side roles. The server must ignore any client claim to membership unless verified against trusted membership data.

| Endpoint                                                     | Intended role/purpose                                       |
| ------------------------------------------------------------ | ----------------------------------------------------------- |
| `GET /v1/tenants/:tenantId/devices`                          | Member; bounded cursor list                                 |
| `POST /v1/tenants/:tenantId/devices`                         | Owner/admin; register device and trusted credential mapping |
| `GET /v1/tenants/:tenantId/devices/:deviceId`                | Member; device metadata                                     |
| `PATCH /v1/tenants/:tenantId/devices/:deviceId`              | Owner/admin; validated updates/assignment/deactivation      |
| `POST /v1/tenants/:tenantId/alerts/:alertId/acknowledgments` | Owner/admin; idempotent acknowledgment                      |

Decide request idempotency, cursor format, error codes, pagination caps, concurrency controls, and audit records before implementing those routes. Authentication and tenant provisioning are Phase 1; no bypass endpoint is supplied for setup.

## Shared MQTT telemetry DTO

Topic: `tenants/{tenantId}/devices/{deviceId}/telemetry`.

```json
{
  "schemaVersion": 1,
  "eventId": "a6446db9-a428-44e1-86bc-72b11e75fb2f",
  "tenantId": "tenant-demo",
  "deviceId": "virtual-001",
  "timestamp": "2026-11-07T12:00:00.000Z",
  "metrics": {
    "temperatureC": 24.5,
    "humidityPercent": 55,
    "motionDetected": false,
    "batteryPercent": 90
  }
}
```

`deviceTelemetrySchema` is implemented in `packages/shared`. Event IDs are UUIDs. Tenant/device IDs are 1–64 ASCII alphanumeric/underscore/hyphen characters with an alphanumeric first character. Timestamps must be valid ISO UTC strings ending in Z. Unknown fields are rejected at both levels. Temperature range: -50 to 125 °C; humidity/battery: 0–100; motion: boolean. Numbers must be finite and are not coerced from strings.

Topic identity, device authorization, accepted message age/future skew, duplicate handling, and broker packet limits belong to future ingestion, beyond DTO validation. The example timestamp is illustrative; it is not a valid current timestamp for a future freshness-enforced publisher.

## Planned realtime contract

Authenticated clients may listen to a specific tenant device document, or bounded tenant queries permitted by rules. Every onSnapshot subscription must return its unsubscribe function through effect cleanup, expose loading/error/empty states, and respond to tenant/auth changes. No listener or fabricated live values are implemented in Phase 0.
