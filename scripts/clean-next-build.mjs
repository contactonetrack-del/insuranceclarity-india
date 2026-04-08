import fs from 'node:fs/promises';
import path from 'node:path';

async function removeIfPresent(targetPath) {
  try {
    await fs.rm(targetPath, { recursive: true, force: true });
  } catch (error) {
    console.warn(`[clean-next-build] Failed to remove ${targetPath}:`, error);
  }
}

async function run() {
  const repoRoot = process.cwd();
  await removeIfPresent(path.join(repoRoot, '.next', 'dev'));
}

await run();

