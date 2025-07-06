import { NextRequest, NextResponse } from 'next/server'
import { FlashcardService } from '../../../lib/flashcard-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    switch (action) {
      case 'due':
        const dueCards = await FlashcardService.getDueCards(userId, limit)
        return NextResponse.json(dueCards)
      
      case 'stats':
        const stats = await FlashcardService.getFlashcardStats(userId)
        return NextResponse.json(stats)
      
      case 'schedule':
        const days = parseInt(searchParams.get('days') || '7')
        const schedule = await FlashcardService.getStudySchedule(userId, days)
        return NextResponse.json(schedule)
      
      case 'search':
        const query = searchParams.get('q') || ''
        const lessonId = searchParams.get('lessonId')
        const tags = searchParams.get('tags')?.split(',')
        const minDifficulty = parseFloat(searchParams.get('minDifficulty') || '0')
        const maxDifficulty = parseFloat(searchParams.get('maxDifficulty') || '1')
        
        const results = await FlashcardService.searchFlashcards(userId, query, {
          lessonId: lessonId || undefined,
          tags: tags || undefined,
          difficulty: { min: minDifficulty, max: maxDifficulty }
        })
        return NextResponse.json(results)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in flashcards GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, ...data } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    switch (action) {
      case 'create':
        const flashcard = await FlashcardService.createFlashcard(userId, data)
        return NextResponse.json(flashcard, { status: 201 })
      
      case 'review':
        const { flashcardId, quality, responseTime, wasCorrect } = data
        const result = await FlashcardService.reviewFlashcard(userId, {
          flashcardId,
          quality,
          responseTime,
          wasCorrect
        })
        return NextResponse.json(result)
      
      case 'complete_session':
        const { reviewedCards, sessionStartTime, sessionEndTime } = data
        const sessionResult = await FlashcardService.completeStudySession(userId, {
          reviewedCards,
          sessionStartTime: new Date(sessionStartTime),
          sessionEndTime: new Date(sessionEndTime)
        })
        return NextResponse.json(sessionResult)
      
      case 'import_from_lesson':
        const { lessonId } = data
        const importedCards = await FlashcardService.importFromLesson(userId, lessonId)
        return NextResponse.json({ 
          imported: importedCards.length,
          flashcards: importedCards 
        })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in flashcards POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}