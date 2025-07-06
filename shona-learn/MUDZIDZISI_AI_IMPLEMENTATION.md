# Mudzidzisi AI - Shona Pronunciation AI Agent

## Implementation Guide & Documentation v2.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Installation & Setup](#installation--setup)
4. [Core Components](#core-components)
5. [Usage Guide](#usage-guide)
6. [API Reference](#api-reference)
7. [Configuration](#configuration)
8. [Integration Examples](#integration-examples)
9. [Testing & Validation](#testing--validation)
10. [Production Deployment](#production-deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Mudzidzisi AI** is a sophisticated autonomous pronunciation AI agent designed specifically for the Shona language. It implements a comprehensive phonetic analysis system that processes Shona words through advanced linguistic rules and generates precise pronunciation assets including audio files and instructional videos.

### Key Features

- **Advanced Phonetic Analysis**: Implements longest-match-first parsing with comprehensive IPA transcription
- **Autonomous Asset Generation**: Creates TTS audio and video synthesis prompts automatically
- **Specialized Sound Handling**: Properly handles whistled sibilants, implosive sounds, and prenasalized consonants
- **Batch Processing**: Scalable processing of vocabulary lists with job management
- **Quality Assurance**: Built-in validation and complexity analysis
- **Integration Ready**: Designed for seamless integration with learning management systems

### Technical Specifications

- **Version**: 2.0
- **Language**: TypeScript/JavaScript
- **Architecture**: Modular, singleton-based design
- **Processing**: Autonomous, rule-based phonetic analysis
- **Output**: Audio (WAV), Video (MP4), JSON metadata

---

## 🏗️ System Architecture

The Mudzidzisi AI system is composed of four main components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Autonomous Generation Agent              │
│                      (Orchestration Layer)                 │
├─────────────────────────────────────────────────────────────┤
│                     Mudzidzisi AI Core                      │
│                   (Phonetic Analysis Engine)               │
├─────────────────────────────────────────────────────────────┤
│                  Asset Generation Pipeline                  │
│                  (TTS & Video Synthesis)                   │
├─────────────────────────────────────────────────────────────┤
│                     Storage & Logging                      │
│                    (File Management)                       │
└─────────────────────────────────────────────────────────────┘
```

### Core Files

- `lib/mudzidzisi-ai.ts` - Main phonetic analysis engine
- `lib/asset-generation-pipeline.ts` - Asset generation management
- `lib/autonomous-generation-agent.ts` - Orchestration and job management
- `scripts/mudzidzisi-ai-demo.js` - Demonstration and testing interface

---

## 🔧 Installation & Setup

### Prerequisites

```bash
# Node.js 18+
node --version

# npm or yarn
npm --version
```

### Installation

1. **Install Dependencies**
```bash
cd shona-learn
npm install
```

2. **Configure API Keys**
Create a `.env` file in the project root:
```env
# Google Cloud Text-to-Speech API
GOOGLE_TTS_API_KEY=your_google_api_key

# Video Synthesis API (HeyGen, Synthesia, etc.)
VIDEO_SYNTHESIS_API_KEY=your_video_api_key_here
```

3. **Verify Installation**
```bash
# Run the demonstration
node scripts/mudzidzisi-ai-demo.js demo

# Test a single word
node scripts/mudzidzisi-ai-demo.js word bhazi
```

---

## 🧠 Core Components

### 1. Mudzidzisi AI Core Engine

The heart of the system implements the four-stage processing workflow:

**Stage 1: Phonetic Tokenization**
- Applies longest-match-first parsing principle
- Handles complex orthographic combinations (tsv, dzv, etc.)
- Precedence order: Trigraphs → Digraphs → Monographs

**Stage 2: Syllabification & Phonetic Profiling**
- CV (Consonant-Vowel) structure analysis
- Vowel hiatus detection and handling
- Detailed phonetic profile generation

**Stage 3: Dynamic Prompt Generation**
- TTS-specific prompts with articulation details
- Video synthesis prompts with visual instructions
- Anti-pattern warnings and critical instructions

**Stage 4: Complexity Analysis**
- Pronunciation difficulty scoring
- Processing time tracking
- Metadata generation

### 2. Phoneme Reference System

Comprehensive phoneme table with 40+ Shona phonemes:

```typescript
// Example phoneme entry
'tsv': {
  token: 'tsv',
  type: 'Whistled Affricate',
  ipa: 'tswhistling',
  instructions: "KEYWORD: WHISTLED AFFRICATE. A ts sound combined with the whistled sv sibilant.",
  category: 'whistled-affricate',
  antiPatterns: ["A single complex sound, not ts followed by v."]
}
```

### 3. Asset Generation Pipeline

Manages integration with external AI services:

- **TTS Integration**: Google Cloud Text-to-Speech with custom instructions
- **Video Synthesis**: HeyGen/Synthesia integration with facial animation prompts
- **File Management**: Automated saving and organization of generated assets
- **Quality Assurance**: Validation and error handling

### 4. Autonomous Generation Agent

Orchestrates the complete workflow:

- **Job Management**: Create, execute, and monitor batch processing jobs
- **Statistics Tracking**: Comprehensive analytics and reporting
- **Integration Interface**: Easy integration with learning systems
- **Error Handling**: Robust error management and logging

---

## 📖 Usage Guide

### Basic Usage

```javascript
import { processWord, mudzidzisiAI } from './lib/mudzidzisi-ai'

// Process a single word
const result = processWord('bhazi')
console.log(result.profile.tokens)        // ['bh', 'a', 'z', 'i']
console.log(result.profile.syllables)     // ['bha', 'zi']
console.log(result.metadata.complexity)   // 7
```

### Batch Processing

```javascript
import { autonomousGenerationAgent } from './lib/autonomous-generation-agent'

// Process vocabulary list
const words = [
  { word: 'bhazi', english: 'bus', category: 'Transport', difficulty: 3 },
  { word: 'svika', english: 'arrive', category: 'Movement', difficulty: 4 }
]

const jobId = await autonomousGenerationAgent.createGenerationJob(words)
const results = await autonomousGenerationAgent.executeGenerationJob(jobId)
```

### Integration with Learning System

```javascript
import { processWord } from './lib/mudzidzisi-ai'

// Enhance existing pronunciation exercises
const enhancedExercises = pronunciationExercises.map(exercise => {
  const analysis = processWord(exercise.shona)
  return {
    ...exercise,
    phonetic_profile: analysis.profile,
    complexity: analysis.metadata.complexity,
    specialized_instructions: analysis.audioPrompt.prompt,
    visual_guidance: analysis.videoPrompt.prompt
  }
})
```

---

## 🔌 API Reference

### Core Functions

#### `processWord(word: string)`
Process a single Shona word through complete phonetic analysis.

**Parameters:**
- `word`: Shona word to analyze

**Returns:**
```typescript
{
  profile: PhoneticProfile,
  audioPrompt: AssetPrompt,
  videoPrompt: AssetPrompt,
  metadata: {
    processingTimestamp: Date,
    version: string,
    complexity: number
  }
}
```

#### `mudzidzisiAI.tokenizeWord(word: string)`
Tokenize a word using longest-match-first parsing.

**Parameters:**
- `word`: Input word

**Returns:** `string[]` - Array of phoneme tokens

#### `mudzidzisiAI.getPhonemeReference(token: string)`
Get detailed information about a specific phoneme.

**Parameters:**
- `token`: Phoneme token to look up

**Returns:** `PhonemeToken | undefined`

### Autonomous Generation Agent

#### `autonomousGenerationAgent.createGenerationJob(words: WordData[])`
Create a new batch processing job.

**Parameters:**
- `words`: Array of word data objects

**Returns:** `Promise<string>` - Job ID

#### `autonomousGenerationAgent.executeGenerationJob(jobId: string)`
Execute a batch processing job.

**Parameters:**
- `jobId`: Job identifier

**Returns:** `Promise<GenerationJob>` - Job results

#### `autonomousGenerationAgent.getGlobalStatistics()`
Get comprehensive processing statistics.

**Returns:** Processing statistics object

---

## ⚙️ Configuration

### Environment Variables

```env
# Required for asset generation
GOOGLE_TTS_API_KEY=your_google_api_key
VIDEO_SYNTHESIS_API_KEY=your_video_api_key

# Optional configuration
MUDZIDZISI_OUTPUT_DIR=./generated-assets
MUDZIDZISI_LOG_LEVEL=info
```

### API Configuration

```javascript
// Update TTS configuration
assetGenerationPipeline.updateConfigurations({
  ttsConfig: {
    apiKey: 'your_api_key',
    endpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
    model: 'standard',
    voiceId: 'en-US-Standard-A'
  }
})
```

---

## 🔗 Integration Examples

### Next.js Integration

```javascript
// pages/api/analyze-word.js
import { processWord } from '../../../lib/mudzidzisi-ai'

export default async function handler(req, res) {
  const { word } = req.body
  
  try {
    const analysis = processWord(word)
    res.status(200).json(analysis)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

### React Component Integration

```jsx
// components/PronunciationAnalyzer.jsx
import { useState } from 'react'

export default function PronunciationAnalyzer() {
  const [word, setWord] = useState('')
  const [analysis, setAnalysis] = useState(null)
  
  const analyzeWord = async () => {
    const response = await fetch('/api/analyze-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word })
    })
    const result = await response.json()
    setAnalysis(result)
  }
  
  return (
    <div>
      <input 
        value={word} 
        onChange={(e) => setWord(e.target.value)}
        placeholder="Enter Shona word"
      />
      <button onClick={analyzeWord}>Analyze</button>
      
      {analysis && (
        <div>
          <h3>Phonetic Analysis</h3>
          <p>Tokens: {analysis.profile.tokens.join(', ')}</p>
          <p>Syllables: {analysis.profile.syllables.join('-')}</p>
          <p>Complexity: {analysis.metadata.complexity}</p>
        </div>
      )}
    </div>
  )
}
```

---

## 🧪 Testing & Validation

### Running Tests

```bash
# Run the comprehensive demo
node scripts/mudzidzisi-ai-demo.js demo

# Interactive testing
node scripts/mudzidzisi-ai-demo.js interactive

# Test specific words
node scripts/mudzidzisi-ai-demo.js word tsvaira
node scripts/mudzidzisi-ai-demo.js word kuudza
```

### Validation Checklist

- [ ] Phonetic tokenization accuracy
- [ ] Syllabification correctness
- [ ] IPA transcription validation
- [ ] Complexity scoring consistency
- [ ] Asset generation functionality
- [ ] Batch processing performance
- [ ] Error handling robustness

### Example Test Cases

```javascript
// Test whistled sounds
const whistledTests = ['svika', 'zvino', 'tsvaira']
whistledTests.forEach(word => {
  const analysis = processWord(word)
  console.log(`${word}: ${analysis.profile.tokens.join(', ')}`)
})

// Test vowel hiatus
const hiatus = processWord('kuudza')
console.log('Vowel hiatus detected:', hiatus.profile.vowelHiatus)

// Test complexity calculation
const complexWords = ['dzvinyu', 'tsvaira', 'mbvundura']
complexWords.forEach(word => {
  const analysis = processWord(word)
  console.log(`${word}: complexity ${analysis.metadata.complexity}`)
})
```

---

## 🚀 Production Deployment

### Deployment Steps

1. **Environment Setup**
```bash
# Production environment
NODE_ENV=production
GOOGLE_TTS_API_KEY=your_production_api_key
VIDEO_SYNTHESIS_API_KEY=your_production_video_key
```

2. **Asset Storage Configuration**
```javascript
// Configure cloud storage for assets
const storageConfig = {
  provider: 'aws-s3', // or 'gcs', 'azure'
  bucket: 'shona-pronunciation-assets',
  region: 'us-east-1'
}
```

3. **Monitoring Setup**
```javascript
// Production monitoring
const monitoring = {
  logLevel: 'info',
  metricsEndpoint: 'https://your-metrics-server.com',
  errorReporting: true
}
```

### Performance Optimization

- **Batch Processing**: Use job queues for large vocabulary lists
- **Caching**: Implement Redis caching for frequently analyzed words
- **Rate Limiting**: Configure API rate limits to prevent overuse
- **Load Balancing**: Use multiple instances for high-volume processing

### Scaling Considerations

```javascript
// Horizontal scaling configuration
const scalingConfig = {
  maxConcurrentJobs: 10,
  workerInstances: 5,
  queueSize: 1000,
  retryAttempts: 3
}
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Phonetic Analysis Errors**
```
Error: Unrecognized character at position X
Solution: Verify proper Shona orthography and check character encoding
```

**2. API Key Configuration**
```
Error: TTS API key not configured
Solution: Set GOOGLE_TTS_API_KEY in environment variables
```

**3. Asset Generation Failures**
```
Error: Video synthesis API error: 429 Too Many Requests
Solution: Implement rate limiting and retry logic
```

### Debug Mode

```javascript
// Enable debug logging
process.env.MUDZIDZISI_DEBUG = 'true'

// Detailed analysis
const analysis = processWord('problematic-word')
console.log('Debug info:', analysis.metadata)
```

### Performance Issues

```javascript
// Monitor processing times
const stats = autonomousGenerationAgent.getGlobalStatistics()
console.log('Average processing time:', stats.averageProcessingTime)
console.log('Complexity distribution:', stats.complexityDistribution)
```

---

## 📊 System Metrics

### Key Performance Indicators

- **Processing Speed**: Average time per word analysis
- **Accuracy Rate**: Phonetic analysis correctness
- **Asset Generation Success**: TTS and video creation rates
- **System Throughput**: Words processed per hour
- **Error Rate**: Failed processing attempts

### Monitoring Dashboard

```javascript
// Example metrics collection
const metrics = {
  totalWordsProcessed: 15847,
  averageProcessingTime: 245, // milliseconds
  successRate: 98.7,
  complexityDistribution: {
    'Low (1-5)': 45,
    'Medium (6-10)': 35,
    'High (11-15)': 15,
    'Very High (16+)': 5
  }
}
```

---

## 📚 Additional Resources

### Documentation Links

- [Shona Language Reference](https://en.wikipedia.org/wiki/Shona_language)
- [IPA Transcription Guide](https://www.internationalphoneticassociation.org/)
- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)

### Sample Data

```javascript
// Example vocabulary for testing
const sampleVocabulary = [
  { word: 'mangwanani', english: 'good morning', category: 'Greetings' },
  { word: 'zvakanaka', english: 'fine/good', category: 'Responses' },
  { word: 'ndatenda', english: 'thank you', category: 'Courtesy' },
  { word: 'pamusoroi', english: 'excuse me', category: 'Courtesy' }
]
```

---

## 🤝 Contributing

### Development Setup

```bash
# Clone and setup
git clone [repository-url]
cd shona-learn
npm install

# Run tests
npm test

# Run development server
npm run dev
```

### Code Style

- Follow TypeScript best practices
- Use ESLint configuration
- Maintain comprehensive documentation
- Include unit tests for new features

---

## 📄 License

This project is part of the Shona Language Learning Application. Please refer to the main project license for terms and conditions.

---

## 💡 Future Enhancements

### Planned Features

1. **Tone Pattern Analysis**: Advanced tonal analysis for Shona
2. **Regional Dialects**: Support for different Shona dialects
3. **Machine Learning Integration**: AI-powered pronunciation scoring
4. **Real-time Processing**: WebSocket-based live analysis
5. **Mobile SDK**: Native mobile app integration

### Research Areas

- **Acoustic Analysis**: Integration with speech recognition
- **Cultural Context**: Enhanced cultural learning integration
- **Gamification**: Advanced pronunciation games and challenges
- **Community Features**: Peer-to-peer pronunciation practice

---

**© 2024 Shona Language Learning Project - Mudzidzisi AI v2.0**