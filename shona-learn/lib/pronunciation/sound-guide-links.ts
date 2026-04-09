/**
 * Detects clusters taught in content/sound-guide.json for contextual hints.
 * Longest token first so e.g. "tsv" matches before "ts".
 */
export const SOUND_GUIDE_CLUSTER_TOKENS = [
  'tsv',
  'mh',
  'nh',
  'bv',
  'pf',
  'ch',
  'sh',
  'dz',
  'ts',
  'ng',
  'ny',
  'zv',
  'sv',
  'mb',
  'nd',
  'nz',
] as const

export type SoundGuideToken = (typeof SOUND_GUIDE_CLUSTER_TOKENS)[number]

export function findSoundGuideLinks(shona: string): string[] {
  const found = new Set<string>()
  const parts = shona
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  for (const part of parts) {
    let i = 0
    while (i < part.length) {
      let matched = false
      for (const t of SOUND_GUIDE_CLUSTER_TOKENS) {
        if (part.slice(i, i + t.length) === t) {
          found.add(t)
          i += t.length
          matched = true
          break
        }
      }
      if (!matched) i += 1
    }
  }
  return [...found]
}

/** Typical English-speaker confusions (see PRONUNCIATION_MODULE_REVIEW.md). */
export const ENGLISH_SPEAKER_COMMON_MISTAKES: Record<string, string> = {
  b: "Avoid a hard English plosive — Shona /b/ is often slightly implosive (a softer inward pop).",
  d: "Avoid a hard English /d/ — Shona /d/ can be implosive; keep stops light and crisp.",
  r: "Don't use American curled /r/ — use a quick flap/tap against the alveolar ridge (like Spanish single r).",
  mh: "Don't say \"m\" then \"h\" as two sounds — blend into one breathy nasal.",
  nh: "Don't separate \"n\" and \"h\" — one nasal airflow, then breathiness into the vowel.",
  sv: "Don't use a flat English \"s\" — round your lips slightly so the friction has a whistle quality.",
  zv: "Don't skip lip rounding — keep a buzzy /z/ with the same lip position you'd use toward /v/.",
  ng: "At the start of a word, don't add \"uh-\" — start straight on the sound (like \"ngoma\", not \"uh-ngoma\"). Don't use \"ng\" like at the end of \"sing\" when you need the hard \"ng\" of \"finger\".",
  bv: "Don't pause between /b/ and /v/ — it's one continuous lip buzz.",
  pf: "Keep the labial puff — it's /p/ releasing straight into /f/, like \"Pfizer\" or a quiet \"pfft\".",
  tsv: "Start from \"ts\" (as in \"cats\"), then add lip contact for /v/ without breaking the beat.",
  mb: "Same cluster as in \"timber\" — Shona often places it at the beginning of a syllable.",
  nd: "Same cluster as in \"under\" — often at the start in Shona (e.g. ndi- 'I').",
  nz: "Keep the nasal flowing into /z/ with no gap.",
  ts: "Like the end of \"cats\", including at syllable onsets.",
  dz: "Like \"ds\" in \"beds\", including at the beginning of a word.",
  ny: "Like \"ny\" in \"canyon\" or Spanish ñ.",
  ch: "Same as English \"church\".",
  sh: "Same as English \"ship\".",
}

export function primaryCommonMistakeHint(soundLinks: string[]): string | undefined {
  const priority = ['mh', 'nh', 'sv', 'zv', 'tsv', 'bv', 'pf', 'ng', 'mb', 'nd', 'nz', 'dz', 'ts', 'ny']
  for (const key of priority) {
    if (soundLinks.includes(key) && ENGLISH_SPEAKER_COMMON_MISTAKES[key]) {
      return ENGLISH_SPEAKER_COMMON_MISTAKES[key]
    }
  }
  const first = soundLinks[0]
  return first ? ENGLISH_SPEAKER_COMMON_MISTAKES[first] : undefined
}
