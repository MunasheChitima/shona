'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navigation from './Navigation'
import PageTransition from './PageTransition'
import RouteProgress from './RouteProgress'

const OnboardingFlow = dynamic(() => import('./OnboardingFlow'), {
  ssr: false,
  loading: () => null,
})

const ONBOARDED_KEY = 'shona_onboarded'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Show once per browser: gate purely on the onboarded flag so it works in
    // dev too (the flow itself sets the flag on complete/skip).
    try {
      const flag = localStorage.getItem(ONBOARDED_KEY)
      if (!flag) setShowOnboarding(true)
    } catch {
      // localStorage unavailable; skip onboarding silently.
    }
  }, [])

  const completeOnboarding = () => {
    // OnboardingFlow persists the `shona_onboarded` flag itself; just hide it.
    setShowOnboarding(false)
  }

  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <RouteProgress />
      <header role="banner">
        <Navigation />
      </header>
      <main id="main-content" role="main" tabIndex={-1}>
        <PageTransition>{children}</PageTransition>
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
