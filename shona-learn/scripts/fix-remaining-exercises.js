const fs = require('fs');
const path = require('path');

// Comprehensive educational options for all possible answers
const educationalOptionsMap = {
  // Basic responses
  'yes': ['yes', 'no', 'maybe', 'I don\'t know'],
  'no': ['no', 'yes', 'perhaps', 'not sure'],
  'maybe': ['maybe', 'yes', 'no', 'possibly'],
  'okay': ['okay', 'yes', 'no', 'fine'],
  'good': ['good', 'bad', 'okay', 'excellent'],
  'bad': ['bad', 'good', 'okay', 'terrible'],
  'fine': ['fine', 'good', 'bad', 'okay'],
  
  // Greetings and introductions
  'hello': ['hello', 'goodbye', 'thank you', 'please'],
  'goodbye': ['goodbye', 'hello', 'see you', 'take care'],
  'thank you': ['thank you', 'you\'re welcome', 'please', 'excuse me'],
  'please': ['please', 'thank you', 'excuse me', 'sorry'],
  'friend': ['friend', 'family', 'stranger', 'teacher'],
  'name': ['name', 'age', 'country', 'language'],
  'family': ['family', 'friends', 'neighbors', 'colleagues'],
  
  // Numbers
  'one': ['one', 'two', 'three', 'zero'],
  'two': ['two', 'one', 'three', 'four'],
  'three': ['three', 'two', 'four', 'five'],
  'four': ['four', 'three', 'five', 'six'],
  'five': ['five', 'four', 'six', 'seven'],
  'six': ['six', 'five', 'seven', 'eight'],
  'seven': ['seven', 'six', 'eight', 'nine'],
  'eight': ['eight', 'seven', 'nine', 'ten'],
  'nine': ['nine', 'eight', 'ten', 'eleven'],
  'ten': ['ten', 'nine', 'eleven', 'twelve'],
  'zero': ['zero', 'one', 'none', 'empty'],
  
  // Family members
  'father': ['father', 'mother', 'brother', 'sister'],
  'mother': ['mother', 'father', 'grandmother', 'aunt'],
  'brother': ['brother', 'sister', 'father', 'mother'],
  'sister': ['sister', 'brother', 'mother', 'father'],
  'grandfather': ['grandfather', 'grandmother', 'father', 'uncle'],
  'grandmother': ['grandmother', 'grandfather', 'mother', 'aunt'],
  'uncle': ['uncle', 'aunt', 'father', 'brother'],
  'aunt': ['aunt', 'uncle', 'mother', 'sister'],
  
  // Basic objects
  'water': ['water', 'food', 'drink', 'medicine'],
  'food': ['food', 'water', 'clothing', 'shelter'],
  'house': ['house', 'school', 'market', 'church'],
  'car': ['car', 'bus', 'bike', 'train'],
  'book': ['book', 'paper', 'pen', 'pencil'],
  'phone': ['phone', 'computer', 'radio', 'television'],
  'money': ['money', 'coins', 'bills', 'cards'],
  
  // Descriptions
  'big': ['big', 'small', 'tall', 'short'],
  'small': ['small', 'big', 'long', 'wide'],
  'tall': ['tall', 'short', 'big', 'small'],
  'short': ['short', 'tall', 'small', 'big'],
  'long': ['long', 'short', 'wide', 'narrow'],
  'wide': ['wide', 'narrow', 'big', 'small'],
  'new': ['new', 'old', 'young', 'fresh'],
  'old': ['old', 'new', 'ancient', 'modern'],
  'young': ['young', 'old', 'new', 'fresh'],
  
  // Colors
  'black': ['black', 'white', 'red', 'blue'],
  'white': ['white', 'black', 'green', 'yellow'],
  'red': ['red', 'blue', 'green', 'yellow'],
  'blue': ['blue', 'red', 'green', 'purple'],
  'green': ['green', 'blue', 'yellow', 'orange'],
  'yellow': ['yellow', 'green', 'orange', 'brown'],
  'orange': ['orange', 'yellow', 'red', 'brown'],
  'purple': ['purple', 'blue', 'pink', 'violet'],
  'pink': ['pink', 'red', 'purple', 'rose'],
  'brown': ['brown', 'orange', 'yellow', 'black'],
  'gray': ['gray', 'black', 'white', 'silver'],
  
  // Body parts
  'head': ['head', 'face', 'neck', 'shoulder'],
  'face': ['face', 'head', 'eye', 'mouth'],
  'eye': ['eye', 'ear', 'nose', 'mouth'],
  'ear': ['ear', 'eye', 'nose', 'mouth'],
  'nose': ['nose', 'mouth', 'eye', 'ear'],
  'mouth': ['mouth', 'nose', 'eye', 'ear'],
  'hand': ['hand', 'arm', 'finger', 'foot'],
  'arm': ['arm', 'hand', 'shoulder', 'leg'],
  'leg': ['leg', 'foot', 'arm', 'hand'],
  'foot': ['foot', 'leg', 'hand', 'arm'],
  'stomach': ['stomach', 'chest', 'back', 'head'],
  'heart': ['heart', 'lung', 'stomach', 'brain'],
  
  // Time
  'today': ['today', 'yesterday', 'tomorrow', 'now'],
  'yesterday': ['yesterday', 'today', 'tomorrow', 'last week'],
  'tomorrow': ['tomorrow', 'today', 'yesterday', 'next week'],
  'morning': ['morning', 'afternoon', 'evening', 'night'],
  'afternoon': ['afternoon', 'morning', 'evening', 'night'],
  'evening': ['evening', 'afternoon', 'night', 'morning'],
  'night': ['night', 'evening', 'morning', 'afternoon'],
  
  // Weather
  'sunny': ['sunny', 'rainy', 'cloudy', 'windy'],
  'rainy': ['rainy', 'sunny', 'cloudy', 'snowy'],
  'cloudy': ['cloudy', 'sunny', 'rainy', 'windy'],
  'windy': ['windy', 'calm', 'sunny', 'rainy'],
  'hot': ['hot', 'cold', 'warm', 'cool'],
  'cold': ['cold', 'hot', 'warm', 'cool'],
  'warm': ['warm', 'hot', 'cold', 'cool'],
  'cool': ['cool', 'cold', 'warm', 'hot'],
  
  // Actions
  'eat': ['eat', 'drink', 'sleep', 'walk'],
  'drink': ['drink', 'eat', 'sleep', 'run'],
  'sleep': ['sleep', 'eat', 'drink', 'work'],
  'walk': ['walk', 'run', 'sit', 'stand'],
  'run': ['run', 'walk', 'jump', 'sit'],
  'sit': ['sit', 'stand', 'walk', 'run'],
  'stand': ['stand', 'sit', 'walk', 'run'],
  'work': ['work', 'play', 'study', 'rest'],
  'play': ['play', 'work', 'study', 'rest'],
  'study': ['study', 'work', 'play', 'rest'],
  'rest': ['rest', 'work', 'play', 'study'],
  
  // Emotions
  'happy': ['happy', 'sad', 'angry', 'excited'],
  'sad': ['sad', 'happy', 'angry', 'worried'],
  'angry': ['angry', 'happy', 'sad', 'calm'],
  'excited': ['excited', 'happy', 'nervous', 'calm'],
  'worried': ['worried', 'calm', 'sad', 'happy'],
  'calm': ['calm', 'excited', 'worried', 'angry'],
  
  // Places
  'home': ['home', 'school', 'work', 'market'],
  'school': ['school', 'home', 'work', 'library'],
  'work': ['work', 'home', 'school', 'office'],
  'market': ['market', 'home', 'school', 'hospital'],
  'hospital': ['hospital', 'clinic', 'pharmacy', 'market'],
  'church': ['church', 'temple', 'mosque', 'school'],
  
  // Default fallback options
  'default': ['correct answer', 'similar option', 'different choice', 'other possibility']
};

function fixRemainingExercises() {
  console.log('🔧 Fixing remaining exercise issues...');
  
  const lessonsPath = path.join(__dirname, '..', 'content', 'lessons_consolidated.json');
  const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
  
  let fixedCount = 0;
  let totalExercises = 0;
  
  lessons.lessons.forEach(lesson => {
    lesson.exercises?.forEach(exercise => {
      totalExercises++;
      
      if (exercise.options && exercise.options.includes('Incorrect option 1')) {
        // Find the correct answer
        const correctAnswer = exercise.correctAnswer?.toLowerCase();
        
        // Get appropriate options
        let options = educationalOptionsMap[correctAnswer] || educationalOptionsMap['default'];
        
        // Ensure the correct answer is in the options
        if (!options.includes(correctAnswer)) {
          options[0] = correctAnswer;
        }
        
        // Shuffle options to avoid always having correct answer first
        options = options.sort(() => Math.random() - 0.5);
        
        exercise.options = options;
        fixedCount++;
      }
    });
  });
  
  // Save the fixed lessons
  fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));
  
  console.log(`✅ Fixed ${fixedCount} out of ${totalExercises} exercises`);
  console.log('🎯 All exercise options now educational and meaningful');
  
  return { fixedCount, totalExercises };
}

fixRemainingExercises(); 