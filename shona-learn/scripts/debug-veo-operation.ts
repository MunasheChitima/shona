#!/usr/bin/env tsx
/**
 * Debug Veo Operation Response
 * Examines the exact response structure to understand the operation results
 */

import { promises as fs } from 'fs'
import path from 'path'

// Google Veo API Configuration
const GEMINI_API_KEY = 'AIzaSyBOGN6xFt_ylRMucqVHYDhsRE5IoMJZXEo'
const OPERATION_ID = '6nm82lwsin3n'
const OPERATION_NAME = `models/veo-2.0-generate-001/operations/${OPERATION_ID}`
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

/**
 * Debug the Veo operation response
 */
async function debugVeoOperation() {
  console.log('🔍 ===============================================')
  console.log('🔍 Debugging Google Veo Operation Response')
  console.log('🔍 ===============================================\n')
  
  const endpoint = `${BASE_URL}/${OPERATION_NAME}`
  
  console.log(`🎯 Operation ID: ${OPERATION_ID}`)
  console.log(`📡 Full endpoint: ${endpoint}`)
  console.log(`🔑 API Key: ${GEMINI_API_KEY.substring(0, 20)}...\n`)
  
  try {
    console.log(`📡 Making API request...`)
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`📊 Response Status: ${response.status}`)
    console.log(`📊 Response Status Text: ${response.statusText}`)
    
    const responseHeaders = Object.fromEntries(response.headers.entries())
    console.log(`📊 Response Headers:`)
    Object.entries(responseHeaders).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log(`❌ Error Response Body:`)
      console.log(errorText)
      return
    }
    
    const result = await response.json()
    
    console.log(`\n🔍 COMPLETE API RESPONSE:`)
    console.log('=' + '='.repeat(50))
    console.log(JSON.stringify(result, null, 2))
    
    console.log(`\n📊 RESPONSE ANALYSIS:`)
    console.log('=' + '='.repeat(30))
    console.log(`✅ Operation Name: ${result.name || 'NOT FOUND'}`)
    console.log(`✅ Operation Done: ${result.done || 'NOT FOUND'}`)
    console.log(`📍 Has Response: ${!!result.response}`)
    console.log(`📍 Has Error: ${!!result.error}`)
    
    if (result.response) {
      console.log(`📹 Response Keys: ${Object.keys(result.response).join(', ')}`)
      
      if (result.response.videos) {
        console.log(`📹 Videos Array Length: ${result.response.videos.length}`)
        result.response.videos.forEach((video: any, index: number) => {
          console.log(`📹 Video ${index + 1}:`)
          console.log(`   • Keys: ${Object.keys(video).join(', ')}`)
          console.log(`   • MIME Type: ${video.mimeType || 'NOT FOUND'}`)
          console.log(`   • Has GCS URI: ${!!video.gcsUri}`)
          console.log(`   • Has Base64: ${!!video.bytesBase64Encoded}`)
          if (video.gcsUri) {
            console.log(`   • GCS URI: ${video.gcsUri}`)
          }
        })
      } else {
        console.log(`❌ No 'videos' array found in response`)
      }
      
      // Check for alternative response structures
      console.log(`\n🔍 CHECKING ALTERNATIVE STRUCTURES:`)
      if (result.response.generatedVideos) {
        console.log(`✅ Found 'generatedVideos': ${result.response.generatedVideos.length} items`)
      }
      if (result.response.predictions) {
        console.log(`✅ Found 'predictions': ${result.response.predictions.length} items`)
      }
      if (result.response.outputs) {
        console.log(`✅ Found 'outputs': ${result.response.outputs.length} items`)
      }
    }
    
    if (result.error) {
      console.log(`❌ ERROR DETAILS:`)
      console.log(JSON.stringify(result.error, null, 2))
    }
    
    // Save the full response for analysis
    const debugDir = path.join(process.cwd(), 'debug')
    await fs.mkdir(debugDir, { recursive: true })
    
    const debugPath = path.join(debugDir, 'veo_operation_response.json')
    await fs.writeFile(debugPath, JSON.stringify(result, null, 2))
    console.log(`\n💾 Full response saved to: ${debugPath}`)
    
    // Try to understand the API structure
    console.log(`\n🧠 ANALYSIS & RECOMMENDATIONS:`)
    console.log('=' + '='.repeat(40))
    
    if (result.done && !result.error) {
      if (result.response && Object.keys(result.response).length === 0) {
        console.log(`⚠️  The operation completed but returned an empty response object.`)
        console.log(`   This could indicate:`)
        console.log(`   • The API key lacks video generation permissions`)
        console.log(`   • The Veo model is not available with this API key`)
        console.log(`   • The request was filtered by safety policies`)
      } else if (result.response && !result.response.videos) {
        console.log(`⚠️  The operation completed with a response, but no 'videos' field.`)
        console.log(`   Checking for alternative response formats...`)
      } else {
        console.log(`✅ The operation structure looks correct, investigating further...`)
      }
    } else if (result.error) {
      console.log(`❌ The operation failed with an error (see details above).`)
    } else if (!result.done) {
      console.log(`⏳ The operation is still in progress.`)
    }
    
    console.log(`\n🔄 NEXT STEPS:`)
    console.log(`1. 📋 Review the full response structure above`)
    console.log(`2. 🔑 Verify API key has Veo access permissions`)
    console.log(`3. 🎬 Try a simpler video generation request`)
    console.log(`4. 📚 Check Google's Veo API documentation for response format`)
    
  } catch (error) {
    console.error(`❌ Failed to debug operation:`, error)
  }
}

// Execute the debug
if (require.main === module) {
  debugVeoOperation().catch(console.error)
}

export { debugVeoOperation }