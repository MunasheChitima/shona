'use client'
import React from 'react'
import { motion } from 'framer-motion'

export interface StudyCard {
  id: string
  shona: string
  english: string
  pronunciation?: string
  example?: string
  translation?: string
}

interface FlashcardCardProps {
  card: StudyCard
  isFlipped: boolean
  onFlip: () => void
}

/**
 * A single, satisfying 3D flip card.
 * Front: Shona term + pronunciation (with an audio seam for later).
 * Back: English meaning + optional example sentence.
 *
 * The flip is a real rotateY transform with hidden backfaces, so the two
 * faces share the same physical space and rotate together.
 */
export default function FlashcardCard({ card, isFlipped, onFlip }: FlashcardCardProps) {
  return (
    <div className="[perspective:1600px] w-full" style={{ touchAction: 'pan-y' }}>
      <motion.button
        type="button"
        onClick={onFlip}
        // Suppress the browser's native drag-and-drop on the card. Without this,
        // dragging the card (it contains text) could start a native DnD whose
        // drop navigates the whole document to about:blank.
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        aria-label={isFlipped ? 'flip to shona term' : 'flip to english meaning'}
        className="relative w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded-2xl select-none"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT — Shona */}
        <div
          className="bg-white/80 backdrop-blur rounded-2xl border border-stone-200 min-h-[20rem] sm:min-h-[24rem] p-8 flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <span className="text-xs uppercase tracking-widest text-stone-400 mb-6">shona</span>
          {/* audio hook: term — render the Shona term so an audio button can attach here later */}
          <p className="text-4xl sm:text-5xl font-medium tracking-tight text-stone-900 break-words">
            {card.shona}
          </p>
          {card.pronunciation ? (
            <p className="mt-4 text-stone-500 text-lg">{card.pronunciation}</p>
          ) : null}
          <p className="mt-auto pt-8 text-xs text-stone-400 lowercase">tap to reveal meaning</p>
        </div>

        {/* BACK — English */}
        <div
          className="absolute inset-0 bg-white/80 backdrop-blur rounded-2xl border border-stone-200 min-h-[20rem] sm:min-h-[24rem] p-8 flex flex-col items-center justify-center text-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-xs uppercase tracking-widest text-stone-400 mb-6">meaning</span>
          <p className="text-3xl sm:text-4xl font-medium tracking-tight text-stone-900 break-words">
            {card.english}
          </p>
          {card.example ? (
            <div className="mt-6 max-w-sm">
              <p className="text-stone-700">{card.example}</p>
              {card.translation ? (
                <p className="mt-1 text-sm text-stone-500 italic">{card.translation}</p>
              ) : null}
            </div>
          ) : null}
          <p className="mt-auto pt-8 text-xs text-stone-400 lowercase">how well did you recall it?</p>
        </div>
      </motion.button>
    </div>
  )
}
