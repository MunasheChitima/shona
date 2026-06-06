#!/usr/bin/env node
/**
 * One-off content tagger: writes `heritageTrack: 'skip' | 'review' | 'core'`
 * onto every lesson in content/lessons_consolidated.json.
 *
 * Heritage learners (grew up around Shona, hear it spoken by family) skip
 * foundational vocabulary they already passively know, get brief recall on
 * partially-known vocab, and full lessons on grammar / sentence production /
 * idioms / advanced topics.
 *
 * Re-running is idempotent — it overwrites whatever value is currently set.
 *
 * Curriculum coverage: this targets the 78-lesson FSI-based curriculum
 * (lessons 1–78). Earlier revisions tagged 8 grammar bridges (lesson-g1..g8)
 * which no longer exist in the current content.
 */
import fs from 'node:fs'
import path from 'node:path'

const LESSONS_PATH = path.join(process.cwd(), 'content', 'lessons_consolidated.json')

const SKIP = new Set([
  'lesson-1',   // Mhoro — basic greetings
  'lesson-2',   // Ini Ndinonzi — my name is (basic intro)
  'lesson-3',   // Hongu/Kwete — yes/no
  'lesson-4',   // Chii/Sei — what/how (basic question words)
  'lesson-5',   // Mhuri Yangu — my family (baba, amai, mukoma)
  'lesson-6',   // Vanhu Vemhuri — family elders (sekuru, ambuya)
  'lesson-7',   // Shamwari neMuvakidzani — friends & neighbors
  'lesson-8',   // Ini, Iwe, Isu — basic pronouns
  'lesson-9',   // Kuverenga 1-10 — counting
  'lesson-10',  // Nhamba Huru — big numbers
  'lesson-13',  // Zvokudya — food vocabulary
  'lesson-15',  // Muviri Wangu — my body (body parts)
  'lesson-16',  // Mavara — colors
  'lesson-33',  // Mhuka — animals
  'lesson-34',  // Zvisikwa — nature
])

const REVIEW = new Set([
  'lesson-11',  // Nguva — time
  'lesson-12',  // Mazuva — days & seasons
  'lesson-14',  // Kumba — at home
  'lesson-17',  // Kumusika — at the market
  'lesson-18',  // Kufamba — getting around
  'lesson-20',  // Kudya Panze — eating out
  'lesson-25',  // Manzwiro — feelings (often partially known)
  'lesson-27',  // Ndine Urombo — I'm sorry
  'lesson-31',  // Mbira neNgoma — music & art (cultural vocab familiar)
  'lesson-36',  // Mamiriro eKunze — weather
  // New (78-lesson curriculum, FSI lessons 53–78) — vocab-heavy categories
  // where heritage learners typically recognise the words but benefit from
  // a quick recall pass.
  'lesson-66',  // kumusika — at the vegetable market
  'lesson-67',  // fruits and michero
  'lesson-68',  // the rooms of an imba
  'lesson-72',  // cooking processes — kubika, kukanga, kugocha
  'lesson-73',  // animals around the home
  'lesson-74',  // travelling by bus and train
  'lesson-77',  // seasons in mashonaland
])

function trackFor(lessonId) {
  if (SKIP.has(lessonId)) return 'skip'
  if (REVIEW.has(lessonId)) return 'review'
  return 'core'
}

function main() {
  const raw = fs.readFileSync(LESSONS_PATH, 'utf8')
  const data = JSON.parse(raw)
  const lessons = data.lessons || []

  const counts = { skip: 0, review: 0, core: 0 }
  for (const lesson of lessons) {
    if (!lesson?.id) continue
    const track = trackFor(lesson.id)
    lesson.heritageTrack = track
    counts[track] += 1
  }

  fs.writeFileSync(LESSONS_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`Tagged ${lessons.length} lessons:`)
  console.log(`  skip:   ${counts.skip}`)
  console.log(`  review: ${counts.review}`)
  console.log(`  core:   ${counts.core}`)
}

main()
