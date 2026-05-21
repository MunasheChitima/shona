import jwt, { type SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BETA_OPEN_ACCESS, BETA_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/lib/beta-access'

// Server-side auth utilities.
// JWT_SECRET is mandatory in every environment — no insecure fallback.
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}
// Local non-null alias so TS narrows for the rest of the module.
const SECRET: string = JWT_SECRET

function parseExpiresIn(): SignOptions['expiresIn'] {
  const raw = process.env.JWT_EXPIRES_IN?.trim()
  if (!raw) return '7d'
  const asNumber = Number(raw)
  if (!Number.isNaN(asNumber) && asNumber > 0) return asNumber
  // Accept the standard `<digits><unit>` short form, otherwise fall back.
  if (/^\d+\s*(ms|s|m|h|d|w|y)$/i.test(raw)) return raw as SignOptions['expiresIn']
  return '7d'
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, SECRET, {
    algorithm: 'HS256',
    expiresIn: parseExpiresIn(),
  })
}

type CookieReader = { get: (name: string) => { value: string } | undefined }

function getCookieReader(request: Request): CookieReader | null {
  const maybeCookies = (request as unknown as { cookies?: unknown }).cookies
  if (maybeCookies && typeof (maybeCookies as CookieReader).get === 'function') {
    return maybeCookies as CookieReader
  }
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  const map = new Map<string, string>()
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const k = part.slice(0, eq).trim()
    const v = decodeURIComponent(part.slice(eq + 1).trim())
    if (k) map.set(k, v)
  }
  return { get: (name: string) => (map.has(name) ? { value: map.get(name)! } : undefined) }
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization')
  if (!authorization) return null
  const token = authorization.replace(/^Bearer\s+/i, '').trim()
  if (!token || token === 'null' || token === 'undefined') return null
  return token
}

const BETA_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function resolveBetaUserFromCookie(cookies: CookieReader | null): Promise<string | null> {
  if (!cookies) return null
  const raw = cookies.get(BETA_COOKIE_NAME)?.value
  if (!raw || !BETA_UUID_RE.test(raw)) return null
  const email = `beta+${raw.toLowerCase()}@shona.local`
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) return existing.id
  // Use a non-guessable placeholder password — these accounts cannot log in
  // via /api/auth/login because the bcrypt hash will never match any user
  // input. They exist only to own progress/XP rows for an anonymous visitor.
  const placeholder = await bcrypt.hash(`beta:${raw}:${Date.now()}:${Math.random()}`, 10)
  const created = await prisma.user.create({
    data: { email, name: 'Beta Learner', password: placeholder },
    select: { id: true },
  })
  return created.id
}

export async function verifyAuth(request: Request | NextRequest): Promise<string | null> {
  const cookies = getCookieReader(request)
  const cookieToken = cookies?.get(SESSION_COOKIE_NAME)?.value
  const bearerToken = getBearerToken(request)
  const token = bearerToken || cookieToken
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] }) as { userId?: unknown }
      if (decoded && typeof decoded.userId === 'string') return decoded.userId
    } catch {
      // fall through — invalid/expired token
    }
  }
  if (BETA_OPEN_ACCESS) {
    return resolveBetaUserFromCookie(cookies)
  }
  return null
}
