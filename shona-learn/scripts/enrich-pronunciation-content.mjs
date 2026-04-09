/**
 * Enriches lessons + flashcards with pronunciation fields from PRONUNCIATION_MODULE_REVIEW.md
 * Run: node scripts/enrich-pronunciation-content.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const SOUND_TOKENS = [
  'tsv', 'mh', 'nh', 'bv', 'pf', 'ch', 'sh', 'dz', 'ts', 'ng', 'ny', 'zv', 'sv', 'mb', 'nd', 'nz',
]

function findSoundGuideLinks(shona) {
  const found = new Set()
  const parts = shona.toLowerCase().split(/\s+/).filter(Boolean)
  for (const part of parts) {
    let i = 0
    while (i < part.length) {
      let matched = false
      for (const t of SOUND_TOKENS) {
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

const MISTAKE_PRIORITY = ['mh', 'nh', 'sv', 'zv', 'tsv', 'bv', 'pf', 'ng', 'mb', 'nd', 'nz', 'dz', 'ts', 'ny']
const MISTAKES = {
  mh: "Don't say \"m\" and \"h\" separately — blend into one breathy nasal.",
  nh: "Don't separate \"n\" and \"h\" — one breathy nasal into the vowel.",
  sv: "Don't chain a flat English \"s\" then \"v\" — round your lips so the hiss whistles slightly.",
  zv: "Don't drop lip rounding — the buzz and rounding happen together.",
  tsv: "Build from \"ts\" (as in \"cats\"), then add lip contact for \"v\" in the same beat.",
  bv: "Don't stop between \"b\" and \"v\" — one smooth lip buzz.",
  pf: "Keep the puff after the lip closure — like \"Pfizer\" or a quiet \"pfft\".",
  ng: "At the start of a word, don't add \"uh-\" before \"ng\". For hard /ng/, think \"finger\" not \"singer\".",
  mb: "Same \"mb\" as in \"timber\" — moved to the start of the syllable.",
  nd: "Same \"nd\" as in \"under\" — often at the start in Shona.",
  nz: "Keep nasal airflow flowing straight into \"z\".",
  dz: "Like \"ds\" in \"beds\", including at word onset.",
  ts: "Like \"ts\" in \"cats\", including at syllable onset.",
  ny: "Like \"ny\" in \"canyon\" or Spanish ñ.",
}

function commonMistakeFor(links) {
  for (const k of MISTAKE_PRIORITY) {
    if (links.includes(k) && MISTAKES[k]) return MISTAKES[k]
  }
  return undefined
}

/**
 * Curated tone hints only — do not bulk-generate or auto-fill.
 * Each entry should be linguist-reviewed before adding (see handover P3).
 */
const TONE_BY_WORD = {
  mhoro: { tonePattern: 'H-L', toneHint: 'First syllable higher, last syllable lower — listen to audio to match pitch.' },
  mhoroi: { tonePattern: 'H-L-L', toneHint: 'Keep syllables clear; pitch drops toward the end of the greeting.' },
  ndiri: { tonePattern: 'H-L', toneHint: 'Stress and pitch are evened across syllables; avoid English “hammer” stress.' },
  ndinonzi: { tonePattern: 'H-L-L', toneHint: 'Syllable-timed rhythm — give each part equal time.' },
  nhasi: { tonePattern: 'H-L', toneHint: 'Breathy \"nh\" sets the tone for the following vowel; keep rhythm even.' },
  ngoma: { tonePattern: 'H-L', toneHint: 'Start on the syllable with /ng/ without a leading vowel schwa.' },
  mbira: { tonePattern: 'H-L', toneHint: 'Prenasalized onset — no extra vowel before \"mb\".' },
  mangwanani: { tonePattern: 'L-H-H-L', toneHint: 'Even rhythm; listen to native audio for the melodic contour.' },
  manheru: { tonePattern: 'L-H-L', toneHint: 'Watch the syllable with \"nh\" — breathy, not two consonants.' },
  svika: { tonePattern: 'H-L', toneHint: 'Whistled /sv/ — maintain slight lip rounding through the fricative.' },
  zvino: { tonePattern: 'H-L', toneHint: 'Voiced counterpart of /sv/; lips stay engaged.' },
  zvakanaka: { tonePattern: 'H-L-H-L', toneHint: 'Four syllables, roughly equal length — not English stress-timing.' },
  kwete: { tonePattern: 'H-L', toneHint: 'Clear vowels; no English glide on \"e\".' },
  ndatenda: { tonePattern: 'H-L-H-L', toneHint: 'Repeated \"nd\" syllables — keep each crisp.' },
  ndimi: { tonePattern: 'H-L', toneHint: 'Initial prenasalized cluster at syllable onset.' },
}

function parsePracticeQuestion(q) {
  const m =
    q.match(/Practice saying\s+'([^']+)'\s*\(([^)]+)\)/i) ||
    q.match(/Practice saying\s+"([^"]+)"\s*\(([^)]+)\)/i)
  if (m) return { target: m[1].trim(), english: m[2].trim() }
  return null
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function saveJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function main() {
  const fcPath = path.join(ROOT, 'content', 'flashcards.json')
  const data = loadJson(fcPath)
  const byShona = {}
  for (const c of data.flashcards) {
    byShona[String(c.shona).toLowerCase()] = c
  }

  function enrichVocabItem(item) {
    const key = String(item.shona).toLowerCase()
    const fc = byShona[key]
    const links = findSoundGuideLinks(item.shona)
    if (fc?.englishAnchor) item.englishAnchor = fc.englishAnchor
    if (fc?.pronounceDifficulty) item.pronounceDifficulty = fc.pronounceDifficulty
    if (!item.pronunciation && fc?.pronunciation) item.pronunciation = fc.pronunciation
    item.soundGuideLinks = [...new Set([...(item.soundGuideLinks || []), ...links])]
    const tone = TONE_BY_WORD[key]
    if (tone?.tonePattern && !String(item.tonePattern || '').trim()) {
      item.tonePattern = tone.tonePattern
      item.toneHint = tone.toneHint
    }
    return item
  }

  function enrichFlashcard(card) {
    const links = findSoundGuideLinks(card.shona)
    card.soundGuideLinks = [...new Set([...(card.soundGuideLinks || []), ...links])]
    const key = String(card.shona).toLowerCase()
    const tone = TONE_BY_WORD[key]
    if (tone?.tonePattern) {
      card.tonePattern = tone.tonePattern
      card.toneHint = tone.toneHint
    }
    return card
  }

  for (const card of data.flashcards) enrichFlashcard(card)
  saveJson(fcPath, data)
  saveJson(path.join(ROOT, 'public', 'flashcards.json'), data)

  for (const lessonsFile of ['lessons_consolidated.json', 'lessons.json']) {
    const lp = path.join(ROOT, 'content', lessonsFile)
    if (!fs.existsSync(lp)) continue
    const lessonsData = loadJson(lp)
    for (const lesson of lessonsData.lessons || []) {
      for (const v of lesson.vocabulary || []) {
        enrichVocabItem(v)
      }
      for (const ex of lesson.exercises || []) {
        if (ex.type !== 'pronunciation') continue
        const tw = String(ex.targetWord || '').trim()
        if (!tw) continue
        const fk = tw.toLowerCase()
        const fc = byShona[fk]
        const links = findSoundGuideLinks(tw)
        ex.soundGuideLinks = [...new Set([...(ex.soundGuideLinks || []), ...links])]
        if (fc?.englishAnchor) ex.englishAnchor = fc.englishAnchor
        ex.pronounceDifficulty = fc?.pronounceDifficulty || ex.pronounceDifficulty
        const parsed = parsePracticeQuestion(ex.question || '')
        if (parsed) {
          ex.englishPhrase = parsed.english
        } else if (fc?.english) {
          ex.englishPhrase = fc.english
        }
        const mistake = commonMistakeFor(ex.soundGuideLinks)
        if (mistake) ex.commonMistakeWarning = mistake
      }
    }
    saveJson(lp, lessonsData)
  }

  console.log('Enrichment complete: flashcards, lessons_consolidated, lessons, public/flashcards')
}

main()
