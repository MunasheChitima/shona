const fs = require('fs');
const path = require('path');

// Pronunciation mapping based on the master guide
const pronunciationGuide = {
  // Common Shona sounds
  'ng': 'ŋ',
  'ny': 'ɲ',
  'ch': 'tʃ',
  'sh': 'ʃ',
  'zh': 'ʒ',
  'mb': 'ᵐb',
  'nd': 'ⁿd',
  'ng': 'ᵑɡ',
  'nj': 'ᶮdʒ',
  'nz': 'ⁿz',
  'sv': 's͎',
  'zv': 'z͎',
  'tsv': 'ts͎'
};

// FSI Shona Basic Course vocabulary (extracted from the course)
const fsiVocabulary = [
  {
    shona: "mangwanani",
    english: "good morning",
    category: "greetings",
    tones: "LHLHL",
    ipa: "/maŋgwanani/",
    simplified: "mah-ngwah-NAH-nee",
    source: "fsi_basic",
    difficulty: 1,
    cultural: "Standard morning greeting, used until around 10 AM"
  },
  {
    shona: "masikati",
    english: "good afternoon",
    category: "greetings",
    tones: "LHLHL",
    ipa: "/masikati/",
    simplified: "mah-see-KAH-tee",
    source: "fsi_basic",
    difficulty: 1,
    cultural: "Used from around 10 AM to sunset"
  },
  {
    shona: "manheru",
    english: "good evening",
    category: "greetings",
    tones: "LHLHL",
    ipa: "/manheru/",
    simplified: "mah-NHEH-roo",
    source: "fsi_basic",
    difficulty: 1,
    cultural: "Used after sunset"
  },
  {
    shona: "poshi",
    english: "one",
    category: "numbers",
    tones: "LHL",
    ipa: "/poʃi/",
    simplified: "poh-SHEE",
    source: "fsi_basic",
    difficulty: 1
  },
  {
    shona: "piri",
    english: "two",
    category: "numbers",
    tones: "LHL",
    ipa: "/piri/",
    simplified: "pee-REE",
    source: "fsi_basic",
    difficulty: 1
  },
  {
    shona: "tatu",
    english: "three",
    category: "numbers",
    tones: "LHL",
    ipa: "/tatu/",
    simplified: "tah-TOO",
    source: "fsi_basic",
    difficulty: 1
  },
  {
    shona: "china",
    english: "four",
    category: "numbers",
    tones: "LHL",
    ipa: "/tʃina/",
    simplified: "CHEE-nah",
    source: "fsi_basic",
    difficulty: 1
  },
  {
    shona: "shanu",
    english: "five",
    category: "numbers",
    tones: "LHL",
    ipa: "/ʃanu/",
    simplified: "SHAH-noo",
    source: "fsi_basic",
    difficulty: 1
  },
  {
    shona: "tanhatu",
    english: "six",
    category: "numbers",
    tones: "LHL",
    ipa: "/tanhatu/",
    simplified: "tah-NHAH-too",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "nomwe",
    english: "seven",
    category: "numbers",
    tones: "LHL",
    ipa: "/nomwe/",
    simplified: "NOH-mweh",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "sere",
    english: "eight",
    category: "numbers",
    tones: "LHL",
    ipa: "/sere/",
    simplified: "SEH-reh",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "pfumbamwe",
    english: "nine",
    category: "numbers",
    tones: "LHLHL",
    ipa: "/pfumbamwe/",
    simplified: "pfoo-BAH-mweh",
    source: "fsi_basic",
    difficulty: 3
  },
  {
    shona: "gumi",
    english: "ten",
    category: "numbers",
    tones: "LHL",
    ipa: "/gumi/",
    simplified: "GOO-mee",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "ndatenda",
    english: "thank you",
    category: "expressions",
    tones: "LHLHL",
    ipa: "/ⁿdatenda/",
    simplified: "ndah-TEN-dah",
    source: "fsi_basic",
    difficulty: 2,
    cultural: "Standard expression of gratitude"
  },
  {
    shona: "ndapota",
    english: "please",
    category: "expressions",
    tones: "LHLHL",
    ipa: "/ⁿdapota/",
    simplified: "ndah-POH-tah",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "ndine urombo",
    english: "I'm sorry",
    category: "expressions",
    tones: "LHLHL",
    ipa: "/ⁿdine urombo/",
    simplified: "ndee-neh oo-ROHM-boh",
    source: "fsi_basic",
    difficulty: 3,
    cultural: "Expression of apology or sympathy"
  },
  {
    shona: "zvakanaka",
    english: "it's good/okay",
    category: "expressions",
    tones: "LHLHL",
    ipa: "/z͎akanaka/",
    simplified: "zvah-kah-NAH-kah",
    source: "fsi_basic",
    difficulty: 3
  },
  {
    shona: "hapana",
    english: "nothing/no",
    category: "expressions",
    tones: "LHL",
    ipa: "/hapana/",
    simplified: "hah-PAH-nah",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "ndiani",
    english: "who",
    category: "questions",
    tones: "LHL",
    ipa: "/ⁿdiani/",
    simplified: "ndee-AH-nee",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "chii",
    english: "what",
    category: "questions",
    tones: "LH",
    ipa: "/tʃii/",
    simplified: "CHEE-ee",
    source: "fsi_basic",
    difficulty: 1
  },
  {
    shona: "kupi",
    english: "where",
    category: "questions",
    tones: "LHL",
    ipa: "/kupi/",
    simplified: "KOO-pee",
    source: "fsi_basic",
    difficulty: 1
  },
  {
    shona: "rinhi",
    english: "when",
    category: "questions",
    tones: "LHL",
    ipa: "/rinhi/",
    simplified: "REE-nhee",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "sei",
    english: "how",
    category: "questions",
    tones: "LH",
    ipa: "/sei/",
    simplified: "SEH-ee",
    source: "fsi_basic",
    difficulty: 1
  },
  {
    shona: "ndiri",
    english: "I am",
    category: "pronouns",
    tones: "LHL",
    ipa: "/ⁿdiri/",
    simplified: "ndee-REE",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "uri",
    english: "you are (singular)",
    category: "pronouns",
    tones: "LH",
    ipa: "/uri/",
    simplified: "OO-ree",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "ari",
    english: "he/she is",
    category: "pronouns",
    tones: "LH",
    ipa: "/ari/",
    simplified: "AH-ree",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "tiri",
    english: "we are",
    category: "pronouns",
    tones: "LHL",
    ipa: "/tiri/",
    simplified: "tee-REE",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "muri",
    english: "you are (plural)",
    category: "pronouns",
    tones: "LHL",
    ipa: "/muri/",
    simplified: "moo-REE",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "vari",
    english: "they are",
    category: "pronouns",
    tones: "LHL",
    ipa: "/vari/",
    simplified: "vah-REE",
    source: "fsi_basic",
    difficulty: 2
  },
  {
    shona: "ndinoda",
    english: "I want",
    category: "verbs",
    tones: "LHLHL",
    ipa: "/ⁿdinoda/",
    simplified: "ndee-NOH-dah",
    source: "fsi_basic",
    difficulty: 3
  },
  {
    shona: "unoda",
    english: "you want (singular)",
    category: "verbs",
    tones: "LHL",
    ipa: "/unoda/",
    simplified: "oo-NOH-dah",
    source: "fsi_basic",
    difficulty: 3
  },
  {
    shona: "anoda",
    english: "he/she wants",
    category: "verbs",
    tones: "LHL",
    ipa: "/anoda/",
    simplified: "ah-NOH-dah",
    source: "fsi_basic",
    difficulty: 3
  },
  {
    shona: "tinoda",
    english: "we want",
    category: "verbs",
    tones: "LHLHL",
    ipa: "/tinoda/",
    simplified: "tee-NOH-dah",
    source: "fsi_basic",
    difficulty: 3
  },
  {
    shona: "munoda",
    english: "you want (plural)",
    category: "verbs",
    tones: "LHLHL",
    ipa: "/munoda/",
    simplified: "moo-NOH-dah",
    source: "fsi_basic",
    difficulty: 3
  },
  {
    shona: "vanoda",
    english: "they want",
    category: "verbs",
    tones: "LHLHL",
    ipa: "/vanoda/",
    simplified: "vah-NOH-dah",
    source: "fsi_basic",
    difficulty: 3
  },
  {
    shona: "ndiri kuenda",
    english: "I am going",
    category: "verbs",
    tones: "LHLHL",
    ipa: "/ⁿdiri kuenda/",
    simplified: "ndee-REE koo-EHN-dah",
    source: "fsi_basic",
    difficulty: 4
  },
  {
    shona: "uri kuenda",
    english: "you are going (singular)",
    category: "verbs",
    tones: "LHLHL",
    ipa: "/uri kuenda/",
    simplified: "OO-ree koo-EHN-dah",
    source: "fsi_basic",
    difficulty: 4
  },
  {
    shona: "ari kuenda",
    english: "he/she is going",
    category: "verbs",
    tones: "LHLHL",
    ipa: "/ari kuenda/",
    simplified: "AH-ree koo-EHN-dah",
    source: "fsi_basic",
    difficulty: 4
  },
  {
    shona: "tiri kuenda",
    english: "we are going",
    category: "verbs",
    tones: "LHLHL",
    ipa: "/tiri kuenda/",
    simplified: "tee-REE koo-EHN-dah",
    source: "fsi_basic",
    difficulty: 4
  },
  {
    shona: "muri kuenda",
    english: "you are going (plural)",
    category: "verbs",
    tones: "LHLHL",
    ipa: "/muri kuenda/",
    simplified: "moo-REE koo-EHN-dah",
    source: "fsi_basic",
    difficulty: 4
  },
  {
    shona: "vari kuenda",
    english: "they are going",
    category: "verbs",
    tones: "LHLHL",
    ipa: "/vari kuenda/",
    simplified: "vah-REE koo-EHN-dah",
    source: "fsi_basic",
    difficulty: 4
  }
];

// Additional vocabulary from other sources
const additionalVocabulary = [
  // Family terms
  {
    shona: "mukadzi",
    english: "woman/wife",
    category: "family",
    tones: "LHL",
    ipa: "/mukadzi/",
    simplified: "moo-KAH-dzee",
    source: "ethnography",
    difficulty: 2,
    cultural: "Respectful term for woman or wife"
  },
  {
    shona: "murume",
    english: "man/husband",
    category: "family",
    tones: "LHL",
    ipa: "/murume/",
    simplified: "moo-ROO-meh",
    source: "ethnography",
    difficulty: 2,
    cultural: "Respectful term for man or husband"
  },
  {
    shona: "vana",
    english: "children",
    category: "family",
    tones: "LHL",
    ipa: "/vana/",
    simplified: "VAH-nah",
    source: "ethnography",
    difficulty: 1,
    cultural: "Plural form of child"
  },
  {
    shona: "mwana",
    english: "child",
    category: "family",
    tones: "LHL",
    ipa: "/mwana/",
    simplified: "MWAH-nah",
    source: "ethnography",
    difficulty: 1
  },
  // Food and drink
  {
    shona: "sadza",
    english: "maize porridge",
    category: "food",
    tones: "LHL",
    ipa: "/sadza/",
    simplified: "SAH-dzah",
    source: "cultural_practices",
    difficulty: 2,
    cultural: "Staple food in Zimbabwe, made from maize meal"
  },
  {
    shona: "nyama",
    english: "meat",
    category: "food",
    tones: "LHL",
    ipa: "/ɲama/",
    simplified: "NYAH-mah",
    source: "cultural_practices",
    difficulty: 2
  },
  {
    shona: "muriwo",
    english: "vegetables",
    category: "food",
    tones: "LHLHL",
    ipa: "/muriwo/",
    simplified: "moo-REE-woh",
    source: "cultural_practices",
    difficulty: 3
  },
  {
    shona: "mvura",
    english: "water",
    category: "food",
    tones: "LHL",
    ipa: "/mvura/",
    simplified: "MVOO-rah",
    source: "cultural_practices",
    difficulty: 2
  },
  // Body parts
  {
    shona: "musoro",
    english: "head",
    category: "body",
    tones: "LHL",
    ipa: "/musoro/",
    simplified: "moo-SOH-roh",
    source: "primary_textbook",
    difficulty: 2
  },
  {
    shona: "meso",
    english: "eyes",
    category: "body",
    tones: "LHL",
    ipa: "/meso/",
    simplified: "MEH-soh",
    source: "primary_textbook",
    difficulty: 2
  },
  {
    shona: "nzeve",
    english: "ears",
    category: "body",
    tones: "LHL",
    ipa: "/ⁿzeve/",
    simplified: "ndzeh-VEH",
    source: "primary_textbook",
    difficulty: 2
  },
  {
    shona: "mukanwa",
    english: "mouth",
    category: "body",
    tones: "LHLHL",
    ipa: "/mukanwa/",
    simplified: "moo-KAH-nwah",
    source: "primary_textbook",
    difficulty: 3
  },
  // Colors
  {
    shona: "chena",
    english: "white",
    category: "colors",
    tones: "LHL",
    ipa: "/tʃena/",
    simplified: "CHEH-nah",
    source: "primary_textbook",
    difficulty: 2
  },
  {
    shona: "nhema",
    english: "black",
    category: "colors",
    tones: "LHL",
    ipa: "/ɲema/",
    simplified: "NYEH-mah",
    source: "primary_textbook",
    difficulty: 2
  },
  {
    shona: "tsvuku",
    english: "red",
    category: "colors",
    tones: "LHL",
    ipa: "/ts͎uku/",
    simplified: "TSVOO-koo",
    source: "primary_textbook",
    difficulty: 3
  },
  {
    shona: "yero",
    english: "yellow",
    category: "colors",
    tones: "LHL",
    ipa: "/jero/",
    simplified: "YEH-roh",
    source: "primary_textbook",
    difficulty: 2
  },
  // Animals
  {
    shona: "mombe",
    english: "cow",
    category: "animals",
    tones: "LHL",
    ipa: "/mombe/",
    simplified: "MOHM-beh",
    source: "cultural_practices",
    difficulty: 2,
    cultural: "Important animal in Shona culture, symbol of wealth"
  },
  {
    shona: "imbwa",
    english: "dog",
    category: "animals",
    tones: "LHL",
    ipa: "/iᵐbwa/",
    simplified: "eem-BWAH",
    source: "cultural_practices",
    difficulty: 2
  },
  {
    shona: "katsi",
    english: "cat",
    category: "animals",
    tones: "LHL",
    ipa: "/katsi/",
    simplified: "KAH-tsee",
    source: "cultural_practices",
    difficulty: 2
  },
  {
    shona: "shiri",
    english: "bird",
    category: "animals",
    tones: "LHL",
    ipa: "/ʃiri/",
    simplified: "SHEE-ree",
    source: "cultural_practices",
    difficulty: 2
  }
];

// Combine all vocabulary
const allVocabulary = [...fsiVocabulary, ...additionalVocabulary];

// Function to generate pronunciation text
function generatePronunciationText(word, ipa, tones) {
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
  
  // Add syllable breaks and stress
  // This is a simplified approach - in practice, you'd need more sophisticated syllable analysis
  simplified = simplified.replace(/([aeiou])/g, '$1-');
  simplified = simplified.replace(/-$/, ''); // Remove trailing hyphen
  
  return simplified;
}

// Process vocabulary and add pronunciation text
const processedVocabulary = allVocabulary.map(word => ({
  ...word,
  pronunciation: generatePronunciationText(word.shona, word.ipa, word.tones),
  audioFile: `${word.shona}.mp3`,
  examples: word.examples || [
    {
      shona: `Ndinoda ${word.shona}`,
      english: `I want ${word.english}`,
      context: "Basic sentence structure",
      register: "neutral"
    }
  ]
}));

// Create master vocabulary document
const masterVocabulary = {
  metadata: {
    title: "Comprehensive Shona Vocabulary Master Document",
    version: "1.0.0",
    created: new Date().toISOString(),
    totalWords: processedVocabulary.length,
    sources: ["fsi_basic", "ethnography", "cultural_practices", "primary_textbook"],
    pronunciationGuide: "SHONA_PRONUNCIATION_MASTER_GUIDE.md"
  },
  pronunciationGuide: {
    reference: "SHONA_PRONUNCIATION_MASTER_GUIDE.md",
    summary: "Comprehensive guide to Shona pronunciation including tones, special sounds, and regional variations"
  },
  vocabulary: processedVocabulary
};

// Write to file
const outputPath = path.join(__dirname, '..', 'content', 'vocabulary_master_comprehensive.json');
fs.writeFileSync(outputPath, JSON.stringify(masterVocabulary, null, 2));

console.log(`✅ Created comprehensive vocabulary master document with ${processedVocabulary.length} words`);
console.log(`📁 Output: ${outputPath}`);
console.log(`📖 Pronunciation guide: SHONA_PRONUNCIATION_MASTER_GUIDE.md`);

// Also create a simplified version for easy reading
const simplifiedVocabulary = processedVocabulary.map(word => ({
  shona: word.shona,
  english: word.english,
  pronunciation: word.pronunciation,
  tones: word.tones,
  category: word.category,
  difficulty: word.difficulty,
  cultural: word.cultural || null
}));

const simplifiedOutput = {
  metadata: {
    title: "Simplified Shona Vocabulary List",
    version: "1.0.0",
    totalWords: simplifiedVocabulary.length
  },
  vocabulary: simplifiedVocabulary
};

const simplifiedPath = path.join(__dirname, '..', 'content', 'vocabulary_simplified.json');
fs.writeFileSync(simplifiedPath, JSON.stringify(simplifiedOutput, null, 2));

console.log(`📝 Created simplified vocabulary list: ${simplifiedPath}`); 