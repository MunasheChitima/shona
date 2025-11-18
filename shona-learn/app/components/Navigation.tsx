'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaBook, FaUser, FaSignOutAlt, FaTrophy, FaMap, FaGamepad } from 'react-icons/fa'

interface User {
  xp?: number
}

interface NavigationProps {
  user: User | null
}

export default function Navigation({ user }: NavigationProps) {
  const router = useRouter()
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }
  
  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-soft border-b border-white/20 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div>
              <span className="text-3xl">🇿🇼</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Learn Shona
              </span>
              <div className="text-xs text-gray-500">Master Zimbabwe&apos;s Language</div>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/quests" className="group">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-purple-50 transition-colors">
                <FaMap className="text-purple-600 group-hover:text-purple-700" />
                <span className="font-medium text-gray-700 group-hover:text-purple-700">Quests</span>
              </div>
            </Link>
            
            <Link href="/learn" className="group">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-green-50 transition-colors">
                <FaBook className="text-green-600 group-hover:text-green-700" />
                <span className="font-medium text-gray-700 group-hover:text-green-700">Learn</span>
              </div>
            </Link>
            
            <Link href="/games" className="group">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors">
                <FaGamepad className="text-orange-600 group-hover:text-orange-700" />
                <span className="font-medium text-gray-700 group-hover:text-orange-700">Games</span>
              </div>
            </Link>
            
            <Link href="/profile" className="group">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                <FaUser className="text-blue-600 group-hover:text-blue-700" />
                <span className="font-medium text-gray-700 group-hover:text-blue-700">Profile</span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-xl border border-yellow-200">
              <FaTrophy className="text-yellow-600" />
              <span className="font-bold text-gray-700">{user?.xp || 0}</span>
              <span className="text-sm text-gray-600">XP</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors group"
            >
              <FaSignOutAlt className="text-red-600 group-hover:text-red-700" />
              <span className="font-medium text-gray-700 group-hover:text-red-700">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
