#!/usr/bin/env node

/**
 * Audio Compression Setup Script for Shona Learning App
 * Creates compressed versions of audio files in multiple formats and qualities
 */

const fs = require('fs').promises
const path = require('path')
const { spawn } = require('child_process')

// Configuration
const CONFIG = {
  inputDir: path.join(__dirname, '..', 'content', 'audio'),
  outputDir: path.join(__dirname, '..', 'public', 'content', 'audio', 'compressed'),
  formats: {
    mp3_128: {
      format: 'mp3',
      bitrate: '128k',
      sampleRate: '44100',
      channels: 1,
      extension: 'mp3'
    },
    opus_64: {
      format: 'opus',
      bitrate: '64k',
      sampleRate: '48000',
      channels: 1,
      extension: 'opus'
    },
    opus_32: {
      format: 'opus',
      bitrate: '32k',
      sampleRate: '24000',
      channels: 1,
      extension: 'opus'
    }
  },
  concurrency: 4 // Number of parallel compression jobs
}

class AudioCompressor {
  constructor() {
    this.queue = []
    this.activeJobs = 0
    this.stats = {
      total: 0,
      completed: 0,
      failed: 0,
      startTime: Date.now()
    }
  }

  async initialize() {
    console.log('🎵 Initializing Audio Compression Pipeline...')
    
    // Check if FFmpeg is available
    if (!await this.checkFFmpeg()) {
      throw new Error('FFmpeg not found. Please install FFmpeg to proceed.')
    }
    
    // Create output directories
    await this.createOutputDirectories()
    
    console.log('✅ Audio compression pipeline initialized')
  }

  async checkFFmpeg() {
    return new Promise((resolve) => {
      const ffmpeg = spawn('ffmpeg', ['-version'])
      ffmpeg.on('close', (code) => {
        resolve(code === 0)
      })
      ffmpeg.on('error', () => {
        resolve(false)
      })
    })
  }

  async createOutputDirectories() {
    for (const quality in CONFIG.formats) {
      const dir = path.join(CONFIG.outputDir, quality)
      await fs.mkdir(dir, { recursive: true })
      console.log(`📁 Created directory: ${dir}`)
    }
  }

  async findAudioFiles() {
    console.log('🔍 Scanning for audio files...')
    
    const audioFiles = []
    
    async function scanDirectory(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath)
        } else if (entry.isFile() && /\.(mp3|wav|ogg|flac)$/i.test(entry.name)) {
          const relativePath = path.relative(CONFIG.inputDir, fullPath)
          audioFiles.push({
            inputPath: fullPath,
            relativePath,
            name: entry.name,
            extension: path.extname(entry.name)
          })
        }
      }
    }
    
    await scanDirectory(CONFIG.inputDir)
    
    console.log(`🎵 Found ${audioFiles.length} audio files`)
    return audioFiles
  }

  async compressFile(audioFile, quality, qualityConfig) {
    return new Promise((resolve, reject) => {
      const outputFileName = audioFile.name.replace(
        audioFile.extension, 
        `.${quality}.${qualityConfig.extension}`
      )
      
      const outputPath = path.join(
        CONFIG.outputDir, 
        quality,
        path.dirname(audioFile.relativePath),
        outputFileName
      )
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath)
      fs.mkdir(outputDir, { recursive: true }).then(() => {
        
        const args = [
          '-i', audioFile.inputPath,
          '-c:a', qualityConfig.format === 'opus' ? 'libopus' : 'libmp3lame',
          '-b:a', qualityConfig.bitrate,
          '-ar', qualityConfig.sampleRate,
          '-ac', qualityConfig.channels.toString(),
          '-y', // Overwrite output files
          outputPath
        ]
        
        const ffmpeg = spawn('ffmpeg', args)
        
        let stderr = ''
        ffmpeg.stderr.on('data', (data) => {
          stderr += data.toString()
        })
        
        ffmpeg.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              inputPath: audioFile.inputPath,
              outputPath,
              quality,
              size: 0 // Will be populated after compression
            })
          } else {
            reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`))
          }
        })
        
        ffmpeg.on('error', reject)
      }).catch(reject)
    })
  }

  async processFile(audioFile) {
    const results = []
    
    for (const [quality, qualityConfig] of Object.entries(CONFIG.formats)) {
      try {
        const result = await this.compressFile(audioFile, quality, qualityConfig)
        
        // Get compressed file size
        const stats = await fs.stat(result.outputPath)
        result.size = stats.size
        
        results.push(result)
        
        console.log(`✅ ${audioFile.name} → ${quality} (${this.formatBytes(result.size)})`)
        
      } catch (error) {
        console.error(`❌ Failed to compress ${audioFile.name} to ${quality}:`, error.message)
        results.push({
          success: false,
          inputPath: audioFile.inputPath,
          quality,
          error: error.message
        })
        this.stats.failed++
      }
    }
    
    return results
  }

  async processQueue() {
    while (this.queue.length > 0 && this.activeJobs < CONFIG.concurrency) {
      const audioFile = this.queue.shift()
      this.activeJobs++
      
      this.processFile(audioFile).then((results) => {
        this.stats.completed++
        this.activeJobs--
        
        // Continue processing
        this.processQueue()
        
        // Log progress
        const progress = (this.stats.completed / this.stats.total * 100).toFixed(1)
        console.log(`📊 Progress: ${this.stats.completed}/${this.stats.total} (${progress}%)`)
        
      }).catch((error) => {
        console.error('Processing error:', error)
        this.stats.failed++
        this.activeJobs--
        this.processQueue()
      })
    }
  }

  async compressAll() {
    const audioFiles = await this.findAudioFiles()
    
    if (audioFiles.length === 0) {
      console.log('🤷 No audio files found to compress')
      return
    }
    
    this.queue = [...audioFiles]
    this.stats.total = audioFiles.length
    
    console.log(`🚀 Starting compression of ${audioFiles.length} files...`)
    console.log(`📋 Formats: ${Object.keys(CONFIG.formats).join(', ')}`)
    console.log(`⚡ Concurrency: ${CONFIG.concurrency} jobs`)
    
    // Start processing
    this.processQueue()
    
    // Wait for completion
    return new Promise((resolve) => {
      const checkCompletion = () => {
        if (this.stats.completed + this.stats.failed >= this.stats.total && this.activeJobs === 0) {
          resolve()
        } else {
          setTimeout(checkCompletion, 1000)
        }
      }
      checkCompletion()
    })
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  printStats() {
    const duration = (Date.now() - this.stats.startTime) / 1000
    
    console.log('\n📊 Compression Statistics:')
    console.log(`Total files: ${this.stats.total}`)
    console.log(`Completed: ${this.stats.completed}`)
    console.log(`Failed: ${this.stats.failed}`)
    console.log(`Duration: ${duration.toFixed(1)}s`)
    console.log(`Rate: ${(this.stats.completed / duration).toFixed(1)} files/sec`)
  }

  async generateManifest() {
    console.log('📝 Generating compression manifest...')
    
    const manifest = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      qualities: CONFIG.formats,
      stats: this.stats,
      files: {}
    }
    
    // Scan compressed directories to build file map
    for (const quality in CONFIG.formats) {
      const qualityDir = path.join(CONFIG.outputDir, quality)
      
      try {
        const files = await this.scanCompressedFiles(qualityDir)
        manifest.files[quality] = files
      } catch (error) {
        console.error(`Failed to scan ${quality} directory:`, error)
      }
    }
    
    const manifestPath = path.join(CONFIG.outputDir, 'compression-manifest.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    
    console.log(`✅ Manifest saved to: ${manifestPath}`)
  }

  async scanCompressedFiles(dir) {
    const files = []
    
    async function scan(currentDir) {
      try {
        const entries = await fs.readdir(currentDir, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name)
          
          if (entry.isDirectory()) {
            await scan(fullPath)
          } else if (entry.isFile()) {
            const stats = await fs.stat(fullPath)
            const relativePath = path.relative(dir, fullPath)
            
            files.push({
              path: relativePath,
              size: stats.size,
              modified: stats.mtime.toISOString()
            })
          }
        }
      } catch (error) {
        console.error(`Error scanning ${currentDir}:`, error)
      }
    }
    
    await scan(dir)
    return files
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'compress'
  
  console.log('🎵 Shona Audio Compression Pipeline')
  console.log('===================================\n')
  
  const compressor = new AudioCompressor()
  
  try {
    await compressor.initialize()
    
    switch (command) {
      case 'compress':
      case 'all':
        await compressor.compressAll()
        compressor.printStats()
        await compressor.generateManifest()
        break
        
      case 'manifest':
        await compressor.generateManifest()
        break
        
      case 'check':
        console.log('✅ System check complete')
        break
        
      default:
        console.log('Usage: node setup-audio-compression.js [compress|manifest|check]')
        process.exit(1)
    }
    
    console.log('\n🎉 Audio compression pipeline completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { AudioCompressor, CONFIG }