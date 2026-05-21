import fs from 'fs'
import path from 'path'

export type GeneratedDrillRow = {
  key: string
  exerciseId: string
  exerciseTitle: string
  focusSound?: string
  shona: string
  english: string
  audioFile?: string
}

type RawExercise = Record<string, unknown>

function loadRaw(): { exercises?: RawExercise[] } | null {
  const p = path.join(process.cwd(), 'content', 'generated-pronunciation-exercises.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

export function loadGeneratedPronunciationDrills(): GeneratedDrillRow[] {
  const data = loadRaw()
  const rows: GeneratedDrillRow[] = []
  for (const ex of data?.exercises || []) {
    const id = String(ex.id || '')
    const title = String(ex.title || id)
    const focus = ex.focusSound as string | undefined

    const pushWord = (shona: string, english: string, audioFile?: string, suffix = '') => {
      const s = String(shona || '').trim()
      if (!s) return
      rows.push({
        key: `${id}-${s}-${suffix}`.replace(/\s+/g, '_'),
        exerciseId: id,
        exerciseTitle: title,
        focusSound: focus,
        shona: s,
        english: String(english || '').trim() || title,
        audioFile: audioFile ? String(audioFile) : undefined,
      })
    }

    if (ex.type === 'sound_isolation' && Array.isArray(ex.practiceWords)) {
      for (const w of ex.practiceWords as { shona?: string; english?: string; audioFile?: string }[]) {
        pushWord(w.shona || '', w.english || '', w.audioFile)
      }
    } else if (ex.type === 'repetition_drill' && Array.isArray(ex.words)) {
      for (const w of ex.words as { shona?: string; english?: string; audioFile?: string }[]) {
        pushWord(w.shona || '', w.english || '', w.audioFile)
      }
    } else if (ex.type === 'rhythm' && ex.phrase && typeof ex.phrase === 'object') {
      const ph = ex.phrase as { shona?: string; english?: string; audioFile?: string }
      pushWord(ph.shona || '', ph.english || '', ph.audioFile, 'phrase')
    } else if (ex.type === 'progressive_difficulty' && Array.isArray(ex.wordSteps)) {
      let i = 0
      for (const step of ex.wordSteps as { shona?: string; gloss?: string; audioFile?: string }[]) {
        pushWord(step.shona || '', step.gloss || title, step.audioFile, `step-${i++}`)
      }
    }
  }
  return rows
}

export function loadGeneratedPronunciationJson(): object | null {
  const p = path.join(process.cwd(), 'content', 'generated-pronunciation-exercises.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}
