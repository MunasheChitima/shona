'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const errs: { email?: string; password?: string } = {}
    if (!formData.email) {
      errs.email = 'Email is required'
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      errs.email = 'Invalid email format'
    }
    if (!formData.password) {
      errs.password = 'Password is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setErrors({})
    
    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        router.push('/learn')
      } else {
        setErrors({ server: result.error || 'Invalid email or password. Please try again.' })
      }
    } catch (error: any) {
      setErrors({ server: error.message || 'Login failed' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue learning Shona</p>
        </div>
        
        {errors.server && (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6" data-testid="error-message">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {errors.server}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              disabled={isLoading}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter your email"
            />
            {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              disabled={isLoading}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Enter your password"
            />
            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-300 disabled:to-green-400 text-white font-bold py-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 