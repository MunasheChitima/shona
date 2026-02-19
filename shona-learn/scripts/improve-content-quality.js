const fs = require('fs');
const path = require('path');

// Pronunciation format standardization
const pronunciationFixes = {
  'H-o-ng-u': 'ho-NGU',
  'KW-e-t-e': 'kwe-TE',
  'D-u-mb-u': 'dum-BU',
  'M-A-nz-i-n-o': 'man-ZI-no',
  'M-a-o-k-o': 'ma-O-ko',
  'K-U-N-Z-E- -K-W-E-N-Y-I-K-A': 'kun-ze kwe-nyi-ka',
  'K-U-P-I-N-Z-A': 'ku-pin-za',
  'D-U-dz-i-r-o': 'du-dzi-ro',
  'NH-a-U-r-i-r-a-n-o': 'nha-u-ri-ra-no',
  'NH-e-V-e-dz-a-n-o': 'nhe-ve-dza-no'
};

// Educational exercise options
const educationalOptions = {
  'yes': ['yes', 'no', 'maybe', 'I don\'t know'],
  'no': ['no', 'yes', 'perhaps', 'not sure'],
  'hello': ['hello', 'goodbye', 'thank you', 'please'],
  'friend': ['friend', 'family', 'stranger', 'teacher'],
  'name': ['name', 'age', 'country', 'language'],
  'one': ['one', 'two', 'three', 'zero'],
  'two': ['two', 'one', 'three', 'four'],
  'father': ['father', 'mother', 'brother', 'sister'],
  'mother': ['mother', 'father', 'grandmother', 'aunt'],
  'water': ['water', 'food', 'drink', 'medicine'],
  'food': ['food', 'water', 'clothing', 'shelter'],
  'house': ['house', 'school', 'market', 'church'],
  'good': ['good', 'bad', 'big', 'small'],
  'bad': ['bad', 'good', 'new', 'old'],
  'big': ['big', 'small', 'tall', 'short'],
  'small': ['small', 'big', 'long', 'wide'],
  'black': ['black', 'white', 'red', 'blue'],
  'white': ['white', 'black', 'green', 'yellow'],
  'red': ['red', 'blue', 'green', 'yellow'],
  'blue': ['blue', 'red', 'green', 'purple'],
  'green': ['green', 'blue', 'yellow', 'orange'],
  'yellow': ['yellow', 'green', 'orange', 'brown']
};

// Cultural context improvements
const culturalContext = {
  'hongu': 'In Shona culture, agreement shows respect and community harmony. Saying "hongu" (yes) demonstrates politeness and willingness to cooperate.',
  'kwete': 'Politeness in disagreement is important in Shona culture. "Kwete" (no) is used respectfully to decline or disagree.',
  'mhoro': 'In Zimbabwean culture, greetings are essential and show respect. Always greet elders first with appropriate respect.',
  'shamwari': 'Friendship in Shona culture is deep and meaningful. "Shamwari" represents a close, trusted relationship.',
  'zita': 'Names in Shona culture often have deep meaning and connect to family history and cultural values.',
  'baba': 'Fathers hold a position of respect in Shona culture. The term "baba" shows honor and reverence.',
  'amai': 'Mothers are central to Shona family life. "Amai" represents nurturing, wisdom, and family leadership.',
  'sekuru': 'Grandfathers are respected elders who carry traditional knowledge and family wisdom.',
  'ambuya': 'Grandmothers are treasured for their wisdom, traditional knowledge, and nurturing care.',
  'mukoma': 'Older brothers have a protective and guiding role in Shona families.',
  'hanzvadzi': 'Sisters represent family bonds and mutual support in Shona culture.',
  'dumbu': 'The stomach is important in traditional Shona medicine and cultural practices.',
  'manzino': 'Teeth are cared for traditionally and are important for health and appearance.',
  'maoko': 'Hands are used in traditional greetings, work, and cultural ceremonies.',
  'dema': 'Black color has cultural significance in traditional ceremonies and clothing.',
  'chena': 'White represents purity and is used in traditional ceremonies and celebrations.',
  'tsvuku': 'Red has cultural meaning in traditional clothing and ceremonial practices.',
  'bhuruu': 'Blue represents peace and harmony in Shona cultural expressions.',
  'girini': 'Green connects to nature and agricultural traditions in Shona culture.',
  'yero': 'Yellow represents warmth and energy in traditional Shona expressions.'
};

// Usage improvements
const usageNotes = {
  'hongu': 'Use "hongu" to agree or say yes. It\'s polite and can be used in any situation to show respect.',
  'kwete': 'Use "kwete" to disagree or say no. It\'s polite and respectful, suitable for any context.',
  'mhoro': 'Use "mhoro" as a casual greeting among friends. For elders, use "mangwanani" (good morning).',
  'shamwari': 'Use "shamwari" for close friends. It represents deep friendship, not casual acquaintance.',
  'zita': 'Ask for someone\'s name politely with "Munonzi ani?" (What is your name?).',
  'baba': 'Address your father or any elder man with respect using "baba".',
  'amai': 'Address your mother or any elder woman with respect using "amai".',
  'sekuru': 'Use "sekuru" to address your grandfather or any respected elder man.',
  'ambuya': 'Use "ambuya" to address your grandmother or any respected elder woman.',
  'mukoma': 'Address your older brother with "mukoma" to show respect.',
  'hanzvadzi': 'Use "hanzvadzi" for your sister, showing family closeness.',
  'dumbu': 'Use "dumbu" when discussing health or traditional medicine.',
  'manzino': 'Use "manzino" when discussing dental health or appearance.',
  'maoko': 'Use "maoko" when discussing work, greetings, or cultural activities.',
  'dema': 'Use "dema" to describe black objects, clothing, or traditional items.',
  'chena': 'Use "chena" to describe white objects, clothing, or ceremonial items.',
  'tsvuku': 'Use "tsvuku" to describe red objects, clothing, or traditional items.',
  'bhuruu': 'Use "bhuruu" to describe blue objects, clothing, or peaceful settings.',
  'girini': 'Use "girini" to describe green objects, nature, or agricultural items.',
  'yero': 'Use "yero" to describe yellow objects, warmth, or energetic settings.'
};

// Better examples
const betterExamples = {
  'hongu': 'Hongu, ndinonzwisisa (Yes, I understand)',
  'kwete': 'Kwete, handidi (No, I don\'t want)',
  'mhoro': 'Mhoro, shamwari! (Hello, friend!)',
  'shamwari': 'Shamwari yangu (My friend)',
  'zita': 'Zita rangu ndinonzi Maria (My name is Maria)',
  'baba': 'Baba vangu (My father)',
  'amai': 'Amai vangu (My mother)',
  'sekuru': 'Sekuru vangu (My grandfather)',
  'ambuya': 'Ambuya vangu (My grandmother)',
  'mukoma': 'Mukoma wangu (My older brother)',
  'hanzvadzi': 'Hanzvadzi yangu (My sister)',
  'dumbu': 'Ndine dumbu rinorwadza (I have a stomach ache)',
  'manzino': 'Manzino angu akanaka (My teeth are good)',
  'maoko': 'Maoko angu akachena (My hands are clean)',
  'dema': 'Hembe dema (Black shirt)',
  'chena': 'Hembe chena (White shirt)',
  'tsvuku': 'Hembe tsvuku (Red shirt)',
  'bhuruu': 'Denga bhuruu (Blue sky)',
  'girini': 'Sora girini (Green grass)',
  'yero': 'Zuva yero (Yellow sun)'
};

function improveContent() {
  const lessonsPath = path.join(__dirname, '..', 'content', 'lessons_enhanced.json');
  const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
  
  let improvements = 0;
  
  lessons.lessons.forEach(lesson => {
    // Improve vocabulary
    lesson.vocabulary?.forEach(word => {
      // Fix pronunciation format
      if (pronunciationFixes[word.pronunciation]) {
        word.pronunciation = pronunciationFixes[word.pronunciation];
        improvements++;
      }
      
      // Add cultural context
      if (!word.culturalContext && culturalContext[word.shona]) {
        word.culturalContext = culturalContext[word.shona];
        improvements++;
      }
      
      // Add usage notes
      if (!word.usage && usageNotes[word.shona]) {
        word.usage = usageNotes[word.shona];
        improvements++;
      }
      
      // Improve examples
      if (word.example === 'Ndinoda hongu' || word.example === 'Ndinoda kwete' || !word.example) {
        if (betterExamples[word.shona]) {
          word.example = betterExamples[word.shona];
          improvements++;
        }
      }
    });
    
    // Improve exercises
    lesson.exercises?.forEach(exercise => {
      // Fix pronunciation in exercises
      if (pronunciationFixes[exercise.pronunciation]) {
        exercise.pronunciation = pronunciationFixes[exercise.pronunciation];
        improvements++;
      }
      
      // Replace generic options
      if (exercise.options && exercise.options.includes('Incorrect option 1')) {
        const correctAnswer = exercise.correctAnswer?.toLowerCase();
        if (educationalOptions[correctAnswer]) {
          exercise.options = educationalOptions[correctAnswer];
          improvements++;
        }
      }
    });
  });
  
  // Save improved content
  fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));
  
  console.log(`✅ Improved ${improvements} content items`);
  console.log('📝 Content quality improvements completed!');
}

improveContent(); 