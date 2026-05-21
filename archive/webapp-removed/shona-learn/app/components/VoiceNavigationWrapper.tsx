'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import VoiceNavigation to avoid SSR issues
const VoiceNavigation = dynamic(() => import('./voice/VoiceNavigation'), {
  ssr: false,
  loading: () => null
})

export default function VoiceNavigationWrapper() {
  return (
    <Suspense fallback={null}>
      <VoiceNavigation />
    </Suspense>
  )
} 