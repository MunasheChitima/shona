import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import fs from 'fs/promises'
import path from 'path'

type ScenarioPack = {
  id: string
  [key: string]: unknown
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Missing scenario id' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'content', 'scenario_packs.json')
    const raw = await fs.readFile(filePath, 'utf8')
    const data = JSON.parse(raw) as { packs?: ScenarioPack[] }
    const packs = Array.isArray(data.packs) ? data.packs : []

    const pack = packs.find((p) => p.id === id)
    if (!pack) {
      return NextResponse.json({ error: 'Scenario pack not found' }, { status: 404 })
    }

    return NextResponse.json({ pack })
  } catch (error) {
    console.error('Error loading scenario pack:', error)
    return NextResponse.json({ error: 'Failed to load scenario' }, { status: 500 })
  }
}
