const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Pronunciation map for common words (can be expanded)
const pronunciationMap = {
  // Greetings
  'mangwanani': 'mah-ngwah-NAH-nee',
  'masikati': 'mah-see-KAH-tee',
  'manheru': 'mah-NEH-roo',
  'makadii': 'mah-kah-DEE',
  'ndiripo': 'ndee-REE-poh',
  'ndatenda': 'ndah-TEN-dah',
  
  // Numbers
  'potsi': 'POH-tsee',
  'piri': 'PEE-ree',
  'tatu': 'TAH-too',
  'ina': 'EE-nah',
  'shanu': 'SHAH-noo',
  'tanhatu': 'tahn-HAH-too',
  'nomwe': 'NOH-mweh',
  'sere': 'SEH-reh',
  'pfumbamwe': 'pfoom-BAH-mweh',
  'gumi': 'GOO-mee',
  
  // Family
  'amai': 'ah-MAH-ee',
  'baba': 'BAH-bah',
  'mwana': 'MWAH-nah',
  'mukoma': 'moo-KOH-mah',
  'hanzvadzi': 'hahn-ZVAH-dzee',
  'sekuru': 'seh-KOO-roo',
  'ambuya': 'ahm-BOO-yah',
  'mhuri': 'MHOO-ree',
  
  // Common verbs
  'kuda': 'KOO-dah',
  'kuenda': 'koo-EN-dah',
  'kudya': 'KOO-dyah',
  'kurara': 'koo-RAH-rah',
  'kutaura': 'koo-TAH-oo-rah',
  'kuona': 'koo-OH-nah',
  'kunzwa': 'KOON-zwah',
  'kubata': 'koo-BAH-tah',
  
  // Colors
  'chena': 'CHEH-nah',
  'dema': 'DEH-mah',
  'tsvuku': 'TSVOO-koo',
  'bhuruu': 'bhoo-ROO',
  'girinhi': 'gee-REEN-hee',
  'yero': 'YEH-roh',
  
  // Common phrases
  'ndatenda zvikuru': 'ndah-TEN-dah zvee-KOO-roo',
  'zita rangu ndi': 'ZEE-tah RAH-ngoo ndee',
  'ndinobva ku': 'ndee-NOH-bvah koo',
  'ndiri bho': 'NDEE-ree bhoh',
  
  // Body parts
  'musoro': 'moo-SOH-roh',
  'maoko': 'mah-OH-koh',
  'tsoka': 'TSOH-kah',
  'maziso': 'mah-ZEE-soh',
  'nzeve': 'NZEH-veh',
  'muromo': 'moo-ROH-moh',
  
  // Food
  'sadza': 'SAH-dzah',
  'nyama': 'NYAH-mah',
  'mvura': 'MVOO-rah',
  'mukaka': 'moo-KAH-kah',
  'chingwa': 'CHEEN-gwah',
  'michero': 'mee-CHEH-roh',
  
  // Places
  'imba': 'EEM-bah',
  'chikoro': 'chee-KOH-roh',
  'musika': 'moo-SEE-kah',
  'chipatara': 'chee-pah-TAH-rah',
  'kereke': 'keh-REH-keh',
  
  // Time
  'nhasi': 'NHAH-see',
  'mangwana': 'mahn-GWAH-nah',
  'nezuro': 'neh-ZOO-roh',
  'mwedzi': 'MWEH-dzee',
  'gore': 'GOH-reh'
};

// Function to get pronunciation for a Shona phrase
function getPronunciation(shonaPhrase) {
  if (!shonaPhrase) return null;
  
  const normalized = shonaPhrase.toLowerCase().trim();
  
  // Direct match
  if (pronunciationMap[normalized]) {
    return pronunciationMap[normalized];
  }
  
  // Try to find partial matches for single words
  const words = normalized.split(' ');
  if (words.length === 1) {
    // For single words, try to find in the map
    for (const [key, value] of Object.entries(pronunciationMap)) {
      if (key.includes(normalized) || normalized.includes(key)) {
        return value;
      }
    }
  }
  
  // For phrases, try to build pronunciation from individual words
  const pronunciations = words.map(word => {
    if (pronunciationMap[word]) {
      return pronunciationMap[word];
    }
    // If not found, return a basic phonetic approximation
    return word.toUpperCase();
  });
  
  if (pronunciations.some(p => p !== p.toUpperCase())) {
    return pronunciations.join(' ');
  }
  
  return null;
}

async function updateExercisePronunciations() {
  console.log('Starting pronunciation update...');
  
  try {
    // Get all exercises
    const exercises = await prisma.exercise.findMany();
    console.log(`Found ${exercises.length} exercises`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const exercise of exercises) {
      // Skip if already has valid pronunciation
      if (exercise.audioText && exercise.audioText !== 'null' && exercise.audioText !== exercise.shonaPhrase) {
        skipped++;
        continue;
      }
      
      // Get pronunciation based on Shona phrase
      const pronunciation = getPronunciation(exercise.shonaPhrase);
      
      if (pronunciation) {
        await prisma.exercise.update({
          where: { id: exercise.id },
          data: { audioText: pronunciation }
        });
        updated++;
        console.log(`Updated: "${exercise.shonaPhrase}" -> "${pronunciation}"`);
      } else if (exercise.shonaPhrase) {
        // If we couldn't find a pronunciation, create a basic one
        const basicPronunciation = exercise.shonaPhrase
          .toLowerCase()
          .split(' ')
          .map(word => {
            // Basic phonetic rules for Shona
            return word
              .replace(/ng/g, 'ng')
              .replace(/ny/g, 'ny')
              .replace(/zh/g, 'zh')
              .replace(/sh/g, 'sh')
              .replace(/ch/g, 'ch')
              .replace(/mb/g, 'mb')
              .replace(/nd/g, 'nd')
              .replace(/nz/g, 'nz')
              .replace(/sv/g, 'sv')
              .replace(/zv/g, 'zv')
              .replace(/tsv/g, 'tsv')
              .replace(/dzv/g, 'dzv');
          })
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('-');
        
        await prisma.exercise.update({
          where: { id: exercise.id },
          data: { audioText: basicPronunciation }
        });
        updated++;
        console.log(`Updated with basic: "${exercise.shonaPhrase}" -> "${basicPronunciation}"`);
      }
    }
    
    console.log(`\nUpdate complete!`);
    console.log(`Updated: ${updated} exercises`);
    console.log(`Skipped: ${skipped} exercises (already had pronunciation)`);
    console.log(`Total: ${exercises.length} exercises`);
    
  } catch (error) {
    console.error('Error updating pronunciations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateExercisePronunciations();