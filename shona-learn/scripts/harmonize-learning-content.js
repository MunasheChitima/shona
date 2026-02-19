const fs = require('fs');
const path = require('path');

const VOCAB_PATH = 'content/vocabulary_master_improved.json';
const LESSONS_PATHS = [
  'content/lessons.json',
  'content/lessons_enhanced.json',
  'content/lessons_updated.json'
];
const QUESTS_PATHS = [
  'content/quests.json',
  'content/quests_updated.json'
];
const AUDIO_MANIFEST_PATH = 'content/audio-manifest.json';
const FLASHCARDS_PATH = 'content/flashcards.json';
const MISSING_AUDIO_REPORT = 'content/missing_audio_report.txt';

// Load canonical vocabulary
const vocabData = JSON.parse(fs.readFileSync(VOCAB_PATH, 'utf8'));
const vocabMap = new Map();
vocabData.vocabulary.forEach(entry => {
  vocabMap.set(entry.shona.toLowerCase(), entry);
});

// Helper to harmonize a vocab entry
function harmonizeVocabRef(ref) {
  if (!ref || !ref.shona) return ref;
  const canonical = vocabMap.get(ref.shona.toLowerCase());
  if (!canonical) return ref;
  return {
    ...ref,
    pronunciation: canonical.simplified,
    ipa: canonical.ipa,
    tones: canonical.tones,
    syllables: canonical.shona.split('').join('-'),
    audioFile: canonical.audioFile,
    cultural: canonical.cultural,
    examples: canonical.examples
  };
}

// Harmonize lessons
function harmonizeLessons(lessonsPath) {
  if (!fs.existsSync(lessonsPath)) return;
  const data = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
  const lessons = data.lessons || data.lessons || [];
  let changed = false;
  lessons.forEach(lesson => {
    if (lesson.vocabulary) {
      lesson.vocabulary = lesson.vocabulary.map(harmonizeVocabRef);
      changed = true;
    }
    if (lesson.exercises) {
      lesson.exercises.forEach(ex => {
        if (ex.targetWord) {
          ex = { ...ex, ...harmonizeVocabRef({ shona: ex.targetWord }) };
        }
      });
    }
  });
  if (changed) {
    fs.writeFileSync(lessonsPath.replace('.json', '_harmonized.json'), JSON.stringify({ ...data, lessons }, null, 2));
    console.log(`✅ Harmonized ${lessonsPath}`);
  }
}

// Harmonize quests
function harmonizeQuests(questsPath) {
  if (!fs.existsSync(questsPath)) return;
  const data = JSON.parse(fs.readFileSync(questsPath, 'utf8'));
  const quests = data.quests || [];
  let changed = false;
  quests.forEach(quest => {
    if (quest.vocabulary) {
      quest.vocabulary = quest.vocabulary.map(harmonizeVocabRef);
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(questsPath.replace('.json', '_harmonized.json'), JSON.stringify({ ...data, quests }, null, 2));
    console.log(`✅ Harmonized ${questsPath}`);
  }
}

// Harmonize audio manifest
function harmonizeAudioManifest() {
  if (!fs.existsSync(AUDIO_MANIFEST_PATH)) return;
  const data = JSON.parse(fs.readFileSync(AUDIO_MANIFEST_PATH, 'utf8'));
  let changed = false;
  data.files = data.files.map(file => {
    const canonical = vocabMap.get(file.shona.toLowerCase());
    if (canonical) {
      changed = true;
      return {
        ...file,
        pronunciation: canonical.simplified,
        ipa: canonical.ipa,
        tones: canonical.tones,
        syllables: canonical.shona.split('').join('-'),
        audioFile: canonical.audioFile,
        cultural: canonical.cultural
      };
    }
    return file;
  });
  if (changed) {
    fs.writeFileSync(AUDIO_MANIFEST_PATH.replace('.json', '_harmonized.json'), JSON.stringify(data, null, 2));
    console.log(`✅ Harmonized ${AUDIO_MANIFEST_PATH}`);
  }
}

// Generate flashcards
function generateFlashcards() {
  const flashcards = vocabData.vocabulary.map(entry => ({
    shona: entry.shona,
    english: entry.english,
    pronunciation: entry.simplified,
    ipa: entry.ipa,
    tones: entry.tones,
    category: entry.category,
    audioFile: entry.audioFile,
    example: entry.examples && entry.examples[0] ? entry.examples[0].shona : '',
    translation: entry.examples && entry.examples[0] ? entry.examples[0].english : ''
  }));
  fs.writeFileSync(FLASHCARDS_PATH, JSON.stringify({ flashcards }, null, 2));
  console.log(`✅ Generated ${FLASHCARDS_PATH}`);
}

// List missing audio
function reportMissingAudio() {
  const missing = vocabData.vocabulary.filter(entry => !entry.audioFile || entry.audioFile === '');
  const lines = missing.map(entry => `${entry.shona} (${entry.english})`);
  fs.writeFileSync(MISSING_AUDIO_REPORT, lines.join('\n'));
  console.log(`✅ Reported missing audio: ${MISSING_AUDIO_REPORT}`);
}

// Run all steps
LESSONS_PATHS.forEach(harmonizeLessons);
QUESTS_PATHS.forEach(harmonizeQuests);
harmonizeAudioManifest();
generateFlashcards();
reportMissingAudio();

console.log('\n🎉 All learning content harmonized and flashcards generated!'); 