import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { BETA_OPEN_ACCESS } from '@/lib/beta-access'

// Server-side auth utilities
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-change-in-production'

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production' && !BETA_OPEN_ACCESS) {
  throw new Error('JWT_SECRET environment variable is required in production')
}

let cachedBetaAnonymousUserId: string | null | undefined

/**
 * DB user used for all unauthenticated requests while BETA_OPEN_ACCESS is true.
 * Override with BETA_ANONYMOUS_USER_ID if the seeded user id is known.
 */
export async function resolveBetaAnonymousUserId(): Promise<string | null> {
  if (!BETA_OPEN_ACCESS) return null
  if (cachedBetaAnonymousUserId !== undefined) return cachedBetaAnonymousUserId
  const fromEnv = process.env.BETA_ANONYMOUS_USER_ID?.trim()
  if (fromEnv) {
    cachedBetaAnonymousUserId = fromEnv
    return fromEnv
  }
  const byEmail = await prisma.user.findFirst({
    where: { email: 'test@example.com' },
    select: { id: true },
  })
  if (byEmail) {
    cachedBetaAnonymousUserId = byEmail.id
    return byEmail.id
  }
  const anyUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' }, select: { id: true } })
  cachedBetaAnonymousUserId = anyUser?.id ?? null
  return cachedBetaAnonymousUserId
}

export function generateToken(userId: string): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: expiresIn as any })
}

export async function verifyAuth(request: Request): Promise<string | null> {
  const authorization = request.headers.get('authorization')
  if (authorization) {
    try {
      const token = authorization.replace(/^Bearer\s+/i, '').trim()
      if (token && token !== 'null' && token !== 'undefined') {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        return decoded.userId
      }
    } catch {
      // invalid token — fall through to beta anonymous if enabled
    }
  }
  if (BETA_OPEN_ACCESS) {
    return resolveBetaAnonymousUserId()
  }
  return null
} 