import { jwtConfig } from './jwt-config'

export async function verifyAuth(request: Request): Promise<string | null> {
  try {
    const authorization = request.headers.get('authorization')
    if (!authorization) return null
    
    const token = authorization.replace('Bearer ', '')
    const decoded = jwtConfig.verifyToken(token)
    
    return decoded?.userId || null
  } catch (error) {
    return null
  }
}
