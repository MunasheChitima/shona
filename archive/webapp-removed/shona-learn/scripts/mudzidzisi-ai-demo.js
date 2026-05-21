#!/usr/bin/env node
/**
 * Mudzidzisi AI Demonstration Script
 * 
 * This script demonstrates the complete workflow of the Shona Pronunciation AI Agent
 * from phonetic analysis through asset generation.
 * 
 * Usage: node mudzidzisi-ai-demo.js [command] [options]
 */

const { autonomousGenerationAgent, processVocabulary, processCategoryWords, processComplexWords, getGlobalStatistics, exportGenerationReport } = require('../lib/autonomous-generation-agent')
const { mudzidzisiAI, processWord } = require('../lib/mudzidzisi-ai')
const { assetGenerationPipeline } = require('../lib/asset-generation-pipeline')
const fs = require('fs').promises
const path = require('path')

// Demo configuration
const DEMO_WORDS = [
  { word: 'bhazi', english: 'bus', category: 'Transport', difficulty: 3 },
  { word: 'svika', english: 'arrive', category: 'Movement', difficulty: 4 },
  { word: 'zvino', english: 'now', category: 'Time', difficulty: 3 },
  { word: 'tsvaira', english: 'drive', category: 'Action', difficulty: 5 },
  { word: 'kuudza', english: 'to tell', category: 'Communication', difficulty: 4 },
  { word: 'mbira', english: 'thumb piano', category: 'Music', difficulty: 3 },
  { word: 'ndimi', english: 'you (plural)', category: 'Pronouns', difficulty: 3 },
  { word: 'ngoma', english: 'drum', category: 'Music', difficulty: 3 },
  { word: 'mangwanani', english: 'good morning', category: 'Greetings', difficulty: 2 },
  { word: 'dzvinyu', english: 'watermelon', category: 'Food', difficulty: 5 }
]

class MudzidzisiAIDemo {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'demo-output')
    this.ensureOutputDir()
  }

  async ensureOutputDir() {
    try {
      await fs.access(this.outputDir)
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true })
    }
  }

  /**
   * Display welcome message and system information
   */
  displayWelcome() {
    console.log('🎯 ======================================')
    console.log('🎯 Mudzidzisi AI - Shona Pronunciation AI Agent')
    console.log('🎯 Version 2.0 - Autonomous Generation System')
    console.log('🎯 ======================================')
    console.log()
    console.log('📋 This demonstration showcases:')
    console.log('   ✓ Advanced phonetic analysis with longest-match-first parsing')
    console.log('   ✓ Comprehensive IPA transcription and articulation instructions')
    console.log('   ✓ Dynamic prompt generation for TTS and video synthesis')
    console.log('   ✓ Complete asset generation workflow')
    console.log('   ✓ Autonomous batch processing capabilities')
    console.log()
  }

  /**
   * Demonstrate phonetic analysis for a single word
   */
  async demonstratePhoneticAnalysis(word) {
    console.log(`🔍 PHONETIC ANALYSIS DEMONSTRATION: "${word}"`)
    console.log('=' + '='.repeat(50))
    
    const analysis = processWord(word)
    
    console.log('📝 STAGE 1: Phonetic Tokenization')
    console.log(`   Input word: ${word}`)
    console.log(`   Tokens: [${analysis.profile.tokens.join(', ')}]`)
    console.log(`   Precedence applied: Longest-match-first`)
    console.log()
    
    console.log('📝 STAGE 2: Syllabification & Profiling')
    console.log(`   Syllables: ${analysis.profile.syllables.join(' - ')}`)
    console.log(`   Vowel Hiatus: ${analysis.profile.vowelHiatus ? 'Yes' : 'No'}`)
    console.log(`   Global Rules: ${analysis.profile.global_rules.join(', ')}`)
    console.log()
    
    console.log('📝 DETAILED PHONETIC PROFILE:')
    analysis.profile.phonetic_profile.forEach((phoneme, index) => {
      console.log(`   ${index + 1}. Token: '${phoneme.token}' [${phoneme.ipa}]`)
      console.log(`      Type: ${phoneme.type}`)
      console.log(`      Category: ${phoneme.category}`)
      console.log(`      Instructions: ${phoneme.instructions}`)
      if (phoneme.antiPatterns.length > 0) {
        console.log(`      Anti-patterns: ${phoneme.antiPatterns.join(' ')}`)
      }
      console.log()
    })
    
    console.log('📝 STAGE 3: Prompt Generation')
    console.log('   Audio TTS Prompt Preview:')
    console.log(`   "${analysis.audioPrompt.prompt.substring(0, 150)}..."`)
    console.log()
    console.log('   Video Synthesis Prompt Preview:')
    console.log(`   "${analysis.videoPrompt.prompt.substring(0, 150)}..."`)
    console.log()
    
    console.log('📊 COMPLEXITY ANALYSIS:')
    console.log(`   Complexity Score: ${analysis.metadata.complexity}`)
    console.log(`   Processing Time: ${Date.now() - analysis.metadata.processingTimestamp.getTime()}ms`)
    console.log()
    
    return analysis
  }

  /**
   * Demonstrate the complete asset generation workflow
   */
  async demonstrateAssetGeneration() {
    console.log('🎨 ASSET GENERATION DEMONSTRATION')
    console.log('=' + '='.repeat(50))
    
    // Select a complex word for demonstration
    const demoWord = DEMO_WORDS.find(w => w.word === 'tsvaira')
    console.log(`Selected word: ${demoWord.word} (${demoWord.english})`)
    console.log()
    
    try {
      const result = await autonomousGenerationAgent.processSingleWord(demoWord)
      
      console.log('✅ Asset Generation Results:')
      console.log(`   Audio file: ${result.assets.audio}`)
      console.log(`   Video file: ${result.assets.video}`)
      if (result.assets.profileVideo) {
        console.log(`   Profile video: ${result.assets.profileVideo}`)
      }
      console.log(`   Processing time: ${result.metadata.processingTime}ms`)
      console.log()
      
      return result
    } catch (error) {
      console.error('❌ Asset generation failed:', error.message)
      console.log('   Note: This is expected in demo mode without API keys')
      console.log()
      return null
    }
  }

  /**
   * Demonstrate batch processing capabilities
   */
  async demonstrateBatchProcessing() {
    console.log('🚀 BATCH PROCESSING DEMONSTRATION')
    console.log('=' + '='.repeat(50))
    
    // Create a small batch job
    const batchWords = DEMO_WORDS.slice(0, 5)
    console.log(`Creating batch job with ${batchWords.length} words:`)
    batchWords.forEach((word, index) => {
      console.log(`   ${index + 1}. ${word.word} (${word.english})`)
    })
    console.log()
    
    try {
      const jobId = await autonomousGenerationAgent.createGenerationJob(batchWords)
      console.log(`Job created with ID: ${jobId}`)
      
      // Note: We won't actually execute the job in demo mode
      console.log('📝 Job execution skipped in demo mode')
      console.log('   In production, this would:')
      console.log('   ✓ Process each word through phonetic analysis')
      console.log('   ✓ Generate TTS and video synthesis prompts')
      console.log('   ✓ Create audio and video assets')
      console.log('   ✓ Log all results and statistics')
      console.log()
      
      return jobId
    } catch (error) {
      console.error('❌ Batch processing setup failed:', error.message)
      return null
    }
  }

  /**
   * Demonstrate phoneme analysis across multiple words
   */
  async demonstratePhonemeAnalysis() {
    console.log('🧬 PHONEME ANALYSIS DEMONSTRATION')
    console.log('=' + '='.repeat(50))
    
    const phonemeUsage = {}
    const complexityDistribution = {}
    
    console.log('Analyzing phoneme usage across demo vocabulary:')
    
    DEMO_WORDS.forEach(wordData => {
      const analysis = processWord(wordData.word)
      
      // Count phoneme usage
      analysis.profile.tokens.forEach(token => {
        phonemeUsage[token] = (phonemeUsage[token] || 0) + 1
      })
      
      // Track complexity
      const range = this.getComplexityRange(analysis.metadata.complexity)
      complexityDistribution[range] = (complexityDistribution[range] || 0) + 1
      
      console.log(`   ${wordData.word}: [${analysis.profile.tokens.join(', ')}] (complexity: ${analysis.metadata.complexity})`)
    })
    
    console.log()
    console.log('📊 PHONEME USAGE STATISTICS:')
    Object.entries(phonemeUsage)
      .sort(([,a], [,b]) => b - a)
      .forEach(([phoneme, count]) => {
        const phonemeInfo = mudzidzisiAI.getPhonemeReference(phoneme)
        console.log(`   ${phoneme}: ${count} occurrences (${phonemeInfo?.type || 'Unknown'})`)
      })
    
    console.log()
    console.log('📊 COMPLEXITY DISTRIBUTION:')
    Object.entries(complexityDistribution).forEach(([range, count]) => {
      console.log(`   ${range}: ${count} words`)
    })
    console.log()
  }

  /**
   * Demonstrate specialized sound categories
   */
  async demonstrateSpecializedSounds() {
    console.log('🎵 SPECIALIZED SOUND CATEGORIES')
    console.log('=' + '='.repeat(50))
    
    const categories = {
      'Whistled Sounds': ['svika', 'zvino', 'tsvaira'],
      'Implosive Sounds': ['bhazi', 'ndimi'],
      'Prenasalized Sounds': ['mbira', 'ndimi', 'ngoma'],
      'Vowel Hiatus': ['kuudza']
    }
    
    for (const [category, words] of Object.entries(categories)) {
      console.log(`🔊 ${category}:`)
      
      for (const word of words) {
        const analysis = processWord(word)
        const specialFeatures = this.identifySpecialFeatures(analysis.profile)
        
        console.log(`   ${word}:`)
        console.log(`     Syllables: ${analysis.profile.syllables.join('-')}`)
        console.log(`     Features: ${specialFeatures.join(', ')}`)
        console.log(`     Complexity: ${analysis.metadata.complexity}`)
        console.log()
      }
    }
  }

  /**
   * Identify special phonetic features
   */
  identifySpecialFeatures(profile) {
    const features = []
    
    if (profile.vowelHiatus) features.push('Vowel Hiatus')
    if (profile.global_rules.includes('EVEN_STRESS')) features.push('Even Stress')
    
    const categories = profile.phonetic_profile.map(p => p.category)
    if (categories.includes('whistled')) features.push('Whistled Sounds')
    if (categories.includes('implosive')) features.push('Implosive Sounds')
    if (categories.includes('prenasalized')) features.push('Prenasalized Sounds')
    if (categories.includes('breathy')) features.push('Breathy Voice')
    
    return features.length > 0 ? features : ['Standard Articulation']
  }

  /**
   * Get complexity range for display
   */
  getComplexityRange(complexity) {
    if (complexity <= 5) return 'Low (1-5)'
    if (complexity <= 10) return 'Medium (6-10)'
    if (complexity <= 15) return 'High (11-15)'
    return 'Very High (16+)'
  }

  /**
   * Export demonstration results
   */
  async exportDemoResults() {
    console.log('📄 EXPORTING DEMONSTRATION RESULTS')
    console.log('=' + '='.repeat(50))
    
    const demoResults = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      demoWords: DEMO_WORDS,
      analyses: {},
      statistics: {
        totalWords: DEMO_WORDS.length,
        averageComplexity: 0,
        phonemeUsage: {},
        categoryDistribution: {}
      }
    }
    
    // Generate analysis for each demo word
    let totalComplexity = 0
    DEMO_WORDS.forEach(wordData => {
      const analysis = processWord(wordData.word)
      demoResults.analyses[wordData.word] = {
        profile: analysis.profile,
        complexity: analysis.metadata.complexity,
        audioPromptPreview: analysis.audioPrompt.prompt.substring(0, 200),
        videoPromptPreview: analysis.videoPrompt.prompt.substring(0, 200)
      }
      
      totalComplexity += analysis.metadata.complexity
      
      // Count phonemes
      analysis.profile.tokens.forEach(token => {
        demoResults.statistics.phonemeUsage[token] = (demoResults.statistics.phonemeUsage[token] || 0) + 1
      })
      
      // Count categories
      const category = wordData.category
      demoResults.statistics.categoryDistribution[category] = (demoResults.statistics.categoryDistribution[category] || 0) + 1
    })
    
    demoResults.statistics.averageComplexity = totalComplexity / DEMO_WORDS.length
    
    const exportPath = path.join(this.outputDir, 'mudzidzisi-ai-demo-results.json')
    await fs.writeFile(exportPath, JSON.stringify(demoResults, null, 2))
    
    console.log(`✅ Demo results exported to: ${exportPath}`)
    console.log()
    
    return exportPath
  }

  /**
   * Run the complete demonstration
   */
  async runCompleteDemo() {
    this.displayWelcome()
    
    console.log('🎬 STARTING COMPREHENSIVE DEMONSTRATION')
    console.log('=' + '='.repeat(50))
    console.log()
    
    // 1. Phonetic Analysis Demo
    await this.demonstratePhoneticAnalysis('bhazi')
    await this.demonstratePhoneticAnalysis('tsvaira')
    await this.demonstratePhoneticAnalysis('kuudza')
    
    // 2. Asset Generation Demo
    await this.demonstrateAssetGeneration()
    
    // 3. Batch Processing Demo
    await this.demonstrateBatchProcessing()
    
    // 4. Phoneme Analysis Demo
    await this.demonstratePhonemeAnalysis()
    
    // 5. Specialized Sounds Demo
    await this.demonstrateSpecializedSounds()
    
    // 6. Export Results
    await this.exportDemoResults()
    
    console.log('🎉 DEMONSTRATION COMPLETE!')
    console.log('=' + '='.repeat(50))
    console.log()
    console.log('📋 Summary:')
    console.log('   ✅ Phonetic analysis system demonstrated')
    console.log('   ✅ Asset generation workflow showcased')
    console.log('   ✅ Batch processing capabilities shown')
    console.log('   ✅ Specialized sound handling explained')
    console.log('   ✅ Results exported for review')
    console.log()
    console.log('🔧 Next Steps:')
    console.log('   1. Configure API keys for TTS and video synthesis')
    console.log('   2. Run production batch processing')
    console.log('   3. Integrate with learning management system')
    console.log('   4. Monitor asset generation quality')
    console.log()
  }

  /**
   * Run interactive demo mode
   */
  async runInteractiveDemo() {
    console.log('🎮 INTERACTIVE DEMONSTRATION MODE')
    console.log('=' + '='.repeat(50))
    console.log()
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const askQuestion = (question) => new Promise(resolve => {
      readline.question(question, resolve)
    })
    
    try {
      while (true) {
        console.log('Available commands:')
        console.log('  1. Analyze word')
        console.log('  2. Show phoneme reference')
        console.log('  3. Generate prompts')
        console.log('  4. Show statistics')
        console.log('  5. Exit')
        console.log()
        
        const choice = await askQuestion('Enter your choice (1-5): ')
        
        switch (choice) {
          case '1':
            const word = await askQuestion('Enter a Shona word to analyze: ')
            await this.demonstratePhoneticAnalysis(word)
            break
            
          case '2':
            const phoneme = await askQuestion('Enter phoneme to look up: ')
            const info = mudzidzisiAI.getPhonemeReference(phoneme)
            if (info) {
              console.log(`📝 ${phoneme} [${info.ipa}]: ${info.instructions}`)
              if (info.antiPatterns.length > 0) {
                console.log(`❌ Avoid: ${info.antiPatterns.join(' ')}`)
              }
            } else {
              console.log(`❌ Phoneme '${phoneme}' not found in reference table`)
            }
            console.log()
            break
            
          case '3':
            const promptWord = await askQuestion('Enter word for prompt generation: ')
            const analysis = processWord(promptWord)
            console.log('🎵 Audio Prompt:')
            console.log(analysis.audioPrompt.prompt)
            console.log()
            console.log('🎬 Video Prompt:')
            console.log(analysis.videoPrompt.prompt)
            console.log()
            break
            
          case '4':
            await this.demonstratePhonemeAnalysis()
            break
            
          case '5':
            console.log('👋 Goodbye!')
            readline.close()
            return
            
          default:
            console.log('❌ Invalid choice. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error in interactive mode:', error)
      readline.close()
    }
  }
}

// Main execution
if (require.main === module) {
  const demo = new MudzidzisiAIDemo()
  
  const args = process.argv.slice(2)
  const command = args[0] || 'demo'
  
  switch (command) {
    case 'demo':
      demo.runCompleteDemo()
      break
      
    case 'interactive':
      demo.runInteractiveDemo()
      break
      
    case 'word':
      if (args[1]) {
        demo.demonstratePhoneticAnalysis(args[1])
      } else {
        console.log('Usage: node mudzidzisi-ai-demo.js word <shona-word>')
      }
      break
      
    default:
      console.log('Available commands:')
      console.log('  demo - Run complete demonstration')
      console.log('  interactive - Run interactive mode')
      console.log('  word <word> - Analyze specific word')
      console.log()
      console.log('Example: node mudzidzisi-ai-demo.js word bhazi')
  }
}

module.exports = MudzidzisiAIDemo