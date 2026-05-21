import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { loginSchema, validate } from '@/lib/validation'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { SESSION_COOKIE_NAME } from '@/lib/beta-access'

// A known-invalid bcrypt hash used to keep the response time on the
// "user not found" branch close to the real-compare branch. This prevents
// a trivial user-enumeration timing oracle on the login endpoint.
const DUMMY_BCRYPT_HASH =
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(`login:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const validation = validate(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validation.errors?.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    const { email, password } = validation.data!
    // Normalize email the same way at register + login so lookups always match.
    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (!user) {
      // Spend roughly the same time as a real compare so attackers can't
      // distinguish "user exists" from "user does not exist" via response time.
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // IMPORTANT: pass the raw password — never sanitize before bcrypt,
    // otherwise distinct passwords collapse into the same compared value.
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    })

    const token = generateToken(user.id)

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        hearts: user.hearts,
      },
    })
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return response
  } catch (error) {
    console.error('login error:', (error as Error)?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
