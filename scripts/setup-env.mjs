import { copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath } from 'node:url';

const files = [
  ['.env.example', '.env'],
  ['apps/api/.env.example', 'apps/api/.env'],
  ['apps/simulator/.env.example', 'apps/simulator/.env'],
  ['apps/web/.env.example', 'apps/web/.env.local'],
];
for (const [source, destination] of files) {
  try {
    await copyFile(
      fileURLToPath(new URL(`../${source}`, import.meta.url)),
      fileURLToPath(new URL(`../${destination}`, import.meta.url)),
      constants.COPYFILE_EXCL,
    );
    console.log(`Created ${destination}`);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'EEXIST'
    )
      console.log(`Kept existing ${destination}`);
    else throw error;
  }
}
