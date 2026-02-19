'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'

export default function Register() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const errs: { name?: string; email?: string; password?: string; confirmPassword?: string } = {}
    if (!formData.name) {
      errs.name = 'Name is required'
    }
    if (!formData.email) {
      errs.email = 'Email is required'
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      errs.email = 'Invalid email format'
    }
    if (!formData.password) {
      errs.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('handleSubmit called')
    if (!validate()) return
    setIsLoading(true)
    setErrors({})
    try {
      const result = await register(formData.name, formData.email, formData.password)
      
      if (result.success) {
        router.push('/learn')
      } else {
        setErrors({ server: result.error || 'Registration failed. Please try again.' })
      }
    } catch (error: any) {
      setErrors({ server: error.message || 'Registration failed' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({...formData, [field]: value})
    
    // Clear validation error when user starts typing
    if (errors[field]) {
      setErrors({...errors, [field]: ''})
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us to start learning Shona</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              required
              disabled={isLoading}
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
            />
            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              disabled={isLoading}
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
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
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Create a password (min 8 characters)"
            />
            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              disabled={isLoading}
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 transition-colors ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <div className="text-red-500 text-sm">{errors.confirmPassword}</div>}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-300 disabled:to-green-400 text-white font-bold py-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Start Learning'
            )}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 