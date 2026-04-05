# Secrets Rotation Runbook (P0)

Use this checklist to close the remaining launch blockers that require provider dashboards.

## 1) Rotate and revoke exposed secrets

Rotate all previously exposed credentials in their provider dashboards:

- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_SECRET`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `CLOUDINARY_API_SECRET`
- `DATABASE_URL` / `DIRECT_URL` credentials

After rotation, revoke old keys so they cannot be reused.

## 2) Google OAuth production credentials

In Google Cloud Console:

1. Create (or update) OAuth client credentials for your production domain.
2. Set authorized redirect URI to:
   - `https://<your-domain>/api/auth/callback/google`
3. Update environment values:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

## 3) Razorpay live payments

In Razorpay Dashboard (live mode):

1. Generate live API keys.
2. Create live subscription plans for PRO and ENTERPRISE.
3. Configure webhook secret.

Update environment values:

- `RAZORPAY_KEY_ID` (must start with `rzp_live_`)
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (must match `RAZORPAY_KEY_ID`)
- `RAZORPAY_PLAN_ID_PRO` (must be live `plan_*`)
- `RAZORPAY_PLAN_ID_ENTERPRISE` (must be live `plan_*`)
- `RAZORPAY_WEBHOOK_SECRET`

## 4) NextAuth secret sync

Ensure the rotated `NEXTAUTH_SECRET` is set in all runtime environments:

- local `.env`
- preview/staging
- production

Generate with:

```bash
openssl rand -base64 32
```

## 5) Verification gate

Run:

```bash
npm run security:preflight
```

All checks must pass before launch.
