#!/usr/bin/env node

/**
 * ElevenLabs Pronunciation Improvement Tool
 * Addresses speed issues and pronunciation accuracy for Shona words
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const VOICE_ID = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID;

if (!API_KEY) {
  console.error('❌ NEXT_PUBLIC_ELEVENLABS_API_KEY not found in .env.local');
  process.exit(1);
}

// Enhanced pronunciation mappings for better ElevenLabs handling
const pronunciationImprovements = {
  // Whistled sibilants - add pauses and emphasis
  'sv': 's...v', // Add pause between s and v
  'zv': 'z...v', // Add pause between z and v
  'tsv': 't...s...v', // Add pauses for clarity
  'dzv': 'd...z...v',
  
  // Prenasalized consonants - longer nasal sound
  'mb': 'm...b', // Longer nasal sound
  'nd': 'n...d', // Longer nasal sound
  'ng': 'n...g', // Longer nasal sound
  'nj': 'n...j', // Longer nasal sound
  'nz': 'n...z', // Longer nasal sound
  'mv': 'm...v', // Longer nasal sound
  
  // Breathy consonants - add breath sound
  'bh': 'b...h', // Add breath sound
  'dh': 'd...h', // Add breath sound
  'vh': 'v...h', // Add breath sound
  'mh': 'm...h', // Add breath sound
  
  // Labialized consonants - emphasize lip rounding
  'gw': 'g...w', // Emphasize w sound
  'kw': 'k...w', // Emphasize w sound
  'ngw': 'n...g...w', // Combined nasal + labialized
  'mw': 'm...w', // Emphasize w sound
  'rw': 'r...w', // Emphasize w sound
};

// Words that need special handling
const specialWords = {
  'svika': 's...vi...ka', // Break down whistled sibilant
  'zvino': 'z...vi...no', // Break down whistled sibilant
  'zvakanaka': 'z...va...ka...na...ka', // Multiple breaks
  'svondo': 's...vo...ndo', // Break down whistled sibilant
  'mbira': 'm...bi...ra', // Longer nasal sound
  'ndatenda': 'n...da...ten...da', // Multiple nasal sounds
  'bhazi': 'b...ha...zi', // Emphasize breathy sound
  'mhuno': 'm...hu...no', // Emphasize breathy sound
  'mangwanani': 'ma...ngwa...na...ni', // Break down complex word
  'ndimi': 'n...di...mi', // Emphasize nasal sound
};

class PronunciationImprover {
  constructor() {
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.results = [];
    this.audioDir = path.join(__dirname, 'improved-audio');
    
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  // Improve text pronunciation with better spacing and emphasis
  improvePronunciation(text) {
    let improved = text.toLowerCase();
    
    // Apply special word handling first
    for (const [word, improvedWord] of Object.entries(specialWords)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      improved = improved.replace(regex, improvedWord);
    }
    
    // Apply general pronunciation improvements
    for (const [pattern, replacement] of Object.entries(pronunciationImprovements)) {
      const regex = new RegExp(pattern, 'gi');
      improved = improved.replace(regex, replacement);
    }
    
    // Add SSML for better control
    return this.addSSMLControls(improved, text);
  }

  // Add SSML controls for speed, pitch, and emphasis
  addSSMLControls(improvedText, originalText) {
    // Slow down the speech by 25% (rate="75%")
    // Lower pitch slightly for clearer pronunciation
    // Add emphasis on special sounds
    return `<speak>
      <prosody rate="75%" pitch="-10%" volume="loud">
        <emphasis level="strong">
          ${improvedText}
        </emphasis>
      </prosody>
    </speak>`;
  }

  // Generate speech with improved pronunciation
  async generateImprovedSpeech(text, filename, options = {}) {
    const improvedText = this.improvePronunciation(text);
    
    const voiceSettings = {
      stability: 0.85,        // Higher stability for consistent pronunciation
      similarity_boost: 0.9,  // Higher similarity for clearer articulation
      style: 0.1,            // Lower style for clearer pronunciation
      use_speaker_boost: true,
      ...options
    };

    const payload = {
      text: improvedText,
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
        improvedText: improvedText,
        duration: await this.getAudioDuration(filepath)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalText: text,
        improvedText: improvedText
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

  // Analyze pronunciation quality
  analyzePronunciation(text, audioFilepath) {
    const analysis = {
      text: text,
      audioFile: audioFilepath,
      issues: [],
      suggestions: [],
      score: 100
    };

    // Check for problematic patterns
    const problematicPatterns = [
      { pattern: /sv|zv/, issue: 'Whistled sibilants may need more emphasis' },
      { pattern: /mb|nd|ng/, issue: 'Prenasalized consonants may need longer nasal sound' },
      { pattern: /bh|dh|vh/, issue: 'Breathy consonants may need more breath emphasis' }
    ];

    for (const { pattern, issue } of problematicPatterns) {
      if (pattern.test(text)) {
        analysis.issues.push(issue);
        analysis.score -= 10;
      }
    }

    // Add suggestions based on word complexity
    if (text.length > 8) {
      analysis.suggestions.push('Consider breaking down longer words with pauses');
    }

    if (/[aeiou]{3,}/.test(text)) {
      analysis.suggestions.push('Multiple vowels may need slower pronunciation');
    }

    return analysis;
  }

  // Test improved pronunciation
  async testImprovedPronunciation() {
    console.log('🎯 Testing Improved Pronunciation...\n');
    
    const testWords = [
      { word: 'svika', english: 'arrive', expected: 'Clear whistled sibilant' },
      { word: 'zvino', english: 'now', expected: 'Clear whistled sibilant' },
      { word: 'mbira', english: 'thumb piano', expected: 'Clear prenasalized consonant' },
      { word: 'ndatenda', english: 'thank you', expected: 'Clear prenasalized consonants' },
      { word: 'bhazi', english: 'bus', expected: 'Clear breathy consonant' },
      { word: 'mangwanani', english: 'good morning', expected: 'Clear complex word' }
    ];

    for (const testCase of testWords) {
      console.log(`Testing: ${testCase.word} (${testCase.english})`);
      
      const filename = `improved_${testCase.word}.mp3`;
      const result = await this.generateImprovedSpeech(testCase.word, filename);
      
      if (result.success) {
        const analysis = this.analyzePronunciation(testCase.word, result.filepath);
        
        console.log(`  ✅ Generated: ${(result.size / 1024).toFixed(1)}KB`);
        console.log(`  ⏱️  Duration: ${result.duration?.toFixed(2) || 'unknown'}s`);
        console.log(`  📊 Score: ${analysis.score}/100`);
        
        if (analysis.issues.length > 0) {
          console.log(`  ⚠️  Issues: ${analysis.issues.join(', ')}`);
        }
        
        if (analysis.suggestions.length > 0) {
          console.log(`  💡 Suggestions: ${analysis.suggestions.join(', ')}`);
        }
        
        this.results.push({
          ...testCase,
          ...result,
          analysis
        });
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
        this.results.push({
          ...testCase,
          ...result
        });
      }
      
      console.log('');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay
    }
  }

  // Generate comparison report
  generateComparisonReport() {
    console.log('📊 Pronunciation Improvement Report\n');
    
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%\n`);
    
    console.log('Detailed Results:');
    this.results.forEach(result => {
      if (result.success) {
        console.log(`\n${result.word} (${result.english}):`);
        console.log(`  Original: ${result.originalText}`);
        console.log(`  Improved: ${result.improvedText}`);
        console.log(`  Duration: ${result.duration?.toFixed(2) || 'unknown'}s`);
        console.log(`  Score: ${result.analysis?.score || 'N/A'}/100`);
      }
    });
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'pronunciation-improvement-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        totalTests,
        successfulTests,
        successRate: ((successfulTests / totalTests) * 100).toFixed(1),
        timestamp: new Date().toISOString(),
        improvements: {
          speedReduction: '25% (rate="75%")',
          pitchAdjustment: '-10% for clarity',
          emphasis: 'Strong emphasis on special sounds',
          pauses: 'Added pauses between complex sounds'
        }
      },
      results: this.results
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    console.log(`🎵 Audio files saved to: ${this.audioDir}`);
  }

  async runImprovementTests() {
    console.log('🚀 Starting Pronunciation Improvement Tests...\n');
    console.log('Key Improvements:');
    console.log('  • 25% slower speech rate');
    console.log('  • Added pauses between complex sounds');
    console.log('  • Stronger emphasis on special Shona sounds');
    console.log('  • Lower pitch for clearer pronunciation');
    console.log('  • SSML controls for better articulation\n');
    
    try {
      await this.testImprovedPronunciation();
      this.generateComparisonReport();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    }
  }
}

// Run improvement tests
async function main() {
  const improver = new PronunciationImprover();
  await improver.runImprovementTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { PronunciationImprover }; 