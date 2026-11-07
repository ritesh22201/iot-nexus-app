# ADR 0001: Firestore as the initial operational store

Status: accepted for initial architecture.

Context: the planned product needs authorized realtime device views and managed persistence with Firebase Authentication. A relational database offers stronger relational constraints, SQL analytics, and transactional joins, but would require a separate realtime subscription path.

Decision: use tenant-scoped Firestore documents for device state, sampled history, membership, alerts, and audits. Use Admin-only writes and browser reads authorized by rules. Keep persistence behind explicit repository ports.

Consequences: easy targeted listeners and emulator-supported development, alongside denormalization, per-operation cost, query/index constraints, limited joins, and document contention. High-volume telemetry may eventually require a dedicated timeseries/analytical store. Repository ports help isolate that change; they do not make migrations automatic.
