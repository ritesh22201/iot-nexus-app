# IoT Nexus

Real-Time IoT Device Management & Monitoring System. A production-oriented TypeScript monorepo foundation, currently **Phase 0: setup only**.

The web shell and API health endpoints run locally. Authentication, device CRUD, MQTT ingestion, simulation, Firestore persistence, live subscriptions, charts, and alerts are **not implemented**. Dependencies and directory boundaries are prepared for them; no synthetic dashboard values or production integrations are presented as working features.

## Architecture

| Workspace         | Responsibility                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`        | Next.js App Router, React, Tailwind CSS, shadcn-compatible UI component, Firebase browser configuration, Recharts dependency |
| `apps/api`        | Fastify, Pino, Zod, Firebase Admin SDK and MQTT.js dependencies; modules split into domain, application, and HTTP layers     |
| `apps/simulator`  | Node.js/TypeScript entrypoint and future generator/publisher/scenario boundaries; currently logs scaffold status only        |
| `packages/shared` | Strict Zod telemetry schema, inferred DTO types, role constants                                                              |
| `packages/config` | Shared strict TypeScript and ESLint configuration                                                                            |
| `infra`           | Isolated development Mosquitto broker, optional Firebase emulator container, security rules and rules tests                  |

Business logic must depend on explicit repository/transport ports, with adapters supplied at the composition root. Browser code must never import Firebase Admin or MQTT credentials. See [architecture](docs/architecture.md).

## Prerequisites

- Node.js **24 LTS** (`nvm use`); pnpm **12.9.1** (`corepack enable && corepack prepare pnpm@12.9.1 --activate`). Alternatively install that pnpm version with your preferred package-manager installation method.
- Docker Engine/Desktop with Compose v2, running, for local MQTT and optional emulators.
- Java **21+** only if running Firebase emulators directly on the host. The optional container includes Java 21.
- No paid Firebase project, service-account key, or Firebase login is required for the demo emulators.

## Quick start

```sh
pnpm install
pnpm env:setup
pnpm dev
```

`env:setup` copies examples without overwriting existing files. Next.js reads `apps/web/.env.local`; API and simulator read their own `.env` using Node's environment-file support. The root `.env` is for Compose, not a universal application env file. Shell environment values override file values.

- Web: http://localhost:3000
- API health: http://127.0.0.1:3001/health
- API scaffold readiness: http://127.0.0.1:3001/ready

`/ready` reports process readiness and explicitly says integrations are not connected. It does not test Firestore or MQTT. Running the shell does not require infrastructure. API development configuration requires emulator-safe identifiers and host values, but Phase 0 opens no Firebase connections.

## Local infrastructure (optional in Phase 0)

Start only the broker:

```sh
pnpm infra:up
```

Start broker and emulators in Docker (no host Java required):

```sh
pnpm emulators:docker
```

Alternatively start the broker in Docker and emulators on a host with Java 21+:

```sh
pnpm infra:up
pnpm emulators
```

Choose one emulator method; do not run both on the same ports. Both use `demo-iot-nexus`, load the same security rules, and do not access production resources. Container images and the emulator runtime require network access on the first build. Emulator state is disposable; there is intentionally no production-like seed or test credential provisioning in Phase 0.

| Service            | Local endpoint          |
| ------------------ | ----------------------- |
| MQTT               | `mqtt://127.0.0.1:1883` |
| Firestore emulator | `127.0.0.1:8080`        |
| Auth emulator      | `http://127.0.0.1:9099` |
| Emulator UI        | `http://127.0.0.1:4000` |

All published Docker ports bind to loopback. The broker permits anonymous plaintext MQTT only for isolated development. **Do not deploy this Compose configuration or broker config to production.** Host-run emulators listen on all interfaces for compatibility with the container configuration; use a trusted workstation/firewall and never expose emulator ports to a network.

```sh
pnpm infra:down
```

This stops Compose services; stop a host-run emulator with Ctrl+C. Docker emulator state is discarded when its container is recreated.

## Commands

| Command                                                  | Result                                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `pnpm dev`                                               | Builds shared contracts, starts web and API in watch mode                                |
| `pnpm dev:simulator`                                     | Starts the simulator stub in watch mode; publishes nothing                               |
| `pnpm build`                                             | Builds shared contracts and all three apps                                               |
| `pnpm lint`                                              | ESLint for source workspaces                                                             |
| `pnpm typecheck`                                         | Strict TypeScript checks, including generated Next.js route types                        |
| `pnpm test`                                              | Contract and API foundation tests, no external services                                  |
| `pnpm format:check`                                      | Checks formatting                                                                        |
| `pnpm check`                                             | Lint, typecheck, unit tests, build                                                       |
| `pnpm test:rules:emulated`                               | Starts temporary Firestore emulator, tests rules, shuts emulator down; needs Java 21+    |
| `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 pnpm test:rules` | Tests against an already-running local emulator; clears demo-project Firestore test data |

Rules tests are separate from `pnpm test` so ordinary unit tests need neither Docker nor Java. They refuse non-loopback endpoints and use only the demo project. Do not point them at an emulator whose demo data you need to preserve. CI runs both suites, with Java 21 for rules tests.

The web scripts explicitly use Next.js Webpack mode for compatibility with restricted environments where Turbopack cannot open its internal CSS-processing port.

Shared contracts are compiled before dependent tasks. After editing `packages/shared` during development, run `pnpm --filter @iot-nexus/shared build` or keep `pnpm --filter @iot-nexus/shared dev` running in a second terminal.

After a build, `pnpm --filter @iot-nexus/web start` and `pnpm --filter @iot-nexus/api start` run the outputs. A production web start does not connect Firebase from the placeholder pages. To use real Firebase in a future production implementation, replace emulator-only public identifiers, disable emulator mode, provide server-only Application Default Credentials, and complete the security milestones first.

## Configuration

Examples live at the root and in each app. **Never commit `.env` files or service-account keys.**

| Variable                                                                | Scope                | Purpose                                                                                 |
| ----------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| `HOST`, `PORT`, `LOG_LEVEL`                                             | API                  | Bind address, port (3001), structured log level                                         |
| `CORS_ORIGINS`                                                          | API                  | Comma-separated exact browser origins; no wildcard or path                              |
| `FIREBASE_PROJECT_ID`                                                   | API                  | `demo-iot-nexus` locally; real project only in production                               |
| `FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`                | API                  | Both must be configured together locally; forbidden in production                       |
| `GOOGLE_APPLICATION_CREDENTIALS`                                        | Future API adapter   | Server-only credential path outside repo; prefer workload identity                      |
| `NEXT_PUBLIC_FIREBASE_*`                                                | Web                  | Public Firebase app identifiers; emulator examples are placeholders                     |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATORS`                                    | Web                  | Explicit local emulator mode; Firebase client initialization rejects this in production |
| `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST`                                   | Web                  | Loopback Firestore emulator host and port                                               |
| `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL`                                | Web                  | Loopback HTTP Auth emulator URL                                                         |
| `MQTT_URL`, `MQTT_ALLOW_INSECURE_LOCAL`                                 | Future API/simulator | Planned broker configuration, currently unused                                          |
| `MQTT_USERNAME`, `MQTT_PASSWORD`                                        | Future API/simulator | Server-side secrets for authenticated broker, currently unused                          |
| `TENANT_ID`, `DEVICE_ID`, `PUBLISH_INTERVAL_MS`                         | Future simulator     | Planned virtual device configuration, currently unused                                  |
| `TELEMETRY_*`, `LATEST_WRITE_INTERVAL_MS`, `HISTORY_SAMPLE_INTERVAL_MS` | Future API ingestion | Planned freshness and persistence policy, currently unused                              |

The lazy browser Firebase factory is prepared but not invoked by any page. It accepts only emulator-safe settings in local development. Firebase API keys identify the project; authorization still depends on Auth and security rules. `NEXT_PUBLIC_*` values are embedded at web build time. Do not place server secrets in them.

## Troubleshooting

- **Docker socket unavailable:** start Docker Desktop/Engine, then retry the infrastructure command.
- **Java emulator startup error:** install/select Java 21+ or use `pnpm emulators:docker`.
- **Invalid API configuration:** run `pnpm env:setup`, check `apps/api/.env`, and set both emulator hosts plus a `demo-` project. Errors report field names without echoing credentials.
- **Firestore permission denied:** expected until authenticated membership and device provisioning exist. No browser write bypass is supplied.
- **Port in use:** stop conflicting services; update both emulator configuration and matching app endpoint variables if changing ports.
- **Missing shared-package output:** run `pnpm --filter @iot-nexus/shared build` before invoking an app directly.
- **Production Firebase factory error:** do not use local emulator variables in a production build. The Phase 0 shell renders without calling the factory.
- **Package download failure:** check registry access/proxy; do not skip installation failures. Commit and use the generated `pnpm-lock.yaml` with `pnpm install --frozen-lockfile` in CI.

## Documentation and next steps

- [Requirements and setup acceptance](docs/requirements.md)
- [Architecture and message flow](docs/architecture.md)
- [Data model, queries, retention, and cost](docs/data-model.md)
- [API contracts](docs/api-contracts.md)
- [Security boundaries](docs/security.md)
- [Development milestones](docs/development-plan.md)
- [Architecture decisions](docs/adr/README.md)
- [Setup verification and environment limits](docs/setup-verification.md)

The next implementation milestone is Firebase authentication, trusted tenant memberships, role checks, and backend device registration. MQTT ingestion and a working live dashboard follow those authorization foundations.
