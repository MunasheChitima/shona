export type CheckpointQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  audioText?: string
}

export type CheckpointSection = {
  id: string
  title: string
  weight: number
  questions: CheckpointQuestion[]
}

export type CheckpointQuestionData = {
  version: number
  sections: CheckpointSection[]
  overallPassPercent: number
  sectionPassPercent: number
}

export type CheckpointQuestionPublic = Omit<CheckpointQuestion, 'correctIndex'>

export type CheckpointSectionPublic = Omit<CheckpointSection, 'questions'> & {
  questions: CheckpointQuestionPublic[]
}

export function parseCheckpointQuestionData(raw: string): CheckpointQuestionData {
  const parsed = JSON.parse(raw) as CheckpointQuestionData
  if (!parsed?.sections || !Array.isArray(parsed.sections)) {
    throw new Error('Invalid checkpoint data')
  }
  return parsed
}

export function toPublicQuestionData(data: CheckpointQuestionData): {
  sections: CheckpointSectionPublic[]
  overallPassPercent: number
  sectionPassPercent: number
} {
  return {
    sections: data.sections.map((s) => ({
      ...s,
      questions: s.questions.map(({ correctIndex: _c, ...q }) => {
        void _c
        return q
      })
    })),
    overallPassPercent: data.overallPassPercent,
    sectionPassPercent: data.sectionPassPercent
  }
}

export type SectionScore = { sectionId: string; percent: number; passed: boolean }

export function scoreCheckpoint(
  data: CheckpointQuestionData,
  answers: Record<string, number>
): {
  sectionScores: SectionScore[]
  overallPercent: number
  passed: boolean
} {
  const sectionScores: SectionScore[] = []
  let weighted = 0
  let totalWeight = 0

  for (const section of data.sections) {
    const n = section.questions.length
    if (n === 0) continue
    let correct = 0
    for (const q of section.questions) {
      const sel = answers[q.id]
      if (typeof sel === 'number' && sel === q.correctIndex) correct += 1
    }
    const percent = Math.round((correct / n) * 100)
    const passed = percent >= data.sectionPassPercent
    sectionScores.push({ sectionId: section.id, percent, passed })
    weighted += (percent * section.weight) / 100
    totalWeight += section.weight
  }

  const overallPercent =
    totalWeight > 0 ? Math.min(100, Math.round((weighted / totalWeight) * 100)) : 0
  const passed =
    overallPercent >= data.overallPassPercent &&
    sectionScores.every((s) => s.passed)

  return { sectionScores, overallPercent, passed }
}
