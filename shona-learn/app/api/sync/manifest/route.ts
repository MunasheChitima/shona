import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

interface ContentVersion {
  id: string
  version: number
  contentType: 'lessons' | 'vocabulary' | 'audio' | 'exercises' | 'cultural_notes'
  hash: string
  timestamp: string
  size: number
  dependencies?: string[]
}

interface ContentManifest {
  version: string
  lastUpdated: string
  platform: string
  content: {
    lessons: ContentVersion
    vocabulary: ContentVersion
    audio: ContentVersion
    exercises: ContentVersion
    cultural_notes: ContentVersion
  }
  metadata: {
    totalSize: number
    requiredVersion: string
    compatibilityVersion: string
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const platform = request.headers.get('Platform') || 'web'
    const clientVersion = request.headers.get('Client-Version') || '0.0.0'
    
    // Check if we have a cached manifest for this platform
    const cachedManifest = await getCachedManifest(platform)
    if (cachedManifest) {
      return NextResponse.json(cachedManifest)
    }
    
    // Generate manifest from content files
    const manifest = await generateContentManifest(platform, clientVersion)
    
    // Cache the manifest for 5 minutes
    await cacheManifest(platform, manifest)
    
    return NextResponse.json(manifest)
    
  } catch (error) {
    console.error('Failed to generate manifest:', error)
    return NextResponse.json(
      { error: 'Failed to generate content manifest' },
      { status: 500 }
    )
  }
}

async function getCachedManifest(platform: string): Promise<ContentManifest | null> {
  try {
    const cacheFile = path.join(process.cwd(), '.cache', `manifest-${platform}.json`)
    
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile)
      const cacheAge = Date.now() - stats.mtimeMs
      
      // Cache valid for 5 minutes
      if (cacheAge < 5 * 60 * 1000) {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'))
        return cached
      }
    }
    
    return null
  } catch (error) {
    console.warn('Failed to read cached manifest:', error)
    return null
  }
}

async function cacheManifest(platform: string, manifest: ContentManifest): Promise<void> {
  try {
    const cacheDir = path.join(process.cwd(), '.cache')
    
    // Ensure cache directory exists
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
    }
    
    const cacheFile = path.join(cacheDir, `manifest-${platform}.json`)
    fs.writeFileSync(cacheFile, JSON.stringify(manifest, null, 2))
    
  } catch (error) {
    console.warn('Failed to cache manifest:', error)
  }
}

async function generateContentManifest(platform: string, clientVersion: string): Promise<ContentManifest> {
  const contentPath = path.join(process.cwd(), 'content')
  const publicAudioPath = path.join(process.cwd(), 'public', 'audio')
  
  // Generate content versions for each type
  const lessons = await generateContentVersion('lessons', path.join(contentPath, 'lessons_enhanced.json'))
  const vocabulary = await generateContentVersion('vocabulary', path.join(contentPath, 'vocabulary'))
  const exercises = await generateContentVersion('exercises', path.join(contentPath, 'exercises'))
  const culturalNotes = await generateContentVersion('cultural_notes', path.join(contentPath, 'cultural_notes.json'))
  const audio = await generateAudioContentVersion(publicAudioPath)
  
  const totalSize = lessons.size + vocabulary.size + exercises.size + culturalNotes.size + audio.size
  
  const manifest: ContentManifest = {
    version: '2.1.0',
    lastUpdated: new Date().toISOString(),
    platform,
    content: {
      lessons,
      vocabulary,
      audio,
      exercises,
      cultural_notes: culturalNotes
    },
    metadata: {
      totalSize,
      requiredVersion: '2.0.0',
      compatibilityVersion: '1.5.0'
    }
  }
  
  return manifest
}

async function generateContentVersion(
  contentType: ContentVersion['contentType'], 
  filePath: string
): Promise<ContentVersion> {
  try {
    let content: any
    let stats: fs.Stats
    
    if (fs.existsSync(filePath)) {
      if (fs.statSync(filePath).isDirectory()) {
        // Handle directory of files
        content = await readDirectoryContent(filePath)
        stats = fs.statSync(filePath)
      } else {
        // Handle single file
        content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        stats = fs.statSync(filePath)
      }
    } else {
      // File doesn't exist, create empty content
      content = getEmptyContent(contentType)
      stats = { size: 0, mtimeMs: Date.now() } as fs.Stats
    }
    
    const contentString = JSON.stringify(content, Object.keys(content).sort())
    const hash = crypto.createHash('sha256').update(contentString).digest('hex')
    
    // Extract version from content if available
    const version = content.metadata?.version || extractVersionFromContent(content) || 1
    
    return {
      id: `${contentType}-${Date.now()}`,
      version,
      contentType,
      hash,
      timestamp: new Date(stats.mtimeMs).toISOString(),
      size: stats.size,
      dependencies: getDependencies(contentType)
    }
    
  } catch (error) {
    console.warn(`Failed to generate version for ${contentType}:`, error)
    
    // Return default version on error
    return {
      id: `${contentType}-error`,
      version: 1,
      contentType,
      hash: 'error',
      timestamp: new Date().toISOString(),
      size: 0
    }
  }
}

async function generateAudioContentVersion(audioPath: string): Promise<ContentVersion> {
  try {
    if (!fs.existsSync(audioPath)) {
      return {
        id: 'audio-empty',
        version: 1,
        contentType: 'audio',
        hash: 'empty',
        timestamp: new Date().toISOString(),
        size: 0
      }
    }
    
    const audioFiles = fs.readdirSync(audioPath)
      .filter(file => file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.m4a'))
      .sort()
    
    let totalSize = 0
    let latestModTime = 0
    
    const audioManifest = audioFiles.map(file => {
      const filePath = path.join(audioPath, file)
      const stats = fs.statSync(filePath)
      totalSize += stats.size
      latestModTime = Math.max(latestModTime, stats.mtimeMs)
      
      return {
        file,
        size: stats.size,
        lastModified: stats.mtimeMs,
        hash: crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex')
      }
    })
    
    const manifestString = JSON.stringify(audioManifest, null, 2)
    const hash = crypto.createHash('sha256').update(manifestString).digest('hex')
    
    return {
      id: `audio-${Date.now()}`,
      version: Math.floor(latestModTime / 1000), // Use timestamp as version
      contentType: 'audio',
      hash,
      timestamp: new Date(latestModTime).toISOString(),
      size: totalSize
    }
    
  } catch (error) {
    console.warn('Failed to generate audio content version:', error)
    
    return {
      id: 'audio-error',
      version: 1,
      contentType: 'audio',
      hash: 'error',
      timestamp: new Date().toISOString(),
      size: 0
    }
  }
}

async function readDirectoryContent(dirPath: string): Promise<any> {
  const result: any = {}
  
  if (!fs.existsSync(dirPath)) {
    return result
  }
  
  const files = fs.readdirSync(dirPath)
  
  for (const file of files) {
    const filePath = path.join(dirPath, file)
    const stats = fs.statSync(filePath)
    
    if (stats.isFile() && file.endsWith('.json')) {
      const fileName = path.basename(file, '.json')
      try {
        result[fileName] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      } catch (error) {
        console.warn(`Failed to read ${filePath}:`, error)
      }
    }
  }
  
  return result
}

function getEmptyContent(contentType: ContentVersion['contentType']): any {
  switch (contentType) {
    case 'lessons':
      return { lessons: [], metadata: { version: 1 } }
    case 'vocabulary':
      return { vocabulary: [], metadata: { version: 1 } }
    case 'exercises':
      return { exercises: [], metadata: { version: 1 } }
    case 'cultural_notes':
      return { notes: [], metadata: { version: 1 } }
    case 'audio':
      return { files: [], metadata: { version: 1 } }
    default:
      return { metadata: { version: 1 } }
  }
}

function extractVersionFromContent(content: any): number {
  // Try to extract version from various possible locations
  if (content.metadata?.version) return content.metadata.version
  if (content.version) return content.version
  if (content.lessons?.length) return content.lessons.length // Use lesson count as version
  if (content.vocabulary?.length) return Math.floor(content.vocabulary.length / 10) + 1
  
  return 1
}

function getDependencies(contentType: ContentVersion['contentType']): string[] {
  switch (contentType) {
    case 'lessons':
      return ['vocabulary', 'cultural_notes']
    case 'exercises':
      return ['lessons', 'vocabulary']
    case 'audio':
      return ['vocabulary', 'lessons']
    default:
      return []
  }
}