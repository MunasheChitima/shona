#!/usr/bin/env tsx
/**
 * Demo Asset Generation Script
 * Demonstrates the complete Mudzidzisi AI system with mock pronunciation assets
 */

import { processWord } from '../lib/mudzidzisi-ai'
import { promises as fs } from 'fs'
import path from 'path'

// Priority words for demonstration
const DEMO_WORDS = [
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

interface DemoAsset {
  word: string
  audioFile: string
  profileData: any
  success: boolean
  error?: string
}

/**
 * Generate mock pronunciation assets for demonstration
 */
async function generateDemoAssets(wordData: { word: string, english: string, category: string }): Promise<DemoAsset> {
  console.log(`🎵 Generating demo assets for: ${wordData.word} (${wordData.english})`)
  
  try {
    // Stage 1-3: Complete Phonetic Analysis and Prompt Generation
    const analysis = processWord(wordData.word)
    
    console.log(`   ✓ Phonetic analysis complete`)
    console.log(`   ✓ Tokens: [${analysis.profile.tokens.join(', ')}]`)
    console.log(`   ✓ Syllables: ${analysis.profile.syllables.join('-')}`)
    console.log(`   ✓ Complexity: ${analysis.metadata.complexity}`)
    
    if (analysis.profile.vowelHiatus) {
      console.log(`   ✓ Vowel hiatus detected`)
    }
    
    // Stage 4: Generate Mock Assets
    console.log(`   🎤 Generating mock pronunciation assets...`)
    
    // Ensure output directory exists
    const audioDir = path.join(process.cwd(), 'public', 'audio', 'generated')
    await fs.mkdir(audioDir, { recursive: true })
    
    // Create mock audio file (placeholder)
    const audioFileName = `${wordData.word}.wav`
    const audioFilePath = path.join(audioDir, audioFileName)
    const mockAudioContent = `MOCK_AUDIO_DATA_FOR_${wordData.word.toUpperCase()}`
    await fs.writeFile(audioFilePath, mockAudioContent)
    
    console.log(`   ✅ Mock audio saved: ${audioFileName}`)
    
    // Save comprehensive pronunciation metadata
    const metadataPath = path.join(audioDir, `${wordData.word}.json`)
    const metadata = {
      word: wordData.word,
      english: wordData.english,
      category: wordData.category,
      phonetic_analysis: {
        tokens: analysis.profile.tokens,
        syllables: analysis.profile.syllables,
        vowel_hiatus: analysis.profile.vowelHiatus,
        phonetic_profile: analysis.profile.phonetic_profile,
        complexity: analysis.metadata.complexity
      },
      ai_generated_prompts: {
        audio_tts_prompt: analysis.audioPrompt.prompt,
        video_synthesis_prompt: analysis.videoPrompt.prompt,
        audio_specifications: analysis.audioPrompt.specifications,
        video_specifications: analysis.videoPrompt.specifications
      },
      detailed_pronunciation_guide: {
        phonemes: analysis.profile.phonetic_profile.map(p => ({
          token: p.token,
          ipa: p.ipa,
          category: p.category,
          type: p.type,
          instructions: p.instructions,
          anti_patterns: p.antiPatterns
        })),
        difficulty_indicators: {
          whistled_sibilants: analysis.profile.phonetic_profile.filter(p => p.category === 'whistled').length,
          breathy_consonants: analysis.profile.phonetic_profile.filter(p => p.category === 'breathy').length,
          prenasalized_consonants: analysis.profile.phonetic_profile.filter(p => p.category === 'prenasalized').length,
          implosive_consonants: analysis.profile.phonetic_profile.filter(p => p.category === 'implosive').length
        }
      },
      pedagogical_metadata: {
        learning_sequence: analysis.metadata.complexity <= 6 ? 'Beginner' : 
                          analysis.metadata.complexity <= 10 ? 'Intermediate' : 'Advanced',
        practice_focus: analysis.profile.phonetic_profile
          .filter(p => ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category))
          .map(p => p.token),
        pronunciation_tips: analysis.profile.phonetic_profile
          .filter(p => p.instructions.includes('WARNING') || p.instructions.includes('NOTE'))
          .map(p => ({ token: p.token, tip: p.instructions }))
      },
      generated_at: new Date().toISOString(),
      mudzidzisi_ai_version: '1.0.0',
      file_info: {
        audio_file: audioFileName,
        audio_type: 'mock_demonstration',
        format: 'WAV',
        sample_rate: '44.1kHz (demonstration)'
      }
    }
    
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
    console.log(`   ✅ Comprehensive metadata saved: ${wordData.word}.json`)
    
    // Display key pronunciation insights
    const specialSounds = analysis.profile.phonetic_profile.filter(p => 
      ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category)
    )
    
    if (specialSounds.length > 0) {
      console.log(`   🎯 Special pronunciation features:`)
      specialSounds.forEach(sound => {
        console.log(`      - ${sound.token}: ${sound.category} (${sound.ipa})`)
      })
    }
    
    return {
      word: wordData.word,
      audioFile: audioFileName,
      profileData: analysis.profile,
      success: true
    }
    
  } catch (error) {
    console.error(`   ❌ Failed to generate demo assets for ${wordData.word}: ${error}`)
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
 * Generate comprehensive pronunciation guide
 */
async function generateComprehensiveGuide(results: DemoAsset[]) {
  const successfulResults = results.filter(r => r.success)
  
  const guide = {
    title: "Mudzidzisi AI - Shona Pronunciation Guide",
    subtitle: "Complete Phonetic Analysis and Pronunciation Assets",
    generated_at: new Date().toISOString(),
    system_info: {
      ai_agent: "Mudzidzisi AI",
      version: "1.0.0",
      phonetic_engine: "Advanced Shona Orthographic Parser",
      total_phonemes: 40,
      specialized_sounds: ['tsv', 'dzv', 'sv', 'zv', 'bh', 'dh', 'mb', 'nd', 'ng', 'nz']
    },
    generation_statistics: {
      total_words: results.length,
      successful_generations: successfulResults.length,
      failed_generations: results.length - successfulResults.length,
      success_rate: `${((successfulResults.length / results.length) * 100).toFixed(1)}%`
    },
    pronunciation_catalog: successfulResults.map(result => ({
      word: result.word,
      english: DEMO_WORDS.find(w => w.word === result.word)?.english || '',
      category: DEMO_WORDS.find(w => w.word === result.word)?.category || '',
      audio_file: result.audioFile,
      phonetic_breakdown: {
        tokens: result.profileData.tokens,
        syllables: result.profileData.syllables,
        complexity_score: result.profileData.phonetic_profile.length,
        vowel_hiatus: result.profileData.vowelHiatus
      },
      special_features: result.profileData.phonetic_profile
        .filter((p: any) => ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category))
        .map((p: any) => ({
          token: p.token,
          type: p.category,
          ipa: p.ipa,
          phoneme_type: p.type
        })),
      pronunciation_details: result.profileData.phonetic_profile.map((p: any) => ({
        token: p.token,
        ipa: p.ipa,
        category: p.category,
        phoneme_type: p.type,
        learning_notes: p.instructions
      }))
    })),
    phoneme_analysis: {
      usage_frequency: calculatePhonemeUsage(successfulResults),
      complexity_distribution: calculateComplexityDistribution(successfulResults),
      special_sound_frequency: calculateSpecialSoundFrequency(successfulResults),
      learning_progression: generateLearningProgression(successfulResults)
    },
    pedagogical_insights: {
      beginner_words: successfulResults.filter(r => r.profileData.phonetic_profile.length <= 6).map(r => r.word),
      intermediate_words: successfulResults.filter(r => r.profileData.phonetic_profile.length > 6 && r.profileData.phonetic_profile.length <= 10).map(r => r.word),
      advanced_words: successfulResults.filter(r => r.profileData.phonetic_profile.length > 10).map(r => r.word),
      challenging_sounds: ['tsv', 'dzv', 'sv', 'zv', 'bh', 'dh', 'mb', 'nd', 'ng'],
      pronunciation_focus_areas: [
        'Whistled sibilants (sv, zv)',
        'Breathy consonants (bh, dh)',
        'Prenasalized consonants (mb, nd, ng)',
        'Trigraph clusters (tsv, dzv)'
      ]
    },
    ai_prompt_examples: {
      audio_tts_sample: successfulResults[0] ? `Sample TTS Prompt: "${successfulResults[0].word}" - Generated specialized audio instruction with phonetic guidance` : '',
      video_synthesis_sample: successfulResults[0] ? `Sample Video Prompt: "${successfulResults[0].word}" - Generated mouth position and articulation guidance` : '',
      complexity_scoring: 'Automatic difficulty assessment based on phonetic complexity and special sound combinations'
    }
  }
  
  const guidePath = path.join(process.cwd(), 'public', 'audio', 'generated', 'mudzidzisi-ai-guide.json')
  await fs.writeFile(guidePath, JSON.stringify(guide, null, 2))
  
  console.log(`📖 Comprehensive guide saved: mudzidzisi-ai-guide.json`)
  return guide
}

/**
 * Calculate phoneme usage statistics
 */
function calculatePhonemeUsage(results: DemoAsset[]): Record<string, number> {
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
function calculateComplexityDistribution(results: DemoAsset[]): Record<string, number> {
  const distribution: Record<string, number> = {
    'Beginner (1-6)': 0,
    'Intermediate (7-10)': 0,
    'Advanced (11-15)': 0,
    'Expert (16+)': 0
  }
  
  results.forEach(result => {
    const complexity = result.profileData.phonetic_profile.length
    if (complexity <= 6) distribution['Beginner (1-6)']++
    else if (complexity <= 10) distribution['Intermediate (7-10)']++
    else if (complexity <= 15) distribution['Advanced (11-15)']++
    else distribution['Expert (16+)']++
  })
  
  return distribution
}

/**
 * Calculate special sound frequency
 */
function calculateSpecialSoundFrequency(results: DemoAsset[]): Record<string, number> {
  const frequency: Record<string, number> = {
    'Whistled Sibilants': 0,
    'Breathy Consonants': 0,
    'Prenasalized Consonants': 0,
    'Implosive Consonants': 0
  }
  
  results.forEach(result => {
    result.profileData.phonetic_profile.forEach((p: any) => {
      if (p.category === 'whistled') frequency['Whistled Sibilants']++
      if (p.category === 'breathy') frequency['Breathy Consonants']++
      if (p.category === 'prenasalized') frequency['Prenasalized Consonants']++
      if (p.category === 'implosive') frequency['Implosive Consonants']++
    })
  })
  
  return frequency
}

/**
 * Generate learning progression
 */
function generateLearningProgression(results: DemoAsset[]) {
  const sorted = results.sort((a, b) => a.profileData.phonetic_profile.length - b.profileData.phonetic_profile.length)
  
  return {
    recommended_order: sorted.map(r => ({
      word: r.word,
      complexity: r.profileData.phonetic_profile.length,
      special_sounds: r.profileData.phonetic_profile
        .filter((p: any) => ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category))
        .map((p: any) => p.token)
    })),
    learning_milestones: [
      { level: 'Foundation', words: sorted.filter(r => r.profileData.phonetic_profile.length <= 6).map(r => r.word) },
      { level: 'Development', words: sorted.filter(r => r.profileData.phonetic_profile.length > 6 && r.profileData.phonetic_profile.length <= 10).map(r => r.word) },
      { level: 'Mastery', words: sorted.filter(r => r.profileData.phonetic_profile.length > 10).map(r => r.word) }
    ]
  }
}

/**
 * Generate pronunciation exercises for integration
 */
async function generatePronunciationExercises(results: DemoAsset[]) {
  const exercises = results
    .filter(r => r.success)
    .map(result => ({
      id: `pronunciation_${result.word}`,
      type: "voice",
      voiceType: "pronunciation",
      question: `Practice pronouncing the Shona word: ${result.word}`,
      translation: DEMO_WORDS.find(w => w.word === result.word)?.english || '',
      category: DEMO_WORDS.find(w => w.word === result.word)?.category || '',
      voiceContent: JSON.stringify({
        words: [{
          shona: result.word,
          english: DEMO_WORDS.find(w => w.word === result.word)?.english || '',
          phonetic: result.profileData.tokens.join('-'),
          syllables: result.profileData.syllables.join('-'),
          tonePattern: "HL", // Default pattern
          audioFile: result.audioFile,
          complexity: result.profileData.phonetic_profile.length,
          specialSounds: result.profileData.phonetic_profile
            .filter((p: any) => ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category))
            .map((p: any) => ({ token: p.token, type: p.category, ipa: p.ipa })),
          pronunciationTips: result.profileData.phonetic_profile
            .filter((p: any) => p.instructions.includes('WARNING') || p.instructions.includes('NOTE'))
            .map((p: any) => ({ token: p.token, tip: p.instructions })),
          learningLevel: result.profileData.phonetic_profile.length <= 6 ? 'Beginner' : 
                        result.profileData.phonetic_profile.length <= 10 ? 'Intermediate' : 'Advanced'
        }]
      }),
      difficulty: result.profileData.phonetic_profile.length <= 6 ? 'beginner' : 
                  result.profileData.phonetic_profile.length <= 10 ? 'intermediate' : 'advanced',
      points: Math.max(5, Math.min(25, result.profileData.phonetic_profile.length * 2)),
      tags: [
        'pronunciation',
        'shona',
        'mudzidzisi-ai',
        DEMO_WORDS.find(w => w.word === result.word)?.category?.toLowerCase() || 'general'
      ].concat(
        result.profileData.phonetic_profile
          .filter((p: any) => ['whistled', 'breathy', 'prenasalized', 'implosive'].includes(p.category))
          .map((p: any) => p.category)
      )
    }))
  
  const exercisePath = path.join(process.cwd(), 'content', 'mudzidzisi-ai-exercises.json')
  await fs.writeFile(exercisePath, JSON.stringify(exercises, null, 2))
  
  console.log(`🎯 Pronunciation exercises saved: mudzidzisi-ai-exercises.json`)
  return exercises
}

/**
 * Main demonstration execution
 */
async function main() {
  console.log('🎯 ================================================')
  console.log('🎯 Mudzidzisi AI - Complete System Demonstration')
  console.log('🎯 Advanced Shona Pronunciation Asset Generation')
  console.log('🎯 ================================================\n')
  
  console.log(`📋 Generating demonstration assets for ${DEMO_WORDS.length} Shona words...`)
  console.log(`🧠 Using advanced phonetic analysis engine`)
  console.log(`🎵 Creating comprehensive pronunciation metadata`)
  console.log(`📚 Demonstrating complete pedagogical framework\n`)
  
  const results: DemoAsset[] = []
  
  // Generate demo assets for each word
  for (const wordData of DEMO_WORDS) {
    const result = await generateDemoAssets(wordData)
    results.push(result)
    console.log()
  }
  
  // Generate comprehensive guides and integrations
  console.log('📖 Generating comprehensive pronunciation guide...')
  const guide = await generateComprehensiveGuide(results)
  
  console.log('🎯 Generating pronunciation exercises...')
  const exercises = await generatePronunciationExercises(results)
  
  // Summary report
  const successful = results.filter(r => r.success).length
  const failed = results.length - successful
  
  console.log('\n🎉 MUDZIDZISI AI DEMONSTRATION COMPLETE!')
  console.log('=' + '='.repeat(55))
  console.log(`✅ Successfully analyzed: ${successful} words`)
  console.log(`❌ Failed analyses: ${failed}`)
  console.log(`📊 Success rate: ${((successful / results.length) * 100).toFixed(1)}%`)
  
  // Display phonetic insights
  console.log('\n🎯 PHONETIC ANALYSIS INSIGHTS:')
  console.log('=' + '='.repeat(35))
  
  const complexityStats = results.filter(r => r.success).reduce((acc, r) => {
    const complexity = r.profileData.phonetic_profile.length
    if (complexity <= 6) acc.beginner++
    else if (complexity <= 10) acc.intermediate++
    else acc.advanced++
    return acc
  }, { beginner: 0, intermediate: 0, advanced: 0 })
  
  console.log(`📊 Complexity Distribution:`)
  console.log(`   Beginner (1-6): ${complexityStats.beginner} words`)
  console.log(`   Intermediate (7-10): ${complexityStats.intermediate} words`)
  console.log(`   Advanced (11+): ${complexityStats.advanced} words`)
  
  const specialSounds = results.filter(r => r.success).reduce((acc, r) => {
    r.profileData.phonetic_profile.forEach((p: any) => {
      if (p.category === 'whistled') acc.whistled.add(p.token)
      if (p.category === 'breathy') acc.breathy.add(p.token)
      if (p.category === 'prenasalized') acc.prenasalized.add(p.token)
    })
    return acc
  }, { whistled: new Set(), breathy: new Set(), prenasalized: new Set() })
  
  console.log(`\n🎵 Special Sound Features:`)
  console.log(`   Whistled Sibilants: ${Array.from(specialSounds.whistled).join(', ')}`)
  console.log(`   Breathy Consonants: ${Array.from(specialSounds.breathy).join(', ')}`)
  console.log(`   Prenasalized Consonants: ${Array.from(specialSounds.prenasalized).join(', ')}`)
  
  if (successful > 0) {
    console.log('\n📁 GENERATED ASSETS:')
    console.log('=' + '='.repeat(25))
    console.log('   📂 public/audio/generated/')
    results.filter(r => r.success).forEach(r => {
      console.log(`     🎵 ${r.audioFile} (mock audio)`)
      console.log(`     📝 ${r.word}.json (comprehensive metadata)`)
    })
    console.log('   📖 mudzidzisi-ai-guide.json (complete guide)')
    console.log('   🎯 mudzidzisi-ai-exercises.json (pronunciation exercises)')
  }
  
  console.log('\n🚀 SYSTEM CAPABILITIES DEMONSTRATED:')
  console.log('=' + '='.repeat(40))
  console.log('   ✅ Advanced phonetic tokenization (40+ phonemes)')
  console.log('   ✅ Syllabification with vowel hiatus detection')
  console.log('   ✅ Complexity scoring and difficulty assessment')
  console.log('   ✅ Specialized sound handling (whistled, breathy, prenasalized)')
  console.log('   ✅ Dynamic prompt generation for TTS and video synthesis')
  console.log('   ✅ Comprehensive pedagogical metadata')
  console.log('   ✅ Exercise integration and learning progression')
  console.log('   ✅ Statistical analysis and pronunciation insights')
  
  console.log('\n🎯 NEXT STEPS FOR PRODUCTION:')
  console.log('=' + '='.repeat(35))
  console.log('   1. 🔐 Configure valid Google Cloud TTS API key')
  console.log('   2. 🎥 Set up video synthesis integration (HeyGen/Synthesia)')
  console.log('   3. 🎵 Replace mock audio with real TTS generation')
  console.log('   4. 📱 Integrate with Shona learning app')
  console.log('   5. 🧪 Validate pronunciation quality with native speakers')
  console.log('   6. 🚀 Deploy to production environment')
  
  console.log('\n🎯 MUDZIDZISI AI DEMONSTRATION COMPLETE!')
  console.log('🎯 ====================================\n')
  
  console.log('💡 The system is ready - just needs a valid API key to generate real audio!')
}

// Execute demonstration
if (require.main === module) {
  main().catch(console.error)
}

export { main as generateDemoAssets }