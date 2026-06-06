'use client'
import { FaVolumeUp } from 'react-icons/fa'

/**
 * Renders a Shona word/phrase with a clean seam for audio.
 *
 * The user is wiring up audio separately. When that lands, an audio player can
 * read `data-shona` off the rendered element (or the `onPlay` prop can be
 * supplied) and the speaker button becomes active. Until then the button is
 * rendered disabled so the layout is final and nothing shifts later.
 *
 * {/* audio hook: the Shona term is exposed via the `term` prop + data-shona attr *\/}
 */
export default function ShonaTerm({
  term,
  className = '',
  showAudio = true,
  onPlay,
}: {
  term: string
  className?: string
  showAudio?: boolean
  onPlay?: (term: string) => void
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} data-shona={term}>
      <span>{term}</span>
      {showAudio && (
        <button
          type="button"
          // Disabled until audio is wired up; kept in the DOM so spacing is final.
          disabled={!onPlay}
          onClick={onPlay ? () => onPlay(term) : undefined}
          aria-label={`Play pronunciation of ${term}`}
          className="shrink-0 text-stone-300 transition-colors enabled:hover:text-emerald-600 disabled:cursor-default"
        >
          <FaVolumeUp className="text-[0.7em]" aria-hidden />
        </button>
      )}
    </span>
  )
}
