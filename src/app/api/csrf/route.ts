/**
 * GET /api/csrf
 *
 * Issues a fresh signed CSRF token to authenticated clients.
 * The token is set as a cookie AND returned in the response body.
 *
 * Client usage:
 *   const { csrfToken } = await fetch('/api/csrf').then(r => r.json());
 *   // Then include it as: headers: { 'x-csrf-token': csrfToken }
 */

import { NextResponse } from 'next/server';
import { createCsrfResponse } from '@/lib/security/csrf';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  return createCsrfResponse();
}
