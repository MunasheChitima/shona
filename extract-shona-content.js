const fs = require('fs');
const path = require('path');

// This script extracts all vocabulary and lessons from JS files and converts to JSON
const contentDir = '/workspace/shona-learn/content';

// Function to extract vocabulary from JS files
function extractVocabularyFromJS(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Use eval in a safe way to extract the exported object
    // We'll create a module context
    const module = { exports: {} };
    const exports = module.exports;
    
    // Replace export const with const and evaluate
    const modifiedContent = content
      .replace(/export const (\w+) = /g, 'const $1 = ')
      .replace(/export function /g, 'function ')
      .replace(/export \{ /g, '');
    
    // Execute in a safe context
    eval(modifiedContent);
    
    // Find the vocabulary object (usually the first large const)
    const vocabKeys = Object.keys(module.exports || {});
    if (vocabKeys.length > 0) {
      const vocabObj = module.exports[vocabKeys[0]];
      return flattenVocabulary(vocabObj);
    }
  } catch (e) {
    console.error(`Error extracting from ${filePath}:`, e.message);
  }
  return [];
}

function flattenVocabulary(obj, result = []) {
  if (!obj || typeof obj !== 'object') return result;
  
  for (const key in obj) {
    const value = obj[key];
    if (Array.isArray(value)) {
      // This is an array of vocabulary items
      result.push(...value);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively flatten nested objects
      flattenVocabulary(value, result);
    }
  }
  return result;
}

// Extract all vocabulary
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

console.log('Extracting vocabulary from JS files...');
vocabFiles.forEach(file => {
  const filePath = path.join(contentDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`Processing ${file}...`);
    const vocab = extractVocabularyFromJS(filePath);
    allVocabulary = allVocabulary.concat(vocab);
    console.log(`  Extracted ${vocab.length} items from ${file}`);
  }
});

console.log(`\nTotal vocabulary extracted: ${allVocabulary.length} items`);

// Save to JSON
const outputPath = '/workspace/Ios/Shona App/Shona App/Content/vocabulary-comprehensive.json';
fs.writeFileSync(outputPath, JSON.stringify(allVocabulary, null, 2));
console.log(`\nSaved comprehensive vocabulary to ${outputPath}`);
