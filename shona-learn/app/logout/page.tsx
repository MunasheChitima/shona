'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Logout() {
  const router = useRouter()

  useEffect(() => {
    // Clear user data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Redirect to home page
    router.push('/')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Logging out...</h1>
        <p className="text-gray-600">Thank you for learning Shona!</p>
      </div>
    </div>
  )
} 