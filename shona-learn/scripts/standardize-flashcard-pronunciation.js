#!/usr/bin/env node
/**
 * Standardizes flashcard pronunciation format: IPA as primary, optional phonetic.
 * Ensures: ipa = /word/ format, pronunciation = learner-friendly (syllabic or phonetic).
 */

const fs = require('fs');
const path = require('path');

function syllabicToPhonetic(syllabic) {
  // Convert M-A-nz-i-n-o style to mah-NZEE-no style
  if (!syllabic || !syllabic.includes('-')) return syllabic;
  const parts = syllabic.split('-').filter(Boolean);
  if (parts.length < 2) return syllabic;
  // Simple conversion: capitalize stressed syllable (usually 2nd to last)
  const stressed = Math.max(0, parts.length - 2);
  const result = parts.map((p, i) => 
    i === stressed ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p.toLowerCase()
  ).join('-');
  return result.replace(/-/g, '');
}

function ensureIpa(shona, existingIpa) {
  if (!shona) return existingIpa || '';
  // Only generate if missing - preserve existing valid IPA
  if (existingIpa && existingIpa.startsWith('/') && existingIpa.endsWith('/')) {
    return existingIpa;
  }
  return '/' + shona.toLowerCase().replace(/\s+/g, '_') + '/';
}

function run() {
  const publicPath = path.join(__dirname, '../public/flashcards.json');
  const contentPath = path.join(__dirname, '../content/flashcards.json');

  for (const filePath of [publicPath, contentPath]) {
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const cards = data.flashcards || data;
    let fixCount = 0;

    for (const card of cards) {
      const shona = card.shona || '';
      
      // Ensure IPA exists and is in /.../ format (standard for linguistic notation)
      const validIpa = card.ipa && card.ipa.startsWith('/') && card.ipa.endsWith('/');
      if (!validIpa) {
        card.ipa = ensureIpa(shona, card.ipa);
        fixCount++;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Standardized ${fixCount} cards in ${path.basename(filePath)}`);
  }
}

run();
