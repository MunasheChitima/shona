/**
 * Autonomous Generation Agent
 * Main orchestration system for the Mudzidzisi AI workflow
 * 
 * This system coordinates all stages of the autonomous pronunciation
 * asset generation process as specified in the Master Document v2.0
 */

import { mudzidzisiAI, PhoneticProfile, AssetPrompt, processWord } from './mudzidzisi-ai'
import { assetGenerationPipeline, processWordAssets } from './asset-generation-pipeline'
import { promises as fs } from 'fs'
import path from 'path'

// Enhanced word data structure
interface WordData {
  word: string
  english: string
  category: string
  difficulty: number
  culturalContext?: string
  usage?: string
  examples?: string[]
}

// Processing result structure
interface ProcessingResult {
  word: string
  profile: PhoneticProfile
  audioPrompt: AssetPrompt
  videoPrompt: AssetPrompt
  complexity: number
  assets: {
    audio: string
    video: string
    profileVideo?: string
  }
  metadata: {
    processingTime: number
    timestamp: Date
    version: string
  }
}

// Generation job structure
interface GenerationJob {
  id: string
  words: WordData[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  results: ProcessingResult[]
  errors: string[]
  startTime: Date
  endTime?: Date
  statistics: {
    totalWords: number
    successfulWords: number
    failedWords: number
    totalProcessingTime: number
    averageComplexity: number
  }
}

/**
 * Autonomous Generation Agent
 * Master controller for the complete workflow
 */
export class AutonomousGenerationAgent {
  private static instance: AutonomousGenerationAgent
  private jobs: Map<string, GenerationJob> = new Map()
  private isProcessing: boolean = false
  private outputDir: string
  
  private constructor() {
    this.outputDir = path.join(process.cwd(), 'content', 'generated-assets')
    this.ensureDirectories()
  }

  public static getInstance(): AutonomousGenerationAgent {
    if (!AutonomousGenerationAgent.instance) {
      AutonomousGenerationAgent.instance = new AutonomousGenerationAgent()
    }
    return AutonomousGenerationAgent.instance
  }

  /**
   * Ensure necessary directories exist
   */
  private async ensureDirectories(): Promise<void> {
    const dirs = [
      this.outputDir,
      path.join(this.outputDir, 'audio'),
      path.join(this.outputDir, 'video'),
      path.join(this.outputDir, 'profiles'),
      path.join(this.outputDir, 'logs')
    ]
    
    for (const dir of dirs) {
      try {
        await fs.access(dir)
      } catch {
        await fs.mkdir(dir, { recursive: true })
      }
    }
  }

  /**
   * Process a single word through the complete workflow
   */
  public async processSingleWord(wordData: WordData): Promise<ProcessingResult> {
    const startTime = Date.now()
    
    console.log(`🎯 Processing word: ${wordData.word}`)
    console.log(`📝 Translation: ${wordData.english}`)
    console.log(`🏷️ Category: ${wordData.category}`)
    
    // Stage 1-3: Phonetic Analysis and Prompt Generation
    const analysis = processWord(wordData.word)
    
    console.log(`🔍 Phonetic Analysis Complete:`)
    console.log(`   - Tokens: ${analysis.profile.tokens.join(', ')}`)
    console.log(`   - Syllables: ${analysis.profile.syllables.join('-')}`)
    console.log(`   - Complexity: ${analysis.metadata.complexity}`)
    
    // Stage 4: Asset Generation
    console.log(`🎨 Generating assets...`)
    const generationLog = await processWordAssets(
      wordData.word,
      analysis.profile,
      analysis.audioPrompt,
      analysis.videoPrompt,
      analysis.metadata.complexity
    )
    
    const processingTime = Date.now() - startTime
    
    // Prepare result structure
    const result: ProcessingResult = {
      word: wordData.word,
      profile: analysis.profile,
      audioPrompt: analysis.audioPrompt,
      videoPrompt: analysis.videoPrompt,
      complexity: analysis.metadata.complexity,
      assets: {
        audio: generationLog.audioResult?.fileName || '',
        video: generationLog.videoResult?.fileName || '',
        profileVideo: generationLog.profileVideoResult?.fileName
      },
      metadata: {
        processingTime,
        timestamp: new Date(),
        version: '2.0'
      }
    }
    
    console.log(`✅ Word processing complete: ${wordData.word}`)
    console.log(`   - Audio: ${result.assets.audio}`)
    console.log(`   - Video: ${result.assets.video}`)
    if (result.assets.profileVideo) {
      console.log(`   - Profile Video: ${result.assets.profileVideo}`)
    }
    console.log(`   - Processing Time: ${processingTime}ms`)
    
    return result
  }

  /**
   * Create a new generation job
   */
  public async createGenerationJob(
    words: WordData[],
    jobId?: string
  ): Promise<string> {
    const id = jobId || this.generateJobId()
    
    const job: GenerationJob = {
      id,
      words,
      status: 'pending',
      results: [],
      errors: [],
      startTime: new Date(),
      statistics: {
        totalWords: words.length,
        successfulWords: 0,
        failedWords: 0,
        totalProcessingTime: 0,
        averageComplexity: 0
      }
    }
    
    this.jobs.set(id, job)
    
    console.log(`📋 Created generation job: ${id}`)
    console.log(`   - Words to process: ${words.length}`)
    
    return id
  }

  /**
   * Execute a generation job
   */
  public async executeGenerationJob(jobId: string): Promise<GenerationJob> {
    const job = this.jobs.get(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }
    
    if (this.isProcessing) {
      throw new Error('Another job is already processing')
    }
    
    this.isProcessing = true
    job.status = 'processing'
    
    console.log(`🚀 Starting generation job: ${jobId}`)
    console.log(`   - Total words: ${job.words.length}`)
    console.log(`   - Started at: ${job.startTime.toISOString()}`)
    
    try {
      // Process each word
      for (let i = 0; i < job.words.length; i++) {
        const wordData = job.words[i]
        
        console.log(`\n📍 Processing word ${i + 1}/${job.words.length}: ${wordData.word}`)
        
        try {
          const result = await this.processSingleWord(wordData)
          job.results.push(result)
          job.statistics.successfulWords++
          job.statistics.totalProcessingTime += result.metadata.processingTime
          
          // Update average complexity
          const totalComplexity = job.results.reduce((sum, r) => sum + r.complexity, 0)
          job.statistics.averageComplexity = totalComplexity / job.results.length
          
        } catch (error) {
          const errorMsg = `Failed to process word ${wordData.word}: ${error}`
          job.errors.push(errorMsg)
          job.statistics.failedWords++
          console.error(`❌ ${errorMsg}`)
        }
        
        // Brief pause between words
        if (i < job.words.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      job.status = 'completed'
      job.endTime = new Date()
      
      console.log(`\n🎉 Generation job completed: ${jobId}`)
      console.log(`   - Successful: ${job.statistics.successfulWords}`)
      console.log(`   - Failed: ${job.statistics.failedWords}`)
      console.log(`   - Total time: ${job.statistics.totalProcessingTime}ms`)
      
      // Save job results
      await this.saveJobResults(job)
      
    } catch (error) {
      job.status = 'failed'
      job.endTime = new Date()
      job.errors.push(`Job execution failed: ${error}`)
      console.error(`💥 Job failed: ${error}`)
    } finally {
      this.isProcessing = false
    }
    
    return job
  }

  /**
   * Process vocabulary list from existing content
   */
  public async processVocabularyList(
    vocabularySource: 'existing' | 'custom',
    customWords?: WordData[]
  ): Promise<string> {
    let words: WordData[] = []
    
    if (vocabularySource === 'existing') {
      // Load from existing vocabulary files
      words = await this.loadExistingVocabulary()
    } else if (customWords) {
      words = customWords
    } else {
      throw new Error('No vocabulary source provided')
    }
    
    console.log(`📚 Processing vocabulary list: ${words.length} words`)
    
    // Create and execute job
    const jobId = await this.createGenerationJob(words)
    await this.executeGenerationJob(jobId)
    
    return jobId
  }

  /**
   * Load existing vocabulary from content files
   */
  private async loadExistingVocabulary(): Promise<WordData[]> {
    const vocabularyPath = path.join(process.cwd(), 'content', 'vocabulary_enhanced.json')
    
    try {
      const data = await fs.readFile(vocabularyPath, 'utf8')
      const vocabulary = JSON.parse(data)
      
      // Transform to WordData format
      return vocabulary.map((item: any) => ({
        word: item.shona,
        english: item.english,
        category: item.category || 'General',
        difficulty: item.difficulty || 1,
        culturalContext: item.culturalContext,
        usage: item.usage,
        examples: item.examples
      }))
    } catch (error) {
      console.error('Failed to load existing vocabulary:', error)
      return []
    }
  }

  /**
   * Process specific word categories
   */
  public async processCategoryWords(
    categories: string[],
    maxWordsPerCategory: number = 50
  ): Promise<string> {
    const allWords = await this.loadExistingVocabulary()
    
    const categoryWords = categories.reduce((acc, category) => {
      const words = allWords
        .filter(word => word.category === category)
        .slice(0, maxWordsPerCategory)
      
      return acc.concat(words)
    }, [] as WordData[])
    
    console.log(`🏷️ Processing category words: ${categoryWords.length} words`)
    console.log(`   - Categories: ${categories.join(', ')}`)
    
    const jobId = await this.createGenerationJob(categoryWords, `category-${Date.now()}`)
    await this.executeGenerationJob(jobId)
    
    return jobId
  }

  /**
   * Process high-complexity words
   */
  public async processComplexWords(complexityThreshold: number = 10): Promise<string> {
    const allWords = await this.loadExistingVocabulary()
    
    // Pre-analyze words to find complex ones
    const complexWords: WordData[] = []
    
    for (const word of allWords) {
      const analysis = processWord(word.word)
      if (analysis.metadata.complexity >= complexityThreshold) {
        complexWords.push(word)
      }
    }
    
    console.log(`🧠 Processing complex words: ${complexWords.length} words`)
    console.log(`   - Complexity threshold: ${complexityThreshold}`)
    
    const jobId = await this.createGenerationJob(complexWords, `complex-${Date.now()}`)
    await this.executeGenerationJob(jobId)
    
    return jobId
  }

  /**
   * Save job results to disk
   */
  private async saveJobResults(job: GenerationJob): Promise<void> {
    const jobPath = path.join(this.outputDir, 'logs', `job-${job.id}.json`)
    
    await fs.writeFile(jobPath, JSON.stringify(job, null, 2))
    
    // Also save a summary
    const summaryPath = path.join(this.outputDir, 'logs', `summary-${job.id}.json`)
    const summary = {
      id: job.id,
      status: job.status,
      statistics: job.statistics,
      startTime: job.startTime,
      endTime: job.endTime,
      errors: job.errors,
      successfulWords: job.results.map(r => r.word),
      complexityDistribution: this.calculateComplexityDistribution(job.results)
    }
    
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2))
  }

  /**
   * Calculate complexity distribution
   */
  private calculateComplexityDistribution(results: ProcessingResult[]): Record<string, number> {
    const distribution: Record<string, number> = {}
    
    results.forEach(result => {
      const range = this.getComplexityRange(result.complexity)
      distribution[range] = (distribution[range] || 0) + 1
    })
    
    return distribution
  }

  /**
   * Get complexity range for statistics
   */
  private getComplexityRange(complexity: number): string {
    if (complexity <= 5) return 'Low (1-5)'
    if (complexity <= 10) return 'Medium (6-10)'
    if (complexity <= 15) return 'High (11-15)'
    return 'Very High (16+)'
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get job status
   */
  public getJobStatus(jobId: string): GenerationJob | undefined {
    return this.jobs.get(jobId)
  }

  /**
   * Get all jobs
   */
  public getAllJobs(): GenerationJob[] {
    return Array.from(this.jobs.values())
  }

  /**
   * Get processing statistics
   */
  public getGlobalStatistics(): {
    totalJobs: number
    totalWords: number
    successfulWords: number
    failedWords: number
    averageComplexity: number
    complexityDistribution: Record<string, number>
  } {
    const jobs = Array.from(this.jobs.values())
    const allResults = jobs.flatMap(job => job.results)
    
    return {
      totalJobs: jobs.length,
      totalWords: jobs.reduce((sum, job) => sum + job.statistics.totalWords, 0),
      successfulWords: jobs.reduce((sum, job) => sum + job.statistics.successfulWords, 0),
      failedWords: jobs.reduce((sum, job) => sum + job.statistics.failedWords, 0),
      averageComplexity: allResults.length > 0 
        ? allResults.reduce((sum, result) => sum + result.complexity, 0) / allResults.length
        : 0,
      complexityDistribution: this.calculateComplexityDistribution(allResults)
    }
  }

  /**
   * Export comprehensive generation report
   */
  public async exportGenerationReport(): Promise<string> {
    const report = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      agent: 'Mudzidzisi AI',
      statistics: this.getGlobalStatistics(),
      jobs: Array.from(this.jobs.values()),
      phonemeUsage: this.calculatePhonemeUsage(),
      assetManifest: await this.generateAssetManifest()
    }
    
    const reportPath = path.join(this.outputDir, 'generation-report.json')
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`📊 Generation report exported: ${reportPath}`)
    return reportPath
  }

  /**
   * Calculate phoneme usage statistics
   */
  private calculatePhonemeUsage(): Record<string, number> {
    const usage: Record<string, number> = {}
    
    this.jobs.forEach(job => {
      job.results.forEach(result => {
        result.profile.tokens.forEach(token => {
          usage[token] = (usage[token] || 0) + 1
        })
      })
    })
    
    return usage
  }

  /**
   * Generate asset manifest
   */
  private async generateAssetManifest(): Promise<{
    audio: string[]
    video: string[]
    profileVideo: string[]
  }> {
    const manifest = {
      audio: [] as string[],
      video: [] as string[],
      profileVideo: [] as string[]
    }
    
    this.jobs.forEach(job => {
      job.results.forEach(result => {
        if (result.assets.audio) manifest.audio.push(result.assets.audio)
        if (result.assets.video) manifest.video.push(result.assets.video)
        if (result.assets.profileVideo) manifest.profileVideo.push(result.assets.profileVideo)
      })
    })
    
    return manifest
  }

  /**
   * Clear all jobs and reset agent
   */
  public reset(): void {
    this.jobs.clear()
    this.isProcessing = false
    console.log('🔄 Agent reset complete')
  }
}

// Export singleton instance
export const autonomousGenerationAgent = AutonomousGenerationAgent.getInstance()

// Export utility functions
export const processVocabulary = (
  vocabularySource: 'existing' | 'custom',
  customWords?: WordData[]
) => autonomousGenerationAgent.processVocabularyList(vocabularySource, customWords)

export const processCategoryWords = (
  categories: string[],
  maxWordsPerCategory?: number
) => autonomousGenerationAgent.processCategoryWords(categories, maxWordsPerCategory)

export const processComplexWords = (
  complexityThreshold?: number
) => autonomousGenerationAgent.processComplexWords(complexityThreshold)

export const getJobStatus = (jobId: string) => autonomousGenerationAgent.getJobStatus(jobId)
export const getGlobalStatistics = () => autonomousGenerationAgent.getGlobalStatistics()
export const exportGenerationReport = () => autonomousGenerationAgent.exportGenerationReport()

// Export types for external use
export type { WordData, ProcessingResult, GenerationJob }