# ADR 0004: throttled latest state and authorized Firestore listeners

Status: accepted for design; not implemented in Phase 0.

Context: writing every MQTT message and attaching unbounded listeners would amplify Firestore cost and contention. A browser MQTT connection would expose broker trust/configuration and bypass the desired read authorization model.

Decision: ingest through the backend; validate, deduplicate, and throttle latest-state documents per device. Sample/aggregate history separately. Subscribe from authenticated browsers to specific authorized documents or bounded tenant queries with cleanup and explicit loading/error states.

Consequences: dashboards see recent bounded-rate updates rather than every broker packet. There is extra ingestion state, event-ordering logic, trailing-flush and recovery complexity. Dedupe receipts must cover events omitted from sampled history. Horizontal workers require coordinated device ownership or shared atomic policy. Measure writes, reads, contention, and latency before raising device volume.
