'use client'

import { useState } from 'react'
import Link from 'next/link'
import PronunciationPractice from '@/app/components/voice/PronunciationPractice'
import type { PronunciationDemoPayload } from '@/lib/pronunciation/first-demo-exercise'

export default function PronunciationDemoClient({ demo }: { demo: PronunciationDemoPayload }) {
  const [lastScore, setLastScore] = useState<number | null>(null)

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <p className="text-sm text-gray-600 mb-2">
        From lesson:{' '}
        <Link href="/learn" className="text-emerald-700 hover:underline font-medium">
          {demo.lessonTitle || demo.lessonId}
        </Link>
      </p>
      <p className="text-gray-600 mb-6">
        Practice a word with live feedback. For structured sound drills, open{' '}
        <Link href="/practice/sounds" className="text-emerald-700 hover:underline font-medium">
          Sound drills
        </Link>{' '}
        or the{' '}
        <Link href="/sound-guide" className="text-emerald-700 hover:underline font-medium">
          Sound Guide
        </Link>
        .
      </p>
      {lastScore !== null && (
        <p className="text-center text-sm text-gray-600 mb-4" aria-live="polite">
          Last score: <span className="font-semibold">{lastScore}</span>
          {lastScore >= 80 ? ' — nice work!' : ' — keep practicing or try again.'}
        </p>
      )}
      <PronunciationPractice
        word={demo.targetWord}
        translation={demo.translation}
        phonetic={demo.phonetic}
        tonePattern={demo.tonePattern}
        toneHint={demo.toneHint}
        englishAnchor={demo.englishAnchor}
        soundGuideLinks={demo.soundGuideLinks}
        commonMistakeWarning={demo.commonMistakeWarning}
        pronounceDifficulty={demo.pronounceDifficulty}
        audioFile={demo.audioFile}
        allowContinueAnyway
        onComplete={(score) => setLastScore(score)}
      />
    </div>
  )
}
