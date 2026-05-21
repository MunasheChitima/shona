#!/usr/bin/env tsx
/**
 * Safe Veo Video Generation - Abstract Pronunciation Visualizations
 * Generates pronunciation videos using abstract animations to avoid safety filters
 */

import { processWord } from '../lib/mudzidzisi-ai'
import { promises as fs } from 'fs'
import path from 'path'

// Google Veo API Configuration
const GEMINI_API_KEY = 'AIzaSyBOGN6xFt_ylRMucqVHYDhsRE5IoMJZXEo'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const VEO_MODEL = 'veo-2.0-generate-001'

// Words for safe video generation
const SAFE_WORDS = [
  { word: 'bhazi', english: 'bus', special: 'breathy bh sound' },
  { word: 'svika', english: 'arrive', special: 'whistled sv sound' }
]

/**
 * Generate safe, abstract pronunciation prompts
 */
function generateSafePrompt(wordData: any, analysis: any): string {
  const { word, english, special } = wordData
  const { syllables, phonetic_profile } = analysis.profile
  
  // Focus on abstract visualization without human faces
  let prompt = `Create an abstract animated visualization for the Shona word "${word}" meaning "${english}". `
  
  // Add syllable visualization
  prompt += `Show ${syllables.length} colorful geometric shapes representing the syllables: ${syllables.join('-')}. `
  
  // Add special sound effects
  const specialSounds = phonetic_profile.filter((p: any) => 
    ['whistled', 'breathy', 'prenasalized'].includes(p.category)
  )
  
  if (specialSounds.length > 0) {
    specialSounds.forEach((sound: any) => {
      switch (sound.category) {
        case 'whistled':
          prompt += `When showing "${sound.token}", add sparkles and flowing particles to represent the whistled sound. `
          break
        case 'breathy':
          prompt += `When showing "${sound.token}", add gentle smoke or mist effects to represent the breathy sound. `
          break
        case 'prenasalized':
          prompt += `When showing "${sound.token}", add a brief wave effect before the main shape to represent prenasalization. `
          break
      }
    })
  }
  
  // Technical specifications for safe, educational content
  prompt += `Use bright, educational colors on a clean background. `
  prompt += `Each syllable should pulse or glow as it's pronounced. `
  prompt += `Create smooth transitions between syllables. `
  prompt += `Style: educational animation, abstract geometric design, suitable for language learning apps.`
  
  return prompt
}

/**
 * Alternative approach - Text-based pronunciation animation
 */
function generateTextAnimationPrompt(wordData: any, analysis: any): string {
  const { word, english } = wordData
  const { syllables } = analysis.profile
  
  // Text-based animation approach
  let prompt = `Create an animated text visualization showing the Shona word "${word}" (${english}). `
  prompt += `Display the word breaking into syllables: ${syllables.join(' - ')}. `
  prompt += `Each syllable appears one by one with a gentle bounce animation. `
  prompt += `Use large, clear typography with educational colors. `
  prompt += `Background should be clean and professional. `
  prompt += `Add subtle particle effects around the text as each syllable appears. `
  prompt += `Style: educational motion graphics, clean typography, language learning focused.`
  
  return prompt
}

/**
 * Sound wave visualization approach
 */
function generateSoundWavePrompt(wordData: any, analysis: any): string {
  const { word, english } = wordData
  const { syllables, phonetic_profile } = analysis.profile
  
  let prompt = `Create an animated sound wave visualization for the Shona pronunciation of "${word}" (${english}). `
  prompt += `Show ${syllables.length} distinct wave segments for syllables: ${syllables.join('-')}. `
  
  // Add special visual effects for unique sounds
  const specialSounds = phonetic_profile.filter((p: any) => 
    ['whistled', 'breathy', 'prenasalized'].includes(p.category)
  )
  
  if (specialSounds.length > 0) {
    prompt += `Special wave patterns: `
    specialSounds.forEach((sound: any, index: number) => {
      if (index > 0) prompt += ', '
      switch (sound.category) {
        case 'whistled':
          prompt += `high-frequency spikes for "${sound.token}" (whistled sound)`
          break
        case 'breathy':
          prompt += `softer, wider waves for "${sound.token}" (breathy sound)`
          break
        case 'prenasalized':
          prompt += `brief wave burst before "${sound.token}" (prenasalized)`
          break
      }
    })
    prompt += `. `
  }
  
  prompt += `Use vibrant colors that change with the sound intensity. `
  prompt += `Clean, dark background with glowing wave effects. `
  prompt += `Style: modern data visualization, educational, scientifically accurate.`
  
  return prompt
}

/**
 * Try multiple safe approaches
 */
async function generateSafeVideo(wordData: any, analysis: any, approach: 'abstract' | 'text' | 'wave') {
  let prompt: string
  let approachName: string
  
  switch (approach) {
    case 'abstract':
      prompt = generateSafePrompt(wordData, analysis)
      approachName = 'Abstract Geometric'
      break
    case 'text':
      prompt = generateTextAnimationPrompt(wordData, analysis)
      approachName = 'Text Animation'
      break
    case 'wave':
      prompt = generateSoundWavePrompt(wordData, analysis)
      approachName = 'Sound Wave'
      break
    default:
      throw new Error('Invalid approach')
  }
  
  console.log(`🎬 Generating ${approachName} video for "${wordData.word}"`)
  console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`)
  
  const requestBody = {
    instances: [{
      prompt: prompt
    }],
    parameters: {
      aspectRatio: '16:9',
      personGeneration: 'dont_allow', // Explicitly avoid people
      sampleCount: 1
    }
  }
  
  try {
    const endpoint = `${BASE_URL}/models/${VEO_MODEL}:predictLongRunning`
    
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
      console.log(`❌ Error:`, errorText)
      return null
    }
    
    const result = await response.json()
    console.log(`✅ Operation started: ${result.name}`)
    
    // Save the approach details
    const specDir = path.join(process.cwd(), 'public', 'safe-video-specs')
    await fs.mkdir(specDir, { recursive: true })
    
    const spec = {
      word: wordData.word,
      english: wordData.english,
      approach: approachName,
      prompt: prompt,
      operation_name: result.name,
      phonetic_analysis: {
        tokens: analysis.profile.tokens,
        syllables: analysis.profile.syllables,
        special_sounds: analysis.profile.phonetic_profile
          .filter((p: any) => ['whistled', 'breathy', 'prenasalized'].includes(p.category))
          .map((p: any) => ({ token: p.token, type: p.category }))
      },
      safety_approach: {
        no_human_faces: true,
        abstract_visualization: true,
        educational_focus: true,
        child_safe: true
      },
      generated_at: new Date().toISOString()
    }
    
    const specPath = path.join(specDir, `${wordData.word}_${approach}_spec.json`)
    await fs.writeFile(specPath, JSON.stringify(spec, null, 2))
    console.log(`📋 Specification saved: ${specPath}`)
    
    return {
      operationName: result.name,
      approach: approachName,
      specPath
    }
    
  } catch (error) {
    console.error(`❌ Failed to generate ${approachName} video:`, error)
    return null
  }
}

/**
 * Main execution function
 */
async function generateAllSafeVideos() {
  console.log('🎨 ===============================================')
  console.log('🎨 Generating Safe Veo Pronunciation Videos')
  console.log('🎨 Abstract Animations (No Human Faces)')
  console.log('🎨 ===============================================\n')
  
  const approaches: ('abstract' | 'text' | 'wave')[] = ['abstract', 'text', 'wave']
  const results = []
  
  for (const wordData of SAFE_WORDS) {
    console.log(`\n🎯 Processing: ${wordData.word} (${wordData.english})`)
    console.log('─'.repeat(50))
    
    // Analyze with Mudzidzisi AI
    const analysis = processWord(wordData.word)
    console.log(`🧠 Phonetic analysis: [${analysis.profile.tokens.join(', ')}]`)
    console.log(`🔤 Syllables: ${analysis.profile.syllables.join('-')}`)
    
    // Try each approach
    for (const approach of approaches) {
      try {
        const result = await generateSafeVideo(wordData, analysis, approach)
        if (result) {
          results.push({
            word: wordData.word,
            approach: result.approach,
            success: true,
            operationName: result.operationName
          })
          console.log(`✅ ${result.approach} video generation started`)
        } else {
          results.push({
            word: wordData.word,
            approach,
            success: false
          })
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000))
        
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
  
  console.log('\n🎨 SAFE VIDEO GENERATION SUMMARY')
  console.log('=' + '='.repeat(40))
  console.log(`✅ Successful requests: ${successful.length}`)
  console.log(`❌ Failed requests: ${failed.length}`)
  console.log(`📊 Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`)
  
  if (successful.length > 0) {
    console.log('\n✅ SUCCESSFUL GENERATIONS:')
    successful.forEach(result => {
      console.log(`🎬 ${result.word} - ${result.approach}: ${result.operationName}`)
    })
    
    console.log('\n⏳ NEXT STEPS:')
    console.log('1. 🕐 Wait 5-10 minutes for video generation')
    console.log('2. 🔍 Poll operations to check completion status')
    console.log('3. 📥 Download generated videos when ready')
    console.log('4. 🎓 Integrate into learning app')
  }
  
  console.log('\n🎨 SAFE APPROACH BENEFITS:')
  console.log('• No human faces = No safety filter blocks')
  console.log('• Abstract animations = More accessible')
  console.log('• Multiple approaches = Better success rate')
  console.log('• Educational focus = Child-safe content')
  console.log('• Creative visualization = Engaging learning')
  
  return results
}

// Execute the safe video generation
if (require.main === module) {
  generateAllSafeVideos().catch(console.error)
}

export { generateAllSafeVideos }