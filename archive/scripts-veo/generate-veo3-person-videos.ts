#!/usr/bin/env tsx
/**
 * Veo 3 Person Pronunciation Videos
 * Testing veo-3.0-generate-preview with actual person pronunciation
 */

import { processWord } from '../lib/mudzidzisi-ai'
import { promises as fs } from 'fs'
import path from 'path'

// Google Veo 3 API Configuration
const GEMINI_API_KEY = 'AIzaSyBOGN6xFt_ylRMucqVHYDhsRE5IoMJZXEo'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const VEO3_MODEL = 'veo-3.0-generate-preview'

// Test words for person pronunciation
const PERSON_WORDS = [
  { word: 'bhazi', english: 'bus', special: 'breathy bh sound' },
  { word: 'svika', english: 'arrive', special: 'whistled sv sound' }
]

/**
 * Generate careful person pronunciation prompts for Veo 3
 */
function generatePersonPrompt(wordData: any, analysis: any): string {
  const { word, english } = wordData
  const { syllables, phonetic_profile } = analysis.profile
  
  // Careful educational approach focusing on teaching
  let prompt = `Educational language learning video: A linguistics instructor teaching the pronunciation of the Shona word "${word}" meaning "${english}". `
  
  // Focus on educational context
  prompt += `Professional educational setting with clean, academic background. `
  prompt += `The instructor speaks clearly for language learning purposes. `
  
  // Add syllable information
  prompt += `The word is pronounced in ${syllables.length} syllables: ${syllables.join('-')}. `
  
  // Add special pronunciation guidance with educational focus
  const specialSounds = phonetic_profile.filter((p: any) => 
    ['whistled', 'breathy', 'prenasalized'].includes(p.category)
  )
  
  if (specialSounds.length > 0) {
    prompt += `Educational focus on Shona linguistics: `
    specialSounds.forEach((sound: any, index: number) => {
      if (index > 0) prompt += ', '
      switch (sound.category) {
        case 'whistled':
          prompt += `the "${sound.token}" sound is a distinctive Shona whistled sibilant`
          break
        case 'breathy':
          prompt += `the "${sound.token}" sound includes audible breath release in Shona`
          break
        case 'prenasalized':
          prompt += `the "${sound.token}" includes brief nasal airflow in Shona pronunciation`
          break
      }
    })
    prompt += `. `
  }
  
  // Educational and professional specifications
  prompt += `Style: educational documentary, professional academic presentation, language instruction video. `
  prompt += `Focus on clear articulation for educational purposes. `
  prompt += `Academic lighting, educational setting, scholarly presentation.`
  
  return prompt
}

/**
 * Alternative professional approach
 */
function generateProfessionalPrompt(wordData: any, analysis: any): string {
  const { word, english } = wordData
  const { syllables } = analysis.profile
  
  // Professional academic approach
  let prompt = `Professional language education video featuring clear pronunciation instruction for the Shona word "${word}" (${english}). `
  prompt += `Academic setting with professional instructor demonstrating proper pronunciation. `
  prompt += `Educational focus on syllable structure: ${syllables.join('-')}. `
  prompt += `University-style language instruction with clear enunciation. `
  prompt += `Professional educational lighting and clean academic environment. `
  prompt += `Scholarly approach to Shona language instruction for academic learners.`
  
  return prompt
}

/**
 * Cultural education approach
 */
function generateCulturalPrompt(wordData: any, analysis: any): string {
  const { word, english } = wordData
  const { syllables } = analysis.profile
  
  // Cultural education focus
  let prompt = `Cultural education video: Learning traditional Shona language pronunciation for "${word}" meaning "${english}". `
  prompt += `Educational documentary style showing proper Shona pronunciation techniques. `
  prompt += `Focus on preserving traditional pronunciation of ${syllables.join('-')} syllables. `
  prompt += `Cultural education setting with respectful presentation of Shona language heritage. `
  prompt += `Educational documentary lighting and cultural learning environment.`
  
  return prompt
}

/**
 * Generate person pronunciation video with Veo 3
 */
async function generateVeo3PersonVideo(wordData: any, analysis: any, approach: 'educational' | 'professional' | 'cultural') {
  let prompt: string
  let approachName: string
  
  switch (approach) {
    case 'educational':
      prompt = generatePersonPrompt(wordData, analysis)
      approachName = 'Educational Instructor'
      break
    case 'professional':
      prompt = generateProfessionalPrompt(wordData, analysis)
      approachName = 'Professional Academic'
      break
    case 'cultural':
      prompt = generateCulturalPrompt(wordData, analysis)
      approachName = 'Cultural Education'
      break
    default:
      throw new Error('Invalid approach')
  }
  
  console.log(`🎬 Generating Veo 3 ${approachName} video for "${wordData.word}"`)
  console.log(`📝 Prompt: ${prompt.substring(0, 120)}...`)
  
  // Veo 3 request configuration
  const requestBody = {
    instances: [{
      prompt: prompt
    }],
    parameters: {
      aspectRatio: '16:9',
      durationSeconds: 8, // Veo 3 supports 8 seconds
      enhancePrompt: true, // Let Veo 3 enhance the prompt
      generateAudio: true, // Veo 3 can generate synchronized audio
      personGeneration: 'allow_adult', // Allow adult instructor
      sampleCount: 1
    }
  }
  
  try {
    const endpoint = `${BASE_URL}/models/${VEO3_MODEL}:predictLongRunning`
    
    console.log(`📡 Using Veo 3 endpoint: ${endpoint}`)
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-goog-api-key': GEMINI_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    
    console.log(`📊 Response Status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log(`❌ Error Response:`)
      console.log(errorText)
      return null
    }
    
    const result = await response.json()
    console.log(`✅ Veo 3 Operation started: ${result.name}`)
    
    // Save the Veo 3 specification
    const specDir = path.join(process.cwd(), 'public', 'veo3-person-specs')
    await fs.mkdir(specDir, { recursive: true })
    
    const spec = {
      word: wordData.word,
      english: wordData.english,
      approach: approachName,
      model: VEO3_MODEL,
      prompt: prompt,
      operation_name: result.name,
      phonetic_analysis: {
        tokens: analysis.profile.tokens,
        syllables: analysis.profile.syllables,
        complexity: analysis.metadata.complexity,
        special_sounds: analysis.profile.phonetic_profile
          .filter((p: any) => ['whistled', 'breathy', 'prenasalized'].includes(p.category))
          .map((p: any) => ({ token: p.token, type: p.category, ipa: p.ipa }))
      },
      veo3_features: {
        audio_generation: true,
        duration_seconds: 8,
        enhanced_prompting: true,
        person_generation: 'allow_adult',
        resolution: '720p'
      },
      educational_approach: {
        context: 'Academic language instruction',
        focus: 'Clear pronunciation demonstration',
        target: 'Language learners',
        safety: 'Educational content guidelines'
      },
      generated_at: new Date().toISOString()
    }
    
    const specPath = path.join(specDir, `${wordData.word}_${approach}_veo3_spec.json`)
    await fs.writeFile(specPath, JSON.stringify(spec, null, 2))
    console.log(`📋 Veo 3 specification saved: ${specPath}`)
    
    return {
      operationName: result.name,
      approach: approachName,
      specPath,
      model: VEO3_MODEL
    }
    
  } catch (error) {
    console.error(`❌ Failed to generate Veo 3 ${approachName} video:`, error)
    return null
  }
}

/**
 * Main execution function for Veo 3 person videos
 */
async function generateVeo3PersonVideos() {
  console.log('👤 ===============================================')
  console.log('👤 Google Veo 3 Person Pronunciation Videos')
  console.log('👤 Educational Instructor Approach')
  console.log('👤 ===============================================\n')
  
  console.log(`🤖 Model: ${VEO3_MODEL}`)
  console.log(`🔑 API Key: ${GEMINI_API_KEY.substring(0, 20)}...`)
  console.log(`🎯 Approach: Educational person pronunciation`)
  console.log(`🎬 Features: Audio generation, 8-second videos, 720p`)
  
  const approaches: ('educational' | 'professional' | 'cultural')[] = ['educational', 'professional', 'cultural']
  const results = []
  
  for (const wordData of PERSON_WORDS) {
    console.log(`\n🎯 Processing: ${wordData.word} (${wordData.english})`)
    console.log('─'.repeat(50))
    
    // Analyze with Mudzidzisi AI
    const analysis = processWord(wordData.word)
    console.log(`🧠 Phonetic analysis: [${analysis.profile.tokens.join(', ')}]`)
    console.log(`🔤 Syllables: ${analysis.profile.syllables.join('-')}`)
    console.log(`📊 Complexity: ${analysis.metadata.complexity}`)
    
    // Try different educational approaches
    for (const approach of approaches) {
      try {
        const result = await generateVeo3PersonVideo(wordData, analysis, approach)
        if (result) {
          results.push({
            word: wordData.word,
            approach: result.approach,
            model: result.model,
            success: true,
            operationName: result.operationName
          })
          console.log(`✅ ${result.approach} video generation started with Veo 3`)
        } else {
          results.push({
            word: wordData.word,
            approach,
            success: false
          })
        }
        
        // Delay between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 3000))
        
      } catch (error) {
        console.error(`❌ Failed ${approach} approach:`, error)
        results.push({
          word: wordData.word,
          approach,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log('\n👤 VEO 3 PERSON VIDEO GENERATION SUMMARY')
  console.log('=' + '='.repeat(45))
  console.log(`✅ Successful requests: ${successful.length}`)
  console.log(`❌ Failed requests: ${failed.length}`)
  console.log(`📊 Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`)
  
  if (successful.length > 0) {
    console.log('\n✅ SUCCESSFUL VEO 3 GENERATIONS:')
    successful.forEach(result => {
      console.log(`🎬 ${result.word} - ${result.approach}: ${result.operationName}`)
    })
    
    console.log('\n🎉 VEO 3 ADVANTAGES:')
    console.log('• ✅ Enhanced audio generation with synchronized speech')
    console.log('• ✅ 8-second videos with natural pronunciation')
    console.log('• ✅ Educational instructor approach')
    console.log('• ✅ Professional academic setting')
    console.log('• ✅ Real person demonstration vs. abstract visualization')
    
    console.log('\n⏳ NEXT STEPS:')
    console.log('1. 🕐 Wait 5-10 minutes for Veo 3 video generation')
    console.log('2. 🔍 Poll operations to check completion status')
    console.log('3. 📥 Download generated instructor videos')
    console.log('4. 🎓 Compare with abstract visualization approach')
    console.log('5. 📱 Integrate best approach into learning app')
  } else {
    console.log('\n⚠️  All Veo 3 requests failed')
    console.log('💡 This could indicate:')
    console.log('• API access limitations for Veo 3 preview')
    console.log('• Different safety policies still in effect')
    console.log('• Need for different prompting approach')
    console.log('• Rate limiting or quota restrictions')
  }
  
  console.log('\n🧪 EXPERIMENTAL RESULTS:')
  console.log('• Testing if Veo 3 has different safety policies')
  console.log('• Comparing person vs. abstract video approaches')
  console.log('• Evaluating educational effectiveness')
  console.log('• Assessing production viability')
  
  return results
}

// Execute the Veo 3 person video generation
if (require.main === module) {
  generateVeo3PersonVideos().catch(console.error)
}

export { generateVeo3PersonVideos }