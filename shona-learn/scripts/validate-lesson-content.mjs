/**
 * Validates lesson vocabulary against flashcards (englishAnchor coverage).
 * Run: node scripts/validate-lesson-content.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function main() {
  const fcPath = path.join(ROOT, 'content', 'flashcards.json')
  const lessonsPath = path.join(ROOT, 'content', 'lessons_consolidated.json')

  if (!fs.existsSync(fcPath)) {
    console.error('Missing', fcPath)
    process.exit(1)
  }
  if (!fs.existsSync(lessonsPath)) {
    console.error('Missing', lessonsPath)
    process.exit(1)
  }

  const fc = loadJson(fcPath)
  const byShona = new Set(
    (fc.flashcards || []).map((c) => String(c.shona || '').toLowerCase()).filter(Boolean)
  )

  const data = loadJson(lessonsPath)
  const lessons = data.lessons || []

  const missingAnchor = []
  const optionalAudioMissing = []

  const audioDir = path.join(ROOT, 'public', 'content', 'audio')

  for (const lesson of lessons) {
    const lid = lesson.id || '?'
    for (const v of lesson.vocabulary || []) {
      const shona = String(v.shona || '').trim()
      if (!shona) continue
      const key = shona.toLowerCase()
      if (!byShona.has(key)) continue

      const anchor = v.englishAnchor
      if (typeof anchor !== 'string' || !anchor.trim()) {
        missingAnchor.push({ lesson: lid, shona })
      }

      const af = v.audioFile
      if (typeof af === 'string' && af.trim()) {
        const filePath = path.join(audioDir, af.replace(/^\/+/, ''))
        if (!fs.existsSync(filePath)) {
          optionalAudioMissing.push({ lesson: lid, shona, audioFile: af })
        }
      }
    }
  }

  if (missingAnchor.length) {
    console.error(
      'validate-lesson-content: vocabulary items present in flashcards missing englishAnchor:\n',
      missingAnchor.map((m) => `  ${m.lesson} — ${m.shona}`).join('\n')
    )
    process.exit(1)
  }

  if (optionalAudioMissing.length) {
    console.warn(
      'validate-lesson-content: audio files referenced but not under public/content/audio (app may use browser TTS fallback):\n',
      optionalAudioMissing.slice(0, 25).map((m) => `  ${m.lesson} — ${m.shona} → ${m.audioFile}`).join('\n') +
        (optionalAudioMissing.length > 25 ? `\n  … and ${optionalAudioMissing.length - 25} more` : '')
    )
  }

  console.log('validate-lesson-content: OK (englishAnchor coverage for flashcard-backed lesson words)')
}

main()
