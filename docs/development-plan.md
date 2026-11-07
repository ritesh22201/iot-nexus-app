# Development plan

## Phase 0 — foundation (current delivery)

Workspace/tooling, strict shared telemetry contract, placeholder frontend, health server, simulator stub, secure environment templates, local broker/emulator definitions, Firestore rules, meaningful setup tests, CI, and architecture documentation. Acceptance: install and the documented checks pass; external runtime checks are reported honestly when Docker/Java are unavailable. No active vertical slice is claimed.

## Phase 1 — authentication, tenancy, devices

Implement Firebase email/password Auth and token verification, trusted tenant/member provisioning, owner/admin/viewer policies, validated device registration/update/assignment/deactivation, and audit records. Acceptance: emulator integration tests prove tenant isolation and role restrictions; browser cannot mutate membership or device state directly; secrets never appear in device reads. Define production project/bootstrap procedures.

## Phase 2 — simulation and ingestion

Implement one realistic virtual device every 5 seconds, explicit local insecure mode, secure production MQTT configuration, exact topics, broker principal/ACL mapping, bounded message parsing, timestamp/active-device validation, and transactional idempotency. Acceptance: valid messages pass, malformed/old/future/unauthorized/replayed messages fail; reconnect/shutdown and duplicate delivery behavior tested without paid services. Do not claim production auth from anonymous local mode.

## Phase 3 — latest state and realtime dashboard

Implement Firestore adapter through repository ports, newest-event ordering, throttled latest writes, trailing flush, lastSeenAt, and authorized single-device onSnapshot with cleanup/loading/error/empty states. Acceptance: simulator → MQTT → API → emulator → authenticated dashboard works; cross-tenant listeners fail; history sampling and duplicate handling do not regress latest state. Replace scaffold readiness with actual dependency readiness.

## Phase 4 — history, aggregation, charts

Implement bounded time windows, sampled immutable history, aggregate buckets, Recharts views, cursor pagination, concrete indexes/index exemptions, and configured TTL policies. Acceptance: query/index tests, retention limitations documented, ingestion budgets measured; dedupe independent of history sampling.

## Phase 5 — alerts and device health

Implement threshold policies, idempotent triggering/acknowledgment, online/offline detection with backend scheduling, configuration/scenarios, filters, and operational metrics. Acceptance: deterministic clock tests prove timeout and alert behavior; every mutation is authorized and audited.

## Phase 6 — production hardening and deployment

Add production Docker images/deployment, managed identity/secrets, MQTT TLS/ACL rotation, security headers/CSP, distributed throttling/ownership, durable replay/backpressure strategy, observability, budgets, load tests, backup/restore, dependency scanning, and Playwright E2E. Acceptance: agreed SLOs and threat model, reviewed rules and infrastructure, failure/recovery drills, documented rollback.

## Deliberately deferred

No login form, organization bootstrap, device CRUD, MQTT subscriber/publisher, Firestore persistence adapter, active listeners, charts, history, alerts, deployment, seeded credentials, or production credentials in this setup. No Playwright dependency/config until E2E behavior exists to test.
