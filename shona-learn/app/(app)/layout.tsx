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
        className="border-t border-stone-200 bg-[#fffdf7]/60 py-10 mt-20"
      >
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-stone-500">
            <p>© 2025 shona learn</p>
            <p>built with care for shona language &amp; culture.</p>
          </div>
        </div>
      </footer>

      {showOnboarding ? <OnboardingFlow onComplete={completeOnboarding} /> : null}
    </div>
  )
}
