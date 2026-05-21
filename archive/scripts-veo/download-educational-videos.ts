#!/usr/bin/env tsx
/**
 * Download Educational Videos
 * Properly download videos with authentication
 */

import { promises as fs } from 'fs'
import path from 'path'

const GEMINI_API_KEY = 'AIzaSyBOGN6xFt_ylRMucqVHYDhsRE5IoMJZXEo'

// Video information from successful operations
const EDUCATIONAL_VIDEOS = [
  {
    name: 'Scholarly Research',
    word: 'bhazi',
    fileId: 'v9w4moe8y3dn',
    filename: 'bhazi_scholarly_research.mp4'
  },
  {
    name: 'Educational Documentary', 
    word: 'bhazi',
    fileId: 'x8wi5igegay0',
    filename: 'bhazi_educational_documentary.mp4'
  },
  {
    name: 'Instructional Design',
    word: 'bhazi', 
    fileId: '04aqrchb7g6t',
    filename: 'bhazi_instructional_design.mp4'
  }
]

/**
 * Download video with proper authentication
 */
async function downloadVideo(video: any) {
  console.log(`🎬 Downloading ${video.name} video...`)
  
  try {
    // Try direct download URL with API key
    const downloadUrl = `https://generativelanguage.googleapis.com/v1beta/files/${video.fileId}:download?alt=media`
    
    const response = await fetch(downloadUrl, {
      headers: {
        'x-goog-api-key': GEMINI_API_KEY
      }
    })
    
    console.log(`📊 Response status: ${response.status}`)
    console.log(`📊 Content-Type: ${response.headers.get('content-type')}`)
    console.log(`📊 Content-Length: ${response.headers.get('content-length')}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log(`❌ Download failed: ${errorText}`)
      return false
    }
    
    // Check if response is actually video content
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('video')) {
      const responseText = await response.text()
      console.log(`❌ Not a video response: ${responseText}`)
      return false
    }
    
    // Save video file
    const videoDir = path.join(process.cwd(), 'public', 'videos')
    await fs.mkdir(videoDir, { recursive: true })
    
    const videoPath = path.join(videoDir, video.filename)
    const videoData = await response.arrayBuffer()
    await fs.writeFile(videoPath, Buffer.from(videoData))
    
    console.log(`✅ Video saved: ${videoPath}`)
    console.log(`📏 Size: ${videoData.byteLength} bytes`)
    
    return true
    
  } catch (error) {
    console.error(`❌ Download error for ${video.name}:`, error)
    return false
  }
}

/**
 * Try alternative download method
 */
async function tryAlternativeDownload(video: any) {
  console.log(`🔄 Trying alternative download for ${video.name}...`)
  
  try {
    // Try accessing the file metadata first
    const metadataUrl = `https://generativelanguage.googleapis.com/v1beta/files/${video.fileId}`
    
    const metadataResponse = await fetch(metadataUrl, {
      headers: {
        'x-goog-api-key': GEMINI_API_KEY
      }
    })
    
    if (metadataResponse.ok) {
      const metadata = await metadataResponse.json()
      console.log(`📋 File metadata:`, JSON.stringify(metadata, null, 2))
      
      // Check if file has a different download URL
      if (metadata.uri) {
        console.log(`🔗 Trying metadata URI: ${metadata.uri}`)
        
        const downloadResponse = await fetch(metadata.uri, {
          headers: {
            'x-goog-api-key': GEMINI_API_KEY
          }
        })
        
        if (downloadResponse.ok) {
          const contentType = downloadResponse.headers.get('content-type')
          console.log(`📊 Alternative response content-type: ${contentType}`)
          
          if (contentType?.includes('video')) {
            const videoDir = path.join(process.cwd(), 'public', 'videos')
            await fs.mkdir(videoDir, { recursive: true })
            
            const videoPath = path.join(videoDir, video.filename)
            const videoData = await downloadResponse.arrayBuffer()
            await fs.writeFile(videoPath, Buffer.from(videoData))
            
            console.log(`✅ Alternative download successful: ${videoPath}`)
            return true
          }
        }
      }
    }
    
    return false
    
  } catch (error) {
    console.error(`❌ Alternative download failed:`, error)
    return false
  }
}

/**
 * Main download function
 */
async function downloadEducationalVideos() {
  console.log('🎬 ===============================================')
  console.log('🎬 Educational Video Download')
  console.log('🎬 Downloading Generated Person Pronunciation Videos')
  console.log('🎬 ===============================================\n')
  
  let successCount = 0
  
  for (const video of EDUCATIONAL_VIDEOS) {
    console.log(`\n📥 Processing ${video.name} (${video.word})`)
    console.log('─'.repeat(50))
    
    // Try primary download method
    const primarySuccess = await downloadVideo(video)
    
    if (primarySuccess) {
      successCount++
      continue
    }
    
    // Try alternative download method
    const alternativeSuccess = await tryAlternativeDownload(video)
    
    if (alternativeSuccess) {
      successCount++
    }
    
    // Small delay between downloads
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n🎬 DOWNLOAD SUMMARY')
  console.log('=' + '='.repeat(30))
  console.log(`✅ Successfully downloaded: ${successCount}/${EDUCATIONAL_VIDEOS.length} videos`)
  
  if (successCount > 0) {
    console.log('\n📁 Videos saved in: public/videos/')
    console.log('🎯 You can now view the educational pronunciation videos!')
    
    // List downloaded files
    try {
      const videoDir = path.join(process.cwd(), 'public', 'videos')
      const files = await fs.readdir(videoDir)
      console.log('\n📋 Downloaded files:')
      for (const file of files) {
        if (file.endsWith('.mp4')) {
          const filePath = path.join(videoDir, file)
          const stats = await fs.stat(filePath)
          console.log(`🎥 ${file} (${stats.size} bytes)`)
        }
      }
    } catch (error) {
      console.log('Could not list downloaded files')
    }
  } else {
    console.log('\n❌ No videos could be downloaded')
    console.log('💡 This might be due to:')
    console.log('• Video URLs have expired')
    console.log('• Authentication requirements have changed')
    console.log('• Videos are not yet ready for download')
    console.log('• API access limitations')
  }
}

// Execute the download
if (require.main === module) {
  downloadEducationalVideos().catch(console.error)
}

export { downloadEducationalVideos }