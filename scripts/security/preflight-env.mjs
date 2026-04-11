import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';

const PLACEHOLDER_MARKERS = [
  'replace_with',
  'placeholder',
  'change_me',
  'change-me',
  'example',
  'mock',
  'dummy',
  'todo',
];

function isPlaceholder(value) {
  const normalized = value?.trim().toLowerCase() ?? '';
  if (!normalized) return true;
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
}

function hasStrongAuthSecret(value) {
  const secret = value?.trim() ?? '';
  if (secret.length < 32) return false;
  if (isPlaceholder(secret)) return false;
  if (secret.toLowerCase().includes('insurance-clarity-secret-key')) return false;
  return true;
}

function isLikelyTestValue(value) {
  const normalized = value?.trim().toLowerCase() ?? '';
  return normalized.includes('test');
}

function normalizeUrl(value) {
  return value?.trim().replace(/\/+$/, '') ?? '';
}

function looksLikeRazorpayKeyId(value) {
  const normalized = value?.trim().toLowerCase() ?? '';
  return normalized.startsWith('rzp_');
}

function resolveQueueProvider(rawProvider, qstashToken) {
  const normalized = rawProvider?.trim().toLowerCase();
  if (normalized === 'qstash' || normalized === 'http') return normalized;
  return !isPlaceholder(qstashToken) ? 'qstash' : 'http';
}

function resolveDocumentStorageProvider(rawProvider) {
  const normalized = rawProvider?.trim().toLowerCase();
  if (normalized === 's3') return 's3';
  if (normalized === 'blob') return 'blob';
  return 'cloudinary';
}

function run() {
  const repoRoot = process.cwd();
  const envPath = path.join(repoRoot, '.env');
  const gitignorePath = path.join(repoRoot, '.gitignore');
  const results = [];

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  const trackedEnv = spawnSync('git', ['ls-files', '--error-unmatch', '.env'], {
    cwd: repoRoot,
    stdio: 'pipe',
    encoding: 'utf8',
  });

  results.push({
    name: '.env is not tracked by git',
    pass: trackedEnv.status !== 0,
    detail:
      trackedEnv.status === 0
        ? '`.env` is tracked. Run `git rm --cached .env` and commit the removal.'
        : 'OK',
  });

  const gitignore = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf8')
    : '';
  const hasEnvIgnore =
    /(^|\r?\n)\.env(\r?\n|$)/m.test(gitignore) || /(^|\r?\n)\.env\*(\r?\n|$)/m.test(gitignore);
  const keepsExample = /(^|\r?\n)!\.env\.example(\r?\n|$)/m.test(gitignore);

  results.push({
    name: '.gitignore blocks secret env files',
    pass: hasEnvIgnore && keepsExample,
    detail:
      hasEnvIgnore && keepsExample
        ? 'OK'
        : 'Expected `.env` or `.env*` ignore rule plus `!.env.example` allow rule.',
  });

  const authSecret = process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  results.push({
    name: 'BETTER_AUTH_SECRET is strong',
    pass: hasStrongAuthSecret(authSecret),
    detail: 'Must be >= 32 chars random secret (generate with `openssl rand -base64 32`).',
  });

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  results.push({
    name: 'Google OAuth credentials configured',
    pass: !isPlaceholder(googleClientId) && !isPlaceholder(googleClientSecret),
    detail: 'Set real GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from Google Cloud Console.',
  });

  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  results.push({
    name: 'Gemini analysis key configured',
    pass: !isPlaceholder(geminiApiKey),
    detail: 'Set GEMINI_API_KEY so policy analysis can run in production.',
  });

  const scanProcessingModeRaw = process.env.SCAN_PROCESSING_MODE?.trim().toLowerCase() ?? 'worker';
  const scanProcessingMode =
    scanProcessingModeRaw === 'worker' || scanProcessingModeRaw === 'inline'
      ? scanProcessingModeRaw
      : 'invalid';

  results.push({
    name: 'Scan processing mode is valid',
    pass: scanProcessingMode !== 'invalid',
    detail: 'Set SCAN_PROCESSING_MODE to either `worker` or `inline`.',
  });

  const queueSecret = process.env.QUEUE_SECRET?.trim();
  const qstashToken = process.env.QSTASH_TOKEN?.trim();
  const queueProvider = resolveQueueProvider(process.env.QUEUE_PROVIDER, qstashToken);
  const documentStorageProvider = resolveDocumentStorageProvider(process.env.DOCUMENT_STORAGE_PROVIDER);

  if (scanProcessingMode === 'worker') {
    results.push({
      name: 'QUEUE_SECRET is configured',
      pass: !isPlaceholder(queueSecret),
      detail: 'Set QUEUE_SECRET using `openssl rand -hex 32`.',
    });

    results.push({
      name: 'Queue provider is valid',
      pass: queueProvider === 'qstash' || queueProvider === 'http',
      detail: 'Set QUEUE_PROVIDER to `qstash` (recommended) or `http`.',
    });

    const appBaseUrl = normalizeUrl(process.env.APP_BASE_URL);
    const nextPublicAppUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL);
    const nextAuthUrl = normalizeUrl(process.env.NEXTAUTH_URL);
    const appUrl =
      appBaseUrl ||
      process.env.BETTER_AUTH_URL?.trim() ||
      nextPublicAppUrl ||
      nextAuthUrl ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : '');

    if (queueProvider === 'qstash') {
      const qstashCurrentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY?.trim();
      const qstashNextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY?.trim();

      results.push({
        name: 'QStash credentials configured',
        pass:
          !isPlaceholder(qstashToken) &&
          !isPlaceholder(qstashCurrentSigningKey) &&
          !isPlaceholder(qstashNextSigningKey),
        detail:
          'Set QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, and QSTASH_NEXT_SIGNING_KEY from Upstash QStash console.',
      });

      results.push({
        name: 'Public app URL is configured for managed queue callbacks',
        pass: Boolean(appUrl) && !isPlaceholder(appUrl),
        detail:
          'Set APP_BASE_URL (or BETTER_AUTH_URL / NEXT_PUBLIC_APP_URL) so QStash can reach /api/jobs/document-worker.',
      });

      const canonicalAppUrl = nextPublicAppUrl || nextAuthUrl || appBaseUrl;
      results.push({
        name: 'Managed queue callback URL is aligned with the canonical app URL',
        pass:
          !appBaseUrl ||
          !canonicalAppUrl ||
          normalizeUrl(appBaseUrl) === normalizeUrl(canonicalAppUrl),
        detail:
          'APP_BASE_URL should match NEXT_PUBLIC_APP_URL or NEXTAUTH_URL. A stale preview URL will send queue callbacks to the wrong deployment.',
      });
    } else {
      results.push({
        name: 'Managed queue provider selected for production',
        pass: process.env.NODE_ENV !== 'production',
        detail:
          'For production durability, switch QUEUE_PROVIDER to `qstash` and configure QStash credentials.',
      });
    }
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  const razorpayPublicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const razorpayModeRaw = process.env.RAZORPAY_MODE?.trim().toLowerCase() ?? 'live';
  const razorpayMode = razorpayModeRaw === 'test' ? 'test' : razorpayModeRaw === 'live' ? 'live' : 'invalid';

  results.push({
    name: 'Razorpay mode is valid',
    pass: razorpayMode !== 'invalid',
    detail: 'Set RAZORPAY_MODE to either `test` or `live`.',
  });

  results.push({
    name: razorpayMode === 'test' ? 'Razorpay credentials are test-ready' : 'Razorpay credentials are live',
    pass:
      !isPlaceholder(razorpayKeyId) &&
      !isPlaceholder(razorpayKeySecret) &&
      !isPlaceholder(razorpayPublicKey) &&
      (razorpayMode === 'test'
        ? razorpayKeyId?.startsWith('rzp_test_') === true &&
          razorpayPublicKey?.startsWith('rzp_test_') === true
        : razorpayKeyId?.startsWith('rzp_live_') === true &&
          razorpayPublicKey?.startsWith('rzp_live_') === true) &&
      razorpayPublicKey === razorpayKeyId,
    detail:
      razorpayMode === 'test'
        ? 'Set test `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`, and make `NEXT_PUBLIC_RAZORPAY_KEY_ID` match the test key id.'
        : 'Set live `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`, and make `NEXT_PUBLIC_RAZORPAY_KEY_ID` match the live key id.',
  });

  const proPlan = process.env.RAZORPAY_PLAN_ID_PRO?.trim();
  const enterprisePlan = process.env.RAZORPAY_PLAN_ID_ENTERPRISE?.trim();
  const skipRazorpayPlanValidation =
    (process.env.RAZORPAY_SKIP_PLAN_VALIDATION ?? '').trim().toLowerCase() === 'true';
  const planPattern = /^plan_[A-Za-z0-9_]+$/;
  const planLooksLikeKey =
    looksLikeRazorpayKeyId(proPlan) || looksLikeRazorpayKeyId(enterprisePlan);

  results.push({
    name: razorpayMode === 'test' ? 'Razorpay test plan IDs are configured' : 'Razorpay plan IDs are configured',
    pass: skipRazorpayPlanValidation
      ? true
      : !isPlaceholder(proPlan) &&
        !isPlaceholder(enterprisePlan) &&
        (razorpayMode === 'test' || (!isLikelyTestValue(proPlan) && !isLikelyTestValue(enterprisePlan))) &&
        !planLooksLikeKey &&
        planPattern.test(proPlan ?? '') &&
        planPattern.test(enterprisePlan ?? ''),
    detail:
      skipRazorpayPlanValidation
        ? 'Skipped by RAZORPAY_SKIP_PLAN_VALIDATION=true (owner-approved temporary deferral).'
        : planLooksLikeKey
        ? 'RAZORPAY_PLAN_ID_* must be `plan_...` IDs (from Razorpay Plans), not `rzp_...` API key IDs.'
        : razorpayMode === 'test'
        ? 'Create test plans in Razorpay dashboard, then set RAZORPAY_PLAN_ID_PRO and RAZORPAY_PLAN_ID_ENTERPRISE.'
        : 'Create live plans in Razorpay dashboard, then set non-test RAZORPAY_PLAN_ID_PRO and RAZORPAY_PLAN_ID_ENTERPRISE.',
  });

  if (documentStorageProvider === 'cloudinary') {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    results.push({
      name: 'Cloudinary document storage is configured',
      pass:
        !isPlaceholder(cloudName) &&
        !isPlaceholder(cloudinaryApiKey) &&
        !isPlaceholder(cloudinaryApiSecret),
      detail:
        'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET or switch DOCUMENT_STORAGE_PROVIDER to `s3`.',
    });
  } else if (documentStorageProvider === 's3') {
    const bucket = process.env.DOCUMENT_STORAGE_BUCKET?.trim();
    const accessKeyId = process.env.DOCUMENT_STORAGE_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.DOCUMENT_STORAGE_SECRET_ACCESS_KEY?.trim();
    const endpoint = process.env.DOCUMENT_STORAGE_ENDPOINT?.trim();

    results.push({
      name: 'S3/R2 document storage is configured',
      pass:
        !isPlaceholder(bucket) &&
        !isPlaceholder(accessKeyId) &&
        !isPlaceholder(secretAccessKey),
      detail:
        'Set DOCUMENT_STORAGE_BUCKET, DOCUMENT_STORAGE_ACCESS_KEY_ID, and DOCUMENT_STORAGE_SECRET_ACCESS_KEY before switching to DOCUMENT_STORAGE_PROVIDER=s3.',
    });

    results.push({
      name: 'S3/R2 endpoint is configured when needed',
      pass: !endpoint || !isPlaceholder(endpoint),
      detail:
        'If using Cloudflare R2 or another S3-compatible service, set DOCUMENT_STORAGE_ENDPOINT to the provider endpoint URL.',
    });
  } else {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

    results.push({
      name: 'Vercel Blob document storage is configured',
      pass: !isPlaceholder(blobToken),
      detail:
        'Set BLOB_READ_WRITE_TOKEN before switching to DOCUMENT_STORAGE_PROVIDER=blob.',
    });
  }

  let failed = 0;
  for (const result of results) {
    const icon = result.pass ? 'PASS' : 'FAIL';
    if (!result.pass) failed += 1;
    console.log(`${icon}  ${result.name}`);
    if (!result.pass) {
      console.log(`      ${result.detail}`);
    }
  }

  if (failed > 0) {
    console.error(`\nPreflight failed: ${failed} critical check(s) need action.`);
    return 1;
  }

  console.log('\nPreflight passed: critical launch env checks are satisfied.');
  return 0;
}

process.exitCode = run();
