# Setup verification

Verified on 2026-11-07 using Node.js 24.21.0 and pnpm 12.9.1. Scope: Phase 0 only. No cloud resources, production accounts, or paid services were used, and no application deployment was performed.

## Final results

| Command/check                                       | Outcome                                                                                                                                      |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`                                      | Passed after correcting the Firebase rules-test peer major and pnpm 12 build-script allowlist; lockfile generated                            |
| `pnpm install --frozen-lockfile --offline`          | Passed; manifests and lockfile agree                                                                                                         |
| `pnpm peers check`                                  | Passed; no peer dependency issues                                                                                                            |
| `pnpm env:setup`                                    | Passed; copied emulator-safe app examples; a second run preserved existing files                                                             |
| `pnpm lint`                                         | Passed across applications/contracts plus root scripts, configuration, and rules tests                                                       |
| `pnpm typecheck`                                    | Passed; strict app/shared checks, Next route types, and infrastructure test types                                                            |
| `pnpm test`                                         | Passed: 13 telemetry contract cases and 3 API foundation cases                                                                               |
| `pnpm build`                                        | Passed: shared ESM/declarations, API, simulator, and all Next.js pages                                                                       |
| `pnpm format:check`                                 | Passed                                                                                                                                       |
| `git diff --check`                                  | Passed                                                                                                                                       |
| `docker compose config --quiet`                     | Passed                                                                                                                                       |
| `docker compose --profile emulators config --quiet` | Passed                                                                                                                                       |
| `pnpm --filter @iot-nexus/simulator start`          | Passed; printed explicit scaffold status and published nothing                                                                               |
| `pnpm dev`                                          | Passed; web and API started; stopped after HTTP verification                                                                                 |
| Loopback HTTP checks                                | `/`, `/dashboard`, `/devices`, `/telemetry`, `/alerts`, `/auth`: 200 with expected content; `/health` and `/ready`: 200 with documented JSON |
| Firestore emulator rules suite                      | Passed: 4 tests covering tenant reads, unauthorized reads, forbidden direct writes, and audit roles; emulator stopped cleanly                |

The HTTP smoke check used Python's standard-library urllib client against the actual development servers. It verified server-rendered content and responses, not browser rendering or interaction. Browser E2E remains planned for a later phase.

## Temporary Java runtime for rules tests

The installed host Java is version 17. A temporary Temurin Java 21 runtime and Firestore emulator were downloaded under `/tmp`; the system Java configuration was not changed. The exact successful command was:

```sh
env JAVA_HOME=/tmp/iot-nexus-jre21/Contents/Home PATH="/tmp/iot-nexus-jre21/Contents/Home/bin:$PATH" XDG_CONFIG_HOME=/tmp/iot-nexus-firebase-config FIREBASE_EMULATORS_PATH=/tmp/iot-nexus-firebase-emulators CI=true pnpm test:rules:emulated
```

These temporary paths are verification artifacts, not project prerequisites. Normal local use should install/select Java 21+ and run `pnpm test:rules:emulated`, or run the provided emulator container and use `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 pnpm test:rules`.

## Issues found and resolved

- The first metadata/install attempts without network permission failed due to sandbox DNS restrictions. Installation succeeded with network access.
- The initial Firebase rules testing major required Firebase 12, while the browser SDK is Firebase 13. Updated to rules-unit-testing 6 and confirmed peer compatibility.
- pnpm 12 uses the `allowBuilds` policy. Explicitly allowed required Firebase/esbuild/protobuf/optional native builds and denied the unused optional re2 build. The Firebase CLI and tests run successfully with this policy.
- Strict typechecking found an unknown Fastify error value; added type narrowing before reading statusCode.
- Next.js Turbopack CSS compilation failed because its internal port binding was prohibited, including on an elevated retry. Configured supported Webpack mode for both dev/build; the production build and dev command then passed.
- A bare Firebase CLI version probe hit a sandbox-protected user configuration directory. The rules test run used a temporary XDG config directory instead, without changing user permissions.

## Remaining verification limits

Docker CLI is installed, but `docker info --format '{{.ServerVersion}}'` failed because Docker Desktop/Engine was not running. Both Compose configurations were validated, but images were not built or started: broker connectivity and the Firebase Dockerfile runtime remain unverified. Start Docker and run `pnpm emulators:docker` to verify that path. The Firestore emulator and its rules were tested directly using temporary Java 21.

No MQTT ingestion, publisher, persistence adapter, authentication flow, or live browser subscription exists yet, so no end-to-end telemetry claim is made. CI is configured but has not been executed on a remote provider. Upstream transitive dependency deprecation notices remain; installation and the requested checks pass.
