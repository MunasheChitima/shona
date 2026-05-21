'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'

type MouthPosition = {
  lips?: string
  tongue?: string
  airflow?: string
}

type GuideSound = {
  sound: string
  like?: string
  englishAnchor?: string
  example?: { shona: string; english: string; pronounced?: string }
  tip?: string
  practice?: string
  commonMistake?: string
  mouthPosition?: MouthPosition
  practiceWords?: string[]
}

type GuideLevel = {
  id: string
  title: string
  description: string
  sounds: GuideSound[]
}

type SoundGuideJson = {
  metadata?: {
    englishVsShonaIntro?: { title: string; points: string[] }
  }
  introduction?: string
  levels: GuideLevel[]
}

function soundAnchorId(sound: string) {
  return `sound-${encodeURIComponent(sound.replace(/[^a-z0-9]/gi, '-'))}`
}

export default function SoundGuidePage() {
  const [data, setData] = useState<SoundGuideJson | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/sound-guide.json')
      .then((r) => {
        if (!r.ok) throw new Error('Could not load Sound Guide')
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message || 'Load failed'))
  }, [])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <p className="text-red-700">{error}</p>
        <Link href="/learn" className="text-blue-600 underline mt-4 inline-block">
          Back to Learn
        </Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-600">
        Loading Sound Guide…
      </div>
    )
  }

  const intro = data.metadata?.englishVsShonaIntro

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl pb-24">
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
      >
        <FaArrowLeft /> Back to Learn
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shona Sound Guide</h1>
      <p className="text-gray-600 mb-8 leading-relaxed">{data.introduction}</p>

      {intro && (
        <section className="mb-10 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6">
          <h2 className="text-lg font-semibold text-emerald-900 mb-3">{intro.title}</h2>
          <ol className="list-decimal list-inside space-y-2 text-emerald-950/90 text-sm leading-relaxed">
            {intro.points.map((p: string, i: number) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </section>
      )}

      {data.levels.map((level) => (
        <section key={level.id} className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{level.title}</h2>
          <p className="text-gray-600 mb-6">{level.description}</p>
          <div className="space-y-6">
            {level.sounds.map((s) => (
              <article
                key={`${level.id}-${s.sound}`}
                id={soundAnchorId(s.sound)}
                className="scroll-mt-24 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">{s.sound}</h3>
                {s.like && <p className="text-sm text-gray-500 mt-1">Sounds like: {s.like}</p>}
                {s.englishAnchor && (
                  <p className="mt-3 text-gray-800">
                    <span className="font-medium text-blue-800">English anchor: </span>
                    {s.englishAnchor}
                  </p>
                )}
                {s.example && (
                  <p className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">Example: </span>
                    <span className="font-mono">{s.example.shona}</span> — {s.example.english}
                    {s.example.pronounced && (
                      <span className="text-gray-500"> ({s.example.pronounced})</span>
                    )}
                  </p>
                )}
                {s.tip && <p className="mt-2 text-sm text-gray-700">{s.tip}</p>}
                {s.practice && (
                  <p className="mt-2 text-sm text-amber-900 bg-amber-50 rounded-lg p-3 border border-amber-100">
                    {s.practice}
                  </p>
                )}
                {s.commonMistake && (
                  <p className="mt-2 text-sm text-red-900/90 bg-red-50 rounded-lg p-3 border border-red-100">
                    <span className="font-semibold">Common mistake: </span>
                    {s.commonMistake}
                  </p>
                )}
                {s.mouthPosition && (
                  <div className="mt-3 text-sm bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1">
                    <p className="font-semibold text-slate-800">Mouth &amp; airflow</p>
                    {s.mouthPosition.lips && (
                      <p>
                        <span className="font-medium text-slate-700">Lips: </span>
                        {s.mouthPosition.lips}
                      </p>
                    )}
                    {s.mouthPosition.tongue && (
                      <p>
                        <span className="font-medium text-slate-700">Tongue: </span>
                        {s.mouthPosition.tongue}
                      </p>
                    )}
                    {s.mouthPosition.airflow && (
                      <p>
                        <span className="font-medium text-slate-700">Airflow: </span>
                        {s.mouthPosition.airflow}
                      </p>
                    )}
                  </div>
                )}
                {s.practiceWords && s.practiceWords.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">Practice words: </span>
                    {s.practiceWords.join(', ')}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      <p className="text-sm text-gray-500">
        From vocabulary and flashcards, use the “Sound: …” chips to jump back here for the cluster you are
        working on.
      </p>
    </div>
  )
}
