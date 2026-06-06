'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

/**
 * Thin emerald progress affordance pinned to the very top of the viewport.
 * On every committed route change it animates a quick fill-and-fade to
 * signal that navigation happened. Subtle and dependency-free.
 */
export default function RouteProgress() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [firstRender, setFirstRender] = useState(true)

  useEffect(() => {
    // Skip the very first mount so we don't flash on initial load.
    if (firstRender) {
      setFirstRender(false)
      return
    }
    if (reduceMotion) return

    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 550)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="h-full origin-left bg-emerald-500"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              scaleX: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.15 },
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
