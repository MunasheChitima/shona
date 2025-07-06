#!/usr/bin/env tsx
/**
 * Production Asset Generation Script
 * Generates actual pronunciation assets using Google TTS API
 */

import { processWord } from '../lib/mudzidzisi-ai'
import { promises as fs } from 'fs'
import path from 'path'

// Google API Configuration
const GOOGLE_API_KEY = 'AIzaSyDMgRTZvaRxNFZQ62oMjQLXpsWF5MmEMEMS'
const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize'

// Priority words for asset generation
const PRIORITY_WORDS = [
  { word: 'mangwanani', english: 'good morning', category: 'Greetings' },
  { word: 'masikati', english: 'good afternoon', category: 'Greetings' },
  { word: 'manheru', english: 'good evening', category: 'Greetings' },
  { word: 'bhazi', english: 'bus', category: 'Transport' },
  { word: 'svika', english: 'arrive', category: 'Movement' },
  { word: 'zvino', english: 'now', category: 'Time' },
  { word: 'tsvaira', english: 'drive', category: 'Action' },
  { word: 'kuudza', english: 'to tell', category: 'Communication' },
  { word: 'mbira', english: 'thumb piano', category: 'Music' },
  { word: 'ndimi', english: 'you (plural)', category: 'Pronouns' },
  { word: 'ngoma', english: 'drum', category: 'Music' },
  { word: 'ndatenda', english: 'thank you', category: 'Courtesy' },
  { word: 'zvakanaka', english: 'fine/good', category: 'Responses' },
  { word: 'pamusoroi', english: 'excuse me', category: 'Courtesy' },
  { word: 'sara', english: 'remain', category: 'Action' }
]

interface GeneratedAsset {
  word: string
  audioFile: string
  profileData: any
  success: boolean
  error?: string
}

/**
 * Generate TTS audio using Google Cloud Text-to-Speech
 */
async function generateTTSAudio(word: string, phoneticPrompt: string): Promise<Buffer> {
  const response = await fetch(TTS_ENDPOINT + `?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: { 
        text: word,
        // Use SSML for pronunciation guidance
        ssml: `<speak><phoneme alphabet="ipa" ph="${getIPATranscription(word)}">${word}</phoneme></speak>`
      },
      voice: {
        languageCode: 'en-US', // Closest available for Shona
        name: 'en-US-Wavenet-D', // More natural voice
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'LINEAR16',
        sampleRateHertz: 44100,
        speakingRate: 0.85, // Slightly slower for learning
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`TTS API error: ${response.status} - ${error}`)
  }

  const result = await response.json()
  return Buffer.from(result.audioContent, 'base64')
}

/**
 * Get IPA transcription for SSML
 */
function getIPATranscription(word: string): string {
  const analysis = processWord(word)
  return analysis.profile.phonetic_profile
    .map(p => p.ipa)
    .join('')
    .replace(/whistling/g, '') // Clean up for SSML
}

/**
 * Generate pronunciation assets for a single word
 */
async function generateWordAssets(wordData: { word: string, english: string, category: string }): Promise<GeneratedAsset> {
  console.log(`🎵 Generating assets for: ${wordData.word} (${wordData.english})`)
  
  try {
    // Stage 1-3: Phonetic Analysis and Prompt Generation
    const analysis = processWord(wordData.word)
    
    console.log(`   ✓ Phonetic analysis complete`)
    console.log(`   ✓ Tokens: [${analysis.profile.tokens.join(', ')}]`)
    console.log(`   ✓ Syllables: ${analysis.profile.syllables.join('-')}`)
    console.log(`   ✓ Complexity: ${analysis.metadata.complexity}`)
    
    // Stage 4: Generate TTS Audio
    console.log(`   🎤 Generating TTS audio...`)
    const audioBuffer = await generateTTSAudio(wordData.word, analysis.audioPrompt.prompt)
    
    // Ensure output directory exists
    const audioDir = path.join(process.cwd(), 'public', 'audio', 'generated')
    await fs.mkdir(audioDir, { recursive: true })
    
    // Save audio file
    const audioFileName = `${wordData.word}.wav`
    const audioFilePath = path.join(audioDir, audioFileName)
    await fs.writeFile(audioFilePath, audioBuffer)
    
    console.log(`   ✅ Audio saved: ${audioFileName} (${audioBuffer.length} bytes)`)
    
    // Save pronunciation metadata
    const metadataPath = path.join(audioDir, `${wordData.word}.json`)
    const metadata = {
      word: wordData.word,
      english: wordData.english,
      category: wordData.category,
      phonetic_profile: analysis.profile,
      audio_prompt: analysis.audioPrompt.prompt,
      video_prompt: analysis.videoPrompt.prompt,
      complexity: analysis.metadata.complexity,
      generated_at: new Date().toISOString(),
      file_info: {
        audio_file: audioFileName,
        audio_size: audioBuffer.length,
        format: 'WAV',
        sample_rate: '44.1kHz'
      }
    }
    
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
    console.log(`   ✅ Metadata saved: ${wordData.word}.json`)
    
    return {
      word: wordData.word,
      audioFile: audioFileName,
      profileData: analysis.profile,
      success: true
    }
    
  } catch (error) {
    console.error(`   ❌ Failed to generate assets for ${wordData.word}: ${error}`)
    return {
      word: wordData.word,
      audioFile: '',
      profileData: null,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Generate pronunciation guide content
 */
async function generatePronunciationGuide(results: GeneratedAsset[]) {
  const successfulResults = results.filter(r => r.success)
  
  const guide = {
    title: "Shona Pronunciation Guide",
    generated_at: new Date().toISOString(),
    total_words: results.length,
    successful_generations: successfulResults.length,
    failed_generations: results.length - successfulResults.length,
    words: successfulResults.map(result => ({
      word: result.word,
      audio_file: result.audioFile,
      tokens: result.profileData.tokens,
      syllables: result.profileData.syllables,
      complexity: result.profileData.phonetic_profile.length,
      vowel_hiatus: result.profileData.vowelHiatus,
      phonetic_details: result.profileData.phonetic_profile.map((p: any) => ({
        token: p.token,
        ipa: p.ipa,
        type: p.type,
        instructions: p.instructions
      }))
    })),
    phoneme_usage: calculatePhonemeUsage(successfulResults),
    complexity_distribution: calculateComplexityDistribution(successfulResults)
  }
  
  const guidePath = path.join(process.cwd(), 'public', 'audio', 'generated', 'pronunciation-guide.json')
  await fs.writeFile(guidePath, JSON.stringify(guide, null, 2))
  
  console.log(`📖 Pronunciation guide saved: pronunciation-guide.json`)
  return guide
}

/**
 * Calculate phoneme usage statistics
 */
function calculatePhonemeUsage(results: GeneratedAsset[]): Record<string, number> {
  const usage: Record<string, number> = {}
  
  results.forEach(result => {
    result.profileData.tokens.forEach((token: string) => {
      usage[token] = (usage[token] || 0) + 1
    })
  })
  
  return Object.fromEntries(
    Object.entries(usage).sort(([,a], [,b]) => b - a)
  )
}

/**
 * Calculate complexity distribution
 */
function calculateComplexityDistribution(results: GeneratedAsset[]): Record<string, number> {
  const distribution: Record<string, number> = {
    'Low (1-5)': 0,
    'Medium (6-10)': 0,
    'High (11-15)': 0,
    'Very High (16+)': 0
  }
  
  results.forEach(result => {
    const complexity = result.profileData.phonetic_profile.length
    if (complexity <= 5) distribution['Low (1-5)']++
    else if (complexity <= 10) distribution['Medium (6-10)']++
    else if (complexity <= 15) distribution['High (11-15)']++
    else distribution['Very High (16+)']++
  })
  
  return distribution
}

/**
 * Generate pronunciation exercises integration
 */
async function generateExerciseIntegration(results: GeneratedAsset[]) {
  const exercises = results
    .filter(r => r.success)
    .map(result => ({
      type: "voice",
      voiceType: "pronunciation",
      question: `Practice pronouncing: ${result.word}`,
      voiceContent: JSON.stringify({
        words: [{
          shona: result.word,
          english: PRIORITY_WORDS.find(w => w.word === result.word)?.english || '',
          phonetic: result.profileData.tokens.join('-'),
          tonePattern: "HL", // Default for now
          audioFile: result.audioFile,
          complexity: result.profileData.phonetic_profile.length,
          specialInstructions: result.profileData.phonetic_profile
            .filter((p: any) => p.category === 'whistled' || p.category === 'implosive' || p.category === 'breathy')
            .map((p: any) => p.instructions)
            .join(' ')
        }]
      }),
      points: Math.max(5, Math.min(20, result.profileData.phonetic_profile.length))
    }))
  
  const exercisePath = path.join(process.cwd(), 'content', 'generated-pronunciation-exercises.json')
  await fs.writeFile(exercisePath, JSON.stringify(exercises, null, 2))
  
  console.log(`🎯 Exercise integration saved: generated-pronunciation-exercises.json`)
  return exercises
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 ======================================')
  console.log('🎯 Mudzidzisi AI - Production Asset Generation')
  console.log('🎯 Creating Real Pronunciation Content')
  console.log('🎯 ======================================\n')
  
  console.log(`📋 Generating assets for ${PRIORITY_WORDS.length} priority words...`)
  console.log(`🔑 Using Google TTS API: ${GOOGLE_API_KEY.substring(0, 10)}...`)
  console.log()
  
  const results: GeneratedAsset[] = []
  
  // Generate assets for each word
  for (const wordData of PRIORITY_WORDS) {
    const result = await generateWordAssets(wordData)
    results.push(result)
    
    // Brief pause to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log()
  }
  
  // Generate comprehensive guides
  console.log('📖 Generating pronunciation guide...')
  const guide = await generatePronunciationGuide(results)
  
  console.log('🎯 Generating exercise integration...')
  const exercises = await generateExerciseIntegration(results)
  
  // Summary report
  const successful = results.filter(r => r.success).length
  const failed = results.length - successful
  
  console.log('\n🎉 GENERATION COMPLETE!')
  console.log('=' + '='.repeat(50))
  console.log(`✅ Successfully generated: ${successful} assets`)
  console.log(`❌ Failed generations: ${failed}`)
  console.log(`📊 Success rate: ${((successful / results.length) * 100).toFixed(1)}%`)
  
  if (successful > 0) {
    console.log('\n📁 Generated Files:')
    console.log('   📂 public/audio/generated/')
    results.filter(r => r.success).forEach(r => {
      console.log(`     🎵 ${r.audioFile}`)
      console.log(`     📝 ${r.word}.json`)
    })
    console.log('   📖 pronunciation-guide.json')
    console.log('   🎯 generated-pronunciation-exercises.json')
  }
  
  if (failed > 0) {
    console.log('\n❌ Failed Words:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`   ${r.word}: ${r.error}`)
    })
  }
  
  console.log('\n🔧 Next Steps:')
  console.log('   1. Test generated audio files in the app')
  console.log('   2. Integrate with pronunciation exercises')
  console.log('   3. Validate pronunciation quality')
  console.log('   4. Expand to more vocabulary words')
  
  console.log('\n🎯 Production Asset Generation Complete!')
  console.log('🎯 =====================================\n')
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error)
}

export { main as generatePronunciationAssets }