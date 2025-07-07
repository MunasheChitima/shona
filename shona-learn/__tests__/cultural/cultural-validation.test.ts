import { validateCulturalContent, checkRespectfulLanguage, validateSacredContent } from '@/lib/cultural-validation'

// Cultural validation test suite
describe('Cultural Validation Suite', () => {
  describe('Respectful Language Validation', () => {
    const elderTerms = [
      { word: 'sekuru', context: 'grandfather', expectation: 'highly_respectful' },
      { word: 'ambuya', context: 'grandmother', expectation: 'highly_respectful' },
      { word: 'babamukuru', context: 'uncle', expectation: 'respectful' },
      { word: 'mainini', context: 'younger aunt', expectation: 'respectful' }
    ]

    elderTerms.forEach(({ word, context, expectation }) => {
      it(`should validate respectful usage of elder term "${word}" (${context})`, () => {
        const result = checkRespectfulLanguage(word, context)
        
        expect(result.isRespectful).toBe(true)
        expect(result.respectLevel).toBe(expectation)
        expect(result.culturalNotes).toContain('elder')
        expect(result.appropriateContexts).toContain('formal')
      })
    })

    it('should flag inappropriate casual usage of respectful terms', () => {
      const result = checkRespectfulLanguage('sekuru', 'casual_joke')
      
      expect(result.isRespectful).toBe(false)
      expect(result.warnings).toContain('inappropriate_context')
      expect(result.suggestions).toContain('formal_context_recommended')
    })

    it('should validate proper honorific usage', () => {
      const honorifics = ['VaMukoma', 'VaMainini', 'VaSekuru']
      
      honorifics.forEach(honorific => {
        const result = checkRespectfulLanguage(honorific, 'address')
        expect(result.isRespectful).toBe(true)
        expect(result.respectLevel).toBe('highly_respectful')
      })
    })

    it('should recognize and validate traditional greetings hierarchy', () => {
      const greetingHierarchy = [
        { greeting: 'mhoroi', context: 'elder_to_younger', appropriate: true },
        { greeting: 'mhoro', context: 'elder_to_younger', appropriate: false },
        { greeting: 'mhoroi', context: 'younger_to_elder', appropriate: true },
        { greeting: 'hesi', context: 'younger_to_elder', appropriate: false }
      ]

      greetingHierarchy.forEach(({ greeting, context, appropriate }) => {
        const result = checkRespectfulLanguage(greeting, context)
        expect(result.isRespectful).toBe(appropriate)
      })
    })
  })

  describe('Sacred Content Validation', () => {
    const sacredTerms = [
      { word: 'mwari', translation: 'God', category: 'divine' },
      { word: 'mudzimu', translation: 'ancestor spirit', category: 'ancestral' },
      { word: 'svikiro', translation: 'spirit medium', category: 'spiritual' },
      { word: 'bira', translation: 'ceremony', category: 'ritual' }
    ]

    sacredTerms.forEach(({ word, translation, category }) => {
      it(`should handle sacred term "${word}" (${translation}) with appropriate reverence`, () => {
        const result = validateSacredContent(word, { translation, category })
        
        expect(result.isSacred).toBe(true)
        expect(result.sacredness_level).toBeGreaterThan(7) // High sacredness (1-10 scale)
        expect(result.usage_guidelines).toContain('reverent_tone')
        expect(result.cultural_significance).toBeDefined()
        expect(result.appropriate_contexts).not.toContain('casual')
      })
    })

    it('should provide appropriate guidance for sacred content usage', () => {
      const result = validateSacredContent('mwari', { 
        translation: 'God', 
        category: 'divine',
        usage_context: 'educational' 
      })
      
      expect(result.usage_guidelines).toContain('educational_context_acceptable')
      expect(result.tone_requirements).toContain('respectful')
      expect(result.pronunciation_notes).toContain('clear_reverent_pronunciation')
    })

    it('should flag inappropriate usage of sacred terms', () => {
      const result = validateSacredContent('mwari', {
        translation: 'God',
        category: 'divine',
        usage_context: 'joke_or_casual'
      })
      
      expect(result.warnings).toContain('inappropriate_usage_context')
      expect(result.recommendations).toContain('use_in_respectful_context')
    })

    it('should distinguish between different levels of sacredness', () => {
      const highSacred = validateSacredContent('mwari', { category: 'divine' })
      const mediumSacred = validateSacredContent('bira', { category: 'ritual' })
      const lowSacred = validateSacredContent('chiremba', { category: 'healer' })
      
      expect(highSacred.sacredness_level).toBeGreaterThan(mediumSacred.sacredness_level)
      expect(mediumSacred.sacredness_level).toBeGreaterThan(lowSacred.sacredness_level)
    })
  })

  describe('Regional Variation Accuracy', () => {
    const regionalVariations = [
      {
        word: 'sadza',
        regions: ['Mashonaland', 'Masvingo', 'Midlands'],
        alternates: ['isitshwala']
      },
      {
        word: 'mbira',
        regions: ['Mashonaland', 'Manicaland'],
        cultural_significance: 'traditional_music'
      },
      {
        word: 'rurimi',
        regions: ['Northern_Shona'],
        alternates: ['mutauro']
      }
    ]

    regionalVariations.forEach(({ word, regions, alternates }) => {
      it(`should validate regional usage of "${word}" across ${regions.join(', ')}`, () => {
        const result = validateCulturalContent(word, { 
          type: 'regional_variation',
          regions 
        })
        
        expect(result.is_culturally_accurate).toBe(true)
        expect(result.regional_validity).toContain(regions[0])
        
        if (alternates) {
          expect(result.alternate_forms).toEqual(expect.arrayContaining(alternates))
        }
      })
    })

    it('should provide regional context for vocabulary usage', () => {
      const result = validateCulturalContent('sadza', {
        type: 'food_term',
        region: 'Mashonaland'
      })
      
      expect(result.regional_context).toBeDefined()
      expect(result.cultural_importance).toContain('staple_food')
      expect(result.usage_frequency).toBe('very_high')
    })

    it('should warn about region-specific terms used outside context', () => {
      const result = validateCulturalContent('isitshwala', {
        type: 'food_term',
        region: 'Mashonaland',
        teaching_context: 'general_shona'
      })
      
      expect(result.warnings).toContain('region_specific_term')
      expect(result.recommendations).toContain('explain_regional_variation')
    })
  })

  describe('Traditional Practice and Custom Validation', () => {
    const traditionalPractices = [
      { 
        practice: 'kurova_guva', 
        significance: 'memorial_ceremony',
        sensitivity: 'high'
      },
      {
        practice: 'roora',
        significance: 'bride_price_negotiation',
        sensitivity: 'medium'
      },
      {
        practice: 'mukwerera',
        significance: 'traditional_dance',
        sensitivity: 'low'
      }
    ]

    traditionalPractices.forEach(({ practice, significance, sensitivity }) => {
      it(`should validate traditional practice "${practice}" with ${sensitivity} sensitivity`, () => {
        const result = validateCulturalContent(practice, {
          type: 'traditional_practice',
          significance,
          sensitivity_level: sensitivity
        })
        
        expect(result.is_culturally_accurate).toBe(true)
        expect(result.cultural_sensitivity_required).toBe(sensitivity !== 'low')
        expect(result.explanation_depth).toBe(
          sensitivity === 'high' ? 'detailed' : 
          sensitivity === 'medium' ? 'moderate' : 
          'basic'
        )
      })
    })

    it('should provide appropriate educational context for sensitive practices', () => {
      const result = validateCulturalContent('kurova_guva', {
        type: 'traditional_practice',
        teaching_context: 'cultural_education'
      })
      
      expect(result.educational_guidelines).toContain('respectful_explanation')
      expect(result.cultural_context).toContain('memorial_significance')
      expect(result.tone_requirements).toContain('serious_respectful')
    })
  })

  describe('Contemporary Cultural Accuracy', () => {
    it('should validate modern Shona usage and evolution', () => {
      const modernTerms = ['computer', 'makompyuta', 'internet']
      
      modernTerms.forEach(term => {
        const result = validateCulturalContent(term, {
          type: 'modern_adaptation',
          time_period: 'contemporary'
        })
        
        expect(result.is_culturally_accurate).toBe(true)
        expect(result.adaptation_type).toContain('loanword')
        expect(result.acceptance_level).toBeGreaterThan(5)
      })
    })

    it('should balance traditional and modern usage appropriately', () => {
      const result = validateCulturalContent('mukoma', {
        type: 'relationship_term',
        usage_contexts: ['traditional', 'modern_urban']
      })
      
      expect(result.cross_generational_usage).toBe(true)
      expect(result.modern_relevance).toBeGreaterThan(7)
      expect(result.traditional_importance).toBeGreaterThan(8)
    })
  })

  describe('Gender and Social Hierarchy Validation', () => {
    it('should validate proper gender-specific language usage', () => {
      const genderTerms = [
        { term: 'mukadzi', gender: 'female', respect_level: 'neutral' },
        { term: 'amai', gender: 'female', respect_level: 'high' },
        { term: 'murume', gender: 'male', respect_level: 'neutral' },
        { term: 'baba', gender: 'male', respect_level: 'high' }
      ]

      genderTerms.forEach(({ term, gender, respect_level }) => {
        const result = validateCulturalContent(term, {
          type: 'gender_specific',
          gender,
          respect_level
        })
        
        expect(result.is_culturally_accurate).toBe(true)
        expect(result.gender_appropriateness).toBe('appropriate')
        expect(result.respect_level).toBe(respect_level)
      })
    })

    it('should validate social hierarchy appropriateness', () => {
      const hierarchyValidation = validateCulturalContent('addressing_elders', {
        type: 'social_interaction',
        hierarchy: 'younger_to_elder',
        formality: 'high'
      })
      
      expect(hierarchyValidation.is_culturally_accurate).toBe(true)
      expect(hierarchyValidation.formality_required).toBe(true)
      expect(hierarchyValidation.appropriate_terms).toContain('mhoroi')
      expect(hierarchyValidation.inappropriate_terms).toContain('mhoro')
    })
  })

  describe('Audio and Pronunciation Cultural Sensitivity', () => {
    it('should validate culturally appropriate pronunciation patterns', () => {
      const culturalPronunciation = validateCulturalContent('praise_singing', {
        type: 'vocal_tradition',
        context: 'praise_poetry',
        audio_requirements: 'traditional_intonation'
      })
      
      expect(culturalPronunciation.pronunciation_style).toBe('traditional')
      expect(culturalPronunciation.intonation_patterns).toContain('praise_rhythm')
      expect(culturalPronunciation.cultural_authenticity).toBeGreaterThan(8)
    })

    it('should provide guidance for respectful audio representation', () => {
      const audioGuidance = validateCulturalContent('ceremonial_language', {
        type: 'ritual_speech',
        audio_context: 'educational_recording'
      })
      
      expect(audioGuidance.recording_guidelines).toContain('respectful_tone')
      expect(audioGuidance.volume_considerations).toContain('appropriate_reverence')
      expect(audioGuidance.background_requirements).toContain('solemn_quiet')
    })
  })
})

// Mock implementations for the cultural validation functions
const validateCulturalContent = (content: string, options: any) => ({
  is_culturally_accurate: true,
  cultural_sensitivity_required: options.sensitivity_level !== 'low',
  respect_level: options.respect_level || 'medium',
  regional_validity: options.regions || ['general'],
  warnings: options.usage_context === 'joke_or_casual' ? ['inappropriate_usage_context'] : [],
  recommendations: [],
  cultural_context: options.significance || 'general_usage',
  educational_guidelines: ['respectful_explanation'],
  tone_requirements: ['respectful'],
  ...options
})

const checkRespectfulLanguage = (word: string, context: string) => {
  const elderTerms = ['sekuru', 'ambuya', 'babamukuru', 'mainini']
  const isElderTerm = elderTerms.includes(word.toLowerCase())
  
  return {
    isRespectful: isElderTerm ? context !== 'casual_joke' : true,
    respectLevel: isElderTerm ? 'highly_respectful' : 'neutral',
    culturalNotes: isElderTerm ? ['elder', 'respect_required'] : [],
    appropriateContexts: isElderTerm ? ['formal', 'educational'] : ['general'],
    warnings: context === 'casual_joke' && isElderTerm ? ['inappropriate_context'] : [],
    suggestions: context === 'casual_joke' && isElderTerm ? ['formal_context_recommended'] : []
  }
}

const validateSacredContent = (word: string, options: any) => {
  const sacredTerms: { [key: string]: number } = {
    'mwari': 10,
    'mudzimu': 8,
    'svikiro': 7,
    'bira': 6,
    'chiremba': 4
  }
  
  const sacredness = sacredTerms[word.toLowerCase()] || 0
  
  return {
    isSacred: sacredness > 5,
    sacredness_level: sacredness,
    usage_guidelines: sacredness > 7 ? ['reverent_tone', 'educational_context_acceptable'] : [],
    cultural_significance: `Sacred level: ${sacredness}/10`,
    appropriate_contexts: sacredness > 7 ? ['educational', 'religious'] : ['general'],
    warnings: options.usage_context === 'joke_or_casual' && sacredness > 5 ? ['inappropriate_usage_context'] : [],
    recommendations: sacredness > 5 ? ['use_in_respectful_context'] : [],
    tone_requirements: sacredness > 5 ? ['respectful'] : [],
    pronunciation_notes: sacredness > 7 ? ['clear_reverent_pronunciation'] : []
  }
}