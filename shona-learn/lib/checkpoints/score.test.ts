import { describe, expect, it } from 'vitest'
import { scoreCheckpoint, type CheckpointQuestionData } from './score'

const sample: CheckpointQuestionData = {
  version: 1,
  overallPassPercent: 70,
  sectionPassPercent: 60,
  sections: [
    {
      id: 'listening',
      title: 'Listening',
      weight: 25,
      questions: [
        { id: 'a', prompt: 'x', options: ['a', 'b'], correctIndex: 0 },
        { id: 'b', prompt: 'y', options: ['a', 'b'], correctIndex: 1 }
      ]
    },
    {
      id: 'reading',
      title: 'Reading',
      weight: 25,
      questions: [{ id: 'c', prompt: 'z', options: ['a', 'b'], correctIndex: 0 }]
    }
  ]
}

describe('scoreCheckpoint', () => {
  it('passes when overall and each section meet thresholds', () => {
    const r = scoreCheckpoint(sample, { a: 0, b: 1, c: 0 })
    expect(r.passed).toBe(true)
    expect(r.overallPercent).toBe(100)
  })

  it('fails when a section drops below sectionPassPercent', () => {
    const r = scoreCheckpoint(sample, { a: 0, b: 0, c: 0 })
    expect(r.overallPercent).toBeLessThan(100)
    expect(r.sectionScores.find((s) => s.sectionId === 'listening')?.passed).toBe(false)
    expect(r.passed).toBe(false)
  })
})
