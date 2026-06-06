'use client'
/**
 * Shared full-attention modal surface for the lesson loop. Gives every modal
 * (exercise, review, celebration) the same backdrop blur, entrance/exit
 * animation, mobile-first full-height behaviour, and outside/escape dismissal
 * so the flow feels continuous as one surface hands off to the next.
 */
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ErrorBoundary from '../ErrorBoundary'

type LessonShellProps = {
  children: React.ReactNode
  onRequestClose: () => void
  /** Max width of the panel. */
  maxWidth?: 'xl' | '2xl' | 'md'
  testId?: string
  contentTestId?: string
  /** When false, clicking the backdrop / pressing escape will not close. */
  dismissible?: boolean
}

const MAX_W: Record<NonNullable<LessonShellProps['maxWidth']>, string> = {
  md: 'max-w-md',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}

export default function LessonShell({
  children,
  onRequestClose,
  maxWidth = '2xl',
  testId,
  contentTestId,
  dismissible = true,
}: LessonShellProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Lightweight focus management: pull focus into the panel on mount and keep
  // tabbing from escaping the surface (focus-trap-ish, no extra deps).
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    // Defer so children (inputs, buttons) have mounted.
    const t = window.setTimeout(() => {
      const focusable = panel.querySelector<HTMLElement>(
        'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      ;(focusable ?? panel).focus()
    }, 30)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'input:not([disabled]), button:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    panel.addEventListener('keydown', onKeyDown)
    // Prevent body scroll behind the modal on mobile.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(t)
      panel.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [])

  return (
    <ErrorBoundary>
      <div
        className="fixed inset-0 z-50 flex items-stretch justify-center bg-stone-900/40 backdrop-blur-sm modal-backdrop sm:items-center sm:p-4"
        data-testid={testId}
        onClick={(e) => {
          if (
            dismissible &&
            (e.target as HTMLElement).classList.contains('modal-backdrop')
          ) {
            onRequestClose()
          }
        }}
      >
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          initial={{ scale: 0.97, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className={`flex max-h-screen w-full ${MAX_W[maxWidth]} flex-col overflow-y-auto border-stone-200 bg-[#fffdf7] shadow-xl outline-none sm:max-h-[92vh] sm:rounded-3xl sm:border`}
          data-testid={contentTestId}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </div>
    </ErrorBoundary>
  )
}
