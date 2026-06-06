'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Animates a number from 0 to `target` once `active` is true. Used for the
 * earned-score reveal on the celebration screen. Uses requestAnimationFrame
 * with an ease-out curve so the count slows as it lands.
 */
export function useCountUp(target: number, active: boolean, durationMs = 1100): number {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }
    const safeTarget = Number.isFinite(target) ? target : 0
    if (safeTarget <= 0) {
      setValue(0)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * safeTarget))
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, active, durationMs])

  return value
}
