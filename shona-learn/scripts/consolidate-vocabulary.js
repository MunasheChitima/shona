/**
 * Comprehensive Vocabulary Consolidation Script
 * Consolidates all vocabulary sources into a master vocabulary file
 * for comprehensive audio generation
 */

const fs = require('fs').promises;
const path = require('path');

// Import vocabulary modules
const { advancedConversationalVocabulary } = require('../content/vocabulary/advanced-conversational-vocabulary.js');
const { contemporaryModernVocabulary } = require('../content/vocabulary/contemporary-modern-vocabulary.js');
const { professionalTechnicalVocabulary } = require('../content/vocabulary/professional-technical-vocabulary.js');

/**
 * Extract all words from a vocabulary structure
 */
function extractWordsFromVocabulary(vocabularyObj, source) {
  const words = [];
  
  function recursiveExtract(obj, currentPath = []) {
    if (Array.isArray(obj)) {
      // This is an array of words
      obj.forEach(wordObj => {
        if (wordObj.shona && wordObj.english) {
          words.push({
            ...wordObj,
            source: source,
            category_path: currentPath.join(' -> ')
          });
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      // This is a nested object, recurse
      Object.entries(obj).forEach(([key, value]) => {
        recursiveExtract(value, [...currentPath, key]);
      });
    }
  }
  
  recursiveExtract(vocabularyObj);
  return words;
}

/**
 * Enhance word data with additional pronunciation and cultural information
 */
function enhanceWordData(word) {
  return {
    id: word.id || `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shona: word.shona,
    english: word.english,
    category: word.category || 'general',
    subcategories: word.subcategories || [],
    level: word.level || 'A2',
    difficulty: word.difficulty || 5,
    frequency: word.frequency || 'medium',
    register: word.register || 'neutral',
    dialect: word.dialect || 'standard',
    
    // Pronunciation data
    tones: word.tones || inferTonePattern(word.shona),
    ipa: word.ipa || generateBasicIPA(word.shona),
    syllables: extractSyllables(word.shona),
    
    // Morphology
    morphology: word.morphology || {
      root: extractRoot(word.shona),
      affixes: [],
      noun_class: null
    },
    
    // Cultural and usage information
    cultural_notes: word.cultural_notes || null,
    usage_notes: word.usage_notes || null,
    collocations: word.collocations || [],
    synonyms: word.synonyms || [],
    antonyms: word.antonyms || [],
    
    // Examples with context
    examples: word.examples || [
      {
        shona: word.shona,
        english: word.english,
        context: "Basic usage",
        register: word.register || "neutral"
      }
    ],
    
    // Audio information
    audio: word.audio || {
      word: `${word.shona}.mp3`,
      sentences: word.examples ? word.examples.map((_, idx) => `${word.shona}_sentence_${idx + 1}.mp3`) : [`${word.shona}_sentence_1.mp3`]
    },
    
    // Source tracking
    source: word.source,
    category_path: word.category_path,
    
    // Cultural classification for pronunciation
    cultural_classification: classifyCulturalContext(word)
  };
}

/**
 * Basic IPA generation (simplified)
 */
function generateBasicIPA(word) {
  if (!word) return '/unknown/';
  
  // Basic character mapping
  let ipa = '/';
  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase();
    switch (char) {
      case 'a': ipa += 'a'; break;
      case 'e': ipa += 'e'; break;
      case 'i': ipa += 'i'; break;
      case 'o': ipa += 'o'; break;
      case 'u': ipa += 'u'; break;
      case 'c': ipa += 'tʃ'; break;
      case 'j': ipa += 'dʒ'; break;
      case 'y': ipa += 'j'; break;
      default: ipa += char;
    }
  }
  return ipa + '/';
}

/**
 * Basic tone pattern inference
 */
function inferTonePattern(word) {
  if (!word) return 'L';
  const syllableCount = extractSyllables(word).length;
  if (syllableCount === 1) return 'H';
  if (syllableCount === 2) return 'HL';
  if (syllableCount === 3) return 'HLL';
  return 'H' + 'L'.repeat(syllableCount - 1);
}

/**
 * Extract syllables
 */
function extractSyllables(word) {
  if (!word) return [];
  
  const syllables = [];
  let currentSyllable = '';
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    currentSyllable += char;
    
    // If this is a vowel, complete the syllable
    if ('aeiou'.includes(char.toLowerCase())) {
      syllables.push(currentSyllable);
      currentSyllable = '';
    }
  }
  
  // Add remaining consonants to last syllable
  if (currentSyllable && syllables.length > 0) {
    syllables[syllables.length - 1] += currentSyllable;
  } else if (currentSyllable) {
    syllables.push(currentSyllable);
  }
  
  return syllables.length > 0 ? syllables : [word];
}

/**
 * Extract root (simplified)
 */
function extractRoot(word) {
  if (!word) return '';
  
  // Simple root extraction - remove common prefixes
  const prefixes = ['ku', 'mu', 'chi', 'ma', 'zi', 'mi', 'va', 'nda', 'une'];
  let root = word;
  
  for (const prefix of prefixes) {
    if (word.toLowerCase().startsWith(prefix)) {
      root = word.substring(prefix.length);
      break;
    }
  }
  
  return root || word;
}

/**
 * Classify cultural context for pronunciation handling
 */
function classifyCulturalContext(word) {
  const text = (word.shona + ' ' + word.english + ' ' + (word.cultural_notes || '') + ' ' + (word.category || '')).toLowerCase();
  
  // Religious/spiritual terms
  const religiousKeywords = ['mwari', 'mudzimu', 'spirit', 'ancestor', 'prayer', 'sacred', 'holy', 'divine', 'church', 'faith'];
  const isReligious = religiousKeywords.some(keyword => text.includes(keyword));
  
  // Traditional ceremony terms
  const traditionalKeywords = ['ceremony', 'ritual', 'traditional', 'culture', 'custom', 'heritage', 'ancestral', 'tribal', 'chieftain'];
  const isTraditional = traditionalKeywords.some(keyword => text.includes(keyword));
  
  // Family/kinship terms
  const familialKeywords = ['father', 'mother', 'brother', 'sister', 'child', 'parent', 'family', 'relative', 'baba', 'amai', 'mukoma', 'mwana'];
  const isFamilial = familialKeywords.some(keyword => text.includes(keyword));
  
  return {
    isReligious,
    isTraditional,
    isFamilial,
    requiresSpecialTone: isReligious || isTraditional,
    culturalSensitivity: isReligious ? 'high' : isTraditional ? 'medium' : 'low'
  };
}

/**
 * Main consolidation function
 */
async function consolidateVocabulary() {
  console.log('🔄 Starting comprehensive vocabulary consolidation...');
  
  try {
    // Extract words from all sources
    console.log('📖 Extracting words from vocabulary sources...');
    
    const advancedWords = extractWordsFromVocabulary(advancedConversationalVocabulary, 'advanced-conversational');
    console.log(`   ✓ Advanced Conversational: ${advancedWords.length} words`);
    
    const contemporaryWords = extractWordsFromVocabulary(contemporaryModernVocabulary, 'contemporary-modern');
    console.log(`   ✓ Contemporary Modern: ${contemporaryWords.length} words`);
    
    const professionalWords = extractWordsFromVocabulary(professionalTechnicalVocabulary, 'professional-technical');
    console.log(`   ✓ Professional Technical: ${professionalWords.length} words`);
    
    // Combine all words
    const allWords = [...advancedWords, ...contemporaryWords, ...professionalWords];
    console.log(`📊 Total words collected: ${allWords.length}`);
    
    // Remove duplicates based on Shona word
    const uniqueWords = [];
    const seenWords = new Set();
    
    allWords.forEach(word => {
      if (!seenWords.has(word.shona)) {
        seenWords.add(word.shona);
        uniqueWords.push(word);
      }
    });
    
    console.log(`🔄 Unique words after deduplication: ${uniqueWords.length}`);
    
    // Enhance all words with additional data
    console.log('🔧 Enhancing word data...');
    const enhancedWords = uniqueWords.map(enhanceWordData);
    
    // Sort by difficulty and frequency for better organization
    enhancedWords.sort((a, b) => {
      if (a.level !== b.level) {
        const levelOrder = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
        return (levelOrder[a.level] || 3) - (levelOrder[b.level] || 3);
      }
      if (a.difficulty !== b.difficulty) {
        return a.difficulty - b.difficulty;
      }
      return a.shona.localeCompare(b.shona);
    });
    
    // Create master vocabulary object
    const masterVocabulary = {
      title: "Comprehensive Shona Vocabulary Master Collection",
      subtitle: "Complete vocabulary for audio generation - 480+ words",
      version: "2.0.0",
      generated_at: new Date().toISOString(),
      total_words: enhancedWords.length,
      sources: [
        "advanced-conversational-vocabulary.js",
        "contemporary-modern-vocabulary.js", 
        "professional-technical-vocabulary.js"
      ],
      statistics: {
        by_level: calculateLevelDistribution(enhancedWords),
        by_difficulty: calculateDifficultyDistribution(enhancedWords),
        by_category: calculateCategoryDistribution(enhancedWords),
        by_cultural_context: calculateCulturalDistribution(enhancedWords),
        special_sounds: calculateSpecialSoundsDistribution(enhancedWords)
      },
      words: enhancedWords
    };
    
    // Save master vocabulary
    const outputPath = path.join(__dirname, '../content/vocabulary_master_improved.json');
    await fs.writeFile(outputPath, JSON.stringify(masterVocabulary, null, 2));
    
    console.log('✅ Master vocabulary created successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📊 Total words: ${enhancedWords.length}`);
    console.log(`🎯 Ready for audio generation!`);
    
    // Generate summary report
    const reportPath = path.join(__dirname, '../content/vocabulary_consolidation_report.md');
    await generateConsolidationReport(masterVocabulary, reportPath);
    
    return masterVocabulary;
    
  } catch (error) {
    console.error('❌ Error during vocabulary consolidation:', error);
    throw error;
  }
}

/**
 * Calculate distribution statistics
 */
function calculateLevelDistribution(words) {
  const distribution = {};
  words.forEach(word => {
    distribution[word.level] = (distribution[word.level] || 0) + 1;
  });
  return distribution;
}

function calculateDifficultyDistribution(words) {
  const distribution = {};
  words.forEach(word => {
    const range = Math.floor(word.difficulty / 2) * 2;
    const key = `${range}-${range + 1}`;
    distribution[key] = (distribution[key] || 0) + 1;
  });
  return distribution;
}

function calculateCategoryDistribution(words) {
  const distribution = {};
  words.forEach(word => {
    distribution[word.category] = (distribution[word.category] || 0) + 1;
  });
  return distribution;
}

function calculateCulturalDistribution(words) {
  const distribution = {
    religious: 0,
    traditional: 0,
    familial: 0,
    general: 0
  };
  
  words.forEach(word => {
    if (word.cultural_classification.isReligious) distribution.religious++;
    else if (word.cultural_classification.isTraditional) distribution.traditional++;
    else if (word.cultural_classification.isFamilial) distribution.familial++;
    else distribution.general++;
  });
  
  return distribution;
}

function calculateSpecialSoundsDistribution(words) {
  const distribution = {};
  const specialSounds = ['sv', 'zv', 'mb', 'nd', 'ng', 'nz', 'bh', 'dh', 'gh', 'vh', 'bv', 'pf'];
  
  specialSounds.forEach(sound => {
    distribution[sound] = words.filter(word => word.shona.includes(sound)).length;
  });
  
  return distribution;
}

/**
 * Generate consolidation report
 */
async function generateConsolidationReport(vocabulary, reportPath) {
  const report = `# Vocabulary Consolidation Report

Generated: ${vocabulary.generated_at}
Total Words: ${vocabulary.total_words}

## Sources
${vocabulary.sources.map(source => `- ${source}`).join('\n')}

## Level Distribution
${Object.entries(vocabulary.statistics.by_level).map(([level, count]) => 
  `- ${level}: ${count} words`
).join('\n')}

## Cultural Context Distribution
${Object.entries(vocabulary.statistics.by_cultural_context).map(([context, count]) => 
  `- ${context}: ${count} words`
).join('\n')}

## Special Sounds Distribution
${Object.entries(vocabulary.statistics.special_sounds)
  .filter(([sound, count]) => count > 0)
  .map(([sound, count]) => `- ${sound}: ${count} words`)
  .join('\n')}

## Ready for Audio Generation
This vocabulary collection is optimized for:
- ElevenLabs audio generation
- Cultural context handling
- IPA pronunciation guidance
- Tone pattern application
- Special sound processing

Total sentences for generation: ${vocabulary.total_words * 2} (2 per word)
Estimated audio files: ${vocabulary.total_words * 3} (word + 2 sentences)
`;

  await fs.writeFile(reportPath, report);
  console.log(`📊 Consolidation report saved: ${reportPath}`);
}

// Export for use by other scripts
module.exports = {
  consolidateVocabulary,
  enhanceWordData,
  classifyCulturalContext
};

// Run if called directly
if (require.main === module) {
  consolidateVocabulary()
    .then(() => {
      console.log('🎉 Vocabulary consolidation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Consolidation failed:', error);
      process.exit(1);
    });
}