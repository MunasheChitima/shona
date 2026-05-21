import type { Metadata } from 'next'
import Link from 'next/link'
import { getFirstPronunciationDemo } from '@/lib/pronunciation/first-demo-exercise'
import PronunciationDemoClient from './PronunciationDemoClient'

export const metadata: Metadata = {
  title: 'Pronunciation practice | Shona Learn',
  description: 'Practice Shona pronunciation with guided feedback.',
}

export default function PronunciationPage() {
  const demo = getFirstPronunciationDemo()

  if (!demo) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pronunciation practice</h1>
        <p className="text-gray-600 mb-6">
          No pronunciation exercises found in the lesson catalog. Start from{' '}
          <Link href="/learn" className="text-emerald-700 hover:underline font-medium">
            Learn
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="border-b border-white/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Pronunciation practice</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Warm up with a lesson word, then explore the Sound Guide and drills for every cluster.
          </p>
        </div>
      </div>
      <PronunciationDemoClient demo={demo} />
    </>
  )
}
