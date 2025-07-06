/**
 * Mudzidzisi AI - Shona Pronunciation AI Agent
 * Autonomous phonetic analysis and asset generation system
 * 
 * This system implements the comprehensive phonetic analysis framework
 * specified in the Master Document & Operational Guide v2.0
 */

// Core interfaces for phonetic analysis
export interface PhonemeToken {
  token: string
  type: string
  ipa: string
  instructions: string
  category: string
  antiPatterns: string[]
}

export interface PhoneticProfile {
  word: string
  tokens: string[]
  syllables: string[]
  phonetic_profile: PhonemeToken[]
  global_rules: string[]
  tonePattern?: string
  vowelHiatus?: boolean
}

export interface AssetPrompt {
  type: 'audio' | 'video'
  prompt: string
  specifications: {
    audioSpecs?: {
      format: string
      sampleRate: number
      bitDepth: number
    }
    videoSpecs?: {
      resolution: string
      fps: number
      format: string
      viewTypes: string[]
    }
  }
}

// Phoneme Reference Table - Complete implementation of Section 3.2
const PHONEME_REFERENCE_TABLE: Record<string, PhonemeToken> = {
  // Vowels
  'a': {
    token: 'a',
    type: 'Pure Vowel',
    ipa: 'a',
    instructions: "Pronounce as 'ah' as in 'father'. Short, pure, static sound.",
    category: 'vowel',
    antiPatterns: ["DO NOT pronounce like the 'a' in 'cat' or 'make'. No gliding."]
  },
  'e': {
    token: 'e',
    type: 'Pure Vowel',
    ipa: 'e',
    instructions: "Pronounce as 'eh' as in 'bed'. No 'y' glide.",
    category: 'vowel',
    antiPatterns: ["DO NOT pronounce like the 'ee' in 'see'."]
  },
  'i': {
    token: 'i',
    type: 'Pure Vowel',
    ipa: 'i',
    instructions: "Pronounce as 'ee' as in 'see'.",
    category: 'vowel',
    antiPatterns: ["DO NOT pronounce like the 'i' in 'sit'."]
  },
  'o': {
    token: 'o',
    type: 'Pure Vowel',
    ipa: 'o',
    instructions: "Pronounce as 'oh' as in 'so'. No 'w' glide.",
    category: 'vowel',
    antiPatterns: ["DO NOT add a 'w' sound at the end as in the English 'go'."]
  },
  'u': {
    token: 'u',
    type: 'Pure Vowel',
    ipa: 'u',
    instructions: "Pronounce as 'oo' as in 'doom'.",
    category: 'vowel',
    antiPatterns: ["DO NOT pronounce like the 'u' in 'cup'."]
  },

  // Implosives
  'b': {
    token: 'b',
    type: 'Voiced Implosive',
    ipa: 'ɓ',
    instructions: "KEYWORD: INWARD AIRFLOW. Gentle inward suction. No puff of air. Visually, lips press together and release without explosive movement.",
    category: 'implosive',
    antiPatterns: ["DO NOT pronounce as an explosive English 'b'. A hand in front of the mouth should feel no air."]
  },
  'd': {
    token: 'd',
    type: 'Voiced Implosive',
    ipa: 'ɗ',
    instructions: "KEYWORD: INWARD AIRFLOW. Gentle inward suction with tongue against the alveolar ridge. No puff of air.",
    category: 'implosive',
    antiPatterns: ["DO NOT pronounce as an explosive English 'd'."]
  },

  // Breathy Voice
  'bh': {
    token: 'bh',
    type: 'Breathy-Voiced Plosive',
    ipa: 'bʱ',
    instructions: "KEYWORD: AUDIBLE SIGH. An English 'b' sound with a simultaneous, audible release of air. The 'h' is a feature, not a separate sound.",
    category: 'breathy',
    antiPatterns: ["DO NOT pronounce as 'b' followed by 'h' (e.g., 'ab-hor'). It is one single, airy sound."]
  },
  'dh': {
    token: 'dh',
    type: 'Breathy-Voiced Plosive',
    ipa: 'dʱ',
    instructions: "KEYWORD: AUDIBLE SIGH. An English 'd' sound with a simultaneous, audible release of air.",
    category: 'breathy',
    antiPatterns: ["DO NOT pronounce as 'd' followed by 'h'."]
  },

  // Whistled Sibilants
  'sv': {
    token: 'sv',
    type: 'Voiceless Whistled Sibilant',
    ipa: 'swhistling',
    instructions: "KEYWORD: WHISTLED SIBILANT. A unique high-frequency 's' sound. Visually, lips are slightly rounded/protruded.",
    category: 'whistled',
    antiPatterns: ["DO NOT produce a recreational whistle. It is a sibilant friction sound. DO NOT pronounce as 's' + 'v'."]
  },
  'zv': {
    token: 'zv',
    type: 'Voiced Whistled Sibilant',
    ipa: 'zwhistling',
    instructions: "KEYWORD: VOICED WHISTLED SIBILANT. Voiced version of sv. High-frequency 'z' with lip rounding.",
    category: 'whistled',
    antiPatterns: ["DO NOT pronounce as 'z' + 'v'."]
  },

  // Affricates & Palatals
  'pf': {
    token: 'pf',
    type: 'Voiceless Affricate',
    ipa: 'p̪f',
    instructions: "A p and f sound produced simultaneously as a single unit.",
    category: 'affricate',
    antiPatterns: ["DO NOT pronounce as two separate sounds."]
  },
  'bv': {
    token: 'bv',
    type: 'Breathy-Voiced Affricate',
    ipa: 'b̪v',
    instructions: "A b and v sound produced simultaneously with breathiness.",
    category: 'affricate',
    antiPatterns: ["DO NOT pronounce as 'b' + 'v'."]
  },
  'ts': {
    token: 'ts',
    type: 'Voiceless Affricate',
    ipa: 'ts',
    instructions: "The sound at the end of the English word 'cats'.",
    category: 'affricate',
    antiPatterns: ["DO NOT pronounce as two separate sounds."]
  },
  'dz': {
    token: 'dz',
    type: 'Voiced Affricate',
    ipa: 'dz',
    instructions: "The sound at the end of the English word 'rods'.",
    category: 'affricate',
    antiPatterns: ["DO NOT pronounce as two separate sounds."]
  },
  'tsv': {
    token: 'tsv',
    type: 'Whistled Affricate',
    ipa: 'tswhistling',
    instructions: "KEYWORD: WHISTLED AFFRICATE. A ts sound combined with the whistled sv sibilant.",
    category: 'whistled-affricate',
    antiPatterns: ["A single complex sound, not ts followed by v."]
  },
  'dzv': {
    token: 'dzv',
    type: 'Whistled Affricate',
    ipa: 'dzwhistling',
    instructions: "KEYWORD: VOICED WHISTLED AFFRICATE. A dz sound combined with the whistled zv sibilant.",
    category: 'whistled-affricate',
    antiPatterns: ["A single complex sound, not dz followed by v."]
  },
  'ty': {
    token: 'ty',
    type: 'Palatalized Stops',
    ipa: 'tj',
    instructions: "An English 't' where the middle of the tongue raises towards the hard palate, creating a slight 'y' off-glide.",
    category: 'palatalized',
    antiPatterns: ["The 'y' is a subtle modification of the consonant, not a full separate vowel sound."]
  },
  'dy': {
    token: 'dy',
    type: 'Palatalized Stops',
    ipa: 'dj',
    instructions: "An English 'd' where the middle of the tongue raises towards the hard palate, creating a slight 'y' off-glide.",
    category: 'palatalized',
    antiPatterns: ["The 'y' is a subtle modification of the consonant, not a full separate vowel sound."]
  },

  // Nasals & Clusters
  'ch': {
    token: 'ch',
    type: 'Voiceless Affricate',
    ipa: 'tʃ',
    instructions: "The sound in the English word 'chop'.",
    category: 'affricate',
    antiPatterns: []
  },
  'sh': {
    token: 'sh',
    type: 'Voiceless Fricative',
    ipa: 'ʃ',
    instructions: "The sound in the English word 'shoe'.",
    category: 'fricative',
    antiPatterns: []
  },
  'zh': {
    token: 'zh',
    type: 'Voiced Fricative',
    ipa: 'ʒ',
    instructions: "The sound of 's' in the English word 'pleasure'.",
    category: 'fricative',
    antiPatterns: []
  },
  'ny': {
    token: 'ny',
    type: 'Palatal Nasal',
    ipa: 'ɲ',
    instructions: "The sound of 'ny' in the English word 'canyon'.",
    category: 'nasal',
    antiPatterns: ["DO NOT pronounce as 'n' + 'y'. It is a single nasal sound."]
  },
  'mb': {
    token: 'mb',
    type: 'Prenasalized Stop',
    ipa: 'mb',
    instructions: "A very brief nasal airflow immediately precedes the 'b' stop within the same syllable.",
    category: 'prenasalized',
    antiPatterns: ["The nasal sound is very short, almost part of the 'b'."]
  },
  'nd': {
    token: 'nd',
    type: 'Prenasalized Stop',
    ipa: 'nd',
    instructions: "A very brief nasal airflow immediately precedes the 'd' stop within the same syllable.",
    category: 'prenasalized',
    antiPatterns: ["The nasal sound is very short, almost part of the 'd'."]
  },
  'ng': {
    token: 'ng',
    type: 'Prenasalized Stop',
    ipa: 'ŋɡ',
    instructions: "A prenasalized hard 'g' consonant, not a full separate vowel sound.",
    category: 'prenasalized',
    antiPatterns: ["DO NOT pronounce like the 'ng' in the English word 'sing'. It is 'ng' as in 'finger'."]
  },

  // Structural Rules
  "n'": {
    token: "n'",
    type: 'Velar Nasal',
    ipa: 'ŋ',
    instructions: "The sound at the end of the English word 'sing'. The apostrophe is critical.",
    category: 'nasal',
    antiPatterns: ["This is the sound from 'sing'. DO NOT add a hard 'g' sound."]
  },

  // Single consonants (monographs)
  'f': { token: 'f', type: 'Voiceless Fricative', ipa: 'f', instructions: "Standard English 'f' sound.", category: 'fricative', antiPatterns: [] },
  'g': { token: 'g', type: 'Voiced Stop', ipa: 'g', instructions: "Standard English 'g' sound.", category: 'stop', antiPatterns: [] },
  'h': { token: 'h', type: 'Voiceless Fricative', ipa: 'h', instructions: "Standard English 'h' sound.", category: 'fricative', antiPatterns: [] },
  'j': { token: 'j', type: 'Voiced Affricate', ipa: 'dʒ', instructions: "Standard English 'j' sound.", category: 'affricate', antiPatterns: [] },
  'k': { token: 'k', type: 'Voiceless Stop', ipa: 'k', instructions: "Standard English 'k' sound.", category: 'stop', antiPatterns: [] },
  'm': { token: 'm', type: 'Nasal', ipa: 'm', instructions: "Standard English 'm' sound.", category: 'nasal', antiPatterns: [] },
  'n': { token: 'n', type: 'Nasal', ipa: 'n', instructions: "Standard English 'n' sound.", category: 'nasal', antiPatterns: [] },
  'p': { token: 'p', type: 'Voiceless Stop', ipa: 'p', instructions: "Standard English 'p' sound.", category: 'stop', antiPatterns: [] },
  'r': { token: 'r', type: 'Liquid', ipa: 'r', instructions: "Standard English 'r' sound.", category: 'liquid', antiPatterns: [] },
  's': { token: 's', type: 'Voiceless Fricative', ipa: 's', instructions: "Standard English 's' sound.", category: 'fricative', antiPatterns: [] },
  't': { token: 't', type: 'Voiceless Stop', ipa: 't', instructions: "Standard English 't' sound.", category: 'stop', antiPatterns: [] },
  'w': { token: 'w', type: 'Glide', ipa: 'w', instructions: "Standard English 'w' sound.", category: 'glide', antiPatterns: [] },
  'y': { token: 'y', type: 'Glide', ipa: 'j', instructions: "Standard English 'y' sound.", category: 'glide', antiPatterns: [] },
  'z': { token: 'z', type: 'Voiced Fricative', ipa: 'z', instructions: "Standard English 'z' sound.", category: 'fricative', antiPatterns: [] }
}

// Precedence order for longest-match-first parsing
const PRECEDENCE_ORDER = [
  // Trigraphs (3 letters)
  'dzv', 'tsv',
  // Digraphs (2 letters)
  'bh', 'dh', 'sv', 'zv', 'pf', 'bv', 'ts', 'dz', 'ch', 'sh', 'zh', 'ny', 'mb', 'nd', 'ng', 'dy', 'ty', "n'",
  // Monographs (1 letter)
  'a', 'e', 'i', 'o', 'u', 'b', 'd', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 'r', 's', 't', 'w', 'y', 'z'
]

/**
 * Mudzidzisi AI Core Class
 * Implements the autonomous phonetic analysis system
 */
export class MudzidzisiAI {
  private static instance: MudzidzisiAI
  
  private constructor() {}
  
  public static getInstance(): MudzidzisiAI {
    if (!MudzidzisiAI.instance) {
      MudzidzisiAI.instance = new MudzidzisiAI()
    }
    return MudzidzisiAI.instance
  }

  /**
   * Stage 1: Ingest and Phonetic Tokenization
   * Applies longest-match-first principle for accurate tokenization
   */
  public tokenizeWord(word: string): string[] {
    const tokens: string[] = []
    let position = 0
    
    while (position < word.length) {
      let matched = false
      
      // Apply longest-match-first principle
      for (const phoneme of PRECEDENCE_ORDER) {
        const substring = word.substring(position, position + phoneme.length)
        
        if (substring === phoneme) {
          tokens.push(phoneme)
          position += phoneme.length
          matched = true
          break
        }
      }
      
      if (!matched) {
        // If no match found, skip character (shouldn't happen with proper Shona)
        console.warn(`Unrecognized character at position ${position} in word "${word}": ${word[position]}`)
        position++
      }
    }
    
    return tokens
  }

  /**
   * Stage 2: Syllabification and Phonetic Profiling
   * Groups tokens into syllables and creates detailed phonetic profiles
   */
  public createPhoneticProfile(word: string): PhoneticProfile {
    const tokens = this.tokenizeWord(word)
    const syllables = this.syllabify(tokens)
    const phoneticProfile = this.buildPhoneticProfile(tokens)
    const globalRules = this.determineGlobalRules(tokens)
    
    return {
      word,
      tokens,
      syllables,
      phonetic_profile: phoneticProfile,
      global_rules: globalRules,
      vowelHiatus: this.detectVowelHiatus(tokens)
    }
  }

  /**
   * Syllabification based on CV (Consonant-Vowel) structure
   * Handles special cases like vowel hiatus
   */
  private syllabify(tokens: string[]): string[] {
    const syllables: string[] = []
    let currentSyllable = ''
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      const phoneme = PHONEME_REFERENCE_TABLE[token]
      
      if (!phoneme) {
        console.warn(`Unknown phoneme: ${token}`)
        continue
      }
      
      if (phoneme.category === 'vowel') {
        // Check for vowel hiatus
        const prevToken = tokens[i - 1]
        const prevPhoneme = prevToken ? PHONEME_REFERENCE_TABLE[prevToken] : null
        
        if (prevPhoneme && prevPhoneme.category === 'vowel') {
          // Vowel hiatus - previous vowel forms its own syllable
          if (currentSyllable) {
            syllables.push(currentSyllable)
            currentSyllable = ''
          }
        }
        
        currentSyllable += token
        
        // Check if next token is consonant (end of syllable)
        const nextToken = tokens[i + 1]
        const nextPhoneme = nextToken ? PHONEME_REFERENCE_TABLE[nextToken] : null
        
        if (!nextPhoneme || nextPhoneme.category !== 'vowel') {
          syllables.push(currentSyllable)
          currentSyllable = ''
        }
      } else {
        // Consonant - add to current syllable
        currentSyllable += token
      }
    }
    
    if (currentSyllable) {
      syllables.push(currentSyllable)
    }
    
    return syllables
  }

  /**
   * Build detailed phonetic profile for each token
   */
  private buildPhoneticProfile(tokens: string[]): PhonemeToken[] {
    return tokens.map(token => {
      const phoneme = PHONEME_REFERENCE_TABLE[token]
      if (!phoneme) {
        console.warn(`Unknown phoneme: ${token}`)
        return {
          token,
          type: 'Unknown',
          ipa: token,
          instructions: `Unknown phoneme: ${token}`,
          category: 'unknown',
          antiPatterns: []
        }
      }
      return { ...phoneme }
    })
  }

  /**
   * Determine global pronunciation rules
   */
  private determineGlobalRules(tokens: string[]): string[] {
    const rules = ['EVEN_STRESS']
    
    // Check for vowel hiatus
    if (this.detectVowelHiatus(tokens)) {
      rules.push('VOWEL_HIATUS')
    }
    
    return rules
  }

  /**
   * Detect vowel hiatus pattern
   */
  private detectVowelHiatus(tokens: string[]): boolean {
    for (let i = 0; i < tokens.length - 1; i++) {
      const current = PHONEME_REFERENCE_TABLE[tokens[i]]
      const next = PHONEME_REFERENCE_TABLE[tokens[i + 1]]
      
      if (current?.category === 'vowel' && next?.category === 'vowel') {
        return true
      }
    }
    return false
  }

  /**
   * Stage 3: Dynamic Prompt Generation
   * Creates detailed prompts for TTS and Video Synthesis AI
   */
  public generateAudioPrompt(profile: PhoneticProfile): AssetPrompt {
    let prompt = `Generate a high-fidelity audio file for the Shona word '${profile.word}'. Pronunciation must be phonetically precise.\n\n`
    
    prompt += `Syllabification is: ${profile.syllables.join('-')}.\n\n`
    
    // Add detailed phonetic instructions
    profile.phonetic_profile.forEach(phoneme => {
      prompt += `The token '${phoneme.token}' is a ${phoneme.type.toLowerCase()} [${phoneme.ipa}]. ${phoneme.instructions}\n`
      
      if (phoneme.antiPatterns.length > 0) {
        prompt += `Critical: ${phoneme.antiPatterns.join(' ')}\n`
      }
      prompt += '\n'
    })
    
    // Add global rules
    if (profile.global_rules.includes('EVEN_STRESS')) {
      prompt += "Apply the global rule of EVEN_STRESS to all syllables. All syllables should have relatively equal stress and timing.\n"
    }
    
    if (profile.global_rules.includes('VOWEL_HIATUS')) {
      prompt += "VOWEL_HIATUS detected: When consecutive vowels appear, they belong to separate syllables and must each be pronounced fully without blending.\n"
    }
    
    return {
      type: 'audio',
      prompt,
      specifications: {
        audioSpecs: {
          format: 'wav',
          sampleRate: 44100,
          bitDepth: 16
        }
      }
    }
  }

  /**
   * Generate video synthesis prompt with detailed visual instructions
   */
  public generateVideoPrompt(profile: PhoneticProfile): AssetPrompt {
    let prompt = `Generate a video of a neutral, front-facing human head pronouncing the Shona word '${profile.word}'.\n\n`
    
    prompt += `The word is pronounced in ${profile.syllables.length} distinct syllables: ${profile.syllables.join('-')}.\n\n`
    
    // Add detailed visual instructions for each phoneme
    profile.phonetic_profile.forEach(phoneme => {
      switch (phoneme.category) {
        case 'vowel':
          prompt += `For the vowel '${phoneme.token}', the mouth shape must be pure and static, matching the [${phoneme.ipa}] sound without gliding. `
          if (phoneme.token === 'a') prompt += "'a' is a wide open mouth, "
          if (phoneme.token === 'i') prompt += "'i' is a wide smile, "
          if (phoneme.token === 'u') prompt += "'u' is tightly rounded lips."
          prompt += '\n'
          break
          
        case 'implosive':
          prompt += `For the implosive '${phoneme.token}', show the ${phoneme.token === 'b' ? 'lips' : 'tongue-tip'} making a seal, followed by a release with NO visible puff of air or outward explosive motion. The movement is subtle and contained.\n`
          break
          
        case 'breathy':
          prompt += `For the breathy-voiced '${phoneme.token}', show a standard plosive mouth shape, but the model should visually suggest a release of air, perhaps with a slight relaxation of the cheeks, concurrent with the sound.\n`
          break
          
        case 'whistled':
        case 'whistled-affricate':
          prompt += `CRITICAL: For the whistled sibilant '${phoneme.token}', the lips must be slightly rounded and protruded. The lower lip should visibly rise towards the upper teeth. This specific posture is key. Generate a secondary video from a profile (side) view to clearly show this lip posture.\n`
          break
          
        default:
          prompt += `For '${phoneme.token}' [${phoneme.ipa}], show standard articulation for this ${phoneme.type.toLowerCase()}.\n`
      }
    })
    
    // Add vowel hiatus instructions
    if (profile.vowelHiatus) {
      prompt += "\nWhen Vowel Hiatus occurs, the video must show a clear and distinct re-articulation. The mouth should fully form the first vowel shape, relax slightly, and then fully form the second vowel shape. Do not blend these movements.\n"
    }
    
    prompt += "\nThe overall delivery must be rhythmically even, with equal time and emphasis on each syllable. Avoid any exaggerated facial expressions not related to articulation."
    
    return {
      type: 'video',
      prompt,
      specifications: {
        videoSpecs: {
          resolution: '1080p',
          fps: 30,
          format: 'mp4',
          viewTypes: ['front', 'profile'] // Add profile view for whistled sounds
        }
      }
    }
  }

  /**
   * Stage 4: Complete processing workflow
   * Processes a word through all stages and returns complete analysis
   */
  public processWord(word: string): {
    profile: PhoneticProfile
    audioPrompt: AssetPrompt
    videoPrompt: AssetPrompt
    metadata: {
      processingTimestamp: Date
      version: string
      complexity: number
    }
  } {
    const profile = this.createPhoneticProfile(word.toLowerCase())
    const audioPrompt = this.generateAudioPrompt(profile)
    const videoPrompt = this.generateVideoPrompt(profile)
    
    // Calculate complexity score
    const complexity = this.calculateComplexity(profile)
    
    return {
      profile,
      audioPrompt,
      videoPrompt,
      metadata: {
        processingTimestamp: new Date(),
        version: '2.0',
        complexity
      }
    }
  }

  /**
   * Calculate pronunciation complexity score
   */
  private calculateComplexity(profile: PhoneticProfile): number {
    let score = 0
    
    profile.phonetic_profile.forEach(phoneme => {
      switch (phoneme.category) {
        case 'vowel': score += 1; break
        case 'implosive': score += 3; break
        case 'breathy': score += 4; break
        case 'whistled': score += 5; break
        case 'whistled-affricate': score += 6; break
        case 'prenasalized': score += 3; break
        case 'palatalized': score += 2; break
        default: score += 1
      }
    })
    
    if (profile.vowelHiatus) score += 2
    
    return score
  }

  /**
   * Batch process multiple words
   */
  public processWordList(words: string[]): Array<{
    word: string
    profile: PhoneticProfile
    audioPrompt: AssetPrompt
    videoPrompt: AssetPrompt
    metadata: any
  }> {
    return words.map(word => ({
      word,
      ...this.processWord(word)
    }))
  }

  /**
   * Get phoneme reference information
   */
  public getPhonemeReference(token: string): PhonemeToken | undefined {
    return PHONEME_REFERENCE_TABLE[token]
  }

  /**
   * Validate Shona word structure
   */
  public validateShonaWord(word: string): {
    isValid: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    
    // Check for invalid character combinations
    const tokens = this.tokenizeWord(word)
    const unrecognized = tokens.filter(token => !PHONEME_REFERENCE_TABLE[token])
    
    if (unrecognized.length > 0) {
      issues.push(`Unrecognized phonemes: ${unrecognized.join(', ')}`)
      suggestions.push('Check spelling and ensure proper Shona orthography')
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    }
  }
}

// Export singleton instance
export const mudzidzisiAI = MudzidzisiAI.getInstance()

// Export utility functions
export const processWord = (word: string) => mudzidzisiAI.processWord(word)
export const createPhoneticProfile = (word: string) => mudzidzisiAI.createPhoneticProfile(word)
export const generateAudioPrompt = (profile: PhoneticProfile) => mudzidzisiAI.generateAudioPrompt(profile)
export const generateVideoPrompt = (profile: PhoneticProfile) => mudzidzisiAI.generateVideoPrompt(profile)