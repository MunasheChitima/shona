import { useRouter } from 'next/navigation'
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'

interface AuthErrorProps {
  error: string
  onRetry?: () => void
}

export default function AuthError({ error, onRetry }: AuthErrorProps) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-app-surface flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Something went wrong
        </h2>

        <p className="text-gray-600 mb-6">{error}</p>

        <div className="space-y-3">
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