#!/usr/bin/env node

/**
 * ElevenLabs Audio Generation Agent
 * Background agent for generating audio for all vocabulary items and sentences
 */

const fs = require('fs');
const path = require('path');

class AudioGenerationAgent {
  constructor() {
    this.vocabularyPath = 'content/vocabulary_master_improved.json';
    this.outputDir = 'content/audio/generated';
    this.manifestPath = 'content/audio/audio-manifest.json';
    this.logPath = 'scripts/agents/logs/audio-generation.log';
    this.progress = 0;
    this.totalItems = 0;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logPath, logMessage + '\n');
  }

  async initialize() {
    this.log('🎵 Initializing ElevenLabs Audio Generation Agent...');
    
    // Create output directories
    const dirs = [
      this.outputDir,
      `${this.outputDir}/words`,
      `${this.outputDir}/sentences`,
      `${this.outputDir}/cultural`
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Load vocabulary
    const vocabulary = JSON.parse(fs.readFileSync(this.vocabularyPath, 'utf8'));
    this.totalItems = vocabulary.vocabulary.length;
    
    this.log(`📚 Loaded ${this.totalItems} vocabulary items`);
    this.log(`📁 Output directory: ${this.outputDir}`);
    
    return vocabulary;
  }

  async generateWordAudio(word, index) {
    try {
      this.log(`🎤 Generating audio for word ${index + 1}/${this.totalItems}: "${word.shona}"`);
      
      // Simulate ElevenLabs API call (replace with actual implementation)
      const audioFileName = `${word.shona.replace(/[^a-zA-Z]/g, '')}.mp3`;
      const audioPath = `${this.outputDir}/words/${audioFileName}`;
      
      // Create placeholder audio file (replace with actual ElevenLabs generation)
      const placeholderAudio = Buffer.from('placeholder audio data');
      fs.writeFileSync(audioPath, placeholderAudio);
      
      this.progress = ((index + 1) / this.totalItems) * 100;
      this.log(`✅ Generated audio for "${word.shona}" (${this.progress.toFixed(1)}% complete)`);
      
      return {
        word: word.shona,
        audioFile: audioFileName,
        path: audioPath,
        status: 'generated'
      };
    } catch (error) {
      this.log(`❌ Error generating audio for "${word.shona}": ${error.message}`);
      return {
        word: word.shona,
        error: error.message,
        status: 'failed'
      };
    }
  }

  async generateSentenceAudio(sentence, word, index) {
    try {
      const sentenceFileName = `${word.shona}_sentence_${index}.mp3`;
      const sentencePath = `${this.outputDir}/sentences/${sentenceFileName}`;
      
      // Create placeholder audio file
      const placeholderAudio = Buffer.from('placeholder sentence audio data');
      fs.writeFileSync(sentencePath, placeholderAudio);
      
      return {
        sentence: sentence.shona,
        audioFile: sentenceFileName,
        path: sentencePath,
        status: 'generated'
      };
    } catch (error) {
      this.log(`❌ Error generating sentence audio: ${error.message}`);
      return {
        sentence: sentence.shona,
        error: error.message,
        status: 'failed'
      };
    }
  }

  async createAudioManifest(generatedAudio) {
    const manifest = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      totalWords: generatedAudio.words.length,
      totalSentences: generatedAudio.sentences.length,
      words: generatedAudio.words,
      sentences: generatedAudio.sentences,
      statistics: {
        successful: generatedAudio.words.filter(w => w.status === 'generated').length,
        failed: generatedAudio.words.filter(w => w.status === 'failed').length,
        totalFiles: generatedAudio.words.length + generatedAudio.sentences.length
      }
    };
    
    fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));
    this.log(`📋 Audio manifest created: ${this.manifestPath}`);
  }

  async run() {
    try {
      this.log('🚀 Starting ElevenLabs Audio Generation Agent...');
      
      const vocabulary = await this.initialize();
      const generatedAudio = {
        words: [],
        sentences: []
      };
      
      // Generate audio for each vocabulary item
      for (let i = 0; i < vocabulary.vocabulary.length; i++) {
        const word = vocabulary.vocabulary[i];
        
        // Generate word audio
        const wordAudio = await this.generateWordAudio(word, i);
        generatedAudio.words.push(wordAudio);
        
        // Generate sentence audio for examples
        if (word.examples && word.examples.length > 0) {
          for (let j = 0; j < word.examples.length; j++) {
            const sentenceAudio = await this.generateSentenceAudio(word.examples[j], word, j);
            generatedAudio.sentences.push(sentenceAudio);
          }
        }
        
        // Update progress every 10 items
        if ((i + 1) % 10 === 0) {
          this.log(`📊 Progress: ${i + 1}/${this.totalItems} words processed`);
        }
      }
      
      // Create audio manifest
      await this.createAudioManifest(generatedAudio);
      
      this.log('🎉 ElevenLabs Audio Generation Agent completed successfully!');
      this.log(`📊 Summary: ${generatedAudio.words.length} words, ${generatedAudio.sentences.length} sentences`);
      
      return {
        success: true,
        wordsGenerated: generatedAudio.words.length,
        sentencesGenerated: generatedAudio.sentences.length,
        manifestPath: this.manifestPath
      };
      
    } catch (error) {
      this.log(`💥 Fatal error in Audio Generation Agent: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Run the agent if called directly
if (require.main === module) {
  const agent = new AudioGenerationAgent();
  agent.run().then(result => {
    console.log('Agent execution completed:', result);
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = AudioGenerationAgent; 