import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import fs from 'fs/promises'
import path from 'path'

type ScenarioPhrase = {
  shona: string
  english: string
  pronunciation?: string
  audioUrl?: string | null
  usageNote?: string
  needs_verification?: boolean
}

type ScenarioDialogueTurn = {
  speaker: 'gogo' | 'learner'
  shona: string
  english: string
  expected?: boolean
  audioUrl?: string | null
}

type ScenarioExercise = {
  id: string
  type: 'multiple_choice' | 'translation' | 'fill_blank'
  question: string
  correctAnswer: string
  options?: string[]
  points?: number
}

type ScenarioPack = {
  id: string
  title: string
  subtitle: string
  emoji: string
  whenToUse: string
  estimatedMinutes: number
  difficulty: string
  phrases: ScenarioPhrase[]
  dialogue: {
    context: string
    turns: ScenarioDialogueTurn[]
  }
  exercises: ScenarioExercise[]
  culturalNote?: string
  needs_verification?: boolean
}

type ScenarioPackSummary = Pick<
  ScenarioPack,
  'id' | 'title' | 'subtitle' | 'emoji' | 'whenToUse' | 'estimatedMinutes' | 'difficulty' | 'needs_verification'
> & {
  phraseCount: number
  exerciseCount: number
}

async function loadPacks(): Promise<ScenarioPack[]> {
  const filePath = path.join(process.cwd(), 'content', 'scenario_packs.json')
  const raw = await fs.readFile(filePath, 'utf8')
  const data = JSON.parse(raw) as { packs?: ScenarioPack[] }
  return Array.isArray(data.packs) ? data.packs : []
}

function toSummary(pack: ScenarioPack): ScenarioPackSummary {
  return {
    id: pack.id,
    title: pack.title,
    subtitle: pack.subtitle,
    emoji: pack.emoji,
    whenToUse: pack.whenToUse,
    estimatedMinutes: pack.estimatedMinutes,
    difficulty: pack.difficulty,
    needs_verification: pack.needs_verification ?? false,
    phraseCount: Array.isArray(pack.phrases) ? pack.phrases.length : 0,
    exerciseCount: Array.isArray(pack.exercises) ? pack.exercises.length : 0,
  }
}

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    const packs = await loadPacks()

    if (id) {
      const pack = packs.find((p) => p.id === id)
      if (!pack) {
        return NextResponse.json({ error: 'Scenario pack not found' }, { status: 404 })
      }
      return NextResponse.json({ pack })
    }

    return NextResponse.json({ packs: packs.map(toSummary) })
  } catch (error) {
    console.error('Error loading scenario packs:', error)
    return NextResponse.json({ error: 'Failed to load scenarios' }, { status: 500 })
  }
}
