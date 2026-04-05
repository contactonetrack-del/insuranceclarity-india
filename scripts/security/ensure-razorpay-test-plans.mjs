import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const envPath = path.join(process.cwd(), '.env');
const keyId = (process.env.RAZORPAY_KEY_ID ?? '').trim();
const keySecret = (process.env.RAZORPAY_KEY_SECRET ?? '').trim();
const mode = (process.env.RAZORPAY_MODE ?? 'live').trim().toLowerCase();

if (!fs.existsSync(envPath)) {
  console.error('Missing .env file in project root.');
  process.exit(1);
}

if (mode !== 'test') {
  console.error('RAZORPAY_MODE is not `test`. Refusing to create test plans.');
  process.exit(1);
}

if (!keyId || !keySecret) {
  console.error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in .env');
  process.exit(1);
}

if (!keyId.startsWith('rzp_test_')) {
  console.error('RAZORPAY_KEY_ID is not a test key (expected prefix `rzp_test_`).');
  process.exit(1);
}

function authHeader() {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

async function razorpayRequest(pathname, method = 'GET', body) {
  const response = await fetch(`https://api.razorpay.com/v1${pathname}`, {
    method,
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const data = await response.text();
    if (response.status === 401) {
      throw new Error(
        'Razorpay credentials unauthorized (401). Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are a valid pair from the same Razorpay test account.'
      );
    }
    throw new Error(`Razorpay API ${method} ${pathname} failed (${response.status}): ${data}`);
  }

  return response.json();
}

async function fetchPlans() {
  const payload = await razorpayRequest('/plans?count=100');
  return Array.isArray(payload?.items) ? payload.items : [];
}

function matchesManagedPlan(plan, alias) {
  return (
    plan?.notes?.managedBy === 'codex' &&
    plan?.notes?.workspace === 'insurance-clarity' &&
    plan?.notes?.alias === alias &&
    typeof plan?.id === 'string' &&
    plan.id.startsWith('plan_')
  );
}

async function ensurePlan({ alias, displayName, amountPaise }) {
  const plans = await fetchPlans();
  const existing = plans.find((p) => matchesManagedPlan(p, alias));
  if (existing?.id) {
    return existing.id;
  }

  const created = await razorpayRequest('/plans', 'POST', {
    period: 'monthly',
    interval: 1,
    item: {
      name: displayName,
      amount: amountPaise,
      currency: 'INR',
      description: `${displayName} (test mode, managed by codex)`,
    },
    notes: {
      managedBy: 'codex',
      workspace: 'insurance-clarity',
      alias,
    },
  });

  if (!created?.id || !String(created.id).startsWith('plan_')) {
    throw new Error(`Unexpected Razorpay plan response for ${alias}.`);
  }

  return created.id;
}

function upsertEnvValue(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  return `${content.trimEnd()}\n${line}\n`;
}

async function run() {
  const proPlanId = await ensurePlan({
    alias: 'pro_test_monthly',
    displayName: 'Insurance Clarity PRO',
    amountPaise: 49900,
  });

  const enterprisePlanId = await ensurePlan({
    alias: 'enterprise_test_monthly',
    displayName: 'Insurance Clarity ENTERPRISE',
    amountPaise: 299900,
  });

  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = upsertEnvValue(envContent, 'RAZORPAY_PLAN_ID_PRO', proPlanId);
  envContent = upsertEnvValue(envContent, 'RAZORPAY_PLAN_ID_ENTERPRISE', enterprisePlanId);
  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('Razorpay test plans ensured and .env updated.');
  console.log(`RAZORPAY_PLAN_ID_PRO=${proPlanId}`);
  console.log(`RAZORPAY_PLAN_ID_ENTERPRISE=${enterprisePlanId}`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
