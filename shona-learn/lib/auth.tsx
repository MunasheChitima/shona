'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { BETA_OPEN_ACCESS } from '@/lib/beta-access'

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
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const BETA_GUEST_USER: User = {
  id: 'beta-guest',
  name: 'Beta tester',
  email: 'beta@shona-learn.local',
  xp: 0,
  level: 1,
  streak: 0,
  hearts: 5,
}

interface BetaIdentity {
  email: string
  password: string
  name: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authBanner, setAuthBanner] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuthOnLoad()
    
    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth check taking too long, forcing completion')
        setIsLoading(false)
      }
    }, 3000) // 3 second fallback
    
    return () => clearTimeout(fallbackTimeout)
  }, [isLoading])

  const getOrCreateBetaIdentity = (): BetaIdentity | null => {
    if (typeof window === 'undefined') return null
    const key = 'betaIdentity'
    const existing = localStorage.getItem(key)
    if (existing) {
      try {
        const parsed = JSON.parse(existing) as BetaIdentity
        if (parsed.email && parsed.password && parsed.name) return parsed
      } catch {
        // fall through to regenerate identity
      }
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const identity: BetaIdentity = {
      email: `beta+${id}@shona-learn.local`,
      password: `beta-${id}`,
      name: `Beta Tester ${id.slice(-4)}`
    }
    localStorage.setItem(key, JSON.stringify(identity))
    return identity
  }

  const ensureBetaSession = async (): Promise<User | null> => {
    if (typeof window === 'undefined') return null
    const identity = getOrCreateBetaIdentity()
    if (!identity) return null

    const payload = {
      email: identity.email,
      password: identity.password
    }

    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (loginRes.ok) {
        const loginData = await loginRes.json()
        localStorage.setItem('token', loginData.token)
        localStorage.setItem('user', JSON.stringify(loginData.user))
        return loginData.user as User
      }
    } catch {
      // If login fails, try registration flow.
    }

    try {
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: identity.name,
          email: identity.email,
          password: identity.password
        })
      })

      if (registerRes.ok) {
        const registerData = await registerRes.json()
        localStorage.setItem('token', registerData.token)
        localStorage.setItem('user', JSON.stringify(registerData.user))
        return registerData.user as User
      }
    } catch {
      // Fall back to guest user below.
    }

    return null
  }

  const checkAuthOnLoad = async () => {
    try {
      if (typeof window !== 'undefined' && BETA_OPEN_ACCESS) {
        const userData = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        if (userData && token) {
          try {
            const parsed = JSON.parse(userData) as User
            setUser(parsed)
          } catch {
            const betaUser = await ensureBetaSession()
            if (betaUser) {
              setUser(betaUser)
            } else {
              setUser(BETA_GUEST_USER)
              localStorage.setItem('user', JSON.stringify(BETA_GUEST_USER))
            }
          }
        } else {
          const betaUser = await ensureBetaSession()
          if (betaUser) {
            setUser(betaUser)
          } else {
            setUser(BETA_GUEST_USER)
            localStorage.setItem('user', JSON.stringify(BETA_GUEST_USER))
          }
        }
        setIsLoading(false)
        return
      }
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData)
            // Set user immediately from localStorage
            setUser(parsedUser)
            
            // Validate token in background (don't block UI)
            setTimeout(() => {
              validateToken(token).then(isValid => {
                if (!isValid) {
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  setUser(null)
                }
              }).catch(error => {
                console.error('Background token validation failed:', error)
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                setUser(null)
              })
            }, 1000) // Delay validation to not block UI
          } catch (error) {
            console.error('Failed to parse user data:', error)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      // Always set loading to false after a short delay
      setTimeout(() => {
        setIsLoading(false)
      }, 100)
    }
  }

  const validateToken = async (token: string): Promise<boolean> => {
    if (BETA_OPEN_ACCESS) return true
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
          setAuthBanner('Session expired — please log in again.')
          setTimeout(() => {
            setAuthBanner(null)
            router.push('/login')
          }, 3200)
        }
        return false
      }
      return response.ok
    } catch (error) {
      console.error('Token validation failed:', error)
      return false
    }
  }

  const checkAuth = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    
    const token = localStorage.getItem('token')
    if (!token) return false
    
    try {
      const isValid = await validateToken(token)
      if (!isValid) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        return false
      }
      return true
    } catch (error) {
      console.error('Auth check failed:', error)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        setAuthBanner(null)
        setUser(data.user)
        return { success: true }
      } else {
        console.error('Login failed:', data.error)
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        setAuthBanner(null)
        setUser(data.user)
        return { success: true }
      } else {
        console.error('Registration failed:', data.error)
        return { success: false, error: data.error || 'Registration failed' }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    setUser(null)
    router.push('/')
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser))
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

// Protected route component — open beta bypasses auth entirely
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return <>{children}</>
} 