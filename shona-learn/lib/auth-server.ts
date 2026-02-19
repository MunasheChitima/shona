import jwt from 'jsonwebtoken'

// Server-side auth utilities
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key-change-in-production'

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production')
}

export function generateToken(userId: string): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: expiresIn as any })
}

export async function verifyAuth(request: Request): Promise<string | null> {
  try {
    const authorization = request.headers.get('authorization')
    if (!authorization) return null
    
    const token = authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    return decoded.userId
  } catch {
    return null
  }
} 