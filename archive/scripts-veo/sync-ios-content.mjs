/**
 * Syncs enriched web JSON into the iOS app bundle (flashcards, sound-guide, lesson pronunciation fields).
 * Run from shona-learn: node scripts/sync-ios-content.mjs
 *
 * Prerequisites: run content:enrich first so web content is canonical.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(path.join(__dirname, '..', '..'))
const SHONA_LEARN = path.join(REPO_ROOT, 'shona-learn')
const IOS_CONTENT = path.join(REPO_ROOT, 'Ios', 'Shona App', 'Shona App', 'Content')

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function saveJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function mergeVocabFields(iosItem, webItem) {
  if (!webItem) return
  const fields = [
    'englishAnchor',
    'soundGuideLinks',
    'pronounceDifficulty',
    'tonePattern',
    'toneHint',
    'pronunciation',
    'phonetic',
    'syllables',
  ]
  for (const f of fields) {
    const w = webItem[f]
    if (w === undefined || w === '') continue
    if (iosItem[f] === undefined || iosItem[f] === '' || (Array.isArray(iosItem[f]) && iosItem[f].length === 0)) {
      iosItem[f] = w
    }
  }
}

function mergeLessonExercises(iosEx, webByTarget) {
  for (const ex of iosEx) {
    if (ex.type !== 'pronunciation') continue
    const tw = String(ex.targetWord || '').trim().toLowerCase()
    if (!tw) continue
    const w = webByTarget[tw]
    if (!w) continue
    if (w.englishAnchor && !ex.englishAnchor) ex.englishAnchor = w.englishAnchor
    if (w.soundGuideLinks?.length && (!ex.soundGuideLinks || !ex.soundGuideLinks.length)) {
      ex.soundGuideLinks = w.soundGuideLinks
    }
    if (w.commonMistakeWarning && !ex.commonMistakeWarning) ex.commonMistakeWarning = w.commonMistakeWarning
    if (w.englishPhrase && !ex.englishPhrase) ex.englishPhrase = w.englishPhrase
  }
}

function main() {
  if (!fs.existsSync(IOS_CONTENT)) {
    console.error('sync-ios-content: iOS Content folder not found:', IOS_CONTENT)
    process.exit(1)
  }

  const fcSrc = path.join(SHONA_LEARN, 'content', 'flashcards.json')
  const sgSrc = path.join(SHONA_LEARN, 'content', 'sound-guide.json')
  const lessonsWeb = path.join(SHONA_LEARN, 'content', 'lessons_consolidated.json')
  const lessonsIos = path.join(IOS_CONTENT, 'lessons.json')

  if (fs.existsSync(fcSrc)) {
    fs.copyFileSync(fcSrc, path.join(IOS_CONTENT, 'flashcards.json'))
    console.log('sync-ios-content: flashcards.json → iOS')
  }

  if (fs.existsSync(sgSrc)) {
    fs.copyFileSync(sgSrc, path.join(IOS_CONTENT, 'sound-guide.json'))
    console.log('sync-ios-content: sound-guide.json → iOS')
  }

  if (fs.existsSync(lessonsWeb) && fs.existsSync(lessonsIos)) {
    const web = loadJson(lessonsWeb)
    const ios = loadJson(lessonsIos)
    const webById = Object.fromEntries((web.lessons || []).map((l) => [l.id, l]))

    for (const lesson of ios.lessons || []) {
      const wlesson = webById[lesson.id]
      if (!wlesson) continue

      const webVocabByShona = Object.fromEntries(
        (wlesson.vocabulary || []).map((v) => [String(v.shona || '').toLowerCase(), v])
      )

      for (const v of lesson.vocabulary || []) {
        const key = String(v.shona || '').toLowerCase()
        mergeVocabFields(v, webVocabByShona[key])
      }

      const webByTarget = {}
      for (const ex of wlesson.exercises || []) {
        if (ex.type !== 'pronunciation') continue
        const tw = String(ex.targetWord || '').trim().toLowerCase()
        if (tw) webByTarget[tw] = ex
      }
      if (lesson.exercises?.length) mergeLessonExercises(lesson.exercises, webByTarget)
    }

    saveJson(lessonsIos, ios)
    console.log('sync-ios-content: merged pronunciation fields into iOS lessons.json')
  }

  console.log('sync-ios-content: done')
}

main()
