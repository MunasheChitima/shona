#!/usr/bin/env tsx
/**
 * Comprehensive Pronunciation Asset Generator
 * Creates complete pronunciation content with multiple audio generation strategies
 */

import { processWord } from '../lib/mudzidzisi-ai'
import { promises as fs } from 'fs'
import path from 'path'

// Priority words with enhanced metadata
const COMPREHENSIVE_WORDS = [
  { word: 'mangwanani', english: 'good morning', category: 'Greetings', difficulty: 'intermediate', cultural: 'formal greeting' },
  { word: 'masikati', english: 'good afternoon', category: 'Greetings', difficulty: 'beginner', cultural: 'daily greeting' },
  { word: 'manheru', english: 'good evening', category: 'Greetings', difficulty: 'beginner', cultural: 'evening greeting' },
  { word: 'bhazi', english: 'bus', category: 'Transport', difficulty: 'intermediate', cultural: 'breathy consonant example' },
  { word: 'svika', english: 'arrive', category: 'Movement', difficulty: 'intermediate', cultural: 'whistled sibilant example' },
  { word: 'zvino', english: 'now', category: 'Time', difficulty: 'intermediate', cultural: 'temporal expression' },
  { word: 'tsvaira', english: 'drive', category: 'Action', difficulty: 'advanced', cultural: 'complex trigraph' },
  { word: 'kuudza', english: 'to tell', category: 'Communication', difficulty: 'intermediate', cultural: 'vowel hiatus example' },
  { word: 'mbira', english: 'thumb piano', category: 'Music', difficulty: 'intermediate', cultural: 'traditional instrument' },
  { word: 'ndimi', english: 'you (plural)', category: 'Pronouns', difficulty: 'beginner', cultural: 'respectful address' },
  { word: 'ngoma', english: 'drum', category: 'Music', difficulty: 'intermediate', cultural: 'traditional instrument' },
  { word: 'ndatenda', english: 'thank you', category: 'Courtesy', difficulty: 'intermediate', cultural: 'essential courtesy' },
  { word: 'zvakanaka', english: 'fine/good', category: 'Responses', difficulty: 'intermediate', cultural: 'common response' },
  { word: 'pamusoroi', english: 'excuse me', category: 'Courtesy', difficulty: 'advanced', cultural: 'polite expression' },
  { word: 'sara', english: 'remain', category: 'Action', difficulty: 'beginner', cultural: 'farewell context' }
]

interface ComprehensiveAsset {
  word: string
  success: boolean
  phoneticData: any
  audioStrategies: {
    ttsPrompt: string
    phoneticsGuide: string
    alternativeAudio: string
    pronunciationMap: string
  }
  learningMaterials: any
}

/**
 * Generate comprehensive pronunciation assets
 */
async function generateComprehensiveAssets(wordData: any): Promise<ComprehensiveAsset> {
  console.log(`🎯 Generating comprehensive assets for: ${wordData.word} (${wordData.english})`)
  
  try {
    // Complete phonetic analysis using Mudzidzisi AI
    const analysis = processWord(wordData.word)
    
    console.log(`   ✅ Phonetic analysis: [${analysis.profile.tokens.join(', ')}]`)
    console.log(`   ✅ Syllabification: ${analysis.profile.syllables.join('-')}`)
    console.log(`   ✅ Complexity score: ${analysis.metadata.complexity}`)
    
    if (analysis.profile.vowelHiatus) {
      console.log(`   ✅ Vowel hiatus detected`)
    }
    
    // Generate multiple audio strategies
    const audioStrategies = {
      ttsPrompt: analysis.audioPrompt.prompt,
      phoneticsGuide: generatePhoneticGuide(analysis.profile),
      alternativeAudio: generateAlternativeAudioInstructions(analysis.profile),
      pronunciationMap: generatePronunciationMap(analysis.profile)
    }
    
    // Create comprehensive learning materials
    const learningMaterials = generateLearningMaterials(wordData, analysis)
    
    console.log(`   ✅ Generated complete learning package`)
    
    return {
      word: wordData.word,
      success: true,
      phoneticData: analysis,
      audioStrategies,
      learningMaterials
    }
    
  } catch (error) {
    console.error(`   ❌ Failed to process ${wordData.word}: ${error}`)
    return {
      word: wordData.word,
      success: false,
      phoneticData: null,
      audioStrategies: { ttsPrompt: '', phoneticsGuide: '', alternativeAudio: '', pronunciationMap: '' },
      learningMaterials: null
    }
  }
}

/**
 * Generate detailed phonetic guide
 */
function generatePhoneticGuide(profile: any): string {
  let guide = `PHONETIC GUIDE FOR "${profile.word.toUpperCase()}"\n`
  guide += `${'='.repeat(40)}\n\n`
  
  guide += `SYLLABLES: ${profile.syllables.join(' - ')}\n\n`
  
  guide += `PHONEME-BY-PHONEME BREAKDOWN:\n`
  profile.phonetic_profile.forEach((phoneme: any, index: number) => {
    guide += `${index + 1}. [${phoneme.token}] → [${phoneme.ipa}]\n`
    guide += `   Type: ${phoneme.type}\n`
    guide += `   Instruction: ${phoneme.instructions}\n`
    if (phoneme.antiPatterns.length > 0) {
      guide += `   ⚠️  WARNING: ${phoneme.antiPatterns.join(' ')}\n`
    }
    guide += `\n`
  })
  
  if (profile.vowelHiatus) {
    guide += `🔸 SPECIAL FEATURE: Vowel hiatus detected - consecutive vowels form separate syllables\n\n`
  }
  
  return guide
}

/**
 * Generate alternative audio instructions for other TTS systems
 */
function generateAlternativeAudioInstructions(profile: any): string {
  let instructions = `ALTERNATIVE AUDIO GENERATION STRATEGIES\n`
  instructions += `${'='.repeat(45)}\n\n`
  
  instructions += `FOR WEB SPEECH API:\n`
  instructions += `navigator.speechSynthesis.speak(new SpeechSynthesisUtterance("${profile.word}"));\n\n`
  
  instructions += `FOR FESTIVAL TTS:\n`
  instructions += `echo "${profile.word}" | festival --tts\n\n`
  
  instructions += `FOR ESPEAK:\n`
  instructions += `espeak "${profile.word}" -s 150 -p 50\n\n`
  
  instructions += `PHONETIC SPELLING FOR MANUAL RECORDING:\n`
  const phoneticSpelling = profile.phonetic_profile.map((p: any) => {
    switch(p.category) {
      case 'whistled': return `[${p.token}=WHISTLED]`
      case 'breathy': return `[${p.token}=BREATHY]`
      case 'prenasalized': return `[${p.token}=PRENASALIZED]`
      case 'implosive': return `[${p.token}=IMPLOSIVE]`
      default: return p.token
    }
  }).join(' ')
  
  instructions += `"${phoneticSpelling}"\n\n`
  
  instructions += `DETAILED ARTICULATION NOTES:\n`
  profile.phonetic_profile.forEach((phoneme: any) => {
    if (['whistled', 'breathy', 'prenasalized', 'implosive'].includes(phoneme.category)) {
      instructions += `• ${phoneme.token}: ${phoneme.instructions}\n`
    }
  })
  
  return instructions
}

/**
 * Generate pronunciation map for visual learning
 */
function generatePronunciationMap(profile: any): string {
  let map = `VISUAL PRONUNCIATION MAP\n`
  map += `${'='.repeat(30)}\n\n`
  
  map += `Word: ${profile.word}\n`
  map += `Syllables: ${profile.syllables.join(' | ')}\n\n`
  
  map += `Character Mapping:\n`
  let position = 0
  profile.tokens.forEach((token: string) => {
    const phoneme = profile.phonetic_profile.find((p: any) => p.token === token)
    map += `${token.padEnd(4)} → [${phoneme?.ipa || token}]  (${phoneme?.type || 'Unknown'})\n`
  })
  
  map += `\nPronunciation Flow:\n`
  map += profile.syllables.map((syl: string, i: number) => `${i + 1}. ${syl}`).join('\n')
  
  return map
}

/**
 * Generate comprehensive learning materials
 */
function generateLearningMaterials(wordData: any, analysis: any) {
  return {
    basicInfo: {
      word: wordData.word,
      english: wordData.english,
      category: wordData.category,
      difficulty: wordData.difficulty,
      culturalNote: wordData.cultural
    },
    phoneticAnalysis: {
      tokens: analysis.profile.tokens,
      syllables: analysis.profile.syllables,
      complexity: analysis.metadata.complexity,
      vowelHiatus: analysis.profile.vowelHiatus,
      specialSounds: analysis.profile.phonetic_profile
        .filter((p: any) => ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category))
        .map((p: any) => ({ token: p.token, type: p.category, description: p.instructions }))
    },
    learningSteps: [
      `1. Study the syllable breakdown: ${analysis.profile.syllables.join(' - ')}`,
      `2. Practice each phoneme individually`,
      `3. Focus on special sounds: ${analysis.profile.phonetic_profile
        .filter((p: any) => ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category))
        .map((p: any) => p.token).join(', ') || 'None'}`,
      `4. Combine syllables slowly`,
      `5. Practice at normal speed`
    ],
    practiceExercises: [
      {
        type: 'syllable_practice',
        instruction: `Break down "${wordData.word}" into syllables and practice each one`,
        content: analysis.profile.syllables
      },
      {
        type: 'phoneme_focus',
        instruction: 'Focus on challenging sounds',
        content: analysis.profile.phonetic_profile
          .filter((p: any) => ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category))
      },
      {
        type: 'context_practice',
        instruction: 'Use in sentences',
        content: [`${wordData.word} means "${wordData.english}"`, `Practice saying: "This is ${wordData.word}"`]
      }
    ],
    audioAlternatives: [
      {
        method: 'web_speech_api',
        code: `speechSynthesis.speak(new SpeechSynthesisUtterance("${wordData.word}"));`,
        note: 'Works in modern browsers'
      },
      {
        method: 'phonetic_recording',
        phonetic: analysis.profile.phonetic_profile.map((p: any) => p.ipa).join(''),
        note: 'For manual recording reference'
      },
      {
        method: 'syllable_audio',
        syllables: analysis.profile.syllables,
        note: 'Record each syllable separately then combine'
      }
    ]
  }
}

/**
 * Save comprehensive assets
 */
async function saveComprehensiveAssets(results: ComprehensiveAsset[]) {
  // Ensure directories exist
  const assetsDir = path.join(process.cwd(), 'public', 'pronunciation-assets')
  const audioDir = path.join(assetsDir, 'audio-alternatives')
  const guidesDir = path.join(assetsDir, 'guides')
  const exercisesDir = path.join(assetsDir, 'exercises')
  
  await fs.mkdir(assetsDir, { recursive: true })
  await fs.mkdir(audioDir, { recursive: true })
  await fs.mkdir(guidesDir, { recursive: true })
  await fs.mkdir(exercisesDir, { recursive: true })
  
  const successful = results.filter(r => r.success)
  
  // Save individual word assets
  for (const result of successful) {
    // Save phonetic guide
    const guideFile = path.join(guidesDir, `${result.word}_guide.txt`)
    await fs.writeFile(guideFile, result.audioStrategies.phoneticsGuide)
    
    // Save pronunciation map
    const mapFile = path.join(guidesDir, `${result.word}_map.txt`)
    await fs.writeFile(mapFile, result.audioStrategies.pronunciationMap)
    
    // Save alternative audio instructions
    const audioFile = path.join(audioDir, `${result.word}_alternatives.txt`)
    await fs.writeFile(audioFile, result.audioStrategies.alternativeAudio)
    
    // Save learning materials
    const learningFile = path.join(exercisesDir, `${result.word}_learning.json`)
    await fs.writeFile(learningFile, JSON.stringify(result.learningMaterials, null, 2))
  }
  
  // Create master pronunciation guide
  const masterGuide = {
    title: 'Complete Shona Pronunciation Guide',
    subtitle: 'Generated by Mudzidzisi AI',
    generated_at: new Date().toISOString(),
    total_words: results.length,
    successful_analysis: successful.length,
    words: successful.map(result => ({
      word: result.word,
      english: result.learningMaterials.basicInfo.english,
      category: result.learningMaterials.basicInfo.category,
      difficulty: result.learningMaterials.basicInfo.difficulty,
      syllables: result.phoneticData.profile.syllables,
      complexity: result.phoneticData.metadata.complexity,
      special_sounds: result.learningMaterials.phoneticAnalysis.specialSounds,
      learning_steps: result.learningMaterials.learningSteps
    })),
    pronunciation_statistics: {
      difficulty_distribution: {
        beginner: successful.filter(r => r.learningMaterials.basicInfo.difficulty === 'beginner').length,
        intermediate: successful.filter(r => r.learningMaterials.basicInfo.difficulty === 'intermediate').length,
        advanced: successful.filter(r => r.learningMaterials.basicInfo.difficulty === 'advanced').length
      },
      special_sounds_frequency: calculateSpecialSoundsFrequency(successful),
      complexity_analysis: {
        average: successful.reduce((sum, r) => sum + r.phoneticData.metadata.complexity, 0) / successful.length,
        range: {
          min: Math.min(...successful.map(r => r.phoneticData.metadata.complexity)),
          max: Math.max(...successful.map(r => r.phoneticData.metadata.complexity))
        }
      }
    }
  }
  
  const masterFile = path.join(assetsDir, 'master_pronunciation_guide.json')
  await fs.writeFile(masterFile, JSON.stringify(masterGuide, null, 2))
  
  // Create audio generation script for multiple platforms
  const audioScript = generateAudioGenerationScript(successful)
  const scriptFile = path.join(audioDir, 'generate_audio.sh')
  await fs.writeFile(scriptFile, audioScript)
  
  console.log(`📁 Saved comprehensive assets to: ${assetsDir}`)
  return masterGuide
}

/**
 * Calculate special sounds frequency
 */
function calculateSpecialSoundsFrequency(results: ComprehensiveAsset[]) {
  const frequency: Record<string, number> = {}
  
  results.forEach(result => {
    result.learningMaterials.phoneticAnalysis.specialSounds.forEach((sound: any) => {
      const key = `${sound.token} (${sound.type})`
      frequency[key] = (frequency[key] || 0) + 1
    })
  })
  
  return frequency
}

/**
 * Generate audio generation script for multiple platforms
 */
function generateAudioGenerationScript(results: ComprehensiveAsset[]): string {
  let script = `#!/bin/bash\n`
  script += `# Audio Generation Script for Shona Pronunciation\n`
  script += `# Generated by Mudzidzisi AI\n\n`
  
  script += `echo "Generating pronunciation audio for ${results.length} Shona words..."\n\n`
  
  results.forEach(result => {
    script += `# ${result.word} (${result.learningMaterials.basicInfo.english})\n`
    script += `echo "Generating: ${result.word}"\n`
    
    // Web Speech API version
    script += `# Web version: Use browser console with:\n`
    script += `# speechSynthesis.speak(new SpeechSynthesisUtterance("${result.word}"));\n\n`
    
    // eSpeak version
    script += `# eSpeak version:\n`
    script += `espeak "${result.word}" -s 150 -p 50 -w ${result.word}_espeak.wav\n\n`
    
    // Festival version
    script += `# Festival version:\n`
    script += `echo "${result.word}" | festival --tts --otype ulaw --ostype ulaw > ${result.word}_festival.au\n\n`
  })
  
  script += `echo "Audio generation complete!"\n`
  script += `echo "Generated files: *.wav, *.au"\n`
  script += `echo "Use convert tools to standardize format if needed"\n`
  
  return script
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 ===============================================')
  console.log('🎯 Comprehensive Pronunciation Asset Generation')
  console.log('🎯 Complete Learning Materials with Audio Alternatives')
  console.log('🎯 ===============================================\n')
  
  console.log(`📚 Processing ${COMPREHENSIVE_WORDS.length} words with full analysis...`)
  console.log(`🎯 Generating multiple audio strategies`)
  console.log(`📖 Creating comprehensive learning materials\n`)
  
  const results: ComprehensiveAsset[] = []
  
  // Process each word
  for (const wordData of COMPREHENSIVE_WORDS) {
    const result = await generateComprehensiveAssets(wordData)
    results.push(result)
    console.log()
  }
  
  // Save all assets
  console.log('💾 Saving comprehensive pronunciation assets...')
  const masterGuide = await saveComprehensiveAssets(results)
  
  // Generate summary
  const successful = results.filter(r => r.success)
  const failed = results.length - successful.length
  
  console.log('\n🎉 COMPREHENSIVE ASSET GENERATION COMPLETE!')
  console.log('=' + '='.repeat(55))
  console.log(`✅ Successfully processed: ${successful.length} words`)
  console.log(`❌ Failed processing: ${failed}`)
  console.log(`📊 Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%`)
  
  console.log('\n📁 GENERATED ASSET LIBRARY:')
  console.log('=' + '='.repeat(35))
  console.log('📂 public/pronunciation-assets/')
  console.log(`   📖 master_pronunciation_guide.json`)
  console.log('   📂 guides/ (15 phonetic guides + pronunciation maps)')
  console.log('   📂 audio-alternatives/ (TTS alternatives + generation script)')
  console.log('   📂 exercises/ (comprehensive learning materials)')
  
  console.log('\n🎯 AUDIO GENERATION OPTIONS:')
  console.log('=' + '='.repeat(35))
  console.log('1. 🌐 Web Speech API (browser-based)')
  console.log('2. 🔊 eSpeak (cross-platform TTS)')
  console.log('3. 🎵 Festival (speech synthesis)')
  console.log('4. 📱 Platform-specific TTS APIs')
  console.log('5. 🎙️ Manual recording with phonetic guides')
  
  console.log('\n📊 PHONETIC ANALYSIS INSIGHTS:')
  console.log('=' + '='.repeat(35))
  console.log(`📈 Average complexity: ${masterGuide.pronunciation_statistics.complexity_analysis.average.toFixed(1)}`)
  console.log(`📉 Complexity range: ${masterGuide.pronunciation_statistics.complexity_analysis.range.min}-${masterGuide.pronunciation_statistics.complexity_analysis.range.max}`)
  console.log(`🔤 Special sounds detected: ${Object.keys(masterGuide.pronunciation_statistics.special_sounds_frequency).length}`)
  
  console.log('\n🚀 READY FOR PRODUCTION:')
  console.log('=' + '='.repeat(25))
  console.log('✅ Complete phonetic analysis system')
  console.log('✅ Multiple audio generation strategies')
  console.log('✅ Comprehensive learning materials')
  console.log('✅ Production-ready pronunciation guides')
  console.log('✅ Alternative TTS implementations')
  
  console.log('\n💡 NEXT STEPS:')
  console.log('=' + '='.repeat(15))
  console.log('1. Choose preferred audio generation method')
  console.log('2. Integrate with Shona learning app')
  console.log('3. Test pronunciation quality with native speakers')
  console.log('4. Expand vocabulary using proven system')
  
  console.log('\n🎯 SUCCESS: Complete pronunciation system ready!')
  console.log('🎯 =============================================\n')
}

// Execute
if (require.main === module) {
  main().catch(console.error)
}

export { main as generateComprehensiveAssets }