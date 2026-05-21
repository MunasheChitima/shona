import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema, validate, sanitizeInput } from '@/lib/validation'
import { generateToken } from '@/lib/auth-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { SESSION_COOKIE_NAME } from '@/lib/beta-access'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    if (!rateLimit(`register:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const validation = validate(registerSchema, body)
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

    const { name, email, password } = validation.data!

    // Sanitize name (XSS-defense for any UI that renders it) but leave the
    // password raw — bcrypt hashes the user's actual input.
    const sanitizedName = sanitizeInput(name)
    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      // Do NOT issue a JWT for an existing account — that would be account
      // takeover. Surface a generic conflict so we don't leak which emails
      // are registered beyond what the registration form already implies.
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: normalizedEmail,
        password: hashedPassword,
      },
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
      maxAge: 60 * 60 * 24 * 7,
    })
    return response
  } catch (error) {
    console.error('register error:', (error as Error)?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
