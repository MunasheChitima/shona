/**
 * Shona Pronunciation Service
 * Provides comprehensive IPA transcriptions and pronunciation guidance for Shona words
 * Using existing pronunciation infrastructure and vocabulary data
 */

import { processWord } from '../mudzidzisi-ai'

export interface ShonaPhoneme {
  token: string
  ipa: string
  type: 'whistled' | 'prenasalized' | 'breathy' | 'standard' | 'bilabial'
  description: string
  instructions: string
}

export interface PronunciationGuidance {
  word: string
  ipa: string
  syllables: string[]
  tonePattern: string
  specialSounds: ShonaPhoneme[]
  complexity: number
  elevenLabsHints: string[]
  culturalContext?: string
}

export class ShonaPronunciationService {
  
  private static readonly SPECIAL_SOUND_MAPPINGS = {
    // Whistled sibilants
    'sv': {
      type: 'whistled' as const,
      ipa: 'sv',
      description: 'KEYWORD: WHISTLED SIBILANT. A unique high-frequency \'s\' sound. Visually, lips are slightly rounded/protruded.',
      elevenLabsHint: 'pronounce with slight lip rounding and higher frequency'
    },
    'zv': {
      type: 'whistled' as const,
      ipa: 'zv',
      description: 'KEYWORD: VOICED WHISTLED SIBILANT. Voiced version of sv. High-frequency \'z\' with lip rounding.',
      elevenLabsHint: 'voiced whistled sound with slight lip protrusion'
    },
    
    // Prenasalized consonants
    'mb': {
      type: 'prenasalized' as const,
      ipa: 'ᵐb',
      description: 'A very brief nasal airflow immediately precedes the \'b\' stop within the same syllable.',
      elevenLabsHint: 'brief nasal before b sound, single syllable unit'
    },
    'nd': {
      type: 'prenasalized' as const,
      ipa: 'ⁿd',
      description: 'A very brief nasal airflow immediately precedes the \'d\' stop within the same syllable.',
      elevenLabsHint: 'brief nasal before d sound, single syllable unit'
    },
    'ng': {
      type: 'prenasalized' as const,
      ipa: 'ᵑg',
      description: 'A prenasalized hard \'g\' consonant, not a full separate vowel sound.',
      elevenLabsHint: 'brief nasal before hard g sound'
    },
    'nz': {
      type: 'prenasalized' as const,
      ipa: 'ⁿz',
      description: 'A very brief nasal airflow immediately precedes the \'z\' fricative within the same syllable.',
      elevenLabsHint: 'brief nasal before z sound, single syllable unit'
    },
    
    // Breathy consonants
    'bh': {
      type: 'breathy' as const,
      ipa: 'bʱ',
      description: 'KEYWORD: AUDIBLE SIGH. An English \'b\' sound with a simultaneous, audible release of air. The \'h\' is a feature, not a separate sound.',
      elevenLabsHint: 'b sound with audible breath release, like a sigh'
    },
    'dh': {
      type: 'breathy' as const,
      ipa: 'dʱ',
      description: 'English \'d\' sound with simultaneous audible breath release.',
      elevenLabsHint: 'd sound with audible breath release'
    },
    'gh': {
      type: 'breathy' as const,
      ipa: 'gʱ',
      description: 'English \'g\' sound with simultaneous audible breath release.',
      elevenLabsHint: 'g sound with audible breath release'
    },
    'vh': {
      type: 'breathy' as const,
      ipa: 'vʱ',
      description: 'English \'v\' sound with simultaneous audible breath release.',
      elevenLabsHint: 'v sound with audible breath release'
    },
    
    // Bilabial fricatives
    'bv': {
      type: 'bilabial' as const,
      ipa: 'ɓ',
      description: 'Bilabial implosive consonant with unique airflow.',
      elevenLabsHint: 'bilabial sound with slight implosive quality'
    },
    'pf': {
      type: 'bilabial' as const,
      ipa: 'p̪f',
      description: 'Labiodental affricate combining p and f sounds.',
      elevenLabsHint: 'p followed immediately by f sound'
    }
  }

  /**
   * Get comprehensive pronunciation guidance for a Shona word
   */
  static getPronunciationGuidance(word: string, existingData?: any): PronunciationGuidance {
    // Use existing vocabulary data if available
    if (existingData) {
      return {
        word: word,
        ipa: existingData.ipa || this.generateIPA(word),
        syllables: this.extractSyllables(word),
        tonePattern: existingData.tones || this.inferTonePattern(word),
        specialSounds: this.identifySpecialSounds(word),
        complexity: this.calculateComplexity(word),
        elevenLabsHints: this.getElevenLabsHints(word),
        culturalContext: existingData.cultural_notes
      }
    }

    // Fallback to AI analysis
    const analysis = processWord(word)
    return {
      word: word,
      ipa: this.generateIPA(word),
      syllables: analysis.profile.syllables || this.extractSyllables(word),
      tonePattern: this.inferTonePattern(word),
      specialSounds: this.identifySpecialSounds(word),
      complexity: analysis.metadata.complexity || this.calculateComplexity(word),
      elevenLabsHints: this.getElevenLabsHints(word),
      culturalContext: undefined
    }
  }

  /**
   * Generate IPA transcription for a word
   */
  private static generateIPA(word: string): string {
    let ipa = '/'
    let i = 0
    
    while (i < word.length) {
      // Check for two-character special sounds first
      const twoChar = word.substring(i, i + 2)
      if (this.SPECIAL_SOUND_MAPPINGS[twoChar]) {
        ipa += this.SPECIAL_SOUND_MAPPINGS[twoChar].ipa
        i += 2
        continue
      }
      
      // Single character mapping
      const char = word[i]
      ipa += this.mapCharacterToIPA(char)
      i++
    }
    
    return ipa + '/'
  }

  /**
   * Map individual characters to IPA
   */
  private static mapCharacterToIPA(char: string): string {
    const mapping: Record<string, string> = {
      'a': 'a', 'e': 'e', 'i': 'i', 'o': 'o', 'u': 'u',
      'b': 'b', 'c': 'tʃ', 'd': 'd', 'f': 'f', 'g': 'g',
      'h': 'h', 'j': 'dʒ', 'k': 'k', 'l': 'l', 'm': 'm',
      'n': 'n', 'p': 'p', 'r': 'r', 's': 's', 't': 't',
      'v': 'v', 'w': 'w', 'y': 'j', 'z': 'z'
    }
    return mapping[char.toLowerCase()] || char
  }

  /**
   * Extract syllable structure
   */
  private static extractSyllables(word: string): string[] {
    // Simple syllable extraction - can be enhanced
    const syllables: string[] = []
    let currentSyllable = ''
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i]
      currentSyllable += char
      
      // Check if this completes a syllable (ends with vowel)
      if ('aeiou'.includes(char.toLowerCase())) {
        syllables.push(currentSyllable)
        currentSyllable = ''
      }
    }
    
    // Add remaining consonants to last syllable
    if (currentSyllable && syllables.length > 0) {
      syllables[syllables.length - 1] += currentSyllable
    } else if (currentSyllable) {
      syllables.push(currentSyllable)
    }
    
    return syllables.length > 0 ? syllables : [word]
  }

  /**
   * Infer tone pattern (basic implementation)
   */
  private static inferTonePattern(word: string): string {
    // Default pattern based on syllable count
    const syllableCount = this.extractSyllables(word).length
    if (syllableCount === 1) return 'H'
    if (syllableCount === 2) return 'HL'
    if (syllableCount === 3) return 'HLL'
    return 'H' + 'L'.repeat(syllableCount - 1)
  }

  /**
   * Identify special sounds in the word
   */
  private static identifySpecialSounds(word: string): ShonaPhoneme[] {
    const specialSounds: ShonaPhoneme[] = []
    
    for (const token of Object.keys(this.SPECIAL_SOUND_MAPPINGS) as Array<keyof typeof this.SPECIAL_SOUND_MAPPINGS>) {
      if (word.includes(token)) {
        const mapping = this.SPECIAL_SOUND_MAPPINGS[token]
        specialSounds.push({
          token,
          ipa: mapping.ipa,
          type: mapping.type,
          description: mapping.description,
          instructions: mapping.elevenLabsHint
        })
      }
    }
    
    return specialSounds
  }

  /**
   * Calculate pronunciation complexity
   */
  private static calculateComplexity(word: string): number {
    let complexity = word.length
    
    // Add complexity for special sounds
    const specialSounds = this.identifySpecialSounds(word)
    complexity += specialSounds.length * 2
    
    // Add complexity for consonant clusters
    const consonantClusters = word.match(/[bcdfghjklmnpqrstvwxyz]{2,}/gi) || []
    complexity += consonantClusters.length
    
    return complexity
  }

  /**
   * Generate ElevenLabs pronunciation hints
   */
  static getElevenLabsHints(word: string): string[] {
    const hints: string[] = []
    const specialSounds = this.identifySpecialSounds(word)
    
    // Add general pronunciation guidance
    hints.push('Use slower speech rate (85%) for clarity')
    hints.push('Moderate emphasis for natural delivery')
    
    // Add specific hints for special sounds
    specialSounds.forEach(sound => {
      hints.push(`For "${sound.token}": ${sound.instructions}`)
    })
    
    // Add tone guidance
    const syllables = this.extractSyllables(word)
    if (syllables.length > 1) {
      hints.push('Pay attention to tone patterns - Shona is a tonal language')
    }
    
    return hints
  }

  /**
   * Get authentic pronunciation settings for ElevenLabs
   */
  static getAuthenticPronunciationSettings() {
    return {
      stability: 0.75,
      similarity_boost: 0.85,
      style: 0.4,
      use_speaker_boost: true,
      rate: '85%',
      emphasis: 'moderate'
    }
  }
}