# Requirements

## Scope and status

The current delivery is Phase 0 setup only. The original architecture brief also described a minimal vertical slice; the follow-up request to perform only setup takes precedence. No active MQTT subscriber, telemetry publisher, Firestore adapter, sign-in flow, or realtime dashboard is implemented.

## Setup acceptance criteria

- pnpm workspaces contain web, API, simulator, shared contracts, and shared config; Turborepo orders dependent builds.
- Web renders an accessible responsive shell, navigation, and explicitly labeled placeholders.
- API exposes process health and scaffold readiness, with structured logging, bounded request bodies, allowlisted CORS, rate limiting, error handling, and graceful shutdown.
- A strict versioned shared telemetry DTO rejects malformed identifiers, non-UTC timestamps, unsupported versions, unknown fields, and out-of-range metrics.
- Configuration examples are emulator-safe; server secrets never enter browser code.
- Local Docker MQTT and optional Firebase emulators are documented; tests require no paid services.
- Tenant-scoped Firestore read rules deny direct sensitive client writes.
- Lint, typecheck, tests, builds, and formatting checks have runnable commands and CI jobs.
- Architecture, data model, API boundaries, security, decisions, and milestones are documented.

## Planned functional requirements

| Phase | Capability                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Email/password Auth, organization memberships (owner/admin/viewer), verified ID tokens, registration/update/assignment/deactivation of devices   |
| 2     | Unique device credentials, broker ACLs, synthetic temperature/humidity/motion/battery every 5 seconds, validated and deduplicated MQTT ingestion |
| 3     | Throttled Firestore latest state, explicit status and lastSeenAt, authorized bounded onSnapshot listeners and cleanup                            |
| 4     | History queries by time window, sampled events, aggregation, charts, pagination, indexes, TTL                                                    |
| 5     | Threshold policies, acknowledgments, online/offline detection, timeout jobs, configuration and scenarios                                         |
| 6     | Audit trails, performance limits, deployment, credential rotation, operational hardening and Playwright E2E                                      |

## Nonfunctional requirements

Strict TypeScript; no explicit any; explicit dependency injection; business policies independent of Fastify, Firestore, and MQTT; structured logs without credentials; tenant isolation; UTC time; schema versioning; idempotent ingestion; bounded resource consumption; sensible read/write cost; accessible responsive pages; no fake production integrations; meaningful tests using in-memory doubles and emulators.

Production reliability, availability targets, expected tenant/device counts, retention duration, and compliance requirements remain open decisions. Phase 0 makes no production SLO guarantee.
