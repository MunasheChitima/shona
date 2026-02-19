import { z } from 'zod'

// User schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Progress schema
export const progressSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  score: z.number().min(0).max(100, 'Score must be between 0 and 100')
})

// Generic validation function
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove JavaScript event handlers
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove JavaScript protocol
    .replace(/javascript:/gi, '')
    // Remove data URLs
    .replace(/data:/gi, '')
    // Remove vbscript
    .replace(/vbscript:/gi, '')
    // Remove onload, onerror, etc.
    .replace(/\bon\w+\s*=/gi, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // Remove null bytes
    .replace(/\x00/g, '')
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

// Validate and sanitize object
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized as T
} 