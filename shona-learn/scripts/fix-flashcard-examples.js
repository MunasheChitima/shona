#!/usr/bin/env node
/**
 * Fixes template-generated flashcard examples with contextually appropriate sentences.
 * Addresses: Ndinoda/Ndine misuse, absurd combinations, grammar errors, categorization.
 */

const fs = require('fs');
const path = require('path');

// Contextually appropriate example/translation mappings
// Format: shona word (lowercase) -> { example, translation }
const EXAMPLE_FIXES = {
  // Basic - yes/no (Ndinoda doesn't work)
  hongu: { example: 'Hongu, ndinobvuma', translation: 'Yes, I agree' },
  kwete: { example: 'Kwete, handingabvumiri', translation: 'No, I do not agree' },

  // Body parts - fix Ndine to natural usage
  dumbu: { example: 'Dumbu rangu rinorwadza', translation: 'My stomach hurts' },
  manzino: { example: 'Ndine manzino mazhinji', translation: 'I have many teeth' },
  maoko: { example: 'Ndine maoko maviri', translation: 'I have two hands' },
  maziso: { example: 'Ndine maziso maviri', translation: 'I have two eyes' },
  muromo: { example: 'Ndine muromo', translation: 'I have a mouth' },
  musoro: { example: 'Ndine musoro', translation: 'I have a head' },
  nzeve: { example: 'Ndine nzeve mbiri', translation: 'I have two ears' },
  tsoka: { example: 'Ndine tsoka mbiri', translation: 'I have two feet' },
  meso: { example: 'Ndine maziso maviri', translation: 'I have two eyes' },
  mukanwa: { example: 'Ndine muromo', translation: 'I have a mouth' },

  // Life events - absurd "Ndinoda" combinations
  kuberekerwa: { example: 'Mwana akaberekerwa gore rino', translation: 'The child was born this year' },
  kufa: { example: 'Musha wakafa gore rapfuura', translation: 'The village elder died last year' },
  kuroora: { example: 'Anoda kuroora mwedzi unouya', translation: 'He wants to marry next month' },
  kuroorwa: { example: 'Anoda kuroorwa mwedzi unouya', translation: 'She wants to get married next month' },

  // Question words - Ndinoda doesn't work
  chii: { example: 'Chii chiri kuitika?', translation: 'What is happening?' },
  kupi: { example: 'Uri kupi?', translation: 'Where are you?' },
  sei: { example: 'Makadii sei?', translation: 'How are you?' },
  ndiani: { example: 'Ndiani ari pano?', translation: 'Who is here?' },
  rinhi: { example: 'Uchauya rinhi?', translation: 'When will you come?' },

  // Pronouns - Ndinoda pronoun is nonsensical
  ari: { example: 'Ari pano', translation: 'He/she is here' },
  muri: { example: 'Muri here?', translation: 'Are you (plural) there?' },
  ndiri: { example: 'Ndiri pano', translation: 'I am here' },
  tiri: { example: 'Tiri pano', translation: 'We are here' },
  uri: { example: 'Uri kupi?', translation: 'Where are you?' },
  vari: { example: 'Vari kumba', translation: 'They are at home' },

  // Communication phrases - fix nonsensical "Ndinoda phrase"
  handingakubatsiri: { example: 'Handingakubatsiri nhasi', translation: 'I cannot help you today' },
  'ndine dambudziko': { example: 'Ndine dambudziko', translation: 'I have a problem' },
  ndinokutenda: { example: 'Ndinokutenda zvikuru', translation: 'I thank you very much' },
  zvinotenda: { example: 'Zvinotenda', translation: 'Thank you (formal)' },

  // Time words - Ndinoda time is awkward
  mangwanani: { example: 'Mangwanani!', translation: 'Good morning!' },
  manheru: { example: 'Manheru!', translation: 'Good evening!' },
  masikati: { example: 'Masikati!', translation: 'Good afternoon!' },
  chino: { example: 'Chino ndinofanira kuenda', translation: 'Now I must go' },
  gore: { example: 'Gore rino', translation: 'This year' },
  husiku: { example: 'Husiku hwakanaka', translation: 'Good night' },
  mwedzi: { example: 'Mwedzi uno', translation: 'This month' },
  nekuchinjika: { example: 'Zvinonaka nekuchinjika', translation: 'It gets better gradually' },
  nguva: { example: 'Nguva yekudya', translation: 'Time to eat' },
  'nguva dzose': { example: 'Nguva dzose ndinokurangarira', translation: 'I always remember you' },
  vhiki: { example: 'Vhiki rinouya', translation: 'Next week' },
  zuva: { example: 'Zuva ranhasi', translation: 'Today' },
  'zvinhu zvachinja': { example: 'Zvinhu zvachinja', translation: 'Things have changed' },

  // Numbers - Ndine number is awkward for counting
  china: { example: 'Ndine mwana china', translation: 'I have four children' },
  piri: { example: 'Ndine maoko maviri', translation: 'I have two hands' },
  poshi: { example: 'Ndine mwana mumwe chete', translation: 'I have one child' },
  shanu: { example: 'Ndine shanu', translation: 'I have five' },
  tatu: { example: 'Ndine vana vatatu', translation: 'I have three children' },
  gumi: { example: 'Ndine magumi maviri', translation: 'I have twenty' },
  nomwe: { example: 'Ndine nomwe', translation: 'I have seven' },
  pfumbamwe: { example: 'Ndine pfumbamwe', translation: 'I have nine' },
  sere: { example: 'Ndine sere', translation: 'I have eight' },
  tanhatu: { example: 'Ndine tanhatu', translation: 'I have six' },

  // Family - fix "is" to "are" for plural
  vana: { example: 'Vana vangu vanofara', translation: 'My children are happy' },

  // Verbs - "X kuenda kumba" is nonsensical
  kubvuma: { example: 'Ndinobvuma neizvozvo', translation: 'I agree with that' },
  kudya: { example: 'Ndinoda kudya sadza', translation: 'I want to eat sadza' },
  kufamba: { example: 'Ndinoda kufamba', translation: 'I want to walk' },
  kugara: { example: 'Ndinogara muHarare', translation: 'I live in Harare' },
  kumuka: { example: 'Ndinomuka mangwanani', translation: 'I wake up in the morning' },
  kunwa: { example: 'Ndinoda kunwa mvura', translation: 'I want to drink water' },
  kuramba: { example: 'Ndinoramba', translation: 'I refuse' },
  kurara: { example: 'Ndinoda kurara', translation: 'I want to sleep' },
  kutamba: { example: 'Vana vanoda kutamba', translation: 'The children want to play' },
};

// Category fixes
const CATEGORY_FIXES = {
  shiri: 'animals',
  mukomana: 'people',
  musikana: 'people',
};

// Remove duplicate nhema (keep dema as primary for black)
// Merge meso into maziso or recategorize - we'll fix meso's example to match maziso

function fixFlashcard(card) {
  const shona = (card.shona || '').toLowerCase().trim();
  const id = (card.id || shona).toLowerCase().trim();
  let modified = false;

  // Apply example/translation fixes (check both id and shona)
  const exampleFix = EXAMPLE_FIXES[id] || EXAMPLE_FIXES[shona];
  if (exampleFix) {
    card.example = exampleFix.example;
    card.translation = exampleFix.translation;
    modified = true;
  }

  // Apply category fixes
  const categoryFix = CATEGORY_FIXES[id] || CATEGORY_FIXES[shona];
  if (categoryFix) {
    card.category = categoryFix;
    modified = true;
  }

  return modified;
}

function run() {
  const publicPath = path.join(__dirname, '../public/flashcards.json');
  const contentPath = path.join(__dirname, '../content/flashcards.json');

  for (const filePath of [publicPath, contentPath]) {
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${filePath} (not found)`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const cards = data.flashcards || data;
    let fixCount = 0;

    for (const card of cards) {
      if (fixFlashcard(card)) fixCount++;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Fixed ${fixCount} cards in ${path.basename(filePath)}`);
  }
}

run();
