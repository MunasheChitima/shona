# ElevenLabs Shona Pronunciation Guide

## Overview

This guide documents the comprehensive Shona pronunciation system integrated with ElevenLabs text-to-speech API. The system handles all special Shona sounds including whistled sibilants, prenasalized consonants, and breathy consonants.

## Setup

### 1. Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_ELEVENLABS_API_KEY="your-elevenlabs-api-key"
NEXT_PUBLIC_ELEVENLABS_VOICE_ID="EXAVITQu4vr4xnSDxMaL"  # Sarah voice (recommended)
```

### 2. Alternative Voice Options

- `EXAVITQu4vr4xnSDxMaL` - Sarah (clear, neutral - recommended)
- `ErXwobaYiN019PkySvjV` - Antoni (deep, clear voice)
- `MF3mGyEYCl7XYWbV9V6O` - Elli (young, clear voice)
- `21m00Tcm4TlvDq8ikWAM` - Rachel (neutral female)
- `yoZ06aMxZJJ28mfd3POQ` - Sam (neutral male)

## Special Shona Sounds

### 1. Whistled Sibilants

These sounds require high-frequency pronunciation with rounded lips:

- **sv** - as in "svika" (arrive)
- **zv** - as in "zvino" (now)
- **tsv** - as in "tsvuku" (red)
- **dzv** - as in "dzva" (yesterday)
- **nzv** - as in "hanzvadzi" (sibling)

**ElevenLabs Handling**: These are converted to "svee", "zvee", etc. to emphasize the whistled quality.

### 2. Prenasalized Consonants

Brief nasal sound immediately precedes the consonant:

- **mb** - as in "mbira" (thumb piano)
- **nd** - as in "ndimi" (you plural)
- **ng** - as in "ngoma" (drum)
- **nj** - as in "njiva" (dove)
- **nz** - as in "nzeve" (ear)
- **mv** - as in "mvura" (rain/water)

**ElevenLabs Handling**: Converted to "m-b", "n-d", etc. to ensure the nasal component is pronounced.

### 3. Breathy Consonants

Pronounced with audible breath/aspiration:

- **bh** - as in "bhazi" (bus)
- **dh** - as in "dhara" (old)
- **vh** - as in "ivhu" (soil)
- **mh** - as in "mhino" (nose)
- **th** - as in "thatha" (take)
- **kh** - as in "khaki" (khaki)
- **ph** - as in "phepha" (paper)

**ElevenLabs Handling**: Converted to "b-ha", "d-ha", etc. to emphasize the breathy quality.

### 4. Labialized Consonants

Pronounced with lip rounding:

- **gw** - as in "gwara" (road)
- **kw** - as in "kwana" (enough)
- **ngw** - as in "mangwanani" (morning)
- **mw** - as in "mwana" (child)
- **rw** - as in "rwizi" (river)

### 5. Palatalized Consonants

Tongue raised toward the palate:

- **dy** - as in "kudya" (to eat)
- **ty** - as in "tya" (fear)
- **ny** - as in "nyama" (meat)
- **nh** - as in "manheru" (evening)

### 6. Affricates

Stop + fricative combinations:

- **ch** - as in "china" (Thursday)
- **dz** - as in "sadza" (staple food)
- **ts** - as in "tsoka" (foot)
- **pf** - as in "pfumo" (spear)

## Usage Examples

### Basic Usage

```tsx
import TextToSpeech from '@/app/components/voice/TextToSpeech'

// Basic usage with ElevenLabs
<TextToSpeech 
  text="svika"
  useElevenLabs={true}
/>

// With custom phonetic hint
<TextToSpeech 
  text="mbira"
  phonetic="m-BEE-rah"
  useElevenLabs={true}
/>
```

### Using the Pronunciation Service

```tsx
import ShonaPronunciationService from '@/lib/services/ShonaPronunciationService'

const service = ShonaPronunciationService.getInstance()

// Get phonetic representation
const phonetic = service.getPhonetic('zvino')  // Returns: "ZVEE-no"

// Get IPA
const ipa = service.toIPA('mbira')  // Returns: "/ᵐbí.ɾa/"

// Get special sounds
const sounds = service.getSpecialSounds('bhazi')
// Returns: [{ token: 'bh', type: 'breathy', description: '...' }]

// Get ElevenLabs hints
const hints = service.getElevenLabsHints('svika')
// Returns: { phonetic: 'SVEE-kah', ssml: '...', notes: [...] }
```

### Direct ElevenLabs API Usage

```tsx
import ElevenLabsService from '@/lib/services/ElevenLabsService'

const elevenLabs = ElevenLabsService.getInstance({
  apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
})

// Generate speech
const audioBuffer = await elevenLabs.generateSpeech('mangwanani', {
  voiceSettings: {
    stability: 0.8,
    similarity_boost: 0.9,
    style: 0.2
  }
})

// Stream speech
for await (const chunk of elevenLabs.streamSpeech('ndatenda')) {
  // Process audio chunk
}
```

## Pronunciation Test Page

Visit `/pronunciation-test` to:

1. Test different categories of Shona sounds
2. Compare browser TTS vs ElevenLabs
3. See IPA, CMU, and phonetic representations
4. Listen to correct pronunciations
5. View special sound annotations

## Troubleshooting

### Common Issues

1. **Whistled sounds not pronounced correctly**
   - Ensure ElevenLabs is using the multilingual model
   - Try different voice IDs (Sarah or Antoni work best)
   - Adjust stability setting (0.7-0.8 recommended)

2. **Prenasalized consonants sound like regular consonants**
   - The hyphenation (m-b, n-d) helps ElevenLabs pause slightly
   - Increase similarity_boost to 0.9 for clearer articulation

3. **Breathy consonants lack aspiration**
   - The "-ha" suffix helps ElevenLabs add breath
   - Lower the style parameter to 0.2-0.3 for clearer pronunciation

### Voice Settings Recommendations

```javascript
{
  stability: 0.75,        // Consistent pronunciation
  similarity_boost: 0.85, // Clear articulation
  style: 0.3,            // Natural but clear
  use_speaker_boost: true // Enhanced clarity
}
```

## API Rate Limits

ElevenLabs has character limits based on your subscription:
- Free tier: 10,000 characters/month
- Starter: 30,000 characters/month
- Creator: 100,000 characters/month

Monitor usage with:
```tsx
const usage = await elevenLabs.getUsage()
console.log(`Used: ${usage.character_count}/${usage.character_limit}`)
```

## Future Enhancements

1. **Custom Pronunciation Dictionary**: When ElevenLabs supports custom dictionaries for new languages
2. **Voice Cloning**: Train on native Shona speakers
3. **SSML Enhancements**: More detailed prosody control
4. **Tone Patterns**: Implement high/low/rising/falling tone markers
5. **Batch Processing**: Generate audio for entire vocabulary offline