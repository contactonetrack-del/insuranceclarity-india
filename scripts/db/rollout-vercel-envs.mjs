#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const vercelDir = path.join(repoRoot, '.vercel');
const envTargets = [
  { name: 'production', file: path.join(vercelDir, '.env.production') },
  { name: 'preview', file: path.join(vercelDir, '.env.preview') },
  { name: 'development', file: path.join(vercelDir, '.env.development') },
];
const apply = process.argv.includes('--apply');

function runCommand(command, args, env = process.env) {
  const commandLine = [command, ...args]
    .map((part) => (/\s/.test(part) ? `"${part.replace(/"/g, '\\"')}"` : part))
    .join(' ');

  const result = spawnSync(commandLine, {
    cwd: repoRoot,
    env,
    stdio: 'pipe',
    encoding: 'utf8',
    shell: true,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `${command} ${args.join(' ')} failed`);
  }

  return result.stdout;
}

function pullVercelEnv(target) {
  runCommand('vercel', ['env', 'pull', target.file, '--environment', target.name, '--yes']);
}

function parseEnvFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const entries = {};

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    entries[match[1]] = match[2].replace(/^"(.*)"$/, '$1');
  }

  return entries;
}

function fingerprint(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
}

function uniqueDatabaseGroups(targets) {
  const groups = new Map();

  for (const target of targets) {
    const databaseUrl = target.env.DATABASE_URL;
    if (!databaseUrl) continue;

    const key = fingerprint(databaseUrl);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        databaseUrl,
        directUrl: target.env.DIRECT_URL,
        envNames: [],
      });
    }

    groups.get(key).envNames.push(target.name);
  }

  return Array.from(groups.values());
}

function printHeader(message) {
  console.log(`\n=== ${message} ===`);
}

function runRolloutForGroup(group) {
  const env = {
    ...process.env,
    DATABASE_URL: group.databaseUrl,
    DIRECT_URL: group.directUrl ?? process.env.DIRECT_URL,
  };

  printHeader(`Applying seed + embeddings to DB group ${group.key} (${group.envNames.join(', ')})`);
  runCommand('npm', ['run', 'db:seed'], env);
  runCommand('npm', ['run', 'db:embeddings:backfill'], env);
  runCommand('npm', ['run', 'check:search'], env);
}

for (const target of envTargets) {
  pullVercelEnv(target);
  target.env = parseEnvFile(target.file);
}

const groups = uniqueDatabaseGroups(envTargets);

printHeader('Vercel environment database mapping');
for (const group of groups) {
  console.log(`DB ${group.key}: ${group.envNames.join(', ')}`);
}

if (groups.length <= 1) {
  console.log('\nAll Vercel environments currently point to the same database target. No additional cross-environment seed/backfill rollout is needed.');
  process.exit(0);
}

if (!apply) {
  console.log('\nMultiple distinct databases were detected. Re-run with --apply to seed and backfill the non-duplicate targets.');
  process.exit(0);
}

for (const group of groups) {
  runRolloutForGroup(group);
}

console.log('\nCross-environment rollout complete.');
