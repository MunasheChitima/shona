import jwt from 'jsonwebtoken'

const JWT_SECRET = 'your-secret-key-change-in-production'

export async function verifyAuth(request: Request): Promise<string | null> {
  try {
    const authorization = request.headers.get('authorization')
    if (!authorization) return null
    
    const token = authorization.replace('Bearer ', '')
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    return decoded.userId
  } catch (error) {
    return null
  }
} 