import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/auth-server'
import { PrismaClient } from '@prisma/client'
import { loginSchema, validate, sanitizeInput } from '@/lib/validation'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
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
            message: e.message
          }))
        }, 
        { status: 400 }
      )
    }
    
    const { email, password } = validation.data!
    
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)
    
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const validPassword = await bcrypt.compare(sanitizedPassword, user.password)
    
    if (!validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
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
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
} 