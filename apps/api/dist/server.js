// src/app.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
async function buildApp(config) {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      redact: ["req.headers.authorization", "req.headers.cookie"]
    },
    bodyLimit: 64 * 1024,
    // Enable proxy trust only after a trusted production proxy is configured.
    trustProxy: false
  });
  await app.register(cors, { origin: config.CORS_ORIGINS, credentials: false });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  app.setErrorHandler((error, request, reply) => {
    const candidateStatus = error && typeof error === "object" && "statusCode" in error ? error.statusCode : void 0;
    const statusCode = typeof candidateStatus === "number" && candidateStatus >= 400 && candidateStatus < 500 ? candidateStatus : 500;
    if (statusCode === 500) request.log.error({ err: error }, "Request failed");
    return reply.code(statusCode).send({
      error: statusCode === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
      message: statusCode === 500 ? "An unexpected error occurred" : "Request could not be processed",
      requestId: request.id
    });
  });
  app.get("/health", async () => ({ status: "ok", service: "iot-nexus-api" }));
  app.get("/ready", async () => ({
    status: "ready",
    scope: "scaffold",
    integrations: "not-connected"
  }));
  return app;
}

// src/config/env.ts
import { z } from "zod";
var apiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  CORS_ORIGINS: z.string().default("http://localhost:3000").transform((value) => value.split(",").map((origin) => origin.trim())).pipe(
    z.array(
      z.url().refine((value) => {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) && url.origin === value;
      }, "Use exact HTTP(S) origins without paths or wildcards")
    ).min(1)
  ),
  FIREBASE_PROJECT_ID: z.string().min(1).default("demo-iot-nexus"),
  FIRESTORE_EMULATOR_HOST: z.string().min(1).optional(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().min(1).optional()
}).superRefine((env, ctx) => {
  const firestore = Boolean(env.FIRESTORE_EMULATOR_HOST);
  const auth = Boolean(env.FIREBASE_AUTH_EMULATOR_HOST);
  if (firestore !== auth) {
    ctx.addIssue({
      code: "custom",
      message: "Configure both Firebase emulators together",
      path: ["FIRESTORE_EMULATOR_HOST"]
    });
  }
  if (env.NODE_ENV === "production" && (firestore || auth || env.FIREBASE_PROJECT_ID.startsWith("demo-"))) {
    ctx.addIssue({
      code: "custom",
      message: "Production must use a real Firebase project without emulator hosts",
      path: ["FIREBASE_PROJECT_ID"]
    });
  }
  if (env.NODE_ENV !== "production" && (!env.FIREBASE_PROJECT_ID.startsWith("demo-") || !firestore || !auth)) {
    ctx.addIssue({
      code: "custom",
      message: "Local development requires a demo- project and both emulator hosts",
      path: ["FIREBASE_PROJECT_ID"]
    });
  }
});
function loadConfig(env = process.env) {
  const result = apiEnvSchema.safeParse(env);
  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join(".")))
    ];
    throw new Error(`Invalid API configuration: ${fields.join(", ")}`);
  }
  return result.data;
}

// src/server.ts
async function main() {
  const config = loadConfig();
  const app = await buildApp(config);
  let closing = false;
  const close = async () => {
    if (closing) return;
    closing = true;
    try {
      await app.close();
    } catch (error) {
      app.log.error({ err: error }, "Shutdown failed");
      process.exitCode = 1;
    }
  };
  process.once("SIGINT", () => {
    void close();
  });
  process.once("SIGTERM", () => {
    void close();
  });
  await app.listen({ host: config.HOST, port: config.PORT });
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "API startup failed");
  process.exitCode = 1;
});
//# sourceMappingURL=server.js.map