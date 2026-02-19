'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  const checkAuthOnLoad = async () => {
    try {
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
    try {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
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

// Protected route component with better error handling
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Force completion after 3 seconds to prevent infinite loading
    const forceComplete = setTimeout(() => {
      setAuthChecked(true)
    }, 3000)
    
    return () => clearTimeout(forceComplete)
  }, [])

  if (isLoading && !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h1>
              <p className="text-gray-600 mb-6">
                Please sign in or create an account to access the Shona learning lessons.
              </p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Create Account
              </button>
            </div>
            <div className="mt-6">
              <button
                onClick={() => router.push('/')}
                className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 