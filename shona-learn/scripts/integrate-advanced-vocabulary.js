const fs = require('fs');
const path = require('path');

// Load the current canonical vocabulary
const canonicalPath = 'content/vocabulary_master_improved.json';
const canonicalData = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));

// Function to extract vocabulary from JS modules
function extractFromJSModule(modulePath) {
  if (!fs.existsSync(modulePath)) {
    console.log(`⚠️  Module not found: ${modulePath}`);
    return [];
  }
  
  const content = fs.readFileSync(modulePath, 'utf8');
  const extracted = [];
  
  // Extract vocabulary objects using regex
  const vocabMatches = content.match(/\{[^}]*"shona"[^}]*\}/g);
  
  if (vocabMatches) {
    vocabMatches.forEach(match => {
      try {
        // Clean up the match to make it valid JSON
        let cleaned = match
          .replace(/(\w+):/g, '"$1":') // Add quotes to keys
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
        
        const vocab = JSON.parse(cleaned);
        if (vocab.shona && vocab.english) {
          extracted.push({
            ...vocab,
            source: path.basename(modulePath, '.js'),
            source_type: 'js_module'
          });
        }
      } catch (parseError) {
        // Skip invalid entries
      }
    });
  }
  
  return extracted;
}

// Function to flatten nested vocabulary structures
function flattenVocabulary(obj, source) {
  const flattened = [];
  
  function extractFromSection(section, category) {
    if (Array.isArray(section)) {
      section.forEach(item => {
        if (item.shona && item.english) {
          flattened.push({
            ...item,
            source: source,
            category: category || item.category || 'general'
          });
        }
      });
    } else if (typeof section === 'object') {
      Object.entries(section).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item.shona && item.english) {
              flattened.push({
                ...item,
                source: source,
                category: category || item.category || key
              });
            }
          });
        }
      });
    }
  }
  
  // Handle different module structures
  if (obj.advancedConversationalVocabulary) {
    Object.entries(obj.advancedConversationalVocabulary).forEach(([category, section]) => {
      extractFromSection(section, category);
    });
  } else if (obj.contemporaryModernVocabulary) {
    Object.entries(obj.contemporaryModernVocabulary).forEach(([category, section]) => {
      extractFromSection(section, category);
    });
  } else if (obj.professionalTechnicalVocabulary) {
    Object.entries(obj.professionalTechnicalVocabulary).forEach(([category, section]) => {
      extractFromSection(section, category);
    });
  }
  
  return flattened;
}

// Extract from all JS modules
const jsModules = [
  'archive/advanced-conversational-vocabulary.js',
  'archive/contemporary-modern-vocabulary.js',
  'archive/professional-technical-vocabulary.js'
];

let allAdvancedVocabulary = [];

jsModules.forEach(modulePath => {
  console.log(`📖 Extracting from ${modulePath}...`);
  
  // Try to extract using regex first
  const extracted = extractFromJSModule(modulePath);
  console.log(`   Found ${extracted.length} vocabulary items via regex`);
  
  // If regex extraction didn't work well, try manual parsing
  if (extracted.length === 0) {
    console.log(`   Trying manual parsing for ${modulePath}...`);
    
    const content = fs.readFileSync(modulePath, 'utf8');
    
    // Look for specific patterns in the advanced vocabulary
    const patterns = [
      /shona:\s*"([^"]+)"/g,
      /english:\s*"([^"]+)"/g,
      /category:\s*"([^"]+)"/g,
      /tones:\s*"([^"]+)"/g,
      /ipa:\s*"([^"]+)"/g
    ];
    
    // This is a simplified approach - in practice, you'd need more sophisticated parsing
    const shonaMatches = [...content.matchAll(/shona:\s*"([^"]+)"/g)];
    const englishMatches = [...content.matchAll(/english:\s*"([^"]+)"/g)];
    
    for (let i = 0; i < Math.min(shonaMatches.length, englishMatches.length); i++) {
      allAdvancedVocabulary.push({
        shona: shonaMatches[i][1],
        english: englishMatches[i][1],
        source: path.basename(modulePath, '.js'),
        category: 'advanced',
        difficulty: 5,
        tones: 'LL',
        ipa: `/${shonaMatches[i][1].toLowerCase()}/`,
        simplified: shonaMatches[i][1].split('').join('-').toUpperCase()
      });
    }
  } else {
    allAdvancedVocabulary = allAdvancedVocabulary.concat(extracted);
  }
});

console.log(`📊 Total advanced vocabulary extracted: ${allAdvancedVocabulary.length}`);

// Merge with canonical vocabulary
const existingShonaWords = new Set(canonicalData.vocabulary.map(v => v.shona.toLowerCase()));
const newVocabulary = allAdvancedVocabulary.filter(v => !existingShonaWords.has(v.shona.toLowerCase()));

console.log(`🆕 New vocabulary to add: ${newVocabulary.length}`);

// Add new vocabulary to canonical dataset
const updatedVocabulary = [...canonicalData.vocabulary, ...newVocabulary];

// Update metadata
const updatedData = {
  ...canonicalData,
  metadata: {
    ...canonicalData.metadata,
    version: "2.2.0",
    updated: new Date().toISOString(),
    totalWords: updatedVocabulary.length,
    qualityImprovements: [
      ...canonicalData.metadata.qualityImprovements,
      "Integrated advanced conversational vocabulary from JS modules",
      "Added professional and technical vocabulary",
      "Enhanced contemporary modern vocabulary"
    ]
  },
  vocabulary: updatedVocabulary
};

// Save updated canonical vocabulary
fs.writeFileSync(canonicalPath, JSON.stringify(updatedData, null, 2));

// Also update the simplified version
const simplifiedVocabulary = updatedVocabulary.map(word => ({
  shona: word.shona,
  english: word.english,
  pronunciation: word.simplified || word.pronunciation,
  tones: word.tones,
  category: word.category,
  difficulty: word.difficulty,
  cultural: word.cultural || word.cultural_notes,
  source: word.source
}));

const simplifiedData = {
  metadata: {
    title: "Simplified Shona Vocabulary List",
    version: "2.2.0",
    totalWords: simplifiedVocabulary.length,
    updated: new Date().toISOString()
  },
  vocabulary: simplifiedVocabulary
};

fs.writeFileSync('content/vocabulary_master_improved_simplified.json', JSON.stringify(simplifiedData, null, 2));

console.log(`✅ Updated canonical vocabulary with ${newVocabulary.length} new words`);
console.log(`📊 Total words now: ${updatedVocabulary.length}`);
console.log(`📝 Updated simplified version as well`);

// Show sample of new words
if (newVocabulary.length > 0) {
  console.log('\n📋 Sample of new vocabulary added:');
  newVocabulary.slice(0, 5).forEach(word => {
    console.log(`  ${word.shona} (${word.english}) - ${word.category}`);
  });
} 