# Security

## Current guarantees and limits

Local configuration defaults to a `demo-` Firebase project. API configuration requires both emulator hosts outside production and rejects demo projects/emulator hosts in production. The browser factory is lazy and rejects unsafe development configuration; pages do not invoke it. The API has no authenticated business endpoints, no Admin client, and no broker connection in Phase 0.

This is a security-conscious foundation, not a production-hardened deployment. Security rules are tracked for emulator/CI verification and must be explicitly deployed and reviewed before any real Firebase client access.

## Firebase trust boundary

- Email/password sign-in is planned for Phase 1. Verify Firebase ID tokens server-side using Admin and, when appropriate, revocation checks.
- Authorize every tenant resource against a trusted membership document, with owner/admin mutations and viewer reads. Never trust a plain tenantId in request bodies or unverified custom claims.
- Current Firestore rules read trusted `tenants/{tenantId}/members/{uid}` roles. Browser clients cannot create or update their own memberships. Future trusted provisioning must enforce owner lifecycle and role changes server-side.
- Rules permit members to read their tenant/device/telemetry/aggregate/alert data, their own membership, and administrators to read tenant audit logs. Unlisted paths and every client write are denied.
- Firebase Admin bypasses rules: use cases must enforce identical tenant/role boundaries. Rules alone cannot secure backend writes.
- Firebase app identifiers/API keys are public config, not server credentials. Never expose Admin keys, application credentials, broker passwords, or raw device secrets through `NEXT_PUBLIC_*` or browser-readable documents.
- Security rules do not filter results. Query the tenant-scoped collections and use bounded, compatible queries. Current member read rules authorize reads but do not themselves enforce page-size caps; enforce sensible query bounds and budgets in application code.

## MQTT trust boundary

The Compose broker allows anonymous plaintext access solely for isolated local development, binds published ports to 127.0.0.1, and uses no production credentials. Any process on the workstation with broker access can impersonate a device. This is intentionally unsuitable for production or shared/untrusted hosts. Container peers on the local Compose network can also reach it.

Before production: provision unique device identities; require TLS with certificate validation; disable anonymous access; use authentication and explicit per-principal ACLs; rotate/revoke credentials; configure packet/connection limits and per-client rates. The unconnected `acl.example` illustrates exact topic grants; it does not activate authorization. A username/password file alone does not establish topic authorization without ACLs.

The broker must bind an authenticated device to its authorized topic. The ingestion service verifies topic structure, device registration/active state, payload DTO, topic/payload consistency, timestamp policy, and idempotency. Payload tenantId is untrusted. Plan retained-message policy, replay limits, QoS/retry handling, and dead-letter/backpressure behavior explicitly.

## Environment and secrets

`pnpm env:setup` copies only emulator examples and never overwrites existing environment files. Environment files, credential key files, and build outputs are ignored. Docker build context excludes secrets. Production should use workload identity/Application Default Credentials and managed secret injection; keep any local service-account file outside the repository. Never paste credentials into docs, commit history, logs, or shell command arguments.

Only local simulator examples may use non-secret identifiers; no real account/password is invented. Host emulator configuration listens on all interfaces for container support, so do not expose it outside a trusted workstation. Docker-published emulator ports are loopback only.

## HTTP, logging, and browser

Exact-origin CORS, bounded body size, in-memory rate limiting, sanitized unexpected-error responses, request IDs, and Pino structured logging are configured. Authorization/cookie headers are redacted. Add authentication, request DTO validation, consistent application errors, audit logs, security headers/CSP, distributed rate limiting, deliberate proxy trust, and monitoring in their implementation phases. CORS limits browser access and is not authentication.

The placeholder web pages perform no sensitive actions and use accessible semantic navigation and empty states. Future listeners must stop on logout/tenant changes, avoid cross-tenant caches, and surface permission errors. Do not store Firebase ID tokens or broker credentials in ad hoc localStorage.

## Verification

Unit tests cover strict telemetry DTO rejection, safe API configuration, basic health, and the CORS allowlist. Emulator rules tests verify authorized same-tenant reads, cross-tenant/unauthenticated denial, backend-only writes, and role-scoped audit reads. They are designed for the demo emulator, never production. CI provisions Java 21 to run them. Broader authorization, ingestion, and browser E2E tests are future work.
