#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const vercelDir = path.join(repoRoot, '.vercel');
const targets = [
  { name: 'production', file: path.join(vercelDir, '.env.production') },
  { name: 'preview', file: path.join(vercelDir, '.env.preview') },
  { name: 'development', file: path.join(vercelDir, '.env.development') },
];

const requiredS3Keys = [
  'DOCUMENT_STORAGE_BUCKET',
  'DOCUMENT_STORAGE_ACCESS_KEY_ID',
  'DOCUMENT_STORAGE_SECRET_ACCESS_KEY',
];
const requiredBlobKeys = ['BLOB_READ_WRITE_TOKEN'];

function runCommand(command, args) {
  const commandLine = [command, ...args]
    .map((part) => (/\s/.test(part) ? `"${part.replace(/"/g, '\\"')}"` : part))
    .join(' ');

  const result = spawnSync(commandLine, {
    cwd: repoRoot,
    stdio: 'pipe',
    encoding: 'utf8',
    shell: true,
    timeout: 120_000,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `${command} ${args.join(' ')} failed`);
  }
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

for (const target of targets) {
  runCommand('vercel', ['env', 'pull', target.file, '--environment', target.name, '--yes']);
  target.env = parseEnvFile(target.file);
}

let missingAny = false;

console.log('\n=== Storage Cutover Readiness ===');
for (const target of targets) {
  const env = target.env;
  const provider = env.DOCUMENT_STORAGE_PROVIDER || 'cloudinary';
  const missingS3 = requiredS3Keys.filter((key) => !env[key]);
  const missingBlob = requiredBlobKeys.filter((key) => !env[key]);
  const endpointConfigured = Boolean(env.DOCUMENT_STORAGE_ENDPOINT);

  console.log(`\n[${target.name}]`);
  console.log(`provider=${provider}`);
  console.log(`blob_token=${env.BLOB_READ_WRITE_TOKEN ? '[set]' : '[missing]'}`);
  console.log(`bucket=${env.DOCUMENT_STORAGE_BUCKET ? '[set]' : '[missing]'}`);
  console.log(`access_key=${env.DOCUMENT_STORAGE_ACCESS_KEY_ID ? '[set]' : '[missing]'}`);
  console.log(`secret_key=${env.DOCUMENT_STORAGE_SECRET_ACCESS_KEY ? '[set]' : '[missing]'}`);
  console.log(`endpoint=${endpointConfigured ? '[set]' : '[missing/optional]'}`);

  if (provider === 's3' && missingS3.length > 0) {
    missingAny = true;
  }

  if (provider === 'blob' && missingBlob.length > 0) {
    missingAny = true;
  }
}

if (missingAny) {
  console.log('\nStorage cutover is blocked because one or more Vercel environments are missing required credentials for the configured provider.');
  process.exit(0);
}

console.log('\nAll required storage credentials are present for the configured provider. You can run `npm run storage:migrate:object -- --apply`.');
