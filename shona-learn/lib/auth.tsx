'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { BETA_OPEN_ACCESS, BETA_COOKIE_NAME } from '@/lib/beta-access'

interface User {
  id: string
  name: string
  email: string
  xp: number
  level: number
  streak: number
  hearts: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_STORAGE_KEY = 'user'

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split(';')
  for (const part of parts) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const k = part.slice(0, eq).trim()
    if (k === name) {
      return decodeURIComponent(part.slice(eq + 1).trim())
    }
  }
  return null
}

function writeCookie(name: string, value: string, maxAgeSec: number): void {
  if (typeof document === 'undefined') return
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; samesite=lax${secure}`
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Very lightweight fallback for environments without crypto.randomUUID.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function ensureBetaCookie(): void {
  if (!BETA_OPEN_ACCESS) return
  const existing = readCookie(BETA_COOKIE_NAME)
  if (existing) return
  writeCookie(BETA_COOKIE_NAME, generateUuid(), 60 * 60 * 24 * 365) // 1 year
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authBanner, setAuthBanner] = useState<string | null>(null)
  const router = useRouter()

  // Run exactly once on mount — never re-run as isLoading flips.
  useEffect(() => {
    let cancelled = false

    const init = async () => {
      try {
        if (typeof window === 'undefined') return

        // For open beta, make sure the visitor has a stable UUID cookie so
        // the server can hydrate them to a per-visitor user row.
        ensureBetaCookie()

        // Hydrate UI immediately from cached profile (NOT auth-of-record).
        const cached = localStorage.getItem(USER_STORAGE_KEY)
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as User
            if (!cancelled) setUser(parsed)
          } catch {
            localStorage.removeItem(USER_STORAGE_KEY)
          }
        }

        // Validate against the server using the cookie. If we have no user
        // yet and the server accepts us, take the userId at face value but
        // keep using cached profile for UI fields we don't get back here.
        try {
          const res = await fetch('/api/auth/validate', {
            credentials: 'include',
          })
          if (cancelled) return
          if (res.status === 401) {
            localStorage.removeItem(USER_STORAGE_KEY)
            setUser(null)
          }
          // If 200 we keep whatever we hydrated. No /api/auth/me endpoint
          // exists; the existing cached profile is good enough for UI.
        } catch {
          // Network error — keep cached user, don't log out.
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateToken = async (): Promise<boolean> => {
    if (BETA_OPEN_ACCESS) return true
    try {
      const response = await fetch('/api/auth/validate', { credentials: 'include' })
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(USER_STORAGE_KEY)
          setUser(null)
          setAuthBanner('Session expired — please log in again.')
          setTimeout(() => {
            setAuthBanner(null)
            router.push('/')
          }, 3200)
        }
        return false
      }
      return response.ok
    } catch (error) {
      console.error('validateToken error:', (error as Error)?.message)
      return false
    }
  }

  const checkAuth = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    try {
      const isValid = await validateToken()
      if (!isValid) {
        localStorage.removeItem(USER_STORAGE_KEY)
        setUser(null)
        return false
      }
      return true
    } catch (error) {
      console.error('checkAuth error:', (error as Error)?.message)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (res.ok) {
        if (typeof window !== 'undefined' && data.user) {
          // Cache the profile for fast UI hydration. The actual auth lives in
          // the HttpOnly cookie set server-side.
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
        }
        setAuthBanner(null)
        setUser(data.user)
        return { success: true }
      }
      return { success: false, error: data.error || 'Login failed' }
    } catch (error) {
      console.error('login error:', (error as Error)?.message)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await res.json()

      if (res.ok) {
        if (typeof window !== 'undefined' && data.user) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user))
        }
        setAuthBanner(null)
        setUser(data.user)
        return { success: true }
      }
      return { success: false, error: data.error || 'Registration failed' }
    } catch (error) {
      console.error('register error:', (error as Error)?.message)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('logout error:', (error as Error)?.message)
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
    setUser(null)
    router.push('/')
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))
      }
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {authBanner ? (
        <div
          role="alert"
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-100 text-amber-900 text-center py-3 px-4 text-sm font-medium border-b border-amber-200"
        >
          {authBanner}
        </div>
      ) : null}
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected route: if there's no signed-in user and we're not in open beta,
// kick the visitor back to the marketing landing page (there is no /login).
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (BETA_OPEN_ACCESS) return
    if (!user) router.replace('/')
  }, [user, isLoading, router])

  if (isLoading) return null
  if (!BETA_OPEN_ACCESS && !user) return null
  return <>{children}</>
}
