# Firestore data model

This is the proposed model. Phase 0 provisions rules and an empty index manifest, not live data or repository adapters. All writes use Firebase Admin through authorized backend use cases; Admin bypasses security rules, so backend authorization is mandatory.

## Collections and documents

| Path                                           | Proposed fields and purpose                                                                                                                                                                   |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tenants/{tenantId}`                           | `schemaVersion: 1`, `tenantId`, `name`, `createdAt`, `updatedAt`                                                                                                                              |
| `tenants/{tenantId}/members/{uid}`             | `schemaVersion`, `tenantId`, `uid`, `role: owner/admin/viewer`, `createdAt`, `updatedAt`; trusted server-managed authorization                                                                |
| `tenants/{tenantId}/devices/{deviceId}`        | `schemaVersion`, `tenantId`, `deviceId`, metadata (`name`, `type`, assignment), `status`, `active`, `lastSeenAt`, `latestReading`, `latestEventId`, `latestEventAt`, `createdAt`, `updatedAt` |
| `.../devices/{deviceId}/telemetry/{eventId}`   | Immutable validated telemetry fields, `receivedAt`, `expiresAt`; immutable except TTL deletion                                                                                                |
| `.../devices/{deviceId}/aggregates/{bucketId}` | `schemaVersion`, `tenantId`, `deviceId`, `bucketStart`, `bucketEnd`, count/min/max/mean for numeric metrics, `updatedAt`                                                                      |
| `tenants/{tenantId}/alerts/{alertId}`          | `schemaVersion`, `tenantId`, `deviceId`, rule ID/version, severity, status, observed value, threshold, `triggeredAt`, `acknowledgedAt`, `acknowledgedBy`, `createdAt`, `updatedAt`            |
| `tenants/{tenantId}/auditLogs/{eventId}`       | `schemaVersion`, `tenantId`, optional `deviceId`, actor UID, action, resource, request ID, `createdAt`; exclude secrets                                                                       |

Firestore persistence timestamps use native Timestamp values; MQTT/HTTP DTOs use ISO 8601 UTC strings. Define serialization at adapter boundaries. `lastSeenAt` is server receipt time; `latestEventAt` is event time. A device can be alive while an older out-of-order event must not replace the latest reading.

Device secrets are never stored on browser-readable device documents. Plan a separate Admin-only credential store with hashed/derived credentials and broker-side identity mapping. Retain schemaVersion on stored documents and explicit migration plans when contracts change.

## Queries and index policy

| Access pattern              | Query and bound                                                                     | Index decision                                              |
| --------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Latest device reading       | Exact authorized device document                                                    | No composite index                                          |
| Device list                 | Tenant subcollection, order `updatedAt desc`, `limit(50)`, cursor pagination        | Single-field index initially                                |
| Active/status device filter | Tenant device query, equality filter(s) + order                                     | Add composite only when implemented query is known          |
| Device history              | Exact device telemetry collection, timestamp range + order, capped window/page size | Single-field timestamp index initially                      |
| Alert queue                 | Tenant alerts, `status == open`, order `triggeredAt desc`, limit                    | Planned composite `status ASC, triggeredAt DESC` in Phase 5 |
| Aggregate chart             | Exact device aggregates, bounded bucketStart range + order                          | Single-field initially                                      |
| Audit history               | Tenant auditLogs, createdAt order, optional actor/device filter, limit              | Add composite for concrete implemented filters              |

`infra/firebase/firestore.indexes.json` is intentionally empty: Phase 0 executes no application queries. Do not create speculative composite indexes. Before persistence launches, exempt unqueried metric maps, raw metadata maps, idempotency payloads, and TTL fields from indexing where supported. Avoid collection-group queries without explicit tenant constraints and compatible rules.

## Retention and deduplication

History should be sampled/aggregated, not written at incoming MQTT frequency. Proposed initial history retention is 30 days, pending product approval. Set an `expiresAt` Timestamp and enable a Firestore TTL policy through infrastructure/deployment configuration in Phase 4. Merely defining that field does not enable TTL. TTL deletion is asynchronous, can incur deletion costs, and does not delete subcollections; emulators do not guarantee production TTL behavior. Queries must enforce user-facing time windows even before cleanup completes.

Sampling history cannot reliably deduplicate every event. Plan separate Admin-only ingestion receipt records (for example a per-device `ingestionReceipts/{eventId}` subcollection) with a defined TTL, transactional conditional creation, and enough lifetime to cover the accepted replay window. Default-deny rules already block that unlisted path. No receipt collection or TTL policy is currently implemented.

## Cost and contention

At one latest-state write every 5 seconds, a continuously active device produces up to 17,280 latest-state writes/day; history sampled every 60 seconds adds up to 1,440 writes/day, before receipts, aggregates, alerts, and retries. Each active subscriber also drives read costs for matching document changes and initial/reconnect reads. Treat these as illustrative upper bounds, not quotas or pricing estimates.

Subscribe to a selected authorized device or bounded list, clean up listeners, and pause hidden/unneeded views. Per-device documents prevent a global hotspot, but a single high-rate device still needs throttling and transaction contention management. For horizontal ingestion workers, a process-local throttle/dedupe map is insufficient; establish ownership/partitioning or shared atomic coordination. Reassess Firestore economics and history storage as volume grows.
