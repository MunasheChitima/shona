'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FaBook, FaUser, FaClone, FaGamepad, FaPhone } from 'react-icons/fa'
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export default function Navigation() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/learn', icon: FaBook, label: 'lessons', ariaLabel: 'Go to learning lessons' },
    // hidden from launch — re-enable when ≥3 native-verified scenario packs exist
    // { href: '/scenarios', icon: FaPhone, label: 'scenarios', ariaLabel: 'Go to scenario phrase packs' },
    { href: '/flashcards', icon: FaClone, label: 'flashcards', ariaLabel: 'Go to vocabulary flashcards' },
    { href: '/games', icon: FaGamepad, label: 'games', ariaLabel: 'Go to learning games' },
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
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? 'text-stone-900'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100/60'
                    }
                  `}
                  aria-label={item.ariaLabel}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-lg bg-stone-100"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 500, damping: 40 }
                      }
                    />
                  )}
                  <item.icon className="relative w-4 h-4" />
                  <span className="relative">{item.label}</span>
                </Link>
              )
            })}
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
        <AnimatePresence initial={false}>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden overflow-hidden"
              initial={reduceMotion ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduceMotion ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="py-3 border-t border-stone-200" role="menu">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
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
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
