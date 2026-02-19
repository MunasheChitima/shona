import { useRouter } from 'next/navigation'
import { FaExclamationTriangle, FaSignInAlt, FaUserPlus, FaRedo } from 'react-icons/fa'

interface AuthErrorProps {
  error: string
  onRetry?: () => void
  showLogin?: boolean
  showRegister?: boolean
}

export default function AuthError({ 
  error, 
  onRetry, 
  showLogin = true, 
  showRegister = true 
}: AuthErrorProps) {
  const router = useRouter()

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'Authentication required':
        return 'Please log in to access this content'
      case 'Authentication expired. Please login again.':
        return 'Your session has expired. Please log in again to continue.'
      case 'Network error. Please try again.':
        return 'Unable to connect to the server. Please check your internet connection and try again.'
      case 'Failed to load lessons':
        return 'There was a problem loading your lessons. Please try again in a moment.'
      default:
        return error
    }
  }

  const getErrorIcon = (error: string) => {
    if (error.includes('Authentication') || error.includes('session')) {
      return <FaSignInAlt className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
    }
    return <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {getErrorIcon(error)}
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {error.includes('Authentication') ? 'Authentication Required' : 'Something went wrong'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {getErrorMessage(error)}
        </p>
        
        <div className="space-y-3">
          {error.includes('Authentication') && showLogin && (
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaSignInAlt />
              Log In
            </button>
          )}
          
          {error.includes('Authentication') && showRegister && (
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaUserPlus />
              Create Account
            </button>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaRedo />
              Try Again
            </button>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
} 