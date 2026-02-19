#!/usr/bin/env node

/**
 * Natural ElevenLabs Pronunciation
 * Uses natural flow without artificial pauses or SSML modifications
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

class NaturalElevenLabsPronunciation {
  constructor() {
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.results = [];
    this.audioDir = path.join(__dirname, 'natural-audio');
    
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  // Generate speech with natural pronunciation (no artificial modifications)
  async generateNaturalSpeech(text, filename, options = {}) {
    const voiceSettings = {
      stability: 0.75,        // Balanced stability
      similarity_boost: 0.85, // Good clarity
      style: 0.4,            // Natural style
      use_speaker_boost: true,
      ...options
    };

    // Use natural text without SSML modifications
    const payload = {
      text: text, // Use original text as-is
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings
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
        duration: await this.getAudioDuration(filepath)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalText: text
      };
    }
  }

  // Get audio duration using ffprobe (if available)
  async getAudioDuration(filepath) {
    try {
      const output = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filepath}"`, { encoding: 'utf8' });
      return parseFloat(output.trim());
    } catch (error) {
      // ffprobe not available, estimate based on file size
      const stats = fs.statSync(filepath);
      return (stats.size / 16000) * 8; // Rough estimate
    }
  }

  // Test natural pronunciation
  async testNaturalPronunciation() {
    console.log('🎯 Testing Natural Pronunciation (No Artificial Modifications)...\n');
    
    const testWords = [
      { word: 'svika', english: 'arrive', expected: 'Natural whistled sibilant' },
      { word: 'zvino', english: 'now', expected: 'Natural whistled sibilant' },
      { word: 'mbira', english: 'thumb piano', expected: 'Natural prenasalized consonant' },
      { word: 'ndatenda', english: 'thank you', expected: 'Natural prenasalized consonants' },
      { word: 'bhazi', english: 'bus', expected: 'Natural breathy consonant' },
      { word: 'mangwanani', english: 'good morning', expected: 'Natural complex word' }
    ];

    for (const testCase of testWords) {
      console.log(`Testing: ${testCase.word} (${testCase.english})`);
      
      const filename = `natural_${testCase.word}.mp3`;
      const result = await this.generateNaturalSpeech(testCase.word, filename);
      
      if (result.success) {
        console.log(`  ✅ Generated: ${(result.size / 1024).toFixed(1)}KB`);
        console.log(`  ⏱️  Duration: ${result.duration?.toFixed(2) || 'unknown'}s`);
        console.log(`  🎵 Natural flow: ${result.originalText}`);
        
        this.results.push({
          ...testCase,
          ...result
        });
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
        this.results.push({
          ...testCase,
          ...result
        });
      }
      
      console.log('');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Generate comparison with previous attempts
  generateComparisonReport() {
    console.log('📊 Natural Pronunciation Report\n');
    
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%\n`);
    
    console.log('Key Differences from Previous Attempts:');
    console.log('  ✅ No artificial pauses or SSML modifications');
    console.log('  ✅ Natural text flow maintained');
    console.log('  ✅ Balanced voice settings for authenticity');
    console.log('  ✅ Let ElevenLabs handle pronunciation naturally\n');
    
    console.log('Detailed Results:');
    this.results.forEach(result => {
      if (result.success) {
        console.log(`\n${result.word} (${result.english}):`);
        console.log(`  Text: ${result.originalText}`);
        console.log(`  Duration: ${result.duration?.toFixed(2) || 'unknown'}s`);
        console.log(`  Size: ${(result.size / 1024).toFixed(1)}KB`);
      }
    });
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'natural-pronunciation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        totalTests,
        successfulTests,
        successRate: ((successfulTests / totalTests) * 100).toFixed(1),
        timestamp: new Date().toISOString(),
        approach: 'natural_flow_no_modifications',
        voiceSettings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.4,
          use_speaker_boost: true
        }
      },
      results: this.results
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    console.log(`🎵 Audio files saved to: ${this.audioDir}`);
  }

  async runNaturalTests() {
    console.log('🚀 Starting Natural ElevenLabs Pronunciation Tests...\n');
    console.log('Key Approach:');
    console.log('  • No artificial pauses or SSML modifications');
    console.log('  • Natural text flow maintained');
    console.log('  • Balanced voice settings for authenticity');
    console.log('  • Let ElevenLabs handle pronunciation naturally\n');
    
    try {
      await this.testNaturalPronunciation();
      this.generateComparisonReport();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    }
  }
}

// Run natural tests
async function main() {
  const natural = new NaturalElevenLabsPronunciation();
  await natural.runNaturalTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NaturalElevenLabsPronunciation }; 