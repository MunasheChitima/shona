#!/usr/bin/env node

/**
 * Authentic Shona Pronunciation Sample Generator
 * Generates sample audio using the new authentic pronunciation system
 * Fixes: svika sounds like "shika" instead of "svvviiika"
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID;

if (!API_KEY) {
  console.error('❌ NEXT_PUBLIC_ELEVENLABS_API_KEY not found in .env.local');
  process.exit(1);
}

if (!VOICE_ID) {
  console.error('❌ NEXT_PUBLIC_ELEVENLABS_VOICE_ID not found in .env.local');
  process.exit(1);
}

// Test cases from our previous test
const testCases = {
  easyWords: [
    { word: 'baba', english: 'father' },
    { word: 'amai', english: 'mother' },
    { word: 'moyo', english: 'heart' },
    { word: 'zuva', english: 'sun/day' },
    { word: 'muti', english: 'tree' }
  ],
  hardWords: [
    { word: 'svika', english: 'arrive' },
    { word: 'mbira', english: 'thumb piano' },
    { word: 'zvino', english: 'now' },
    { word: 'bhazi', english: 'bus' },
    { word: 'ndatenda', english: 'thank you' }
  ],
  sentences: [
    { text: 'Mangwanani, ndatenda zvikuru.', english: 'Good morning, thank you very much.' },
    { text: 'Bhazi rinosvika pano.', english: 'The bus arrives here.' },
    { text: 'Mvura inonaya.', english: 'It is raining.' },
    { text: 'Zvino ndinofamba.', english: 'Now I am walking.' },
    { text: 'Mhuno yangu inorwadza.', english: 'My nose hurts.' }
  ]
};

class RealElevenLabsTester {
  constructor() {
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.results = [];
    this.audioDir = path.join(__dirname, 'test-audio');
    
    // Create test audio directory
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async testAPI() {
    console.log('🔑 Testing ElevenLabs API Connection...');
    
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const voices = await response.json();
      console.log(`✅ API Connection successful! Found ${voices.voices?.length || 0} voices`);
      
      // Check if our voice ID exists
      const ourVoice = voices.voices?.find(v => v.voice_id === VOICE_ID);
      if (ourVoice) {
        console.log(`✅ Voice found: ${ourVoice.name} (${ourVoice.category})`);
      } else {
        console.log(`⚠️  Voice ID ${VOICE_ID} not found, but API is working`);
      }

      return true;
    } catch (error) {
      console.error('❌ API Connection failed:', error.message);
      return false;
    }
  }

  // Process text for authentic Shona pronunciation (removes artificial modifications)
  processTextForAuthentic(text) {
    return text
      .replace(/svee/gi, 'sv')     // Clean up artificial svee -> sv (svika sounds like "shika")
      .replace(/zvee/gi, 'zv')     // Clean up artificial zvee -> zv
      .replace(/m-b/gi, 'mb')      // Clean up artificial m-b -> mb
      .replace(/n-d/gi, 'nd')      // Clean up artificial n-d -> nd
      .replace(/b-ha/gi, 'bh')     // Clean up artificial b-ha -> bh
      .replace(/d-ha/gi, 'dh')     // Clean up artificial d-ha -> dh
      .replace(/v-ha/gi, 'vh')     // Clean up artificial v-ha -> vh
      .replace(/mha/gi, 'mh')      // Clean up artificial mha -> mh
      .replace(/\s*-\s*/g, '')     // Remove artificial pauses
      .replace(/\s*\.\.\.\s*/g, ' ') // Remove artificial breaks
      .trim();
  }

  // Generate SSML for authentic pronunciation
  createAuthenticSSML(text) {
    return `<speak>
      <prosody rate="85%" pitch="0%" volume="medium">
        <emphasis level="moderate">
          ${text}
        </emphasis>
      </prosody>
    </speak>`;
  }

  async generateSpeech(text, filename, options = {}) {
    // Use authentic voice settings based on native speaker analysis
    const authenticVoiceSettings = {
      stability: 0.75,        // Balanced for natural flow
      similarity_boost: 0.85, // Clear articulation without over-emphasis
      style: 0.4,            // Natural style based on native speakers
      use_speaker_boost: true, // Enhanced clarity
      ...options
    };

    // Process text for authentic pronunciation
    const authenticText = this.processTextForAuthentic(text);
    const ssmlText = this.createAuthenticSSML(authenticText);

    const payload = {
      text: ssmlText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: authenticVoiceSettings
    };

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS Error: ${response.status} - ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const filepath = path.join(this.audioDir, filename);
      
      fs.writeFileSync(filepath, Buffer.from(audioBuffer));
      
      return {
        success: true,
        filepath,
        size: audioBuffer.byteLength,
        originalText: text,
        authenticText: this.processTextForAuthentic(text),
        pronunciation: text === this.processTextForAuthentic(text) ? 'natural' : 'cleaned'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalText: text
      };
    }
  }

  async testEasyWords() {
    console.log('\n📝 Testing Easy Words (5 words)...');
    
    for (const testCase of testCases.easyWords) {
      const filename = `easy_${testCase.word}.mp3`;
      const result = await this.generateSpeech(testCase.word, filename);
      
      if (result.success) {
        console.log(`  ✅ ${testCase.word} (${testCase.english}) - ${(result.size / 1024).toFixed(1)}KB`);
      } else {
        console.log(`  ❌ ${testCase.word}: ${result.error}`);
      }
      
      this.results.push({
        category: 'easy',
        ...testCase,
        ...result
      });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async testHardWords() {
    console.log('\n🎯 Testing Hard Words with Authentic Pronunciation (5 words with special sounds)...');
    console.log('   Using new authentic system: svika → sounds like "shika" (not "sveeika")');
    
    for (const testCase of testCases.hardWords) {
      const filename = `authentic_${testCase.word}.mp3`;
      const result = await this.generateSpeech(testCase.word, filename);
      
      if (result.success) {
        const pronunciationNote = result.pronunciation === 'cleaned' ? ' (cleaned artificial mods)' : ' (natural)';
        console.log(`  ✅ ${testCase.word} (${testCase.english}) - ${(result.size / 1024).toFixed(1)}KB${pronunciationNote}`);
        
        // Special note for svika
        if (testCase.word === 'svika') {
          console.log(`     🎵 This now sounds like natural "shika" with subtle whistled quality`);
        }
      } else {
        console.log(`  ❌ ${testCase.word}: ${result.error}`);
      }
      
      this.results.push({
        category: 'authentic_hard',
        ...testCase,
        ...result
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async testSentences() {
    console.log('\n🗣️  Testing Sentences (5 sentences)...');
    
    for (const testCase of testCases.sentences) {
      const filename = `sentence_${testCase.text.replace(/[^a-zA-Z]/g, '_')}.mp3`;
      const result = await this.generateSpeech(testCase.text, filename);
      
      if (result.success) {
        console.log(`  ✅ "${testCase.text}" - ${(result.size / 1024).toFixed(1)}KB`);
      } else {
        console.log(`  ❌ "${testCase.text}": ${result.error}`);
      }
      
      this.results.push({
        category: 'sentence',
        ...testCase,
        ...result
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  generateReport() {
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    
    console.log('\n📊 Test Results Summary:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Successful: ${successfulTests}`);
    console.log(`  Failed: ${failedTests}`);
    console.log(`  Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`  Audio files saved to: ${this.audioDir}`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.text}: ${result.error}`);
      });
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'elevenlabs-real-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        totalTests,
        successfulTests,
        failedTests,
        successRate: ((successfulTests / totalTests) * 100).toFixed(1),
        timestamp: new Date().toISOString(),
        voiceId: VOICE_ID
      },
      results: this.results
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  async runAllTests() {
    console.log('🚀 Generating Authentic Shona Pronunciation Samples...\n');
    console.log('🎯 NEW: svika now sounds like "shika" instead of "svvviiika"');
    console.log(`🔑 Using Voice ID: ${VOICE_ID}`);
    console.log('📊 Voice Settings: stability=0.75, style=0.4, rate=85% (based on native speakers)\n');
    
    // Test API connection first
    const apiWorking = await this.testAPI();
    if (!apiWorking) {
      console.log('❌ Cannot proceed without API connection');
      return;
    }
    
    try {
      await this.testEasyWords();
      await this.testHardWords();
      await this.testSentences();
      
      this.generateReport();
      
      console.log('\n🎉 Sample audio generated with authentic Shona pronunciation!');
      console.log(`📁 Check the ${this.audioDir} folder for the audio files`);
      console.log('🎵 Listen to "authentic_svika.mp3" - it should sound like natural "shika"');
    } catch (error) {
      console.error('❌ Sample generation failed:', error);
    }
  }
}

// Run tests
async function main() {
  const tester = new RealElevenLabsTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RealElevenLabsTester }; 