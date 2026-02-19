import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Read comprehensive lessons from JSON file
    const lessonsPath = path.join(process.cwd(), 'content', 'lessons_consolidated.json')
    
    if (!fs.existsSync(lessonsPath)) {
      return NextResponse.json({ error: 'Lessons file not found' }, { status: 404 })
    }
    
    const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'))
    let lessons = lessonsData.lessons || []
    
    // Limit to first 12 lessons for preview
    const previewLessons = lessons.slice(0, 12).map((lesson: any) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      category: lesson.category,
      level: lesson.level,
      difficulty: lesson.difficulty,
      xpReward: lesson.xpReward,
      estimatedDuration: lesson.estimatedDuration,
      emoji: lesson.emoji,
      vocabulary: lesson.vocabulary?.slice(0, 5) || [], // Limit vocabulary preview
      exercises: lesson.exercises || []
    }))
    
    // Return public lesson data
    return NextResponse.json({
      lessons: previewLessons,
      totalLessons: lessons.length,
      previewCount: previewLessons.length,
      message: 'This is a preview. Sign up to access all lessons!'
    })
  } catch (error) {
    console.error('Error fetching public lessons:', error)
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
} 