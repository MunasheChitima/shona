/**
 * Voice-type exercises in `ExerciseModal` render only when this is true.
 * Exercises with `type === 'pronunciation'` still use `PronunciationPractice` (speech recognition + optional file).
 * Turn on in production only after verifying mic permissions, audio paths, and any TTS provider keys — see
 * `plans/IMPLEMENTATION_PLAN.md` and `lib/services/AudioService.ts`.
 */
export const AUDIO_ENABLED = false


