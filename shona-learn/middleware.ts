import { NextResponse, type NextRequest } from 'next/server'

// Minimal edge middleware.
//
// Auth itself is enforced per-route via `verifyAuth(request)` (see
// lib/auth-server.ts) — not here — because most API routes have richer
// per-endpoint authorization logic that belongs in the route handler.
//
// What this middleware DOES do:
//   1. Ensure every visitor has a stable `shona_beta_id` cookie. The cookie
//      is read by verifyAuth() in open-beta mode to map an anonymous visitor
//      to a per-visitor user row. Setting it server-side at the edge means
//      first-request API calls also see it (the client also writes it from
//      AuthProvider, but the cookie may not be present on the very first
//      navigation).
//   2. Add a couple of conservative security headers to every response.
//
// What this middleware deliberately does NOT do:
//   - Validate the session cookie. JWT verification needs Node crypto and
//     should stay in route handlers running on the Node runtime.
//   - Rate limit. Rate limiting is per-endpoint (login, register) in
//     lib/rate-limit.ts; we'd need a shared store to make it useful at the
//     edge across instances.

const BETA_COOKIE = 'shona_beta_id'
const BETA_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function newUuid(): string {
  // Available in the edge runtime.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const existing = request.cookies.get(BETA_COOKIE)?.value
  if (!existing || !BETA_UUID_RE.test(existing)) {
    response.cookies.set(BETA_COOKIE, newUuid(), {
      // NOT HttpOnly — the client also reads this to detect first-visit state.
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
  }

  // Conservative defaults — keep these tight, individual routes can override.
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'DENY')

  return response
}

export const config = {
  // Skip static assets & Next internals — only run on app/API routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map|woff2?)).*)'],
}
