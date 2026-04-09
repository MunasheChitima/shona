'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import PronunciationPractice from '@/app/components/voice/PronunciationPractice'
import { findSoundGuideLinks, primaryCommonMistakeHint } from '@/lib/pronunciation/sound-guide-links'
import type { GeneratedDrillRow } from '@/lib/pronunciation/generated-drills'

type Props = {
  drills: GeneratedDrillRow[]
}

export default function SoundDrillsClient({ drills }: Props) {
  const [activeKey, setActiveKey] = useState(drills[0]?.key ?? '')

  const active = useMemo(
    () => drills.find((d) => d.key === activeKey) ?? drills[0],
    [drills, activeKey]
  )

  if (!drills.length) {
    return (
      <p className="text-gray-600">
        No drills in catalog yet.{' '}
        <Link href="/sound-guide" className="text-emerald-700 underline">
          Open the Sound Guide
        </Link>
        .
      </p>
    )
  }

  const clusters = active ? findSoundGuideLinks(active.shona) : []
  const mistake = primaryCommonMistakeHint(clusters)

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Drill list</h2>
        <ul className="space-y-1 max-h-[70vh] overflow-y-auto pr-2 text-sm">
          {drills.map((d) => (
            <li key={d.key}>
              <button
                type="button"
                onClick={() => setActiveKey(d.key)}
                className={`w-full text-left rounded-xl px-3 py-2 transition-colors ${
                  d.key === active?.key
                    ? 'bg-emerald-100 text-emerald-900 font-medium'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <span className="text-gray-500 block text-xs">{d.exerciseTitle}</span>
                <span className="text-base">{d.shona}</span>
                <span className="text-gray-600 block text-xs">{d.english}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        {active && (
          <PronunciationPractice
            key={active.key}
            word={active.shona}
            translation={active.english}
            phonetic=""
            englishAnchor={active.focusSound ? `Focus: ${active.focusSound}` : undefined}
            soundGuideLinks={clusters}
            commonMistakeWarning={mistake}
            audioFile={active.audioFile}
            allowContinueAnyway
            onComplete={() => {}}
          />
        )}
      </div>
    </div>
  )
}
