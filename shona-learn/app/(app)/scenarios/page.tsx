'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaPhone, FaClock, FaArrowRight } from 'react-icons/fa'
import { ProtectedRoute } from '../../../lib/auth'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBoundary from '../../components/ErrorBoundary'
import AuthError from '../../components/AuthError'
import { apiAuthHeaders } from '@/lib/api-auth-headers'

type ScenarioPackSummary = {
  id: string
  title: string
  subtitle: string
  emoji: string
  whenToUse: string
  estimatedMinutes: number
  difficulty: string
  needs_verification?: boolean
  phraseCount: number
  exerciseCount: number
}

function difficultyClasses(difficulty: string): string {
  switch ((difficulty || '').toLowerCase()) {
    case 'beginner':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'intermediate':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'advanced':
      return 'bg-rose-100 text-rose-700 border-rose-200'
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200'
  }
}

export default function ScenariosPage() {
  const [packs, setPacks] = useState<ScenarioPackSummary[] | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const fetchPacks = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/scenarios', { headers: { ...apiAuthHeaders() } })
      if (!res.ok) {
        throw new Error(`Failed to load scenarios (${res.status})`)
      }
      const data = await res.json()
      setPacks(Array.isArray(data.packs) ? data.packs : [])
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error loading scenarios'))
    }
  }, [])

  useEffect(() => {
    fetchPacks()
  }, [fetchPacks])

  if (error) {
    return <AuthError error={error.message} onRetry={() => void fetchPacks()} />
  }

  if (!packs) {
    return <LoadingSpinner fullScreen message="loading scenarios..." />
  }

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-app-surface">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-stone-900 lowercase">scenarios</h1>
              <p className="mt-2 text-stone-600">
                phrases bundled for the moments that actually happen — calls home, weddings, hard
                news. pick a scenario, rehearse it, then make the call.
              </p>
            </div>

            {packs.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600">
                no scenarios yet — check back soon.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {packs.map((pack, index) => (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link
                      href={`/scenarios/${pack.id}`}
                      className="block h-full"
                      data-testid="scenario-card"
                    >
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="group relative h-full rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-5xl" aria-hidden="true">
                            {pack.emoji}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-xl font-semibold text-stone-900 lowercase">
                              {pack.title}
                            </h2>
                            <p className="mt-1 text-sm text-stone-600 lowercase">{pack.subtitle}</p>
                          </div>
                        </div>

                        <p className="mt-4 text-sm text-stone-700">
                          <span className="font-semibold text-stone-900">when to use:</span>{' '}
                          {pack.whenToUse}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold ${difficultyClasses(
                              pack.difficulty
                            )}`}
                          >
                            {pack.difficulty}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-stone-700">
                            <FaClock className="text-stone-500" /> {pack.estimatedMinutes} min
                          </span>
                          <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-stone-700">
                            {pack.phraseCount} phrases
                          </span>
                          {pack.needs_verification ? (
                            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">
                              draft — pending review
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-6 flex items-center justify-end text-sm font-semibold text-emerald-700 group-hover:text-emerald-800">
                          start scenario <FaArrowRight className="ml-2" />
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="mt-12 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-600 flex items-center gap-2">
              <FaPhone className="text-stone-500" />
              <span>
                audio recordings are coming — a shona-speaking voice actor is recording each phrase.
              </span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  )
}
