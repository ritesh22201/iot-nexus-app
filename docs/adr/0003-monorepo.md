# ADR 0003: pnpm workspaces with Turborepo

Status: accepted.

Context: web, API, and simulator share versioned DTOs and strict tooling, while remaining independent runtime applications. Separate repositories would make synchronized contract changes harder.

Decision: use pnpm workspace dependencies, one lockfile, and Turborepo's task graph. Compile shared contracts to ESM plus declarations before dependent checks/builds. Centralize TypeScript and ESLint settings in `packages/config`.

Consequences: atomic contract changes and reproducible CI, with a need to manage package boundaries and environment-aware caching. Public Firebase build variables are declared build inputs; runtime secrets are never cached build outputs. Independent services can still deploy separately. Shared watch mode is explicit during contract development.
