import { describe, it, expect, vi } from 'vitest'
import { generateToken, verifyAuth } from '../lib/auth-server'
import { loginSchema, registerSchema, validate } from '../lib/validation'

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn((payload: any) => 'mock-token'),
    verify: vi.fn(() => ({ userId: 'test-user-id' }))
  }
}))

describe('Authentication', () => {
  describe('generateToken', () => {
    it('should generate a token for a user ID', () => {
      const token = generateToken('user-123')
      expect(token).toBe('mock-token')
    })
  })

  describe('verifyAuth', () => {
    it('should return user ID for valid token', async () => {
      const request = new Request('http://localhost', {
        headers: {
          'authorization': 'Bearer valid-token'
        }
      })
      
      const userId = await verifyAuth(request)
      expect(userId).toBe('test-user-id')
    })

    it('should return null for missing authorization header', async () => {
      const request = new Request('http://localhost')
      const userId = await verifyAuth(request)
      expect(userId).toBeNull()
    })

    it('should return null for invalid token', async () => {
      const jwt = await import('jsonwebtoken')
      jwt.default.verify = vi.fn(() => {
        throw new Error('Invalid token')
      })

      const request = new Request('http://localhost', {
        headers: {
          'authorization': 'Bearer invalid-token'
        }
      })
      
      const userId = await verifyAuth(request)
      expect(userId).toBeNull()
    })
  })
})

describe('Input Validation', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = validate(loginSchema, {
        email: 'test@example.com',
        password: 'password123'
      })
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should reject invalid email', () => {
      const result = validate(loginSchema, {
        email: 'invalid-email',
        password: 'password123'
      })
      
      expect(result.success).toBe(false)
      expect(result.errors?.errors[0].message).toContain('Invalid email')
    })

    it('should reject short password', () => {
      const result = validate(loginSchema, {
        email: 'test@example.com',
        password: '123'
      })
      
      expect(result.success).toBe(false)
      expect(result.errors?.errors[0].message).toContain('at least 6 characters')
    })
  })

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const result = validate(registerSchema, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should reject short name', () => {
      const result = validate(registerSchema, {
        name: 'T',
        email: 'test@example.com',
        password: 'password123'
      })
      
      expect(result.success).toBe(false)
      expect(result.errors?.errors[0].message).toContain('at least 2 characters')
    })
  })
}) 