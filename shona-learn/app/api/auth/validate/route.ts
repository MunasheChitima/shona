import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    return NextResponse.json({ 
      valid: true, 
      userId 
    }, { status: 200 })
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json({ error: 'Token validation failed' }, { status: 401 })
  }
} 