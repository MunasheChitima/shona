const fs = require('fs');
const path = require('path');

// Comprehensive extraction of all Shona content
const contentDir = '/workspace/shona-learn/content';
const outputDir = '/workspace/Ios/Shona App/Shona App/Content';

// Read and parse JS files by extracting JSON-like structures
function extractVocabularyItems(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const items = [];
  
  // Find all objects with "id:" field (vocabulary items)
  const idPattern = /id:\s*["']([^"']+)["']/g;
  const objectPattern = /\{[\s\S]*?id:\s*["']([^"']+)["'][\s\S]*?\}/g;
  
  let match;
  let objectStart = 0;
  
  // Find all vocabulary objects
  while ((match = objectPattern.exec(content)) !== null) {
    const objStr = match[0];
    try {
      // Try to parse as JSON (with some cleanup)
      const cleaned = objStr
        .replace(/(\w+):/g, '"$1":')  // Quote keys
        .replace(/\/\/.*$/gm, '')      // Remove comments
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      
      const parsed = JSON.parse(cleaned);
      if (parsed.id && parsed.shona) {
        items.push(parsed);
      }
    } catch (e) {
      // If JSON parsing fails, extract manually
      const idMatch = objStr.match(/id:\s*["']([^"']+)["']/);
      const shonaMatch = objStr.match(/shona:\s*["']([^"']+)["']/);
      const englishMatch = objStr.match(/english:\s*["']([^"']+)["']/);
      
      if (idMatch && shonaMatch && englishMatch) {
        items.push({
          id: idMatch[1],
          shona: shonaMatch[1],
          english: englishMatch[1],
          raw: objStr.substring(0, 200) // Store first 200 chars for manual processing
        });
      }
    }
  }
  
  return items;
}

// Extract all vocabulary
console.log('Extracting vocabulary from all JS files...\n');

const vocabFiles = [
  'vocabulary/fundamental-basic-vocabulary.js',
  'vocabulary/essential-phrases-expressions.js',
  'vocabulary/essential-verbs-actions.js',
  'vocabulary/traditional-cultural-vocabulary.js',
  'vocabulary/advanced-conversational-vocabulary.js',
  'vocabulary/contemporary-modern-vocabulary.js',
  'vocabulary/professional-technical-vocabulary.js'
];

let allVocabulary = [];

vocabFiles.forEach(file => {
  const filePath = path.join(contentDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`Processing ${file}...`);
    const items = extractVocabularyItems(filePath);
    allVocabulary = allVocabulary.concat(items);
    console.log(`  Found ${items.length} vocabulary items`);
  }
});

console.log(`\nTotal vocabulary items: ${allVocabulary.length}`);

// Save comprehensive vocabulary
const vocabOutput = path.join(outputDir, 'vocabulary-comprehensive.json');
fs.writeFileSync(vocabOutput, JSON.stringify(allVocabulary, null, 2));
console.log(`\nSaved to ${vocabOutput}`);

// Also update the existing vocabulary.json by merging
const existingVocabPath = path.join(outputDir, 'vocabulary.json');
let existingVocab = [];
if (fs.existsSync(existingVocabPath)) {
  existingVocab = JSON.parse(fs.readFileSync(existingVocabPath, 'utf8'));
  console.log(`\nExisting vocabulary: ${existingVocab.length} items`);
}

// Merge and deduplicate
const vocabMap = new Map();
existingVocab.forEach(item => {
  if (item.id) vocabMap.set(item.id, item);
});
allVocabulary.forEach(item => {
  if (item.id) vocabMap.set(item.id, item);
});

const mergedVocab = Array.from(vocabMap.values());
fs.writeFileSync(existingVocabPath, JSON.stringify(mergedVocab, null, 2));
console.log(`Merged vocabulary: ${mergedVocab.length} total items`);
