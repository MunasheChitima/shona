'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CheckpointSectionPublic } from '@/lib/checkpoints/score'
import { BETA_OPEN_ACCESS } from '@/lib/beta-access'
import { apiAuthHeaders } from '@/lib/api-auth-headers'

type CheckpointPayload = {
  checkpointId: string
  unitId: string
  stageTitle: string
  title: string
  passingScore: number
  sections: CheckpointSectionPublic[]
  overallPassPercent: number
  sectionPassPercent: number
}

type CheckpointModalProps = {
  unitId: string
  onClose: () => void
  onPassed: () => void
  getToken: () => string | null
}

export default function CheckpointModal({ unitId, onClose, onPassed, getToken }: CheckpointModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CheckpointPayload | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    passed: boolean
    overallPercent: number
    sectionScores: { sectionId: string; percent: number; passed: boolean }[]
    newAchievements: { code: string; title: string }[]
  } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token && !BETA_OPEN_ACCESS) {
        setError('Sign in required')
        setLoading(false)
        return
      }
      const res = await fetch(`/api/checkpoints/unit/${unitId}`, {
        headers: { ...apiAuthHeaders() },
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'Could not load checkpoint')
        setLoading(false)
        return
      }
      const json = await res.json()
      setData(json)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [getToken, unitId])

  useEffect(() => {
    void load()
  }, [load])

  const setAnswer = (qid: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionIndex }))
  }

  const submit = async () => {
    if (!data) return
    const token = getToken()
    if (!token && !BETA_OPEN_ACCESS) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/checkpoints/${data.checkpointId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...apiAuthHeaders(),
        },
        body: JSON.stringify({ answers })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error || 'Submit failed')
        setSubmitting(false)
        return
      }
      setResult({
        passed: json.passed,
        overallPercent: json.overallPercent,
        sectionScores: json.sectionScores || [],
        newAchievements: json.newAchievements || []
      })
      if (json.passed) onPassed()
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const allAnswered =
    data && data.sections.every((s) => s.questions.every((q) => answers[q.id] !== undefined))

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-start gap-2">
          <div>
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Stage checkpoint</div>
            <h2 className="text-xl font-bold text-gray-900">{data?.title ?? 'Checkpoint'}</h2>
            {data ? <p className="text-sm text-gray-600 mt-0.5">{data.stageTitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl leading-none px-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4">
          {loading ? <p className="text-gray-600">Loading assessment…</p> : null}
          {error ? <p className="text-red-600 text-sm mb-3">{error}</p> : null}

          {result ? (
            <div className="space-y-3">
              <p className={`text-lg font-bold ${result.passed ? 'text-green-700' : 'text-amber-800'}`}>
                {result.passed ? 'You passed this checkpoint!' : 'Not quite — review and try again.'}
              </p>
              <p className="text-gray-700">Score: {result.overallPercent}%</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {result.sectionScores.map((s) => (
                  <li key={s.sectionId}>
                    {s.sectionId}: {s.percent}% {s.passed ? '✓' : '(below threshold)'}
                  </li>
                ))}
              </ul>
              {result.newAchievements.length > 0 ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm">
                  <div className="font-semibold text-emerald-900">New achievements</div>
                  <ul className="mt-1 list-disc list-inside">
                    {result.newAchievements.map((a) => (
                      <li key={a.code}>{a.title}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          ) : data ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Pass at {data.overallPassPercent}% overall, with at least {data.sectionPassPercent}% in each
                skill area. You can retake anytime.
              </p>
              <div className="space-y-6">
                {data.sections.map((section) => (
                  <div key={section.id}>
                    <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                    <div className="space-y-4">
                      {section.questions.map((q) => (
                        <fieldset key={q.id} className="border border-gray-100 rounded-xl p-3">
                          <legend className="text-sm font-medium text-gray-800 px-1">{q.prompt}</legend>
                          {q.audioText ? (
                            <p className="text-xs text-gray-500 mt-1 italic">Listen / say: {q.audioText}</p>
                          ) : null}
                          <div className="mt-2 space-y-2">
                            {q.options.map((opt, idx) => (
                              <label
                                key={`${q.id}-${idx}`}
                                className="flex items-center gap-2 text-sm cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  checked={answers[q.id] === idx}
                                  onChange={() => setAnswer(q.id, idx)}
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={!allAnswered || submitting}
                onClick={() => void submit()}
                className="w-full mt-6 py-3 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700"
              >
                {submitting ? 'Submitting…' : 'Submit checkpoint'}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
