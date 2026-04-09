import type { Metadata } from 'next'
import Link from 'next/link'
import { loadGeneratedPronunciationDrills } from '@/lib/pronunciation/generated-drills'
import SoundDrillsClient from './SoundDrillsClient'

export const metadata: Metadata = {
  title: 'Sound drills | Shona Learn',
  description: 'Pronunciation drills: minimal pairs, sound isolation, and rhythm.',
}

export default function SoundDrillsPage() {
  const drills = loadGeneratedPronunciationDrills()

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
      <div className="mb-8">
        <Link
          href="/sound-guide"
          className="text-sm text-emerald-700 hover:underline font-medium"
        >
          ← Sound Guide
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Sound drills</h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Curated pronunciation drills from the curriculum. Pick a word, listen, and practice with speech
          recognition. For theory and diagrams, use the Sound Guide.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Authentic audio files are optional — when missing under <code className="text-xs bg-gray-100 px-1 rounded">/content/audio/</code>, the app falls back to browser speech (see AudioService).
        </p>
      </div>
      <SoundDrillsClient drills={drills} />
    </div>
  )
}
