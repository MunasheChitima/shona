'use client'
import { useRouter, usePathname } from 'next/navigation'
import { FaBook, FaUser, FaClone, FaGamepad, FaScroll } from 'react-icons/fa'
import { useState } from 'react'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/learn', icon: FaBook, label: 'lessons', ariaLabel: 'Go to learning lessons' },
    { href: '/flashcards', icon: FaClone, label: 'flashcards', ariaLabel: 'Go to vocabulary flashcards' },
    { href: '/games', icon: FaGamepad, label: 'games', ariaLabel: 'Go to learning games' },
    { href: '/quests', icon: FaScroll, label: 'quests', ariaLabel: 'Go to quests' },
    { href: '/profile', icon: FaUser, label: 'profile', ariaLabel: 'Go to user profile' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav
      className="bg-[#fffdf7]/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-stone-900 text-white px-4 py-2 rounded z-50"
      >
        skip to main content
      </a>

      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-base" aria-label="Shona Learning App logo">🇿🇼</span>
            <span className="text-base font-medium tracking-tight text-stone-900">shona learn</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.href)
                    ? 'text-stone-900 bg-stone-100'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/60'
                  }
                `}
                aria-label={item.ariaLabel}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block rounded-full border border-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-600">
              open beta
            </span>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden py-3 border-t border-stone-200" role="menu">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href)
                  setIsMobileMenuOpen(false)
                }}
                className={`
                  w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors
                  ${isActive(item.href)
                    ? 'text-stone-900 bg-stone-100'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/60'
                  }
                `}
                role="menuitem"
                aria-label={item.ariaLabel}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
