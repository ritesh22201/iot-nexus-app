'use client';

import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { z } from 'zod';

const publicConfigSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
  appId: z.string().min(1),
});
let clients:
  | { auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore> }
  | undefined;

// Lazy: the Phase 0 shell works without Firebase configuration or network access.
export function getFirebaseClients() {
  if (clients) return clients;
  const config = publicConfigSchema.parse({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  const emulatorMode =
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
  if (process.env.NODE_ENV === 'production' && emulatorMode) {
    throw new Error(
      'Firebase emulators cannot be enabled in a production build',
    );
  }
  if (
    process.env.NODE_ENV !== 'production' &&
    (!emulatorMode || !config.projectId.startsWith('demo-'))
  ) {
    throw new Error(
      'Local Firebase access requires emulator mode and a demo- project',
    );
  }
  if (!emulatorMode && config.projectId.startsWith('demo-')) {
    throw new Error('Demo projects require Firebase emulator mode');
  }
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  if (emulatorMode) {
    const firestoreHost =
      process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
    const match = /^(localhost|127\.0\.0\.1):(\d+)$/.exec(firestoreHost);
    const authUrl =
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL ??
      'http://127.0.0.1:9099';
    const url = new URL(authUrl);
    if (
      !match?.[1] ||
      !match[2] ||
      Number(match[2]) < 1 ||
      Number(match[2]) > 65535 ||
      !['localhost', '127.0.0.1'].includes(url.hostname) ||
      url.protocol !== 'http:'
    ) {
      throw new Error('Use loopback Firebase emulator endpoints');
    }
    connectAuthEmulator(auth, authUrl, { disableWarnings: false });
    connectFirestoreEmulator(db, match[1], Number(match[2]));
  }
  clients = { auth, db };
  return clients;
}
