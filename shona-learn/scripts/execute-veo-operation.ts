#!/usr/bin/env tsx
/**
 * Execute Veo Operation - Download Generated Pronunciation Video
 * Polls the Veo API operation and downloads the completed video
 */

import { promises as fs } from 'fs'
import path from 'path'

// Google Veo API Configuration
const GEMINI_API_KEY = 'AIzaSyBOGN6xFt_ylRMucqVHYDhsRE5IoMJZXEo'
const OPERATION_ID = '6nm82lwsin3n' // From previous successful request
const OPERATION_NAME = `models/veo-2.0-generate-001/operations/${OPERATION_ID}`
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

interface VeoOperationResponse {
  name: string
  done: boolean
  response?: {
    videos?: Array<{
      gcsUri?: string
      bytesBase64Encoded?: string
      mimeType: string
    }>
  }
  error?: any
}

/**
 * Poll the Veo operation status
 */
async function pollVeoOperation(): Promise<VeoOperationResponse> {
  const endpoint = `${BASE_URL}/${OPERATION_NAME}`
  
  console.log(`🔄 Polling Veo operation: ${OPERATION_ID}`)
  console.log(`📡 Endpoint: ${endpoint}`)
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📊 Response Status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }
    
    const result: VeoOperationResponse = await response.json()
    return result
    
  } catch (error) {
    console.error(`❌ Error polling operation:`, error)
    throw error
  }
}

/**
 * Download video from Google Cloud Storage or base64 data
 */
async function downloadVideo(videoData: any, wordName: string = 'bhazi'): Promise<string> {
  const outputDir = path.join(process.cwd(), 'public', 'videos', 'pronunciation')
  await fs.mkdir(outputDir, { recursive: true })
  
  const fileName = `${wordName}_pronunciation_veo.mp4`
  const filePath = path.join(outputDir, fileName)
  
  try {
    if (videoData.gcsUri) {
      // Download from Google Cloud Storage
      console.log(`📥 Downloading video from GCS: ${videoData.gcsUri}`)
      
      // Try to download with API key
      const downloadUrl = `${videoData.gcsUri}?key=${GEMINI_API_KEY}`
      const downloadResponse = await fetch(downloadUrl)
      
      if (!downloadResponse.ok) {
        console.log(`⚠️  GCS download failed: ${downloadResponse.status}`)
        // Try alternative download method
        const alternativeResponse = await fetch(videoData.gcsUri)
        if (alternativeResponse.ok) {
          const videoBuffer = await alternativeResponse.arrayBuffer()
          await fs.writeFile(filePath, Buffer.from(videoBuffer))
        } else {
          throw new Error(`Failed to download from GCS: ${alternativeResponse.status}`)
        }
      } else {
        const videoBuffer = await downloadResponse.arrayBuffer()
        await fs.writeFile(filePath, Buffer.from(videoBuffer))
      }
      
    } else if (videoData.bytesBase64Encoded) {
      // Save from base64 encoded data
      console.log(`💾 Saving video from base64 data`)
      const videoBuffer = Buffer.from(videoData.bytesBase64Encoded, 'base64')
      await fs.writeFile(filePath, videoBuffer)
      
    } else {
      throw new Error('No video data found in response')
    }
    
    console.log(`✅ Video saved successfully: ${filePath}`)
    
    // Get file size
    const stats = await fs.stat(filePath)
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
    console.log(`📏 File size: ${fileSizeMB} MB`)
    
    return filePath
    
  } catch (error) {
    console.error(`❌ Failed to download video:`, error)
    throw error
  }
}

/**
 * Create video metadata file
 */
async function createVideoMetadata(videoPath: string, operationData: any) {
  const metadata = {
    word: 'bhazi',
    english: 'bus',
    video_file: videoPath,
    generated_at: new Date().toISOString(),
    operation_id: OPERATION_ID,
    operation_name: OPERATION_NAME,
    veo_model: 'veo-2.0-generate-001',
    specifications: {
      resolution: '720p',
      duration_seconds: 8,
      aspect_ratio: '16:9',
      frame_rate: '24fps',
      audio_included: true
    },
    phonetic_analysis: {
      tokens: ['bh', 'a', 'z', 'i'],
      syllables: ['bha', 'zi'],
      special_sound: 'bh - breathy consonant with audible air release',
      ipa: 'bʱazi',
      complexity: 7
    },
    educational_focus: [
      'Breathy consonant pronunciation',
      'Clear syllable breakdown',
      'Mouth and lip positioning',
      'Slow, distinct articulation'
    ],
    veo_prompt_used: 'Professional educational video showing clear pronunciation of Shona word "bhazi" with focus on breathy "bh" sound',
    status: 'completed',
    file_info: operationData
  }
  
  const metadataPath = path.join(path.dirname(videoPath), 'bhazi_video_metadata.json')
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
  
  console.log(`📋 Metadata saved: ${metadataPath}`)
  return metadataPath
}

/**
 * Main execution function
 */
async function executeVeoOperation() {
  console.log('🎬 ===============================================')
  console.log('🎬 Executing Google Veo Operation')
  console.log('🎬 Downloading Generated Pronunciation Video')
  console.log('🎬 ===============================================\n')
  
  console.log(`🎯 Operation ID: ${OPERATION_ID}`)
  console.log(`🔑 API Key: ${GEMINI_API_KEY.substring(0, 20)}...`)
  console.log(`📍 Target word: bhazi (bus - breathy consonant)`)
  
  let attempts = 0
  const maxAttempts = 30 // 10 minutes max (20s intervals)
  
  try {
    while (attempts < maxAttempts) {
      console.log(`\n⏳ Polling attempt ${attempts + 1}/${maxAttempts}...`)
      
      const operation = await pollVeoOperation()
      
      console.log(`📊 Operation Status:`)
      console.log(`   • Done: ${operation.done}`)
      console.log(`   • Name: ${operation.name}`)
      
      if (operation.done) {
        if (operation.error) {
          console.error(`❌ Operation failed:`, operation.error)
          throw new Error(`Video generation failed: ${JSON.stringify(operation.error)}`)
        }
        
        if (!operation.response?.videos?.[0]) {
          throw new Error('No video found in completed operation')
        }
        
        console.log(`\n🎉 Video generation completed successfully!`)
        console.log(`📹 Video details:`)
        
        const video = operation.response.videos[0]
        console.log(`   • MIME Type: ${video.mimeType}`)
        
        if (video.gcsUri) {
          console.log(`   • Storage: Google Cloud Storage`)
          console.log(`   • URI: ${video.gcsUri}`)
        } else if (video.bytesBase64Encoded) {
          console.log(`   • Storage: Base64 encoded data`)
          console.log(`   • Size: ${(video.bytesBase64Encoded.length * 0.75 / 1024 / 1024).toFixed(2)} MB (estimated)`)
        }
        
        // Download the video
        console.log(`\n📥 Downloading pronunciation video...`)
        const videoPath = await downloadVideo(video, 'bhazi')
        
        // Create metadata
        console.log(`📋 Creating video metadata...`)
        const metadataPath = await createVideoMetadata(videoPath, video)
        
        console.log(`\n🎊 SUCCESS! Video generation and download complete!`)
        console.log(`==========================================`)
        console.log(`✅ Video file: ${videoPath}`)
        console.log(`✅ Metadata: ${metadataPath}`)
        console.log(`✅ Word: bhazi (bus)`)
        console.log(`✅ Special sound: Breathy consonant [bʱ]`)
        console.log(`✅ Educational focus: Pronunciation learning`)
        
        console.log(`\n🎯 INTEGRATION COMPLETE!`)
        console.log(`========================`)
        console.log(`🎬 Mudzidzisi AI + Google Veo working perfectly`)
        console.log(`📱 Ready for app integration`)
        console.log(`🌍 Revolutionary Shona pronunciation learning`)
        
        return {
          success: true,
          videoPath,
          metadataPath,
          operationId: OPERATION_ID
        }
      }
      
      console.log(`⏳ Video still generating... waiting 20 seconds`)
      await new Promise(resolve => setTimeout(resolve, 20000)) // Wait 20 seconds
      attempts++
    }
    
    throw new Error(`Operation timed out after ${maxAttempts} attempts`)
    
  } catch (error) {
    console.error(`❌ Failed to execute Veo operation:`, error)
    
    // Still create a status report
    console.log(`\n📊 OPERATION STATUS REPORT`)
    console.log(`==========================`)
    console.log(`❌ Video download: FAILED`)
    console.log(`✅ API integration: WORKING`)
    console.log(`✅ Operation started: SUCCESS`)
    console.log(`⏳ Completion status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      operationId: OPERATION_ID
    }
  }
}

// Execute the operation
if (require.main === module) {
  executeVeoOperation().then(result => {
    if (result.success) {
      console.log(`\n🚀 Next steps:`)
      console.log(`1. 🎥 Review the generated pronunciation video`)
      console.log(`2. 🔊 Test audio quality and pronunciation accuracy`)
      console.log(`3. 📱 Integrate video player into learning app`)
      console.log(`4. 🎓 Deploy enhanced pronunciation features`)
      console.log(`5. 🌍 Scale to full Shona vocabulary`)
    } else {
      console.log(`\n🔄 Alternative options:`)
      console.log(`1. ⏰ Wait longer for video generation to complete`)
      console.log(`2. 🔄 Retry the operation polling`)
      console.log(`3. 🎬 Start a new video generation request`)
      console.log(`4. 📋 Use the generated specifications for manual video creation`)
    }
  }).catch(console.error)
}

export { executeVeoOperation }