import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { registerSchema, validate, sanitizeInput } from '@/lib/validation'
import { generateToken } from '@/lib/auth-server'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
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
            message: e.message
          }))
        }, 
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data!

    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email)

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })

    if (existingUser) {
      const token = generateToken(existingUser.id)
      return NextResponse.json({
        token,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          xp: existingUser.xp,
          level: existingUser.level,
          streak: existingUser.streak,
          hearts: existingUser.hearts
        }
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword
      }
    })

    const token = generateToken(user.id)

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        hearts: user.hearts
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
} 