import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { gzip } from 'zlib'
import { promisify } from 'util'

const gzipAsync = promisify(gzip)

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const contentType = params.type
    const platform = request.headers.get('Platform') || 'web'
    const acceptEncoding = request.headers.get('Accept-Encoding') || ''
    
    // Validate content type
    const validTypes = ['lessons', 'vocabulary', 'exercises', 'cultural_notes', 'audio']
    if (!validTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      )
    }
    
    // Get content based on type
    const content = await getContent(contentType, platform)
    
    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }
    
    // Prepare response with proper headers
    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes cache
      'ETag': generateETag(content),
      'Last-Modified': new Date().toUTCString()
    })
    
    // Handle compression if supported
    if (acceptEncoding.includes('gzip')) {
      const jsonString = JSON.stringify(content)
      const compressed = await gzipAsync(Buffer.from(jsonString, 'utf-8'))
      
      responseHeaders.set('Content-Encoding', 'gzip')
      responseHeaders.set('Content-Length', compressed.length.toString())
      
      return new Response(compressed, {
        headers: responseHeaders
      })
    }
    
    return NextResponse.json(content, {
      headers: responseHeaders
    })
    
  } catch (error) {
    console.error(`Failed to serve content ${params.type}:`, error)
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    )
  }
}

async function getContent(contentType: string, platform: string): Promise<any> {
  switch (contentType) {
    case 'lessons':
      return getLessonsContent(platform)
    case 'vocabulary':
      return getVocabularyContent(platform)
    case 'exercises':
      return getExercisesContent(platform)
    case 'cultural_notes':
      return getCulturalNotesContent(platform)
    case 'audio':
      return getAudioContent(platform)
    default:
      return null
  }
}

async function getLessonsContent(platform: string): Promise<any> {
  const contentPath = path.join(process.cwd(), 'content')
  
  // Try enhanced lessons first
  const enhancedPath = path.join(contentPath, 'lessons_enhanced.json')
  if (fs.existsSync(enhancedPath)) {
    const content = JSON.parse(fs.readFileSync(enhancedPath, 'utf-8'))
    return adaptContentForPlatform(content, platform, 'lessons')
  }
  
  // Fallback to original lessons
  const originalPath = path.join(contentPath, 'lessons.json')
  if (fs.existsSync(originalPath)) {
    const content = JSON.parse(fs.readFileSync(originalPath, 'utf-8'))
    return adaptContentForPlatform(content, platform, 'lessons')
  }
  
  return {
    lessons: [],
    metadata: {
      version: 1,
      platform,
      lastUpdated: new Date().toISOString()
    }
  }
}

async function getVocabularyContent(platform: string): Promise<any> {
  const contentPath = path.join(process.cwd(), 'content', 'vocabulary')
  
  if (!fs.existsSync(contentPath)) {
    return {
      vocabulary: [],
      metadata: {
        version: 1,
        platform,
        lastUpdated: new Date().toISOString()
      }
    }
  }
  
  const vocabularyFiles = fs.readdirSync(contentPath)
    .filter(file => file.endsWith('.json'))
  
  const vocabulary: any[] = []
  
  for (const file of vocabularyFiles) {
    try {
      const filePath = path.join(contentPath, file)
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      
      if (Array.isArray(fileContent)) {
        vocabulary.push(...fileContent)
      } else if (fileContent.vocabulary && Array.isArray(fileContent.vocabulary)) {
        vocabulary.push(...fileContent.vocabulary)
      }
    } catch (error) {
      console.warn(`Failed to read vocabulary file ${file}:`, error)
    }
  }
  
  const content = {
    vocabulary,
    metadata: {
      version: vocabulary.length > 0 ? Math.floor(vocabulary.length / 10) + 1 : 1,
      platform,
      lastUpdated: new Date().toISOString(),
      totalWords: vocabulary.length
    }
  }
  
  return adaptContentForPlatform(content, platform, 'vocabulary')
}

async function getExercisesContent(platform: string): Promise<any> {
  const contentPath = path.join(process.cwd(), 'content', 'exercises')
  
  if (!fs.existsSync(contentPath)) {
    return {
      exercises: [],
      metadata: {
        version: 1,
        platform,
        lastUpdated: new Date().toISOString()
      }
    }
  }
  
  const exerciseFiles = fs.readdirSync(contentPath)
    .filter(file => file.endsWith('.json'))
  
  const exercises: any[] = []
  
  for (const file of exerciseFiles) {
    try {
      const filePath = path.join(contentPath, file)
      const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      
      if (Array.isArray(fileContent)) {
        exercises.push(...fileContent)
      } else if (fileContent.exercises && Array.isArray(fileContent.exercises)) {
        exercises.push(...fileContent.exercises)
      }
    } catch (error) {
      console.warn(`Failed to read exercise file ${file}:`, error)
    }
  }
  
  const content = {
    exercises,
    metadata: {
      version: exercises.length > 0 ? Math.floor(exercises.length / 5) + 1 : 1,
      platform,
      lastUpdated: new Date().toISOString(),
      totalExercises: exercises.length
    }
  }
  
  return adaptContentForPlatform(content, platform, 'exercises')
}

async function getCulturalNotesContent(platform: string): Promise<any> {
  const contentPath = path.join(process.cwd(), 'content', 'cultural_notes.json')
  
  if (!fs.existsSync(contentPath)) {
    return {
      notes: [],
      categories: [],
      metadata: {
        version: 1,
        platform,
        lastUpdated: new Date().toISOString()
      }
    }
  }
  
  try {
    const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'))
    return adaptContentForPlatform(content, platform, 'cultural_notes')
  } catch (error) {
    console.warn('Failed to read cultural notes:', error)
    return {
      notes: [],
      categories: [],
      metadata: {
        version: 1,
        platform,
        lastUpdated: new Date().toISOString()
      }
    }
  }
}

async function getAudioContent(platform: string): Promise<any> {
  const audioPath = path.join(process.cwd(), 'public', 'audio')
  
  if (!fs.existsSync(audioPath)) {
    return {
      files: [],
      metadata: {
        version: 1,
        platform,
        lastUpdated: new Date().toISOString()
      }
    }
  }
  
  const audioFiles = fs.readdirSync(audioPath)
    .filter(file => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.m4a'))
    .sort()
  
  const files = audioFiles.map(file => {
    const filePath = path.join(audioPath, file)
    const stats = fs.statSync(filePath)
    
    return {
      name: file,
      size: stats.size,
      lastModified: stats.mtimeMs,
      url: `/audio/${file}`,
      type: path.extname(file).substring(1)
    }
  })
  
  const content = {
    files,
    metadata: {
      version: Math.floor(Date.now() / 1000), // Use current timestamp as version
      platform,
      lastUpdated: new Date().toISOString(),
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0)
    }
  }
  
  return adaptContentForPlatform(content, platform, 'audio')
}

function adaptContentForPlatform(content: any, platform: string, contentType: string): any {
  // Clone content to avoid mutations
  const adapted = JSON.parse(JSON.stringify(content))
  
  // Add platform-specific metadata
  if (!adapted.metadata) {
    adapted.metadata = {}
  }
  
  adapted.metadata.platform = platform
  adapted.metadata.contentType = contentType
  adapted.metadata.lastUpdated = new Date().toISOString()
  
  // Platform-specific adaptations
  switch (platform) {
    case 'ios':
      return adaptForIOS(adapted, contentType)
    case 'android':
      return adaptForAndroid(adapted, contentType)
    case 'web':
    default:
      return adaptForWeb(adapted, contentType)
  }
}

function adaptForIOS(content: any, contentType: string): any {
  // iOS-specific adaptations
  switch (contentType) {
    case 'lessons':
      // Ensure audio files have iOS-compatible paths
      if (content.lessons) {
        content.lessons.forEach((lesson: any) => {
          if (lesson.vocabulary) {
            lesson.vocabulary.forEach((word: any) => {
              if (word.audioFile) {
                word.audioFile = word.audioFile.replace(/\\/g, '/')
              }
            })
          }
        })
      }
      break
      
    case 'audio':
      // Filter to iOS-supported audio formats
      if (content.files) {
        content.files = content.files.filter((file: any) => 
          file.type === 'mp3' || file.type === 'm4a'
        )
      }
      break
  }
  
  return content
}

function adaptForAndroid(content: any, contentType: string): any {
  // Android-specific adaptations
  switch (contentType) {
    case 'audio':
      // Filter to Android-supported audio formats
      if (content.files) {
        content.files = content.files.filter((file: any) => 
          file.type === 'mp3' || file.type === 'wav'
        )
      }
      break
  }
  
  return content
}

function adaptForWeb(content: any, contentType: string): any {
  // Web-specific adaptations
  switch (contentType) {
    case 'lessons':
      // Add web-specific properties like SEO data
      if (content.lessons) {
        content.lessons.forEach((lesson: any) => {
          lesson.webMetadata = {
            slug: lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: lesson.description || lesson.title,
            keywords: extractKeywords(lesson)
          }
        })
      }
      break
  }
  
  return content
}

function extractKeywords(lesson: any): string[] {
  const keywords: string[] = []
  
  if (lesson.category) keywords.push(lesson.category.toLowerCase())
  if (lesson.vocabulary) {
    lesson.vocabulary.forEach((word: any) => {
      if (word.shona) keywords.push(word.shona)
      if (word.english) keywords.push(word.english)
    })
  }
  
  return keywords.slice(0, 10) // Limit to 10 keywords
}

function generateETag(content: any): string {
  const contentString = JSON.stringify(content, Object.keys(content).sort())
  const hash = require('crypto').createHash('md5').update(contentString).digest('hex')
  return `"${hash}"`
}