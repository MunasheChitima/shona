export type SM2Input = {
  easeFactor: number
  intervalDays: number
  repetitions: number
  quality: number
  now?: Date
}

export type SM2Output = {
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewAt: Date
}

export function clampQuality(quality: number): number {
  return Math.max(0, Math.min(5, Math.floor(quality)))
}

export function applySM2(input: SM2Input): SM2Output {
  const quality = clampQuality(input.quality)
  const now = input.now ?? new Date()
  let easeFactor = input.easeFactor || 2.5
  let repetitions = input.repetitions || 0
  let intervalDays = Math.max(1, input.intervalDays || 1)

  // Per SM-2 variants, a low-quality review resets repetition progress.
  if (quality < 3) {
    repetitions = 0
    intervalDays = 1
  } else {
    repetitions += 1
    if (repetitions === 1) intervalDays = 1
    else if (repetitions === 2) intervalDays = 6
    else intervalDays = Math.round(intervalDays * easeFactor)
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  easeFactor = Math.max(1.3, easeFactor)

  const nextReviewAt = new Date(now)
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays)

  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt
  }
}
