/**
 * Microcopy + small primitives shared across the lesson loop. Kept supportive
 * and calm — never punishing on a wrong answer.
 */

const CORRECT_MICROCOPY = [
  'correct',
  'nicely done',
  'spot on',
  'that\'s it',
  'sharp',
  'zvakanaka', // "it's good"
]

const WRONG_MICROCOPY = [
  'not quite — you\'ll get it',
  'close, keep going',
  'no worries, here\'s the answer',
  'almost — learn it and move on',
]

/** Deterministic pick so the same exercise shows stable copy across re-renders. */
function pick(list: string[], seed: number): string {
  const i = Math.abs(seed) % list.length
  return list[i]
}

export function correctMicrocopy(seed: number): string {
  return pick(CORRECT_MICROCOPY, seed)
}

export function wrongMicrocopy(seed: number): string {
  return pick(WRONG_MICROCOPY, seed)
}

/**
 * Subtle combo/streak microcopy. Returns null below the threshold so we don't
 * shout about a 2-answer run.
 */
export function comboLabel(combo: number): string | null {
  if (combo < 2) return null
  if (combo >= 8) return `${combo} in a row · on fire`
  if (combo >= 5) return `${combo} in a row · rolling`
  return `${combo} in a row`
}

/** A warm Shona phrase for the celebration, scaled to performance. */
export function celebrationPhrase(accuracy: number): { shona: string; english: string } {
  if (accuracy >= 0.9) return { shona: 'wakanyatsogona!', english: 'you really nailed it!' }
  if (accuracy >= 0.7) return { shona: 'wakaita zvakanaka!', english: 'you did well!' }
  if (accuracy >= 0.5) return { shona: 'uri kufambira mberi!', english: 'you\'re making progress!' }
  return { shona: 'ramba uchidzidza!', english: 'keep learning!' }
}

/** Convert a small seed string into a stable integer. */
export function seedFrom(s: string | number | undefined): number {
  const str = String(s ?? '')
  let n = 0
  for (let i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) & 0x7fffffff
  return n || 1
}

// ── markdown emphasis ─────────────────────────────────────────────
// Authored explanations contain simple `*emphasis*` markdown (e.g. "*mh* and
// *nh*"). Splits text into runs so the renderer can italicise the emphasised
// spans instead of leaking raw asterisks to the learner (bug #2).
export type TextRun = { text: string; emphasis: boolean }

export function parseEmphasis(input: string | null | undefined): TextRun[] {
  const text = String(input ?? '')
  if (!text) return []
  const runs: TextRun[] = []
  // *word* or **word** — non-greedy, no nested asterisks, no empty spans.
  const re = /\*{1,2}([^*]+?)\*{1,2}/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push({ text: text.slice(last, m.index), emphasis: false })
    runs.push({ text: m[1], emphasis: true })
    last = m.index + m[0].length
  }
  if (last < text.length) runs.push({ text: text.slice(last), emphasis: false })
  return runs
}

/** Hard-strip any stray markdown asterisks (fallback for plain-text contexts). */
export function stripMarkdown(input: string | null | undefined): string {
  return String(input ?? '').replace(/\*{1,2}([^*]+?)\*{1,2}/g, '$1').replace(/\*+/g, '')
}

// ── lenient answer matching ───────────────────────────────────────
// Type-in answers should accept any clearly-correct response, ignoring case,
// punctuation, diacritics, articles, and optional parentheticals (bug #3).
function normalizeAnswer(s: unknown): string {
  const base = String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics/accents
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ') // drop optional "(...)" parts
    .replace(/[^a-z0-9\s]/g, ' ') // strip punctuation
    .replace(/\s+/g, ' ')
    .trim()
  // Drop leading/embedded English articles ("the house" -> "house") — but only
  // when other words remain, so a single-letter Shona answer like the vowel "a"
  // is never reduced to an empty string.
  const deArticled = base.replace(/\b(a|an|the)\b/g, ' ').replace(/\s+/g, ' ').trim()
  return deArticled || base
}

/**
 * Build every acceptable normalized form for an expected answer string. Beyond
 * the fully-normalized form, when the answer carries a parenthetical we ALSO
 * accept the parenthetical content alone (e.g. "i slept (fine)" accepts both
 * "i slept" and "i slept fine").
 */
function expandExpected(raw: unknown): string[] {
  const text = String(raw ?? '')
  const forms = new Set<string>()
  const base = normalizeAnswer(text)
  if (base) forms.add(base)
  // full text with parenthetical contents kept inline
  const inline = normalizeAnswer(text.replace(/[()]/g, ' '))
  if (inline) forms.add(inline)
  return Array.from(forms)
}

/**
 * Lenient check: does `answer` match the exercise's correct answer or any of
 * its acceptable answers / synonyms after normalization? A clearly-correct
 * answer (different case, punctuation, accents, or an omitted parenthetical)
 * is accepted.
 */
export function isAnswerAccepted(answer: unknown, exercise: any): boolean {
  const given = normalizeAnswer(answer)
  if (!given) return false
  const candidates: unknown[] = [
    exercise?.correctAnswer,
    ...(Array.isArray(exercise?.acceptableAnswers) ? exercise.acceptableAnswers : []),
    ...(Array.isArray(exercise?.synonyms) ? exercise.synonyms : []),
  ]
  for (const cand of candidates) {
    for (const form of expandExpected(cand)) {
      if (form && form === given) return true
    }
  }
  return false
}

// ── teaching explanation ──────────────────────────────────────────
// True when a `correct` explanation is just an echo of the answer
// ("correct — \"x\".") and carries no real teaching value.
function isEchoExplanation(text: string): boolean {
  const t = text.trim().toLowerCase()
  if (!t) return true
  if (/^all pairs matched/.test(t)) return true
  return /^correct\s*[—-]/.test(t) && t.length < 70
}

/**
 * Pick the most instructive explanation to show on a CORRECT answer. Authored
 * `explanation.correct` is usually a bare echo, while `explanation.incorrect`
 * holds the real teaching note — so we reuse that teaching text (reframed as
 * reinforcement) when the correct copy adds nothing (bug #1). Returns clean
 * text with markdown asterisks parsed out by the caller via parseEmphasis.
 */
export function teachingExplanation(
  exercise: any,
  correct: boolean
): string | null {
  const expl = exercise?.explanation
  const correctText = typeof expl?.correct === 'string' ? expl.correct : ''
  const incorrectText = typeof expl?.incorrect === 'string' ? expl.incorrect : ''
  const flat = typeof expl === 'string' ? expl : ''

  if (!correct) {
    return incorrectText || flat || null
  }
  // correct: prefer a non-echo `correct` note; otherwise reinforce with the
  // richer teaching text from `incorrect`; finally fall back to a clean echo.
  if (correctText && !isEchoExplanation(correctText)) return correctText
  if (incorrectText) return incorrectText
  if (flat) return flat
  if (correctText) return correctText
  return null
}
