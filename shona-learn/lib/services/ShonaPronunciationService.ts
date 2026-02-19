// Comprehensive Shona Pronunciation Service
// Based on the Shona Pronunciation Dictionary

import { pronunciationDictionary, PronunciationEntry } from '../data/shonaPronunciationDictionary'

interface ConsonantMapping {
  grapheme: string
  ipa: string
  cmu: string
  description?: string
}

interface VowelMapping {
  grapheme: string
  ipa: string
  cmu: string
  tone?: 'H' | 'L' | 'R' | 'F'
}

export class ShonaPronunciationService {
  private static instance: ShonaPronunciationService

  // Comprehensive consonant mappings
  private readonly consonantMap: Map<string, ConsonantMapping> = new Map([
    // Simple consonants
    ['b', { grapheme: 'b', ipa: 'ɓ', cmu: 'B' }],
    ['d', { grapheme: 'd', ipa: 'd', cmu: 'D' }],
    ['f', { grapheme: 'f', ipa: 'f', cmu: 'F' }],
    ['g', { grapheme: 'g', ipa: 'ɡ', cmu: 'G' }],
    ['h', { grapheme: 'h', ipa: 'h', cmu: 'HH' }],
    ['j', { grapheme: 'j', ipa: 'dʒ', cmu: 'JH' }],
    ['k', { grapheme: 'k', ipa: 'k', cmu: 'K' }],
    ['l', { grapheme: 'l', ipa: 'l', cmu: 'L' }],
    ['m', { grapheme: 'm', ipa: 'm', cmu: 'M' }],
    ['n', { grapheme: 'n', ipa: 'n', cmu: 'N' }],
    ['p', { grapheme: 'p', ipa: 'p', cmu: 'P' }],
    ['r', { grapheme: 'r', ipa: 'ɾ', cmu: 'R' }],
    ['s', { grapheme: 's', ipa: 's', cmu: 'S' }],
    ['t', { grapheme: 't', ipa: 't', cmu: 'T' }],
    ['v', { grapheme: 'v', ipa: 'v', cmu: 'V' }],
    ['w', { grapheme: 'w', ipa: 'w', cmu: 'W' }],
    ['y', { grapheme: 'y', ipa: 'j', cmu: 'Y' }],
    ['z', { grapheme: 'z', ipa: 'z', cmu: 'Z' }],
    
    // Breathy consonants
    ['bh', { grapheme: 'bh', ipa: 'bʱ', cmu: 'BH', description: 'breathy b with audible sigh' }],
    ['dh', { grapheme: 'dh', ipa: 'dʱ', cmu: 'DH', description: 'breathy d' }],
    ['vh', { grapheme: 'vh', ipa: 'v̤', cmu: 'VH', description: 'breathy v' }],
    ['mh', { grapheme: 'mh', ipa: 'm̥', cmu: 'MH', description: 'voiceless m' }],
    
    // Prenasalized consonants
    ['mb', { grapheme: 'mb', ipa: 'ᵐb', cmu: 'MB', description: 'prenasalized b' }],
    ['nd', { grapheme: 'nd', ipa: 'ⁿd', cmu: 'ND', description: 'prenasalized d' }],
    ['ng', { grapheme: 'ng', ipa: 'ᵑɡ', cmu: 'NG', description: 'prenasalized g' }],
    ['nj', { grapheme: 'nj', ipa: 'ⁿdʒ', cmu: 'NJ', description: 'prenasalized j' }],
    ['nz', { grapheme: 'nz', ipa: 'ⁿz', cmu: 'NZ', description: 'prenasalized z' }],
    ['mv', { grapheme: 'mv', ipa: 'ᵐv', cmu: 'MV', description: 'prenasalized v' }],
    
    // Whistled sibilants
    ['sv', { grapheme: 'sv', ipa: 's̫', cmu: 'SV', description: 'whistled s - high frequency with lip rounding' }],
    ['zv', { grapheme: 'zv', ipa: 'z̫', cmu: 'ZV', description: 'whistled z - voiced whistled sibilant' }],
    ['tsv', { grapheme: 'tsv', ipa: 'ts̫', cmu: 'TSV', description: 'whistled ts' }],
    ['dzv', { grapheme: 'dzv', ipa: 'dz̫', cmu: 'DZV', description: 'whistled dz' }],
    ['nzv', { grapheme: 'nzv', ipa: 'ⁿz̫', cmu: 'NZV', description: 'prenasalized whistled z' }],
    
    // Labialized consonants
    ['bv', { grapheme: 'bv', ipa: 'ɓv', cmu: 'BV' }],
    ['gw', { grapheme: 'gw', ipa: 'ɡʷ', cmu: 'GW' }],
    ['kw', { grapheme: 'kw', ipa: 'kʷ', cmu: 'KW' }],
    ['ngw', { grapheme: 'ngw', ipa: 'ᵑɡʷ', cmu: 'NGW' }],
    ['mw', { grapheme: 'mw', ipa: 'mʷ', cmu: 'MW' }],
    ['pw', { grapheme: 'pw', ipa: 'pʷ', cmu: 'PW' }],
    ['rw', { grapheme: 'rw', ipa: 'ɾʷ', cmu: 'RW' }],
    ['sw', { grapheme: 'sw', ipa: 'sʷ', cmu: 'SW' }],
    ['tw', { grapheme: 'tw', ipa: 'tʷ', cmu: 'TW' }],
    ['zw', { grapheme: 'zw', ipa: 'zʷ', cmu: 'ZW' }],
    ['hw', { grapheme: 'hw', ipa: 'hʷ', cmu: 'HW' }],
    ['chw', { grapheme: 'chw', ipa: 'tʃʷ', cmu: 'CHW' }],
    
    // Palatalized consonants
    ['dy', { grapheme: 'dy', ipa: 'dʲ', cmu: 'DY' }],
    ['ty', { grapheme: 'ty', ipa: 'tʲ', cmu: 'TY' }],
    ['ny', { grapheme: 'ny', ipa: 'ɲ', cmu: 'NY' }],
    ['nh', { grapheme: 'nh', ipa: 'ɲ', cmu: 'NY' }],
    
    // Affricates
    ['ch', { grapheme: 'ch', ipa: 'tʃ', cmu: 'CH' }],
    ['dz', { grapheme: 'dz', ipa: 'dz', cmu: 'DZ' }],
    ['ts', { grapheme: 'ts', ipa: 'ts', cmu: 'TS' }],
    ['pf', { grapheme: 'pf', ipa: 'p͡f', cmu: 'PF' }],
    
    // Other sounds
    ['sh', { grapheme: 'sh', ipa: 'ʃ', cmu: 'SH' }],
    ['zh', { grapheme: 'zh', ipa: 'ʒ', cmu: 'ZH' }],
    ['th', { grapheme: 'th', ipa: 'tʰ', cmu: 'TH' }],
    ['kh', { grapheme: 'kh', ipa: 'kʰ', cmu: 'KH' }],
    ['ph', { grapheme: 'ph', ipa: 'pʰ', cmu: 'PH' }],
    ["ng'", { grapheme: "ng'", ipa: 'ŋ', cmu: 'NGG' }],
  ])

  // Vowel mappings
  private readonly vowelMap: Map<string, VowelMapping> = new Map([
    ['a', { grapheme: 'a', ipa: 'a', cmu: 'AA' }],
    ['e', { grapheme: 'e', ipa: 'e', cmu: 'EH' }],
    ['i', { grapheme: 'i', ipa: 'i', cmu: 'IY' }],
    ['o', { grapheme: 'o', ipa: 'o', cmu: 'OW' }],
    ['u', { grapheme: 'u', ipa: 'u', cmu: 'UW' }],
    ['a:', { grapheme: 'a:', ipa: 'aː', cmu: 'AA2' }],
    ['e:', { grapheme: 'e:', ipa: 'eː', cmu: 'EH2' }],
    ['i:', { grapheme: 'i:', ipa: 'iː', cmu: 'IY2' }],
    ['o:', { grapheme: 'o:', ipa: 'oː', cmu: 'OW2' }],
    ['u:', { grapheme: 'u:', ipa: 'uː', cmu: 'UW2' }],
  ])

  // Common word pronunciations from the dictionary
  private readonly wordPronunciations: Map<string, PronunciationEntry> = new Map()

  private constructor() {
    this.initializeWordPronunciations()
  }

  static getInstance(): ShonaPronunciationService {
    if (!ShonaPronunciationService.instance) {
      ShonaPronunciationService.instance = new ShonaPronunciationService()
    }
    return ShonaPronunciationService.instance
  }

  private initializeWordPronunciations() {
    // Load the comprehensive pronunciation dictionary
    pronunciationDictionary.forEach(entry => {
      this.wordPronunciations.set(entry.word.toLowerCase(), entry)
      // Also add variations without spaces for phrases
      if (entry.word.includes(' ')) {
        this.wordPronunciations.set(entry.word.replace(/\s+/g, '').toLowerCase(), entry)
      }
    })
  }

  // Convert Shona text to IPA
  public toIPA(text: string): string {
    const word = text.toLowerCase().trim()
    
    // Check if we have a direct word mapping
    if (this.wordPronunciations.has(word)) {
      return this.wordPronunciations.get(word)!.ipa
    }

    // Otherwise, convert character by character
    let ipa = ''
    let i = 0
    
    while (i < word.length) {
      let matched = false
      
      // Try to match multi-character consonants first (longest match)
      for (let len = 3; len >= 1; len--) {
        const substr = word.substr(i, len)
        if (this.consonantMap.has(substr)) {
          ipa += this.consonantMap.get(substr)!.ipa
          i += len
          matched = true
          break
        }
      }
      
      // If no consonant matched, check vowels
      if (!matched) {
        const char = word[i]
        if (this.vowelMap.has(char)) {
          ipa += this.vowelMap.get(char)!.ipa
          i++
        } else {
          // Unknown character, keep as is
          ipa += char
          i++
        }
      }
    }
    
    return `/${ipa}/`
  }

  // Convert Shona text to CMU/ARPABET format
  public toCMU(text: string): string {
    const word = text.toLowerCase().trim()
    
    // Check if we have a direct word mapping
    if (this.wordPronunciations.has(word)) {
      return this.wordPronunciations.get(word)!.cmu
    }

    // Otherwise, convert character by character
    const syllables: string[] = []
    let currentSyllable = ''
    let i = 0
    
    while (i < word.length) {
      let matched = false
      
      // Try to match multi-character consonants first
      for (let len = 3; len >= 1; len--) {
        const substr = word.substr(i, len)
        if (this.consonantMap.has(substr)) {
          currentSyllable += this.consonantMap.get(substr)!.cmu + ' '
          i += len
          matched = true
          break
        }
      }
      
      // If no consonant matched, check vowels
      if (!matched) {
        const char = word[i]
        if (this.vowelMap.has(char)) {
          currentSyllable += this.vowelMap.get(char)!.cmu + '0' // Default unstressed
          syllables.push(currentSyllable.trim())
          currentSyllable = ''
          i++
        } else {
          i++
        }
      }
    }
    
    if (currentSyllable.trim()) {
      syllables.push(currentSyllable.trim())
    }
    
    return syllables.join('-')
  }

  // Get phonetic representation for TTS
  public getPhonetic(text: string): string {
    const word = text.toLowerCase().trim()
    
    // Check if we have a direct word mapping
    if (this.wordPronunciations.has(word)) {
      const entry = this.wordPronunciations.get(word)!
      // Return a simplified phonetic representation
      return this.simplifyPhonetic(entry.cmu)
    }

    // Generate phonetic representation
    return this.generateSimplePhonetic(word)
  }

  // Generate a simple phonetic representation for unknown words
  private generateSimplePhonetic(word: string): string {
    let phonetic = ''
    let i = 0
    
    while (i < word.length) {
      let matched = false
      
      // Check for special consonant combinations
      for (let len = 3; len >= 2; len--) {
        const substr = word.substr(i, len)
        if (this.consonantMap.has(substr)) {
          const mapping = this.consonantMap.get(substr)!
          
          // Apply special pronunciation rules
          switch (mapping.grapheme) {
            case 'sv':
            case 'zv':
              phonetic += substr.toUpperCase() + 'EE'
              break
            case 'mb':
            case 'nd':
            case 'ng':
              phonetic += 'M' + substr[1].toUpperCase()
              break
            case 'bh':
              phonetic += 'B(h)'
              break
            default:
              phonetic += substr.toUpperCase()
          }
          
          i += len
          matched = true
          break
        }
      }
      
      if (!matched) {
        phonetic += word[i].toUpperCase()
        i++
      }
    }
    
    return phonetic
  }

  // Simplify CMU notation for display
  private simplifyPhonetic(cmu: string): string {
    return cmu
      .replace(/AA0/g, 'ah')
      .replace(/AA1H?/g, 'AH')
      .replace(/EH0/g, 'eh')
      .replace(/EH1H?/g, 'EH')
      .replace(/IY0/g, 'ee')
      .replace(/IY1H?/g, 'EE')
      .replace(/OW0/g, 'oh')
      .replace(/OW1H?/g, 'OH')
      .replace(/UW0/g, 'oo')
      .replace(/UW1H?/g, 'OO')
      .replace(/-/g, '-')
  }

  // Get special sounds in a word
  public getSpecialSounds(text: string): Array<{token: string, type: string, description: string}> {
    const word = text.toLowerCase().trim()
    
    if (this.wordPronunciations.has(word)) {
      return this.wordPronunciations.get(word)!.specialSounds || []
    }

    // Detect special sounds in unknown words
    const specialSounds: Array<{token: string, type: string, description: string}> = []
    
    // Check for whistled sibilants
    if (word.includes('sv')) {
      specialSounds.push({
        token: 'sv',
        type: 'whistled',
        description: 'Whistled sibilant - high frequency s with lip rounding'
      })
    }
    if (word.includes('zv')) {
      specialSounds.push({
        token: 'zv',
        type: 'whistled',
        description: 'Voiced whistled sibilant'
      })
    }
    
    // Check for prenasalized consonants
    const prenasalizedConsonants = ['mb', 'nd', 'ng', 'nj', 'nz']
    prenasalizedConsonants.forEach((combo: string) => {
      if (word.includes(combo)) {
        specialSounds.push({
          token: combo,
          type: 'prenasalized',
          description: `Prenasalized ${combo.charAt(1)}`
        })
      }
    })
    
    // Check for breathy consonants
    const breathyConsonants = ['bh', 'dh', 'vh', 'mh']
    breathyConsonants.forEach((combo: string) => {
      if (word.includes(combo)) {
        specialSounds.push({
          token: combo,
          type: 'breathy',
          description: `Breathy ${combo.charAt(0)}`
        })
      }
    })
    
    return specialSounds
  }

  // Generate pronunciation hints for ElevenLabs
  public getElevenLabsHints(text: string): {
    phonetic: string
    ssml?: string
    notes?: string[]
  } {
    const word = text.toLowerCase().trim()
    const specialSounds = this.getSpecialSounds(word)
    const notes: string[] = []
    
    // Build SSML with pronunciation hints
    let ssml = '<speak>'
    let phonetic = this.getPhonetic(word)
    
    // Add specific pronunciation instructions based on special sounds
    specialSounds.forEach(sound => {
      switch (sound.type) {
        case 'whistled':
          notes.push(`${sound.token}: pronounce with high-frequency sibilant and rounded lips`)
          break
        case 'prenasalized':
          notes.push(`${sound.token}: start with brief nasal sound before the consonant`)
          break
        case 'breathy':
          notes.push(`${sound.token}: add audible breath/aspiration to the consonant`)
          break
      }
    })
    
    // For words with special sounds, add phoneme tags
    if (specialSounds.length > 0) {
      ssml += `<phoneme alphabet="ipa" ph="${this.toIPA(word).replace(/\//g, '')}">${text}</phoneme>`
    } else {
      ssml += text
    }
    
    ssml += '</speak>'
    
    return {
      phonetic,
      ssml,
      notes: notes.length > 0 ? notes : undefined
    }
  }
}

export default ShonaPronunciationService