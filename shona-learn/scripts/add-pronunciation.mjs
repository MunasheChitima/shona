#!/usr/bin/env node
/**
 * add-pronunciation.mjs
 *
 * Fills the `pronunciation` field on every vocabulary item in
 * content/lessons_consolidated.json with a rule-based syllabification
 * of the Shona headword.
 *
 * This is a *pragmatic* mnemonic, not academically rigorous IPA. It
 * shows the word as English-readable syllable chunks separated by `-`.
 * Tone is intentionally omitted — Shona is tonal but tone cannot be
 * taught without audio. Stress is intentionally omitted — Shona is
 * syllable-timed, not stress-timed, so capitalizing a "stressed"
 * syllable would be misleading.
 *
 * Shona phonology rules encoded:
 *   - Open syllables only (every syllable ends in a vowel)
 *   - Five pure vowels: a e i o u (never glide)
 *   - Consonant clusters limited to specific onsets
 *
 * The recognized syllable onsets below cover the standard orthography.
 * If you find a word that syllabifies oddly, add its cluster to the
 * appropriate list (CLUSTERS_3 or CLUSTERS_2).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const lessonsPath = path.join(__dirname, '..', 'content', 'lessons_consolidated.json')

// Three-character onsets — checked first
const CLUSTERS_3 = new Set([
  'mbw', 'ndw', 'ngw', 'mhw', 'nhw', 'nyw',
  'tsv', 'dzv', 'tsw', 'dzw',
  'nzv', 'nsv', 'nch', 'nsh', 'nzh',
  'svw', 'zvw',
])

// Two-character onsets — checked second
const CLUSTERS_2 = new Set([
  // prenasalized
  'mb', 'mp', 'nd', 'nt', 'ng', 'nk', 'nj', 'ns', 'nz',
  // aspirated
  'ph', 'th', 'kh',
  // breathy / voiced-aspirated
  'bh', 'dh', 'gh', 'mh', 'nh', 'vh', 'zh',
  // affricates
  'ch', 'sh', 'ts', 'dz',
  // whistled
  'sv', 'zv',
  // labialized (Cw)
  'bw', 'dw', 'gw', 'kw', 'mw', 'nw', 'pw', 'sw', 'tw', 'vw', 'zw', 'hw', 'rw',
  // palatalized (Cy)
  'by', 'dy', 'gy', 'ky', 'my', 'ny', 'py', 'ty', 'vy', 'zy', 'hy', 'ry',
  // labio-dental
  'bv', 'pf',
])

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])

// Words/separators we should pass through untouched
function isWordBoundary(ch) {
  return ch === ' ' || ch === '-' || ch === "'" || ch === '/'
}

function syllabify(word) {
  if (!word || typeof word !== 'string') return ''
  // Preserve case for proper nouns later; work on lowercase for matching
  const w = word.toLowerCase().trim()
  if (!w) return ''

  const result = []
  let current = []
  let i = 0

  while (i < w.length) {
    const ch = w[i]

    // Separator -> flush current word, copy separator
    if (isWordBoundary(ch)) {
      if (current.length) {
        result.push(current.join('-'))
        current = []
      }
      result.push(ch === ' ' ? ' ' : ch)
      i++
      continue
    }

    // Find onset
    let onset = ''
    const tri = w.substring(i, i + 3)
    const di = w.substring(i, i + 2)
    if (CLUSTERS_3.has(tri)) {
      onset = tri
      i += 3
    } else if (CLUSTERS_2.has(di)) {
      onset = di
      i += 2
    } else if (!VOWELS.has(ch)) {
      onset = ch
      i++
    }

    // Find nucleus (one vowel)
    let nucleus = ''
    if (i < w.length && VOWELS.has(w[i])) {
      nucleus = w[i]
      i++
    }

    // Glide nucleus: handle vowel-glide-vowel patterns like "ai", "oi"
    // Shona generally treats each vowel as its own syllable (hiatus).
    // So "amai" => a-ma-i and "mhoroi" => mho-ro-i. We leave the
    // second vowel for the next iteration; emit current syllable now.
    const syllable = onset + nucleus
    if (syllable) current.push(syllable)

    // Edge case: orphan consonant at end of word (rare but happens
    // with verb stems like "-rwa" before a suffix); attach to last
    // syllable so we don't drop characters.
    if (i < w.length && !VOWELS.has(w[i]) && !isWordBoundary(w[i])) {
      // Look ahead: if no vowel coming before next boundary, glue here
      let j = i
      let foundVowel = false
      while (j < w.length && !isWordBoundary(w[j])) {
        if (VOWELS.has(w[j])) {
          foundVowel = true
          break
        }
        j++
      }
      if (!foundVowel && current.length) {
        current[current.length - 1] += w.substring(i, j)
        i = j
      }
    }
  }

  if (current.length) result.push(current.join('-'))
  return result.join('')
}

// Quick spot-test before running on the corpus
const tests = [
  ['baba', 'ba-ba'],
  ['amai', 'a-ma-i'],
  ['mhoro', 'mho-ro'],
  ['mhoroi', 'mho-ro-i'],
  ['ndinonzi', 'ndi-no-nzi'],
  ['ndinobva', 'ndi-no-bva'],
  ['mwana', 'mwa-na'],
  ['sekuru', 'se-ku-ru'],
  ['ambuya', 'a-mbu-ya'],
  ['kufara', 'ku-fa-ra'],
  ['zvichapera', 'zvi-cha-pe-ra'],
  ['tichaenda', 'ti-cha-e-nda'],
  ['tsvimbo', 'tsvi-mbo'],
  ['ngoma', 'ngo-ma'],
  ['kwete', 'kwe-te'],
  ['hongu', 'ho-ngu'],
  ['mangwanani', 'ma-ngwa-na-ni'],
  ['masikati', 'ma-si-ka-ti'],
  ['makadii', 'ma-ka-di-i'],
  ['ndiripo', 'ndi-ri-po'],
]
let failed = 0
for (const [input, expected] of tests) {
  const out = syllabify(input)
  if (out !== expected) {
    console.error(`  FAIL: ${input} -> ${out} (expected ${expected})`)
    failed++
  }
}
if (failed) {
  console.error(`\n${failed} test(s) failed. Fix the syllabifier before running on the corpus.`)
  process.exit(1)
}
console.log(`syllabifier passed ${tests.length} spot-tests`)

// Read corpus
const data = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'))
const lessons = data.lessons || data
let vocabFilled = 0
let vocabSkipped = 0
let exerciseFilled = 0

for (const lesson of lessons) {
  // Vocab entries
  if (Array.isArray(lesson.vocabulary)) {
    for (const v of lesson.vocabulary) {
      if (!v.shona) continue
      const guide = syllabify(v.shona)
      if (guide && (!v.pronunciation || v.pronunciation === '')) {
        v.pronunciation = guide
        vocabFilled++
      } else {
        vocabSkipped++
      }
    }
  }
  // Exercises that already have a pronunciation field
  if (Array.isArray(lesson.exercises)) {
    for (const ex of lesson.exercises) {
      if ('pronunciation' in ex) {
        // Try to find the Shona token being practiced
        const token = ex.targetWord || ex.correctAnswer || ''
        if (typeof token === 'string' && token.match(/^[a-zA-Z\- ']+$/)) {
          const guide = syllabify(token)
          if (guide && (!ex.pronunciation || ex.pronunciation === '')) {
            ex.pronunciation = guide
            exerciseFilled++
          }
        }
      }
    }
  }
}

// Write back with stable formatting
fs.writeFileSync(lessonsPath, JSON.stringify(data, null, 2) + '\n')

console.log(`vocabulary pronunciations filled: ${vocabFilled}`)
console.log(`vocabulary pronunciations skipped (already had a value): ${vocabSkipped}`)
console.log(`exercise pronunciations filled: ${exerciseFilled}`)
console.log(`wrote ${lessonsPath}`)
