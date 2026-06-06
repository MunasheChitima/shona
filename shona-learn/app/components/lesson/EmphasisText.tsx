'use client'
/**
 * Renders feedback/explanation text that may contain simple `*emphasis*`
 * markdown, turning the emphasised spans into <em> instead of leaking raw
 * asterisks to the learner (bug #2). Plain text passes through unchanged.
 */
import { parseEmphasis } from './feedback'

export default function EmphasisText({ text }: { text: string | null | undefined }) {
  const runs = parseEmphasis(text)
  if (runs.length === 0) return null
  return (
    <>
      {runs.map((run, i) =>
        run.emphasis ? (
          <em key={i} className="font-medium not-italic underline decoration-current/30 underline-offset-2">
            {run.text}
          </em>
        ) : (
          <span key={i}>{run.text}</span>
        )
      )}
    </>
  )
}
