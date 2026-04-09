import fs from 'fs'
import path from 'path'

export type PronunciationDemoPayload = {
  lessonTitle: string
  lessonId: string
  targetWord: string
  translation: string
  phonetic: string
  tonePattern?: string
  toneHint?: string
  englishAnchor?: string
  soundGuideLinks?: string[]
  commonMistakeWarning?: string
  pronounceDifficulty?: string
  audioFile?: string
}

/**
 * First pronunciation exercise from canonical lessons (for /pronunciation demo & smoke tests).
 */
export function getFirstPronunciationDemo(): PronunciationDemoPayload | null {
  const p = path.join(process.cwd(), 'content', 'lessons_consolidated.json')
  if (!fs.existsSync(p)) return null
  const data = JSON.parse(fs.readFileSync(p, 'utf8')) as {
    lessons?: Array<{
      id?: string
      title?: string
      exercises?: unknown[]
    }>
  }
  for (const lesson of data.lessons || []) {
    for (const raw of lesson.exercises || []) {
      const ex = raw as Record<string, unknown>
      if (ex.type !== 'pronunciation') continue
      const targetWord = String(ex.targetWord || '').trim()
      if (!targetWord) continue
      return {
        lessonId: String(lesson.id || ''),
        lessonTitle: String(lesson.title || ''),
        targetWord,
        translation: String(
          ex.englishPhrase || ex.question || 'Practice pronunciation'
        ),
        phonetic: String(ex.pronunciation || ex.phonetic || ''),
        tonePattern: ex.tonePattern as string | undefined,
        toneHint: ex.toneHint as string | undefined,
        englishAnchor: ex.englishAnchor as string | undefined,
        soundGuideLinks: ex.soundGuideLinks as string[] | undefined,
        commonMistakeWarning: ex.commonMistakeWarning as string | undefined,
        pronounceDifficulty: ex.pronounceDifficulty as string | undefined,
        audioFile: ex.audioFile as string | undefined,
      }
    }
  }
  return null
}
