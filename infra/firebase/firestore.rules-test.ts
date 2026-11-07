import { readFile } from 'node:fs/promises';
import { afterAll, beforeAll, describe, it } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let environment: RulesTestEnvironment;
beforeAll(async () => {
  const endpoint = process.env.FIRESTORE_EMULATOR_HOST;
  if (!endpoint)
    throw new Error(
      'Run pnpm test:rules:emulated or set FIRESTORE_EMULATOR_HOST; never run against live Firestore.',
    );
  const [host, port] = endpoint.split(':');
  if (
    !host ||
    !['127.0.0.1', 'localhost'].includes(host) ||
    !port ||
    !Number.isInteger(Number(port))
  )
    throw new Error('Rules tests require a loopback emulator endpoint');
  environment = await initializeTestEnvironment({
    projectId: 'demo-iot-nexus',
    firestore: {
      host,
      port: Number(port),
      rules: await readFile(
        new URL('./firestore.rules', import.meta.url),
        'utf8',
      ),
    },
  });
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'tenants/tenant-a/members/alice'), { role: 'viewer' });
    await setDoc(doc(db, 'tenants/tenant-a/members/owner'), { role: 'owner' });
    await setDoc(doc(db, 'tenants/tenant-a/devices/device-1'), {
      tenantId: 'tenant-a',
      deviceId: 'device-1',
    });
    await setDoc(doc(db, 'tenants/tenant-b/devices/device-2'), {
      tenantId: 'tenant-b',
      deviceId: 'device-2',
    });
    await setDoc(doc(db, 'tenants/tenant-a/auditLogs/event-1'), {
      action: 'example',
    });
  });
});
afterAll(async () => {
  await environment?.cleanup();
});

describe('tenant read boundaries and backend-only writes', () => {
  it('allows a member to read a device in their own tenant', async () => {
    await assertSucceeds(
      getDoc(
        doc(
          environment.authenticatedContext('alice').firestore(),
          'tenants/tenant-a/devices/device-1',
        ),
      ),
    );
  });
  it('denies reads across tenants and without authentication', async () => {
    await assertFails(
      getDoc(
        doc(
          environment.authenticatedContext('alice').firestore(),
          'tenants/tenant-b/devices/device-2',
        ),
      ),
    );
    await assertFails(
      getDoc(
        doc(
          environment.unauthenticatedContext().firestore(),
          'tenants/tenant-a/devices/device-1',
        ),
      ),
    );
  });
  it('denies direct device, telemetry, alert, and membership writes even for an owner', async () => {
    const db = environment.authenticatedContext('owner').firestore();
    for (const target of [
      'tenants/tenant-a/devices/device-1',
      'tenants/tenant-a/devices/device-1/telemetry/event-1',
      'tenants/tenant-a/alerts/alert-1',
      'tenants/tenant-a/members/alice',
    ]) {
      await assertFails(setDoc(doc(db, target), { role: 'owner' }));
    }
  });
  it('limits audit log access to administrators', async () => {
    await assertFails(
      getDoc(
        doc(
          environment.authenticatedContext('alice').firestore(),
          'tenants/tenant-a/auditLogs/event-1',
        ),
      ),
    );
    await assertSucceeds(
      getDoc(
        doc(
          environment.authenticatedContext('owner').firestore(),
          'tenants/tenant-a/auditLogs/event-1',
        ),
      ),
    );
  });
});
