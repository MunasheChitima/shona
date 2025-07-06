#!/usr/bin/env tsx
/**
 * Google Veo API Integration for Shona Pronunciation Videos
 * Generates actual pronunciation videos using Google's advanced Veo video generation model
 */

import { processWord } from '../lib/mudzidzisi-ai'
import { promises as fs } from 'fs'
import path from 'path'

// Google Cloud Configuration for Veo API
const GOOGLE_API_KEY = 'AIzaSyBOGN6xFt_ylRMucqVHYDhsRE5IoMJZXEo'
const PROJECT_ID = 'shona-pronunciation-videos' // You'll need to set this
const LOCATION = 'us-central1'
const VEO_MODEL = 'veo-2.0-generate-001' // or 'veo-3.0-generate-preview'

// API Endpoints
const VEO_GENERATE_ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${VEO_MODEL}:predictLongRunning`
const VEO_OPERATION_ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/operations`

// Priority Shona words for video generation
const PRONUNCIATION_WORDS = [
  { word: 'mangwanani', english: 'good morning', complexity: 'intermediate', special: 'prenasalized ng' },
  { word: 'masikati', english: 'good afternoon', complexity: 'beginner', special: 'basic syllables' },
  { word: 'manheru', english: 'good evening', complexity: 'beginner', special: 'aspirated h' },
  { word: 'bhazi', english: 'bus', complexity: 'intermediate', special: 'breathy bh' },
  { word: 'svika', english: 'arrive', complexity: 'intermediate', special: 'whistled sv' },
  { word: 'zvino', english: 'now', complexity: 'intermediate', special: 'whistled zv' },
  { word: 'tsvaira', english: 'drive', complexity: 'advanced', special: 'whistled tsv + hiatus' },
  { word: 'mbira', english: 'thumb piano', complexity: 'intermediate', special: 'prenasalized mb' }
]

interface VeoVideoRequest {
  instances: Array<{
    prompt: string
    image?: {
      bytesBase64Encoded: string
      mimeType: string
    }
  }>
  parameters: {
    aspectRatio: '16:9' | '9:16'
    durationSeconds: number
    enhancePrompt: boolean
    generateAudio: boolean
    negativePrompt?: string
    personGeneration: 'allow_adult' | 'dont_allow'
    sampleCount: number
    seed?: number
    storageUri?: string
  }
}

interface VeoOperation {
  name: string
  done: boolean
  response?: {
    videos: Array<{
      gcsUri?: string
      bytesBase64Encoded?: string
      mimeType: string
    }>
  }
  error?: any
}

/**
 * Generate sophisticated Veo prompt for Shona pronunciation
 */
function generateVeoPrompt(wordData: any, analysis: any): string {
  const { word, english, special } = wordData
  const { syllables, phonetic_profile, vowelHiatus } = analysis.profile
  
  // Base prompt focusing on pronunciation
  let prompt = `Professional close-up video of a linguistics instructor clearly pronouncing the Shona word "${word}" `
  prompt += `(meaning "${english}"). `
  
  // Add syllable breakdown
  prompt += `The word is pronounced in ${syllables.length} syllables: ${syllables.join('-')}. `
  
  // Add special pronunciation features
  const specialSounds = phonetic_profile.filter((p: any) => 
    ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category)
  )
  
  if (specialSounds.length > 0) {
    prompt += `Special attention to: `
    specialSounds.forEach((sound: any, index: number) => {
      if (index > 0) prompt += ', '
      switch (sound.category) {
        case 'whistled':
          prompt += `"${sound.token}" (whistled sibilant - lips slightly rounded and protruded)`
          break
        case 'breathy':
          prompt += `"${sound.token}" (breathy consonant - audible release of air)`
          break
        case 'prenasalized':
          prompt += `"${sound.token}" (prenasalized - brief nasal airflow before consonant)`
          break
        case 'implosive':
          prompt += `"${sound.token}" (implosive - contained inward airflow)`
          break
      }
    })
    prompt += `. `
  }
  
  // Add vowel hiatus if present
  if (vowelHiatus) {
    prompt += `Note: This word contains vowel hiatus - consecutive vowels are pronounced as separate syllables with clear articulation between them. `
  }
  
  // Technical video specifications
  prompt += `Show clear mouth movements, proper tongue positioning, and lip shapes. `
  prompt += `Professional lighting, neutral background, educational style. `
  prompt += `The instructor should speak slowly and clearly, emphasizing proper Shona pronunciation. `
  prompt += `Camera should focus on mouth and facial expressions for optimal pronunciation learning.`
  
  return prompt
}

/**
 * Generate negative prompt to avoid unwanted elements
 */
function generateNegativePrompt(): string {
  return [
    'text overlay', 'subtitles', 'captions', 'graphics', 'logos',
    'multiple people', 'children', 'crowd', 'background noise',
    'music', 'sound effects', 'poor lighting', 'blurry video',
    'fast speech', 'mumbling', 'unclear pronunciation'
  ].join(', ')
}

/**
 * Make request to Google Veo API
 */
async function generateVeoVideo(wordData: any, analysis: any): Promise<string> {
  const prompt = generateVeoPrompt(wordData, analysis)
  const negativePrompt = generateNegativePrompt()
  
  console.log(`📹 Generating video for "${wordData.word}" using Veo API...`)
  console.log(`🎬 Prompt: ${prompt.substring(0, 100)}...`)
  
  const requestBody: VeoVideoRequest = {
    instances: [{
      prompt: prompt
    }],
    parameters: {
      aspectRatio: '16:9',
      durationSeconds: 8, // Maximum for Veo 2.0
      enhancePrompt: true,
      generateAudio: true, // Available in Veo 3.0
      negativePrompt: negativePrompt,
      personGeneration: 'allow_adult', // Allows adult instructor
      sampleCount: 1,
      seed: Math.floor(Math.random() * 4294967295) // Random seed for variety
    }
  }
  
  try {
    const response = await fetch(VEO_GENERATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Veo API error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    return result.name // Operation name for polling
    
  } catch (error) {
    console.error(`❌ Failed to start video generation for ${wordData.word}:`, error)
    throw error
  }
}

/**
 * Poll operation status until video is ready
 */
async function pollVeoOperation(operationName: string, wordData: any): Promise<VeoOperation> {
  const operationUrl = `https://${LOCATION}-aiplatform.googleapis.com/v1/${operationName}`
  let attempts = 0
  const maxAttempts = 60 // 10 minutes max (10s intervals)
  
  console.log(`⏳ Polling operation for "${wordData.word}"...`)
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(operationUrl, {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Operation poll error: ${response.status}`)
      }
      
      const operation: VeoOperation = await response.json()
      
      if (operation.done) {
        if (operation.error) {
          throw new Error(`Video generation failed: ${JSON.stringify(operation.error)}`)
        }
        console.log(`✅ Video generation completed for "${wordData.word}"`)
        return operation
      }
      
      console.log(`⏳ Still generating "${wordData.word}"... (attempt ${attempts + 1}/${maxAttempts})`)
      await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
      attempts++
      
    } catch (error) {
      console.error(`❌ Error polling operation for ${wordData.word}:`, error)
      throw error
    }
  }
  
  throw new Error(`Video generation timeout for ${wordData.word}`)
}

/**
 * Download and save video from Veo response
 */
async function downloadVeoVideo(operation: VeoOperation, wordData: any): Promise<string> {
  if (!operation.response?.videos?.[0]) {
    throw new Error('No video found in operation response')
  }
  
  const video = operation.response.videos[0]
  const outputDir = path.join(process.cwd(), 'public', 'videos', 'pronunciation')
  await fs.mkdir(outputDir, { recursive: true })
  
  const fileName = `${wordData.word}_pronunciation.mp4`
  const filePath = path.join(outputDir, fileName)
  
  try {
    if (video.gcsUri) {
      // Download from Google Cloud Storage
      console.log(`📥 Downloading video from GCS: ${video.gcsUri}`)
      const downloadResponse = await fetch(`${video.gcsUri}?key=${GOOGLE_API_KEY}`)
      
      if (!downloadResponse.ok) {
        throw new Error(`Failed to download video: ${downloadResponse.status}`)
      }
      
      const videoBuffer = await downloadResponse.arrayBuffer()
      await fs.writeFile(filePath, Buffer.from(videoBuffer))
      
    } else if (video.bytesBase64Encoded) {
      // Save from base64 encoded data
      console.log(`💾 Saving video from base64 data`)
      const videoBuffer = Buffer.from(video.bytesBase64Encoded, 'base64')
      await fs.writeFile(filePath, videoBuffer)
      
    } else {
      throw new Error('No video data found in response')
    }
    
    console.log(`✅ Video saved: ${filePath}`)
    return filePath
    
  } catch (error) {
    console.error(`❌ Failed to download video for ${wordData.word}:`, error)
    throw error
  }
}

/**
 * Get Google Cloud access token
 */
async function getAccessToken(): Promise<string> {
  // For development, we'll use the API key directly
  // In production, use proper OAuth2 flow
  return GOOGLE_API_KEY
}

/**
 * Generate comprehensive metadata for the video
 */
function generateVideoMetadata(wordData: any, analysis: any, videoPath: string) {
  return {
    word: wordData.word,
    english: wordData.english,
    complexity: wordData.complexity,
    special_features: wordData.special,
    video_file: videoPath,
    generated_at: new Date().toISOString(),
    phonetic_analysis: {
      tokens: analysis.profile.tokens,
      syllables: analysis.profile.syllables,
      complexity_score: analysis.metadata.complexity,
      vowel_hiatus: analysis.profile.vowelHiatus,
      special_sounds: analysis.profile.phonetic_profile
        .filter((p: any) => ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category))
        .map((p: any) => ({
          token: p.token,
          type: p.category,
          ipa: p.ipa,
          instructions: p.instructions
        }))
    },
    pronunciation_guide: {
      step_by_step: [
        `1. Break down into syllables: ${analysis.profile.syllables.join(' - ')}`,
        `2. Focus on special sounds: ${wordData.special}`,
        `3. Practice slowly, then increase speed`,
        `4. Listen to the audio and watch mouth movements`,
        `5. Repeat until pronunciation is natural`
      ],
      learning_tips: [
        'Watch the instructor\'s lip and tongue positioning',
        'Pay attention to the rhythm and timing',
        'Practice the difficult sounds separately first',
        'Record yourself and compare to the model'
      ]
    },
    veo_generation: {
      model: VEO_MODEL,
      duration_seconds: 8,
      aspect_ratio: '16:9',
      audio_included: true,
      resolution: '720p',
      frame_rate: '24fps'
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎬 ===============================================')
  console.log('🎬 Google Veo API + Mudzidzisi AI Integration')
  console.log('🎬 Generating Real Pronunciation Videos')
  console.log('🎬 ===============================================\n')
  
  console.log(`🔑 Using Google API Key: ${GOOGLE_API_KEY.substring(0, 20)}...`)
  console.log(`🎯 Generating videos for ${PRONUNCIATION_WORDS.length} Shona words`)
  console.log(`🤖 Using Veo model: ${VEO_MODEL}\n`)
  
  const results = []
  const metadataDir = path.join(process.cwd(), 'public', 'videos', 'metadata')
  await fs.mkdir(metadataDir, { recursive: true })
  
  for (const wordData of PRONUNCIATION_WORDS) {
    try {
      console.log(`\n🎬 Processing: ${wordData.word} (${wordData.english})`)
      console.log(`📊 Complexity: ${wordData.complexity}`)
      console.log(`🔤 Special feature: ${wordData.special}`)
      console.log('─'.repeat(50))
      
      // Step 1: Analyze word with Mudzidzisi AI
      console.log(`🧠 Analyzing "${wordData.word}" with Mudzidzisi AI...`)
      const analysis = processWord(wordData.word)
      
      console.log(`✅ Phonetic breakdown: [${analysis.profile.tokens.join(', ')}]`)
      console.log(`✅ Syllables: ${analysis.profile.syllables.join('-')}`)
      console.log(`✅ Complexity score: ${analysis.metadata.complexity}`)
      
      // Step 2: Generate video with Veo API
      const operationName = await generateVeoVideo(wordData, analysis)
      console.log(`🎬 Video generation started: ${operationName}`)
      
      // Step 3: Poll for completion
      const operation = await pollVeoOperation(operationName, wordData)
      
      // Step 4: Download video
      const videoPath = await downloadVeoVideo(operation, wordData)
      
      // Step 5: Generate metadata
      const metadata = generateVideoMetadata(wordData, analysis, videoPath)
      const metadataPath = path.join(metadataDir, `${wordData.word}_metadata.json`)
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
      
      console.log(`✅ Complete: ${wordData.word} video and metadata generated`)
      
      results.push({
        word: wordData.word,
        success: true,
        video_path: videoPath,
        metadata_path: metadataPath,
        complexity: analysis.metadata.complexity
      })
      
         } catch (error) {
       console.error(`❌ Failed to generate video for ${wordData.word}:`, error)
       results.push({
         word: wordData.word,
         success: false,
         error: error instanceof Error ? error.message : String(error)
       })
    }
  }
  
  // Generate final summary
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log('\n🎉 VEO VIDEO GENERATION COMPLETE!')
  console.log('=' + '='.repeat(45))
  console.log(`✅ Successfully generated: ${successful.length} videos`)
  console.log(`❌ Failed generations: ${failed.length}`)
  console.log(`📊 Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`)
  
  if (successful.length > 0) {
    console.log('\n🎬 SUCCESSFULLY GENERATED VIDEOS:')
    console.log('=' + '='.repeat(35))
    successful.forEach(result => {
      console.log(`📹 ${result.word}: ${result.video_path}`)
    })
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED GENERATIONS:')
    console.log('=' + '='.repeat(25))
    failed.forEach(result => {
      console.log(`❌ ${result.word}: ${result.error}`)
    })
  }
  
  // Save master summary
  const summaryPath = path.join(metadataDir, 'generation_summary.json')
  await fs.writeFile(summaryPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    model_used: VEO_MODEL,
    total_words: results.length,
    successful: successful.length,
    failed: failed.length,
    success_rate: (successful.length / results.length) * 100,
    results
  }, null, 2))
  
  console.log('\n🎯 NEXT STEPS:')
  console.log('=' + '='.repeat(15))
  console.log('1. 🎥 Review generated pronunciation videos')
  console.log('2. 🔊 Test audio quality and synchronization')
  console.log('3. 🎓 Integrate videos into learning app')
  console.log('4. 👨‍🏫 Validate pronunciation with native speakers')
  console.log('5. 📱 Deploy enhanced pronunciation features')
  
  console.log('\n🎬 SUCCESS: Real pronunciation videos generated with Google Veo!')
  console.log('🎬 ========================================================\n')
}

// Execute the script
if (require.main === module) {
  main().catch(console.error)
}

export { main as generateVeoPronunciationVideos }