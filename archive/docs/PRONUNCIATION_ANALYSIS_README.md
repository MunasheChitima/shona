# Muturikiri AI - Shona Pronunciation Analysis System v4.0

## Overview

The Muturikiri AI system is a sophisticated pronunciation analysis engine specifically designed for the Shona language. It combines advanced AI-powered acoustic analysis with rule-based linguistic evaluation to provide detailed, actionable feedback on Shona pronunciation.

## Features

### 🎯 Core Capabilities
- **AI-Powered Analysis**: Uses Google's Gemini model for detailed acoustic and phonetic feature extraction
- **Rule-Based Judgment**: Compares AI observations against established Shona phonetic rules
- **Deterministic Scoring**: Calculates scores using precise, weighted algorithms
- **Constructive Feedback**: Provides specific, actionable improvement suggestions
- **Robust Error Handling**: Gracefully handles audio quality issues and edge cases

### 🔍 Phonetic Analysis
- **Implosives (b, d)**: Detects glottalic ingressive airstreams
- **Breathy-Voiced (bh, dh)**: Analyzes breathy voice murmur and tone-depressing effects
- **Whistled Sibilants (sv, zv)**: Evaluates high-frequency whistled fricatives
- **Tone Patterns**: Checks for correct high and low tones
- **Vowel Quality**: Ensures pure vowel sounds without diphthongization
- **Prenasalized Consonants**: Analyzes mb, nd, ng sounds

## Architecture

### Masterless Design
The system follows a masterless architecture where each component operates independently:

1. **Ground Truth Generator**: Creates expected phonetic profiles
2. **AI Analysis Engine**: Performs acoustic analysis using Gemini
3. **Comparative Analyzer**: Compares observations against ground truth
4. **Scoring Engine**: Calculates deterministic scores
5. **Feedback Generator**: Creates user-friendly feedback messages

### Core Components

#### `lib/pronunciation-analysis.ts`
The main library containing the MuturikiriAI class and all analysis logic.

#### `app/api/pronunciation/route.ts`
API endpoint for handling pronunciation analysis requests.

#### `app/components/voice/AdvancedPronunciationPractice.tsx`
React component for the pronunciation practice interface.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @google/generative-ai --legacy-peer-deps
```

### 2. Environment Configuration

Add your Google Generative AI API key to your environment variables:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### 3. API Usage

#### Basic Usage

```typescript
import { createMuturikiriAI } from '@/lib/pronunciation-analysis';

const muturikiriAI = createMuturikiriAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

const result = await muturikiriAI.analyzePronunciation(
  'mbira',  // target word
  '/path/to/audio.wav'  // audio file path
);
```

#### API Endpoint

```typescript
const formData = new FormData();
formData.append('targetWord', 'mbira');
formData.append('audioFile', audioBlob);

const response = await fetch('/api/pronunciation', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

### 4. Demo Page

Visit `/pronunciation-demo` to test the system with various Shona words.

## API Reference

### `analyzePronunciation(targetWord: string, userAudioPath: string)`

Analyzes pronunciation of a Shona word.

**Parameters:**
- `targetWord`: Single Shona word in lowercase
- `userAudioPath`: Path to mono-channel .wav or .flac audio file

**Returns:**
```typescript
interface PronunciationAnalysisResult {
  target_word: string;
  overall_score: number;
  phoneme_analyses: PhonemeAnalysis[];
  feedback_messages: string[];
  error?: {
    code: string;
    message: string;
  };
}
```

### Response Structure

#### Success Response
```json
{
  "target_word": "mbira",
  "overall_score": 85,
  "phoneme_analyses": [
    {
      "phoneme": "mb",
      "score": 90,
      "deviations": [],
      "feedback_codes": []
    },
    {
      "phoneme": "i",
      "score": 80,
      "deviations": [
        {
          "phoneme": "i",
          "feature": "tone",
          "expected": "Low",
          "observed": "High",
          "feedback_code": "INCORRECT_TONE"
        }
      ],
      "feedback_codes": ["INCORRECT_TONE"]
    }
  ],
  "feedback_messages": [
    "i: Pay attention to the tone. This syllable should be Low tone."
  ]
}
```

#### Error Response
```json
{
  "target_word": "mbira",
  "overall_score": 0,
  "phoneme_analyses": [],
  "feedback_messages": [],
  "error": {
    "code": "AUDIO_SILENT",
    "message": "It looks like we couldn't hear you. Please make sure your microphone is working and try speaking a bit louder."
  }
}
```

## Error Codes

| Code | Description | User Message |
|------|-------------|--------------|
| `AUDIO_SILENT` | Audio RMS below silence threshold | "It looks like we couldn't hear you. Please make sure your microphone is working and try speaking a bit louder." |
| `AUDIO_TOO_NOISY` | Signal-to-noise ratio too low | "There seems to be a lot of background noise. Could you try recording again in a quieter place?" |
| `AI_RESPONSE_INVALID` | Gemini API returned malformed response | "Sorry, our analysis tool is having a temporary issue. Please try again in a moment." |
| `DURATION_MISMATCH` | Audio duration doesn't match expected word length | "It sounds like you might have said something different. Please try pronouncing just the word '{target_word}'." |

## Scoring Algorithm

### Phoneme Scoring
Each phoneme starts with 100 points. Deductions are applied based on deviations:

- **Critical Error** (Wrong phoneme type): -60 points
- **Major Feature Error** (Primary acoustic feature wrong): -40 points
- **Tonal Error** (Incorrect tone): -25 points
- **Secondary Feature Error** (Minor deviations): -15 points

### Overall Score
The final word score is the simple average of all phoneme scores.

## Feedback Codes

| Code | Description | Example |
|------|-------------|---------|
| `VOWEL_NOT_PURE` | Vowel sound fluctuates | "Try to keep your vowel sound steady and pure" |
| `INCORRECT_TONE` | Wrong tone pattern | "Pay attention to the tone. This syllable should be Low tone" |
| `IMPLOSIVE_TOO_PLOSIVE` | Implosive sounds like plosive | "This is an implosive sound. Try to suck air in slightly" |
| `BREATHY_VOICE_WEAK` | Breathy quality too weak | "Make the breathy quality stronger" |
| `WHISTLE_QUALITY_LOW` | Whistled sound not high enough | "This is a whistled sound. Try to make it more high-pitched" |
| `WHISTLE_MISSING` | Whistled sound classified as regular fricative | "This should be a whistled sound, not a regular fricative" |

## Shona Phonetic Rules

### Vowels
- **a, e, i, o, u**: Pure vowels with stable formants
- Expected tone: Low (default)

### Implosives
- **b, d**: Glottalic ingressive airstreams
- Features: Low burst energy, implosive airstream detected

### Breathy-Voiced
- **bh, dh**: Breathy voice murmur
- Features: High aspiration, tone-depressing effect

### Whistled Sibilants
- **sv, zv**: High-frequency whistled fricatives
- Features: Spectral centroid > 7.0 kHz

### Prenasalized Consonants
- **mb, nd, ng**: Nasal + plosive combinations
- Features: Medium burst energy

## Development

### Adding New Phonetic Rules

1. Add the rule to `SHONA_PHONETIC_RULES` in `pronunciation-analysis.ts`
2. Update the `findPhoneticRule` method if needed
3. Add corresponding feedback templates
4. Update the comparison logic in `comparePhoneme`

### Testing

```bash
# Run the demo page
npm run dev
# Visit http://localhost:3000/pronunciation-demo
```

### Debugging

Enable debug logging by setting:
```env
DEBUG_PRONUNCIATION=true
```

## Performance Considerations

- Audio files are processed temporarily and cleaned up automatically
- Gemini API calls are optimized for minimal latency
- Scoring is deterministic and cacheable
- Error handling prevents system crashes

## Security

- API keys are stored in environment variables
- Audio files are processed securely and cleaned up
- Input validation prevents malicious uploads
- CORS headers are properly configured

## Future Enhancements

- [ ] Real-time pronunciation feedback
- [ ] Batch analysis for multiple words
- [ ] Integration with speech synthesis for practice
- [ ] Advanced tone pattern recognition
- [ ] Machine learning model fine-tuning
- [ ] Mobile app integration

## Contributing

1. Follow the existing code structure
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure error handling is robust
5. Maintain backward compatibility

## License

This project is part of the Shona Learn application. See the main LICENSE file for details. 