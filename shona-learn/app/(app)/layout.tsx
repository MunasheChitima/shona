'use client'
import { useEffect, useState } from 'react'
import Navigation from '../components/Navigation'
import OnboardingFlow from '../components/OnboardingFlow'

const ONBOARDED_KEY = 'shona_onboarded'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const flag = localStorage.getItem(ONBOARDED_KEY)
      if (!flag) setShowOnboarding(true)
    } catch {
      // localStorage unavailable; skip onboarding silently.
    }
  }, [])

  const completeOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDED_KEY, '1')
    } catch {
      // ignore
    }
    setShowOnboarding(false)
  }

  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <header role="banner">
        <Navigation />
      </header>
      <main id="main-content" role="main" tabIndex={-1}>
        {children}
      </main>
      <footer
        role="contentinfo"
        className="bg-white/80 backdrop-blur-sm border-t border-amber-100/40 py-8 mt-16"
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            © 2025 Shona Learning App. Learn the beautiful language of Zimbabwe.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Made with love for Shona language preservation and education.
          </p>
        </div>
      </footer>

      {showOnboarding ? <OnboardingFlow onComplete={completeOnboarding} /> : null}
    </div>
  )
}
