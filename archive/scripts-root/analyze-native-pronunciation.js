#!/usr/bin/env node

/**
 * Native Shona Pronunciation Analyzer
 * Analyzes native Shona audio to understand natural pronunciation patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class NativePronunciationAnalyzer {
  constructor() {
    this.audioDir = path.join(__dirname, 'test-audio', 'sample');
    this.analysisDir = path.join(__dirname, 'native-pronunciation-analysis');
    
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.analysisDir)) {
      fs.mkdirSync(this.analysisDir, { recursive: true });
    }
  }

  // Analyze audio file properties
  async analyzeAudioFile(filepath) {
    const analysis = {
      filename: path.basename(filepath),
      filepath: filepath,
      properties: {},
      transcription: null,
      pronunciation: null,
      recommendations: []
    };

    try {
      // Get basic file properties
      const stats = fs.statSync(filepath);
      analysis.properties = {
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(1),
        created: stats.birthtime,
        modified: stats.mtime
      };

      // Try to get audio duration and properties using ffprobe
      try {
        const durationOutput = execSync(`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filepath}"`, { encoding: 'utf8' });
        analysis.properties.duration = parseFloat(durationOutput.trim());
        
        const formatOutput = execSync(`ffprobe -v quiet -show_entries stream=codec_name,sample_rate,channels -of csv=p=0 "${filepath}"`, { encoding: 'utf8' });
        const formatInfo = formatOutput.trim().split(',');
        analysis.properties.codec = formatInfo[0];
        analysis.properties.sampleRate = formatInfo[1];
        analysis.properties.channels = formatInfo[2];
      } catch (error) {
        console.log(`⚠️  Could not analyze audio properties for ${path.basename(filepath)}: ${error.message}`);
      }

      return analysis;
    } catch (error) {
      console.error(`❌ Error analyzing ${filepath}: ${error.message}`);
      return null;
    }
  }

  // Generate pronunciation guide from native audio
  generatePronunciationGuide(analysis) {
    const guide = {
      word: this.extractWordFromFilename(analysis.filename),
      nativeAudio: analysis.filepath,
      duration: analysis.properties.duration,
      recommendations: {
        speed: this.recommendSpeed(analysis.properties.duration),
        emphasis: this.recommendEmphasis(analysis.filename),
        naturalPatterns: this.extractNaturalPatterns(analysis.filename)
      }
    };

    return guide;
  }

  extractWordFromFilename(filename) {
    // Remove file extension and common prefixes
    return filename.replace(/\.(mp3|wav|m4a|aac)$/i, '')
                   .replace(/^(native_|shona_|pronunciation_)/i, '')
                   .replace(/[_-]/g, ' ');
  }

  recommendSpeed(duration) {
    if (!duration) return 'unknown';
    
    // Analyze if the pronunciation is fast, medium, or slow
    if (duration < 0.8) return 'fast';
    if (duration < 1.5) return 'medium';
    return 'slow';
  }

  recommendEmphasis(filename) {
    const word = this.extractWordFromFilename(filename).toLowerCase();
    
    // Check for special Shona sounds
    if (/sv|zv/.test(word)) {
      return 'whistled_sibilant';
    }
    if (/mb|nd|ng/.test(word)) {
      return 'prenasalized_consonant';
    }
    if (/bh|dh|vh/.test(word)) {
      return 'breathy_consonant';
    }
    
    return 'natural';
  }

  extractNaturalPatterns(filename) {
    const word = this.extractWordFromFilename(filename).toLowerCase();
    const patterns = [];

    // Identify natural pronunciation patterns
    if (/sv|zv/.test(word)) {
      patterns.push({
        type: 'whistled_sibilant',
        description: 'Natural whistled sibilant pronunciation',
        recommendation: 'Use natural flow without artificial pauses'
      });
    }

    if (/mb|nd|ng/.test(word)) {
      patterns.push({
        type: 'prenasalized_consonant',
        description: 'Natural prenasalized consonant flow',
        recommendation: 'Maintain natural nasal-to-consonant transition'
      });
    }

    if (/bh|dh|vh/.test(word)) {
      patterns.push({
        type: 'breathy_consonant',
        description: 'Natural breathy consonant pronunciation',
        recommendation: 'Subtle breath emphasis, not exaggerated'
      });
    }

    return patterns;
  }

  // Create improved ElevenLabs settings based on native analysis
  createImprovedSettings(analysis) {
    const word = this.extractWordFromFilename(analysis.filename);
    const speed = this.recommendSpeed(analysis.properties.duration);
    const emphasis = this.recommendEmphasis(analysis.filename);

    const settings = {
      word: word,
      voiceSettings: {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.4, // More natural style
        use_speaker_boost: true
      },
      ssmlSettings: {
        rate: this.getNaturalRate(speed),
        pitch: '0%', // Natural pitch
        volume: 'medium',
        emphasis: 'moderate'
      },
      textProcessing: {
        useNaturalFlow: true,
        avoidArtificialPauses: true,
        maintainWordIntegrity: true
      }
    };

    return settings;
  }

  getNaturalRate(speed) {
    switch (speed) {
      case 'fast': return '110%';
      case 'slow': return '85%';
      default: return '100%'; // Natural speed
    }
  }

  // Analyze all native audio files
  async analyzeNativeAudio() {
    console.log('🎵 Analyzing Native Shona Audio Content...\n');
    
    if (!fs.existsSync(this.audioDir)) {
      console.log('📁 Creating native audio samples directory...');
      console.log(`📂 Please add your native Shona audio files to: ${this.audioDir}`);
      console.log('📝 Supported formats: mp3, wav, m4a, aac');
      console.log('📝 Naming convention: word_pronunciation.mp3 (e.g., svika_native.mp3)');
      return;
    }

    const audioFiles = fs.readdirSync(this.audioDir)
      .filter(file => /\.(mp3|wav|m4a|aac)$/i.test(file));

    if (audioFiles.length === 0) {
      console.log('❌ No audio files found in native-audio-samples directory');
      console.log('📁 Please add your native Shona audio files and run again');
      return;
    }

    console.log(`🔍 Found ${audioFiles.length} native audio files to analyze\n`);

    const analyses = [];
    const pronunciationGuides = [];
    const improvedSettings = [];

    for (const file of audioFiles) {
      const filepath = path.join(this.audioDir, file);
      console.log(`Analyzing: ${file}`);
      
      const analysis = await this.analyzeAudioFile(filepath);
      if (analysis) {
        analyses.push(analysis);
        
        const guide = this.generatePronunciationGuide(analysis);
        pronunciationGuides.push(guide);
        
        const settings = this.createImprovedSettings(analysis);
        improvedSettings.push(settings);
        
        console.log(`  ✅ Duration: ${analysis.properties.duration?.toFixed(2) || 'unknown'}s`);
        console.log(`  📊 Speed: ${guide.recommendations.speed}`);
        console.log(`  🎯 Emphasis: ${guide.recommendations.emphasis}`);
        console.log(`  💡 Patterns: ${guide.recommendations.naturalPatterns.length}`);
        console.log('');
      }
    }

    // Generate comprehensive report
    this.generateNativeAnalysisReport(analyses, pronunciationGuides, improvedSettings);
  }

  generateNativeAnalysisReport(analyses, guides, settings) {
    console.log('📊 Generating Native Pronunciation Analysis Report...\n');

    const report = {
      summary: {
        totalFiles: analyses.length,
        averageDuration: (analyses.reduce((sum, a) => sum + (a.properties.duration || 0), 0) / analyses.length).toFixed(2),
        speedDistribution: this.getSpeedDistribution(guides),
        emphasisTypes: this.getEmphasisDistribution(guides),
        timestamp: new Date().toISOString()
      },
      analyses: analyses,
      pronunciationGuides: guides,
      improvedSettings: settings,
      recommendations: this.generateOverallRecommendations(guides)
    };

    // Save detailed report
    const reportPath = path.join(this.analysisDir, 'native-pronunciation-analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate markdown report
    this.generateMarkdownReport(report);

    console.log(`📄 Detailed analysis saved to: ${reportPath}`);
    console.log(`📝 Markdown report saved to: ${path.join(this.analysisDir, 'native-pronunciation-report.md')}`);
    console.log(`🎵 Improved settings saved to: ${path.join(this.analysisDir, 'improved-elevenlabs-settings.json')}`);

    // Save improved settings for ElevenLabs
    const settingsPath = path.join(this.analysisDir, 'improved-elevenlabs-settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }

  getSpeedDistribution(guides) {
    const speeds = guides.map(g => g.recommendations.speed);
    return speeds.reduce((acc, speed) => {
      acc[speed] = (acc[speed] || 0) + 1;
      return acc;
    }, {});
  }

  getEmphasisDistribution(guides) {
    const emphases = guides.map(g => g.recommendations.emphasis);
    return emphases.reduce((acc, emphasis) => {
      acc[emphasis] = (acc[emphasis] || 0) + 1;
      return acc;
    }, {});
  }

  generateOverallRecommendations(guides) {
    const recommendations = [];

    // Analyze speed patterns
    const speeds = guides.map(g => g.recommendations.speed);
    const avgSpeed = speeds.reduce((sum, speed) => {
      if (speed === 'fast') return sum + 1;
      if (speed === 'slow') return sum - 1;
      return sum;
    }, 0) / speeds.length;

    if (avgSpeed > 0.3) {
      recommendations.push('Native speakers tend to pronounce words faster - consider using 110% rate');
    } else if (avgSpeed < -0.3) {
      recommendations.push('Native speakers tend to pronounce words slower - consider using 85% rate');
    } else {
      recommendations.push('Use natural 100% rate for authentic pronunciation');
    }

    // Analyze emphasis patterns
    const emphases = guides.map(g => g.recommendations.emphasis);
    if (emphases.includes('whistled_sibilant')) {
      recommendations.push('Whistled sibilants should flow naturally without artificial pauses');
    }
    if (emphases.includes('prenasalized_consonant')) {
      recommendations.push('Prenasalized consonants should maintain natural nasal-to-consonant flow');
    }
    if (emphases.includes('breathy_consonant')) {
      recommendations.push('Breathy consonants should have subtle, natural breath emphasis');
    }

    recommendations.push('Avoid artificial SSML pauses - let words flow naturally');
    recommendations.push('Use moderate emphasis level for authentic pronunciation');
    recommendations.push('Maintain word integrity without breaking into artificial segments');

    return recommendations;
  }

  generateMarkdownReport(report) {
    const markdown = `# Native Shona Pronunciation Analysis Report

## Summary
- **Total Audio Files**: ${report.summary.totalFiles}
- **Average Duration**: ${report.summary.averageDuration}s
- **Speed Distribution**: ${Object.entries(report.summary.speedDistribution).map(([speed, count]) => `${speed}: ${count}`).join(', ')}
- **Emphasis Types**: ${Object.entries(report.summary.emphasisTypes).map(([type, count]) => `${type}: ${count}`).join(', ')}

## Key Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Detailed Analysis

${report.pronunciationGuides.map(guide => `
### ${guide.word}

**Audio Properties:**
- Duration: ${guide.duration?.toFixed(2) || 'unknown'}s
- Speed: ${guide.recommendations.speed}
- Emphasis: ${guide.recommendations.emphasis}

**Natural Patterns:**
${guide.recommendations.naturalPatterns.map(pattern => `- ${pattern.type}: ${pattern.description}`).join('\n')}

**Recommendations:**
${guide.recommendations.naturalPatterns.map(pattern => `- ${pattern.recommendation}`).join('\n')}
`).join('\n')}

## Improved ElevenLabs Settings

Based on native pronunciation analysis, use these settings for more natural pronunciation:

\`\`\`json
{
  "voiceSettings": {
    "stability": 0.75,
    "similarity_boost": 0.85,
    "style": 0.4,
    "use_speaker_boost": true
  },
  "ssmlSettings": {
    "rate": "100%",
    "pitch": "0%",
    "volume": "medium",
    "emphasis": "moderate"
  },
  "textProcessing": {
    "useNaturalFlow": true,
    "avoidArtificialPauses": true,
    "maintainWordIntegrity": true
  }
}
\`\`\`

## Conclusion

Native Shona pronunciation flows naturally without artificial pauses or exaggerated emphasis. The key is to maintain word integrity and let the natural rhythm of the language guide the pronunciation.
`;

    const reportPath = path.join(this.analysisDir, 'native-pronunciation-report.md');
    fs.writeFileSync(reportPath, markdown);
  }

  async runAnalysis() {
    console.log('🚀 Starting Native Shona Pronunciation Analysis...\n');
    console.log('📁 Looking for native audio files in: native-audio-samples/\n');
    
    await this.analyzeNativeAudio();
  }
}

// Run analysis
async function main() {
  const analyzer = new NativePronunciationAnalyzer();
  await analyzer.runAnalysis();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { NativePronunciationAnalyzer }; 