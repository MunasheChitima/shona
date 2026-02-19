// Content Chunking Service for Performance Optimization
// Breaks large JSON files into smaller chunks for better loading performance

export interface ContentChunk {
  id: string
  type: 'lesson' | 'vocabulary' | 'exercise' | 'cultural'
  data: any
  metadata: {
    totalChunks: number
    chunkIndex: number
    hasNext: boolean
    hasPrevious: boolean
  }
  timestamp?: number
}

export interface ChunkingConfig {
  maxChunkSize: number
  chunkTypes: string[]
  cacheDuration: number
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export class ContentChunkingService {
  private static instance: ContentChunkingService
  private cache = new Map<string, ContentChunk[]>()
  private config: ChunkingConfig

  constructor(config: Partial<ChunkingConfig> = {}) {
    this.config = {
      maxChunkSize: 50, // Maximum items per chunk
      chunkTypes: ['lesson', 'vocabulary', 'exercise', 'cultural'],
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      ...config
    }
  }

  static getInstance(): ContentChunkingService {
    if (!ContentChunkingService.instance) {
      ContentChunkingService.instance = new ContentChunkingService()
    }
    return ContentChunkingService.instance
  }

  // Chunk large arrays of content
  chunkContent<T>(content: T[], type: string, chunkSize?: number): ContentChunk[] {
    const size = chunkSize || this.config.maxChunkSize
    const chunks: ContentChunk[] = []
    
    for (let i = 0; i < content.length; i += size) {
      const chunkData = content.slice(i, i + size)
      const chunkIndex = Math.floor(i / size)
      
      chunks.push({
        id: `${type}_chunk_${chunkIndex}`,
        type: type as any,
        data: chunkData,
        metadata: {
          totalChunks: Math.ceil(content.length / size),
          chunkIndex,
          hasNext: i + size < content.length,
          hasPrevious: i > 0
        }
      })
    }
    
    return chunks
  }

  // Load content chunks with caching
  async loadContentChunks(type: string, page: number = 1, filters?: any): Promise<ContentChunk[]> {
    const cacheKey = `${type}_${page}_${JSON.stringify(filters || {})}`
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (cached[0]?.timestamp && Date.now() - cached[0].timestamp < this.config.cacheDuration) {
        return cached
      }
    }
    
    try {
      // Load and chunk content
      const content = await this.loadFullContent(type, filters)
      const chunks = this.chunkContent(content, type)
      
      // Cache the result
      this.cache.set(cacheKey, chunks.map(chunk => ({
        ...chunk,
        timestamp: Date.now()
      })))
      
      return chunks
    } catch (error) {
      console.error('Error loading content chunks:', error)
      // Return empty chunks array on error to prevent crashes
      return []
    }
  }

  // Load full content from source
  private async loadFullContent(type: string, filters?: any): Promise<any[]> {
    switch (type) {
      case 'lesson':
        return this.loadLessons(filters)
      case 'vocabulary':
        return this.loadVocabulary(filters)
      case 'exercise':
        return this.loadExercises(filters)
      case 'cultural':
        return this.loadCulturalContent(filters)
      default:
        throw new Error(`Unknown content type: ${type}`)
    }
  }

  // Load lessons with filtering
  private async loadLessons(filters?: any): Promise<any[]> {
    try {
      if (typeof window === 'undefined') {
        return []
      }
      
      const response = await fetch('/api/lessons', {
        headers: {
          ...getAuthHeaders(),
        },
      })
      if (!response.ok) throw new Error('Failed to load lessons')
      
      const data = await response.json()
      let lessons = data.lessons || []
      
      // Apply filters
      if (filters?.category) {
        lessons = lessons.filter((l: any) => l.category === filters.category)
      }
      if (filters?.level) {
        lessons = lessons.filter((l: any) => l.level === filters.level)
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        lessons = lessons.filter((l: any) => 
          l.title.toLowerCase().includes(search) ||
          l.description.toLowerCase().includes(search)
        )
      }
      
      return lessons
    } catch (error) {
      console.error('Error loading lessons:', error)
      return []
    }
  }

  // Load vocabulary with filtering
  private async loadVocabulary(filters?: any): Promise<any[]> {
    try {
      if (typeof window === 'undefined') {
        return []
      }
      
      const response = await fetch('/api/vocabulary', {
        headers: {
          ...getAuthHeaders(),
        },
      })
      if (!response.ok) throw new Error('Failed to load vocabulary')
      
      const data = await response.json()
      let vocabulary = data || []
      
      if (filters?.category) {
        vocabulary = vocabulary.filter((v: any) => v.category === filters.category)
      }
      if (filters?.difficulty) {
        vocabulary = vocabulary.filter((v: any) => v.difficulty === filters.difficulty)
      }
      
      return vocabulary
    } catch (error) {
      console.error('Error loading vocabulary:', error)
      return []
    }
  }

  // Load exercises with filtering
  private async loadExercises(filters?: any): Promise<any[]> {
    try {
      if (typeof window === 'undefined') {
        return []
      }
      
      if (!filters?.lessonId) return []
      
      const response = await fetch(`/api/exercises/${filters.lessonId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      })
      if (!response.ok) throw new Error('Failed to load exercises')
      
      const exercises = await response.json()
      return exercises
    } catch (error) {
      console.error('Error loading exercises:', error)
      return []
    }
  }

  // Load cultural content with filtering
  private async loadCulturalContent(filters?: any): Promise<any[]> {
    try {
      if (typeof window === 'undefined') {
        return []
      }
      
      const response = await fetch('/api/cultural-content', {
        headers: {
          ...getAuthHeaders(),
        },
      })
      if (!response.ok) throw new Error('Failed to load cultural content')
      
      const data = await response.json()
      let content = data || []
      
      if (filters?.category) {
        content = content.filter((c: any) => c.category === filters.category)
      }
      
      return content
    } catch (error) {
      console.error('Error loading cultural content:', error)
      return []
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: number } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.values()).flat().length
    }
  }
}

// Export singleton instance
export const contentChunkingService = ContentChunkingService.getInstance() 