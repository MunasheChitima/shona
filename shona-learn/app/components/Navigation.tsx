'use client'
import { useRouter, usePathname } from 'next/navigation'
import { FaHome, FaBook, FaUser, FaSignOutAlt, FaTrophy, FaUsers, FaBars, FaTimes, FaVolumeUp, FaLayerGroup, FaPalette, FaClone } from 'react-icons/fa'
import { useState } from 'react'
import { AUDIO_ENABLED } from '@/lib/featureFlags'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navItems = [
    { href: '/', icon: FaHome, label: 'Home', ariaLabel: 'Go to home page' },
    { href: '/learn', icon: FaBook, label: 'Learn', ariaLabel: 'Go to learning lessons' },
    { href: '/conversational-lessons', icon: FaUsers, label: 'Conversations', ariaLabel: 'Go to conversational lessons' },
    { href: '/quests', icon: FaTrophy, label: 'Quests', ariaLabel: 'Go to quests and challenges' },
    { href: '/profile', icon: FaUser, label: 'Profile', ariaLabel: 'Go to user profile' },
    { href: '/flashcards', icon: FaClone, label: 'Flashcards', ariaLabel: 'Go to vocabulary flashcards' },
    ...(AUDIO_ENABLED ? [{ href: '/pronunciation-test', icon: FaVolumeUp, label: 'Pronunciation Test', ariaLabel: 'Go to pronunciation practice' }] : []),
    { href: '/integrated-vocabulary', icon: FaLayerGroup, label: 'Integrated Vocabulary', ariaLabel: 'Go to integrated vocabulary view' },
    { href: '/theme-demo', icon: FaPalette, label: 'Theme Demo', ariaLabel: 'Go to theme demonstration' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50">
        Skip to main content
      </a>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-zimbabwe rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white text-xl font-bold" aria-label="Shona Learning App logo">🇿🇼</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Shona Learn</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-gradient-zimbabwe text-white shadow-medium'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }
                `}
                aria-label={item.ariaLabel}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <item.icon className="w-4 h-4" />
                <span className="ml-2">{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user.name}</span>
                  <span className="ml-2">Level {Math.floor((user.xp || 0) / 100) + 1}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
                  aria-label="Logout from account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  aria-label="Go to login page"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="px-4 py-2 bg-gradient-zimbabwe text-white rounded-xl font-medium transition-all duration-200 hover:shadow-medium"
                  aria-label="Go to registration page"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200" role="menu">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href)
                  setIsMobileMenuOpen(false)
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.href)
                    ? 'bg-gradient-zimbabwe text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }
                `}
                role="menuitem"
                aria-label={item.ariaLabel}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <div className="flex items-center">
                  <item.icon className="w-4 h-4" />
                  <span className="ml-3">{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
} 