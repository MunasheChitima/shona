import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { loadGeneratedPronunciationJson } from '@/lib/pronunciation/generated-drills'

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = loadGeneratedPronunciationJson()
    if (!data) {
      return NextResponse.json({ error: 'Pronunciation drills file not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error('pronunciation-exercises GET', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
