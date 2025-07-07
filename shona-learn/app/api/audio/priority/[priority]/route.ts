import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface AudioFile {
  id: string
  filename: string
  transcript: string
  translation: string
  category: string
  level: number
  priority: 'immediate' | 'prefetch' | 'onDemand'
  size: number
  duration: number
  url: string
  quality: 'high' | 'medium' | 'low'
  compressionFormats: {
    mp3_128: string
    opus_64: string
    opus_32: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { priority: string } }
) {
  try {
    const priority = params.priority as 'immediate' | 'prefetch' | 'onDemand'
    const searchParams = request.nextUrl.searchParams
    const userLevel = parseInt(searchParams.get('level') || '1')
    const currentLesson = searchParams.get('lesson') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    // Validate priority parameter
    if (!['immediate', 'prefetch', 'onDemand'].includes(priority)) {
      return NextResponse.json(
        { error: 'Invalid priority. Must be immediate, prefetch, or onDemand' },
        { status: 400 }
      )
    }

    // Load enhanced audio manifest
    const manifestPath = path.join(process.cwd(), 'content', 'enhanced-audio-manifest.json')
    const manifestContent = await fs.readFile(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestContent)

    // Get files by priority and user level
    const priorityFiles = await getFilesByPriority(manifest, priority, userLevel, currentLesson)
    
    // Apply limit and add file size information
    const limitedFiles = priorityFiles.slice(0, limit)
    const filesWithMetadata = await Promise.all(
      limitedFiles.map(async (file) => {
        try {
          const filePath = path.join(process.cwd(), 'public', file.url)
          const stats = await fs.stat(filePath)
          return {
            ...file,
            size: stats.size,
            lastModified: stats.mtime.toISOString()
          }
        } catch {
          // If file doesn't exist, return without size info
          return {
            ...file,
            size: 0,
            lastModified: new Date().toISOString()
          }
        }
      })
    )

    // Calculate total size for the priority group
    const totalSize = filesWithMetadata.reduce((sum, file) => sum + file.size, 0)
    const estimatedDownloadTime = calculateEstimatedDownloadTime(totalSize)

    return NextResponse.json({
      priority,
      userLevel,
      currentLesson,
      totalFiles: filesWithMetadata.length,
      totalSize,
      estimatedDownloadTime,
      files: filesWithMetadata
    })

  } catch (error) {
    console.error('Error getting priority files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getFilesByPriority(
  manifest: any,
  priority: string,
  userLevel: number,
  currentLesson: string
): Promise<AudioFile[]> {
  const files: AudioFile[] = []

  // Process words category
  if (manifest.categories.words) {
    for (const levelGroup in manifest.categories.words) {
      const group = manifest.categories.words[levelGroup]
      
      // Check if this group matches the requested priority
      if (group.priority === priority) {
        // Check if user level is appropriate for this group
        if (group.levels.some((level: number) => level <= userLevel + 1)) {
          
          for (const subcategory in group.subcategories) {
            const subcat = group.subcategories[subcategory]
            
            subcat.examples.forEach((word: string, index: number) => {
              files.push({
                id: `${subcategory}_${index}`,
                filename: `${word}.mp3`,
                transcript: word,
                translation: word, // Would need proper translation lookup
                category: subcategory,
                level: group.levels[0],
                priority: priority as any,
                size: 0, // Will be populated later
                duration: 2.0, // Estimated, would be from metadata
                url: `/content/audio/words/${levelGroup}/${subcategory}/${word}.mp3`,
                quality: 'high',
                compressionFormats: {
                  mp3_128: `/content/audio/words/${levelGroup}/${subcategory}/${word}.mp3_128.mp3`,
                  opus_64: `/content/audio/words/${levelGroup}/${subcategory}/${word}.opus_64.opus`,
                  opus_32: `/content/audio/words/${levelGroup}/${subcategory}/${word}.opus_32.opus`
                }
              })
            })
          }
        }
      }
    }
  }

  // Process sentences category
  if (manifest.categories.sentences) {
    for (const sentenceType in manifest.categories.sentences) {
      const group = manifest.categories.sentences[sentenceType]
      
      if (group.priority === priority) {
        if (group.levels.some((level: number) => level <= userLevel + 1)) {
          
          group.examples.forEach((sentence: string, index: number) => {
            files.push({
              id: `sentence_${sentenceType}_${index}`,
              filename: `${sentenceType}_${index}.mp3`,
              transcript: sentence,
              translation: sentence, // Would need proper translation
              category: sentenceType,
              level: group.levels[0],
              priority: priority as any,
              size: 0,
              duration: 4.0, // Estimated for sentences
              url: `/content/audio/sentences/${sentenceType}/${index}.mp3`,
              quality: 'high',
              compressionFormats: {
                mp3_128: `/content/audio/sentences/${sentenceType}/${index}.mp3_128.mp3`,
                opus_64: `/content/audio/sentences/${sentenceType}/${index}.opus_64.opus`,
                opus_32: `/content/audio/sentences/${sentenceType}/${index}.opus_32.opus`
              }
            })
          })
        }
      }
    }
  }

  // Process exercises category
  if (manifest.categories.exercises) {
    for (const exerciseType in manifest.categories.exercises) {
      const group = manifest.categories.exercises[exerciseType]
      
      if (group.priority === priority) {
        // Exercise files are generally important for immediate priority
        for (const subcategory in group.subcategories) {
          const subcat = group.subcategories[subcategory]
          
          if (subcat.examples) {
            subcat.examples.forEach((example: string, index: number) => {
              files.push({
                id: `exercise_${exerciseType}_${subcategory}_${index}`,
                filename: `${exerciseType}_${subcategory}_${index}.mp3`,
                transcript: example,
                translation: example,
                category: `${exerciseType}_${subcategory}`,
                level: 1, // Exercises are generally beginner-friendly
                priority: priority as any,
                size: 0,
                duration: 3.0,
                url: `/content/audio/exercises/${exerciseType}/${subcategory}/${index}.mp3`,
                quality: 'high',
                compressionFormats: {
                  mp3_128: `/content/audio/exercises/${exerciseType}/${subcategory}/${index}.mp3_128.mp3`,
                  opus_64: `/content/audio/exercises/${exerciseType}/${subcategory}/${index}.opus_64.opus`,
                  opus_32: `/content/audio/exercises/${exerciseType}/${subcategory}/${index}.opus_32.opus`
                }
              })
            })
          }
        }
      }
    }
  }

  // Add lesson-specific prioritization
  if (currentLesson && priority === 'immediate') {
    return prioritizeForLesson(files, currentLesson, userLevel)
  }

  // Sort files by relevance to user level
  return files.sort((a, b) => {
    // Prioritize files closer to user's level
    const aDiff = Math.abs(a.level - userLevel)
    const bDiff = Math.abs(b.level - userLevel)
    
    if (aDiff !== bDiff) {
      return aDiff - bDiff
    }
    
    // Secondary sort by category importance
    const categoryPriority: { [key: string]: number } = {
      'greetings': 1,
      'family': 2,
      'numbers': 3,
      'basic_phrases': 4,
      'pronunciation_drills': 5
    }
    
    const aPriority = categoryPriority[a.category] || 10
    const bPriority = categoryPriority[b.category] || 10
    
    return aPriority - bPriority
  })
}

function prioritizeForLesson(files: AudioFile[], lessonId: string, userLevel: number): AudioFile[] {
  // This would integrate with your lesson system to prioritize 
  // audio files that are part of the current lesson
  
  // For now, just return the files sorted by relevance
  return files.filter(file => {
    // Include files that are relevant to the current lesson
    // This is a simplified version - you'd want to implement
    // proper lesson-audio mapping
    return file.level <= userLevel + 1
  })
}

function calculateEstimatedDownloadTime(totalSize: number): {
  fast: number    // 4G connection
  medium: number  // 3G connection  
  slow: number    // 2G connection
} {
  // Estimated download speeds (bytes per second)
  const speeds = {
    fast: 5 * 1024 * 1024,    // 5 MB/s (4G)
    medium: 1 * 1024 * 1024,  // 1 MB/s (3G)
    slow: 128 * 1024          // 128 KB/s (2G)
  }

  return {
    fast: Math.ceil(totalSize / speeds.fast),
    medium: Math.ceil(totalSize / speeds.medium),
    slow: Math.ceil(totalSize / speeds.slow)
  }
}

// Get available priorities
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({
    availablePriorities: ['immediate', 'prefetch', 'onDemand'],
    description: {
      immediate: 'Critical content that should be downloaded first',
      prefetch: 'Important content that can be downloaded in background',
      onDemand: 'Optional content downloaded when specifically requested'
    },
    parameters: {
      level: 'User level (1-10) to filter appropriate content',
      lesson: 'Current lesson ID to prioritize lesson-specific content',
      limit: 'Maximum number of files to return (default: 50)'
    }
  })
}