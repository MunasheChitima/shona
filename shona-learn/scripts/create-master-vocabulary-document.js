const fs = require('fs');
const path = require('path');

// Load all existing vocabulary sources
function loadVocabularySources() {
  const sources = {};
  
  // Load existing vocabulary files
  const vocabularyFiles = [
    'content/vocabulary_merged.json',
    'content/vocabulary_enhanced.json',
    'content/vocabulary.json',
    'content/vocabulary_master_comprehensive.json'
  ];
  
  vocabularyFiles.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        sources[file] = data;
        console.log(`📖 Loaded ${file}: ${data.vocabulary?.length || data.metadata?.totalWords || 0} words`);
      }
    } catch (error) {
      console.log(`⚠️  Could not load ${file}: ${error.message}`);
    }
  });
  
  return sources;
}

// Extract vocabulary from JavaScript modules
function extractFromJSModules() {
  const modules = [
    'content/vocabulary/advanced-conversational-vocabulary.js',
    'content/vocabulary/contemporary-modern-vocabulary.js',
    'content/vocabulary/professional-technical-vocabulary.js'
  ];
  
  const extracted = [];
  
  modules.forEach(modulePath => {
    try {
      if (fs.existsSync(modulePath)) {
        const content = fs.readFileSync(modulePath, 'utf8');
        
        // Extract vocabulary objects from the JavaScript file
        const vocabularyMatches = content.match(/\{[^}]*"shona"[^}]*\}/g);
        
        if (vocabularyMatches) {
          vocabularyMatches.forEach(match => {
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
        
        console.log(`📖 Extracted from ${modulePath}: ${extracted.length} words`);
      }
    } catch (error) {
      console.log(`⚠️  Could not process ${modulePath}: ${error.message}`);
    }
  });
  
  return extracted;
}

// Generate pronunciation text based on the master guide
function generatePronunciationText(word, ipa, tones) {
  if (!ipa) {
    // Generate basic IPA if not provided
    ipa = `/${word.toLowerCase()}/`;
  }
  
  // Convert IPA to simplified pronunciation
  let simplified = ipa
    .replace(/[\/\[\]]/g, '') // Remove IPA brackets
    .replace(/ŋ/g, 'ng')
    .replace(/ɲ/g, 'ny')
    .replace(/tʃ/g, 'ch')
    .replace(/ʃ/g, 'sh')
    .replace(/ʒ/g, 'zh')
    .replace(/ᵐb/g, 'mb')
    .replace(/ⁿd/g, 'nd')
    .replace(/ᵑɡ/g, 'ng')
    .replace(/ᶮdʒ/g, 'nj')
    .replace(/ⁿz/g, 'nz')
    .replace(/s͎/g, 'sv')
    .replace(/z͎/g, 'zv')
    .replace(/ts͎/g, 'tsv');
  
  // Add syllable breaks (simplified approach)
  simplified = simplified.replace(/([aeiou])/g, '$1-');
  simplified = simplified.replace(/-$/, ''); // Remove trailing hyphen
  
  return simplified;
}

// Standardize vocabulary entries
function standardizeVocabularyEntry(entry, source) {
  const standardized = {
    id: entry.id || `${source}_${entry.shona?.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
    shona: entry.shona || entry.word || '',
    english: entry.english || entry.translation || '',
    category: entry.category || 'general',
    tones: entry.tones || entry.tone || 'LL',
    ipa: entry.ipa || entry.pronunciation?.ipa || `/${entry.shona?.toLowerCase()}/`,
    simplified: entry.simplified || entry.pronunciation?.simplified || '',
    source: entry.source || source,
    difficulty: entry.difficulty || 1,
    cultural: entry.cultural || entry.cultural_notes || null,
    examples: entry.examples || [],
    audioFile: entry.audioFile || `${entry.shona}.mp3`,
    modern: entry.modern || false,
    register: entry.register || 'neutral',
    dialect: entry.dialect || 'standard'
  };
  
  // Generate pronunciation text if not provided
  if (!standardized.simplified) {
    standardized.simplified = generatePronunciationText(standardized.shona, standardized.ipa, standardized.tones);
  }
  
  // Add basic example if none provided
  if (!standardized.examples || standardized.examples.length === 0) {
    standardized.examples = [
      {
        shona: `Ndinoda ${standardized.shona}`,
        english: `I want ${standardized.english}`,
        context: "Basic sentence structure",
        register: "neutral"
      }
    ];
  }
  
  return standardized;
}

// Merge all vocabulary sources
function mergeVocabularySources(sources, jsExtracted) {
  const allVocabulary = new Map(); // Use Map to avoid duplicates
  
  // Process each source
  Object.entries(sources).forEach(([sourceName, sourceData]) => {
    const vocabulary = sourceData.vocabulary || sourceData.words || [];
    
    vocabulary.forEach(entry => {
      const standardized = standardizeVocabularyEntry(entry, sourceName);
      const key = standardized.shona.toLowerCase();
      
      if (!allVocabulary.has(key)) {
        allVocabulary.set(key, standardized);
      } else {
        // Merge with existing entry
        const existing = allVocabulary.get(key);
        const merged = {
          ...existing,
          sources: [...(existing.sources || [existing.source]), standardized.source],
          examples: [...(existing.examples || []), ...(standardized.examples || [])],
          cultural: existing.cultural || standardized.cultural,
          difficulty: Math.min(existing.difficulty || 1, standardized.difficulty || 1)
        };
        allVocabulary.set(key, merged);
      }
    });
  });
  
  // Add JS module vocabulary
  jsExtracted.forEach(entry => {
    const standardized = standardizeVocabularyEntry(entry, entry.source);
    const key = standardized.shona.toLowerCase();
    
    if (!allVocabulary.has(key)) {
      allVocabulary.set(key, standardized);
    } else {
      // Merge with existing entry
      const existing = allVocabulary.get(key);
      const merged = {
        ...existing,
        sources: [...(existing.sources || [existing.source]), standardized.source],
        examples: [...(existing.examples || []), ...(standardized.examples || [])],
        cultural: existing.cultural || standardized.cultural,
        difficulty: Math.min(existing.difficulty || 1, standardized.difficulty || 1)
      };
      allVocabulary.set(key, merged);
    }
  });
  
  return Array.from(allVocabulary.values());
}

// Create comprehensive master document
function createMasterDocument(vocabulary) {
  // Categorize vocabulary
  const categories = {};
  vocabulary.forEach(word => {
    if (!categories[word.category]) {
      categories[word.category] = [];
    }
    categories[word.category].push(word);
  });
  
  const masterDocument = {
    metadata: {
      title: "Complete Shona Vocabulary Master Document",
      version: "2.0.0",
      created: new Date().toISOString(),
      totalWords: vocabulary.length,
      totalCategories: Object.keys(categories).length,
      sources: [
        "fsi_basic",
        "ethnography", 
        "cultural_practices",
        "primary_textbook",
        "advanced_conversational",
        "contemporary_modern",
        "professional_technical",
        "merged_vocabulary",
        "enhanced_vocabulary"
      ],
      pronunciationGuide: "SHONA_PRONUNCIATION_MASTER_GUIDE.md",
      description: "Comprehensive Shona vocabulary with pronunciation guides, cultural context, and examples from multiple authoritative sources"
    },
    pronunciationGuide: {
      reference: "SHONA_PRONUNCIATION_MASTER_GUIDE.md",
      summary: "Complete guide to Shona pronunciation including tones, special sounds, regional variations, and practice guidelines"
    },
    categories: Object.keys(categories).sort(),
    categoryBreakdown: Object.entries(categories).reduce((acc, [category, words]) => {
      acc[category] = words.length;
      return acc;
    }, {}),
    vocabulary: vocabulary.sort((a, b) => {
      // Sort by difficulty, then by category, then alphabetically
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.shona.localeCompare(b.shona);
    })
  };
  
  return masterDocument;
}

// Main execution
function main() {
  console.log('🚀 Creating Comprehensive Shona Vocabulary Master Document...\n');
  
  // Load all vocabulary sources
  console.log('📚 Loading vocabulary sources...');
  const sources = loadVocabularySources();
  
  // Extract from JavaScript modules
  console.log('\n📖 Extracting from JavaScript modules...');
  const jsExtracted = extractFromJSModules();
  
  // Merge all sources
  console.log('\n🔄 Merging vocabulary sources...');
  const mergedVocabulary = mergeVocabularySources(sources, jsExtracted);
  
  // Create master document
  console.log('\n📝 Creating master document...');
  const masterDocument = createMasterDocument(mergedVocabulary);
  
  // Write comprehensive version
  const comprehensivePath = 'content/vocabulary_master_complete.json';
  fs.writeFileSync(comprehensivePath, JSON.stringify(masterDocument, null, 2));
  
  // Create simplified version for easy reading
  const simplifiedVocabulary = mergedVocabulary.map(word => ({
    shona: word.shona,
    english: word.english,
    pronunciation: word.simplified,
    tones: word.tones,
    category: word.category,
    difficulty: word.difficulty,
    cultural: word.cultural,
    source: word.source
  }));
  
  const simplifiedDocument = {
    metadata: {
      title: "Simplified Shona Vocabulary List",
      version: "2.0.0",
      totalWords: simplifiedVocabulary.length,
      created: new Date().toISOString()
    },
    vocabulary: simplifiedVocabulary
  };
  
  const simplifiedPath = 'content/vocabulary_master_simplified.json';
  fs.writeFileSync(simplifiedPath, JSON.stringify(simplifiedDocument, null, 2));
  
  // Create category-based files
  const categories = {};
  mergedVocabulary.forEach(word => {
    if (!categories[word.category]) {
      categories[word.category] = [];
    }
    categories[word.category].push(word);
  });
  
  Object.entries(categories).forEach(([category, words]) => {
    const categoryPath = `content/vocabulary_by_category/${category}.json`;
    
    // Ensure directory exists
    const dir = path.dirname(categoryPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const categoryDocument = {
      metadata: {
        category: category,
        totalWords: words.length,
        created: new Date().toISOString()
      },
      vocabulary: words
    };
    
    fs.writeFileSync(categoryPath, JSON.stringify(categoryDocument, null, 2));
  });
  
  // Print summary
  console.log('\n✅ Master Vocabulary Document Created Successfully!');
  console.log(`📊 Total Words: ${mergedVocabulary.length}`);
  console.log(`📁 Categories: ${Object.keys(categories).length}`);
  console.log(`📄 Comprehensive: ${comprehensivePath}`);
  console.log(`📝 Simplified: ${simplifiedPath}`);
  console.log(`📂 Category Files: content/vocabulary_by_category/`);
  console.log(`📖 Pronunciation Guide: SHONA_PRONUNCIATION_MASTER_GUIDE.md`);
  
  // Print category breakdown
  console.log('\n📊 Category Breakdown:');
  Object.entries(categories).forEach(([category, words]) => {
    console.log(`  ${category}: ${words.length} words`);
  });
  
  console.log('\n🎉 All vocabulary sources have been merged into comprehensive master documents!');
}

// Run the script
main(); 