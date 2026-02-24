#!/usr/bin/env node
/**
 * Audits flashcards and lessons for missing audio files.
 * Outputs a report of vocabulary that references audio files not present on disk.
 */

const fs = require('fs');
const path = require('path');

const AUDIO_DIR = path.join(__dirname, '../public/content/audio');
const FLASHCARDS_PATH = path.join(__dirname, '../public/flashcards.json');

function run() {
  let audioDirExists = false;
  let existingFiles = new Set();
  
  if (fs.existsSync(AUDIO_DIR)) {
    audioDirExists = true;
    existingFiles = new Set(fs.readdirSync(AUDIO_DIR));
  }

  const report = {
    audioDirExists,
    audioDir: AUDIO_DIR,
    totalReferenced: 0,
    missing: [],
    found: 0,
    generatedAt: new Date().toISOString()
  };

  if (!fs.existsSync(FLASHCARDS_PATH)) {
    console.log('Flashcards file not found');
    return;
  }

  const data = JSON.parse(fs.readFileSync(FLASHCARDS_PATH, 'utf8'));
  const cards = data.flashcards || [];

  for (const card of cards) {
    const audioFile = card.audioFile;
    if (!audioFile) continue;

    report.totalReferenced++;
    if (audioDirExists && existingFiles.has(audioFile)) {
      report.found++;
    } else {
      report.missing.push({ shona: card.shona, english: card.english, audioFile });
    }
  }

  const reportPath = path.join(__dirname, '../content/audio_audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Audio audit: ${report.found}/${report.totalReferenced} files found`);
  console.log(`Missing: ${report.missing.length}`);
  console.log(`Report written to ${reportPath}`);
}

run();
