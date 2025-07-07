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
  { params }: { params: { id: string } }
) {
  try {
    const audioId = params.id
    const searchParams = request.nextUrl.searchParams
    const quality = searchParams.get('quality') || 'medium'
    const format = searchParams.get('format') || 'mp3'

    // Load enhanced audio manifest
    const manifestPath = path.join(process.cwd(), 'content', 'enhanced-audio-manifest.json')
    const manifestContent = await fs.readFile(manifestPath, 'utf-8')
    const manifest = JSON.parse(manifestContent)

    // Find audio file by ID
    const audioFile = await findAudioFileById(audioId, manifest)
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      )
    }

    // Determine best quality based on request and client capabilities
    const selectedQuality = determineBestQuality(request, quality)
    const filePath = getAudioFilePath(audioFile, selectedQuality, format)
    
    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      // Fallback to original quality if compressed version doesn't exist
      const fallbackPath = audioFile.url
      try {
        await fs.access(path.join(process.cwd(), 'public', fallbackPath))
        return serveAudioFile(path.join(process.cwd(), 'public', fallbackPath), audioFile)
      } catch {
        return NextResponse.json(
          { error: 'Audio file not available' },
          { status: 404 }
        )
      }
    }

    return serveAudioFile(filePath, audioFile)

  } catch (error) {
    console.error('Error serving audio file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function findAudioFileById(id: string, manifest: any): Promise<AudioFile | null> {
  // Search through all categories to find the audio file
  for (const categoryType in manifest.categories) {
    const category = manifest.categories[categoryType]
    
    if (categoryType === 'words') {
      for (const level in category) {
        for (const subcategory in category[level].subcategories) {
          const files = category[level].subcategories[subcategory].examples
          for (let i = 0; i < files.length; i++) {
            const fileId = `${subcategory}_${i}`
            if (fileId === id) {
              return {
                id,
                filename: `${files[i]}.mp3`,
                transcript: files[i],
                translation: files[i], // Would need translation lookup
                category: subcategory,
                level: category[level].levels[0],
                priority: category[level].priority as any,
                size: 0, // Would be populated from file system
                duration: 0, // Would be populated from audio metadata
                url: `/content/audio/words/${level}/${subcategory}/${files[i]}.mp3`,
                quality: 'high',
                compressionFormats: {
                  mp3_128: `/content/audio/words/${level}/${subcategory}/${files[i]}.mp3_128.mp3`,
                  opus_64: `/content/audio/words/${level}/${subcategory}/${files[i]}.opus_64.opus`,
                  opus_32: `/content/audio/words/${level}/${subcategory}/${files[i]}.opus_32.opus`
                }
              }
            }
          }
        }
      }
    }
  }

  // Fallback: check original manifest structure
  const originalManifestPath = path.join(process.cwd(), 'content', 'audio-manifest.json')
  try {
    const originalContent = await fs.readFile(originalManifestPath, 'utf-8')
    const originalManifest = JSON.parse(originalContent)
    
    for (const category in originalManifest.audioManifest.categories) {
      const files = originalManifest.audioManifest.categories[category].files
      for (let i = 0; i < files.length; i++) {
        const fileId = `${category}_${i}`
        if (fileId === id) {
          return {
            id,
            filename: files[i].filename,
            transcript: files[i].transcript,
            translation: files[i].translation,
            category,
            level: determineLevelFromCategory(category),
            priority: determinePriority(category),
            size: 0,
            duration: files[i].duration || 0,
            url: `/content/audio/${files[i].filename}`,
            quality: 'high',
            compressionFormats: {
              mp3_128: `/content/audio/compressed/mp3_128/${files[i].filename}`,
              opus_64: `/content/audio/compressed/opus_64/${files[i].filename.replace('.mp3', '.opus')}`,
              opus_32: `/content/audio/compressed/opus_32/${files[i].filename.replace('.mp3', '.opus')}`
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading original manifest:', error)
  }

  return null
}

function determineLevelFromCategory(category: string): number {
  const levelMap: { [key: string]: number } = {
    'greetings': 1,
    'introductions': 1,
    'numbers': 2,
    'family': 3,
    'market': 4,
    'pronunciation': 5
  }
  return levelMap[category] || 5
}

function determinePriority(category: string): 'immediate' | 'prefetch' | 'onDemand' {
  const immediatePriorities = ['greetings', 'numbers']
  const prefetchPriorities = ['family', 'introductions']
  
  if (immediatePriorities.includes(category)) return 'immediate'
  if (prefetchPriorities.includes(category)) return 'prefetch'
  return 'onDemand'
}

function determineBestQuality(request: NextRequest, requestedQuality: string): string {
  const userAgent = request.headers.get('user-agent') || ''
  const acceptEncoding = request.headers.get('accept-encoding') || ''
  
  // Check for mobile devices
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
  
  // Check connection type from request headers
  const connectionType = request.headers.get('sec-ch-ua-mobile') || ''
  
  // Determine quality based on device and connection
  if (isMobile && requestedQuality === 'auto') {
    return 'opus_64'
  } else if (requestedQuality === 'auto') {
    return 'mp3_128'
  }
  
  // Map requested quality to actual format
  const qualityMap: { [key: string]: string } = {
    'high': 'mp3_128',
    'medium': 'opus_64',
    'low': 'opus_32'
  }
  
  return qualityMap[requestedQuality] || 'opus_64'
}

function getAudioFilePath(audioFile: AudioFile, quality: string, format: string): string {
  const compressionFormats = audioFile.compressionFormats as any
  const selectedPath = compressionFormats[quality] || audioFile.url
  
  return path.join(process.cwd(), 'public', selectedPath)
}

async function serveAudioFile(filePath: string, audioFile: AudioFile): Promise<NextResponse> {
  try {
    const audioBuffer = await fs.readFile(filePath)
    const stats = await fs.stat(filePath)
    
    // Determine MIME type
    const mimeType = getMimeType(filePath)
    
    // Set appropriate headers for audio streaming
    const headers = new Headers({
      'Content-Type': mimeType,
      'Content-Length': audioBuffer.length.toString(),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      'ETag': `"${stats.mtime.getTime()}"`,
      'Last-Modified': stats.mtime.toUTCString(),
      
      // CORS headers for cross-origin requests
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      
      // Audio-specific metadata
      'X-Audio-Duration': audioFile.duration?.toString() || '0',
      'X-Audio-Transcript': audioFile.transcript,
      'X-Audio-Translation': audioFile.translation,
      'X-Audio-Category': audioFile.category,
      'X-Audio-Level': audioFile.level.toString()
    })

    return new NextResponse(audioBuffer, {
      status: 200,
      headers
    })
    
  } catch (error) {
    console.error('Error reading audio file:', error)
    return NextResponse.json(
      { error: 'Failed to read audio file' },
      { status: 500 }
    )
  }
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  
  const mimeTypes: { [key: string]: string } = {
    '.mp3': 'audio/mpeg',
    '.opus': 'audio/ogg; codecs=opus',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac'
  }
  
  return mimeTypes[ext] || 'application/octet-stream'
}

// Handle range requests for streaming
export async function HEAD(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Return the same headers as GET but without body
  const response = await GET(request, { params })
  const headers = new Headers(response.headers)
  
  return new NextResponse(null, {
    status: 200,
    headers
  })
}