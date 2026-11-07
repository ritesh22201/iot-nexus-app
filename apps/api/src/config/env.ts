import { z } from 'zod';

export const apiEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    HOST: z.string().default('127.0.0.1'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:3000')
      .transform((value) => value.split(',').map((origin) => origin.trim()))
      .pipe(
        z
          .array(
            z.url().refine((value) => {
              const url = new URL(value);
              return (
                ['http:', 'https:'].includes(url.protocol) &&
                url.origin === value
              );
            }, 'Use exact HTTP(S) origins without paths or wildcards'),
          )
          .min(1),
      ),
    FIREBASE_PROJECT_ID: z.string().min(1).default('demo-iot-nexus'),
    FIRESTORE_EMULATOR_HOST: z.string().min(1).optional(),
    FIREBASE_AUTH_EMULATOR_HOST: z.string().min(1).optional(),
  })
  .superRefine((env, ctx) => {
    const firestore = Boolean(env.FIRESTORE_EMULATOR_HOST);
    const auth = Boolean(env.FIREBASE_AUTH_EMULATOR_HOST);
    if (firestore !== auth) {
      ctx.addIssue({
        code: 'custom',
        message: 'Configure both Firebase emulators together',
        path: ['FIRESTORE_EMULATOR_HOST'],
      });
    }
    if (
      env.NODE_ENV === 'production' &&
      (firestore || auth || env.FIREBASE_PROJECT_ID.startsWith('demo-'))
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Production must use a real Firebase project without emulator hosts',
        path: ['FIREBASE_PROJECT_ID'],
      });
    }
    if (
      env.NODE_ENV !== 'production' &&
      (!env.FIREBASE_PROJECT_ID.startsWith('demo-') || !firestore || !auth)
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Local development requires a demo- project and both emulator hosts',
        path: ['FIREBASE_PROJECT_ID'],
      });
    }
  });

export type ApiConfig = z.infer<typeof apiEnvSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  const result = apiEnvSchema.safeParse(env);
  if (!result.success) {
    // Report field names, never environment values or credentials.
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join('.'))),
    ];
    throw new Error(`Invalid API configuration: ${fields.join(', ')}`);
  }
  return result.data;
}
