/**
 * src/lib/security/csrf.ts
 *
 * CSRF protection for custom API routes that mutate state.
 *
 * Strategy: Double-Submit Cookie Pattern (stateless, edge-compatible)
 *  1. Server sets a signed `__csrf` cookie on GET requests via /api/csrf endpoint
 *  2. Client reads the cookie and sends the value in the `x-csrf-token` header
 *  3. API routes call `validateCsrfToken(request)` before processing mutations
 *
 * This works in Next.js App Router without a server session store.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';
import { isPlaceholderValue } from '@/lib/security/env';

const csrfBaseSecret = process.env.CSRF_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || '';

if (!csrfBaseSecret) {
  const message = 'CSRF_SECRET (or NEXTAUTH_SECRET fallback) is not configured.';
  if (process.env.NODE_ENV === 'production') {
    throw new Error(message);
  }
  logger.warn({ action: 'csrf.secret.missing', message });
}

if (process.env.NODE_ENV === 'production' && isPlaceholderValue(csrfBaseSecret)) {
  throw new Error('CSRF secret is placeholder-like in production. Set a strong random secret.');
}

const CSRF_SECRET = csrfBaseSecret || 'dev-only-csrf-secret';
const COOKIE_NAME = '__csrf';
const HEADER_NAME = 'x-csrf-token';
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── Token Generation ─────────────────────────────────────────────────────────

/**
 * Creates a signed, timestamped CSRF token: `timestamp.hmac`
 */
export function generateCsrfToken(): string {
  const timestamp = Date.now().toString(36);
  const sig = createHmac('sha256', CSRF_SECRET)
    .update(timestamp)
    .digest('hex');
  return `${timestamp}.${sig}`;
}

/**
 * Verifies a CSRF token's signature and checks it has not expired.
 */
export function verifyCsrfToken(token: string | null | undefined): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, sig] = parts;

  // Re-compute the expected signature
  const expected = createHmac('sha256', CSRF_SECRET)
    .update(timestamp)
    .digest('hex');

  try {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  // Check expiry
  const issuedAt = parseInt(timestamp, 36);
  if (Date.now() - issuedAt > TOKEN_TTL_MS) return false;

  return true;
}

// ─── Route Helpers ────────────────────────────────────────────────────────────

/**
 * Validates the CSRF token from the request header AND the cookie.
 * Returns a 403 NextResponse if invalid, otherwise null.
 *
 * Usage in an API route:
 *   const csrfError = validateCsrfRequest(request);
 *   if (csrfError) return csrfError;
 */
export function validateCsrfRequest(request: NextRequest): NextResponse | null {
  const headerToken = request.headers.get(HEADER_NAME);
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;

  // Both must exist and match
  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return NextResponse.json(
      { error: 'CSRF token mismatch. Please refresh and try again.' },
      { status: 403 },
    );
  }

  // Verify signature and expiry
  if (!verifyCsrfToken(headerToken)) {
    return NextResponse.json(
      { error: 'CSRF token has expired or is invalid.' },
      { status: 403 },
    );
  }

  return null; // valid
}

/**
 * Creates a response that sets a fresh CSRF cookie.
 * Used in GET /api/csrf to issue tokens to the client.
 */
export function createCsrfResponse(): NextResponse {
  const token = generateCsrfToken();
  const response = NextResponse.json({ csrfToken: token });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: false,     // Must be readable by JS to send as a header
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60,     // 1 hour
  });

  return response;
}

/**
 * Server Component helper — reads the CSRF token from the cookie store.
 * Use in Server Actions or page components to pre-populate forms.
 */
export async function readCsrfCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}
