const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Load content files
const loadContentFile = (filename) => {
  const filePath = path.join(__dirname, '..', 'content', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

async function seedLessonContent() {
  try {
    console.log('🌱 Starting lesson content seeding...');

    // Load all content files
    const lessonsData = loadContentFile('lessons.json');
    const exercisesData = loadContentFile('exercises.json');
    const audioManifest = loadContentFile('audio-manifest.json');
    const culturalNotes = loadContentFile('cultural_notes.json');

    // First, ensure quests exist (from the existing quests.ts)
    const questsToCreate = [
      {
        id: 'quest-1',
        title: 'The Village Greeting',
        description: 'Begin your journey by learning to greet people in a Shona village',
        storyNarrative: 'You\'ve just arrived in a beautiful Shona village. The villagers are warm and welcoming, but you need to learn their greetings to connect with them.',
        category: 'Cultural Immersion',
        orderIndex: 1,
        requiredLevel: 1,
        collaborativeElements: ['Practice greetings with other learners', 'Share cultural insights', 'Help others with pronunciation'],
        intrinsicRewards: ['Feel the joy of connecting with Shona speakers', 'Experience cultural understanding', 'Build confidence in language learning']
      },
      {
        id: 'quest-2',
        title: 'Family Connections',
        description: 'Learn about family relationships and build your Shona family vocabulary',
        storyNarrative: 'A family in the village has invited you to their home. You\'ll learn about family relationships, which are central to Shona culture.',
        category: 'Family & Relationships',
        orderIndex: 2,
        requiredLevel: 2,
        collaborativeElements: ['Share your family structure with others', 'Practice family conversations together', 'Create family trees using Shona terms'],
        intrinsicRewards: ['Deepen understanding of Shona culture', 'Feel connected to family values', 'Build meaningful relationships']
      },
      {
        id: 'quest-3',
        title: 'Market Adventures',
        description: 'Navigate a Shona market using numbers, colors, and basic phrases',
        storyNarrative: 'You\'re exploring a vibrant Shona market where you need to count, identify colors, and negotiate.',
        category: 'Practical Communication',
        orderIndex: 3,
        requiredLevel: 3,
        collaborativeElements: ['Role-play market scenarios together', 'Share market experiences from your culture', 'Practice bargaining as a group'],
        intrinsicRewards: ['Experience practical language application', 'Feel confident in real-world situations', 'Connect with local culture and commerce']
      },
      {
        id: 'quest-4',
        title: 'Voice of the Village',
        description: 'Master Shona pronunciation and tones through voice practice',
        storyNarrative: 'The village elders want to teach you the proper way to speak Shona. You\'ll learn the musical tones and sounds that make Shona unique.',
        category: 'Pronunciation Mastery',
        orderIndex: 4,
        requiredLevel: 4,
        collaborativeElements: ['Practice pronunciation with native speakers', 'Record and share pronunciation attempts', 'Give and receive constructive feedback'],
        intrinsicRewards: ['Feel the rhythm and beauty of Shona', 'Build authentic speaking confidence', 'Connect with the language\'s musical heritage']
      }
    ];

    // Create or update quests
    console.log('📚 Seeding quests...');
    for (const questData of questsToCreate) {
      const questForDb = {
        ...questData,
        collaborativeElements: JSON.stringify(questData.collaborativeElements),
        intrinsicRewards: JSON.stringify(questData.intrinsicRewards)
      };
      
      await prisma.quest.upsert({
        where: { id: questData.id },
        update: questForDb,
        create: questForDb,
      });
    }
    console.log('✅ Quests seeded successfully');

    // Create lessons
    console.log('📖 Seeding lessons...');
    for (const lessonData of lessonsData.lessons) {
      const lessonForDb = {
        id: lessonData.id,
        title: lessonData.title,
        description: lessonData.description,
        category: lessonData.category,
        orderIndex: lessonData.orderIndex,
        xpReward: lessonData.xpReward,
        questId: lessonData.questId,
        learningObjectives: JSON.stringify(lessonData.learningObjectives || []),
        discoveryElements: JSON.stringify(lessonData.discoveryElements || []),
      };
      
      const lesson = await prisma.lesson.upsert({
        where: { id: lessonData.id },
        update: lessonForDb,
        create: lessonForDb,
      });
      console.log(`  ✓ Lesson: ${lesson.title}`);
    }
    console.log('✅ Lessons seeded successfully');

    // Create exercises
    console.log('🎯 Seeding exercises...');
    for (const exerciseData of exercisesData.exercises) {
      const exerciseForDb = {
        id: exerciseData.id,
        lessonId: exerciseData.lessonId,
        type: exerciseData.type,
        question: exerciseData.question,
        correctAnswer: exerciseData.correctAnswer 
          ? (Array.isArray(exerciseData.correctAnswer) 
              ? JSON.stringify(exerciseData.correctAnswer)
              : exerciseData.correctAnswer)
          : "Complete the activity correctly",
        options: JSON.stringify(exerciseData.options || []),
        shonaPhrase: exerciseData.audioText,
        audioText: exerciseData.audioText,
        points: exerciseData.points,
        intrinsicFeedback: JSON.stringify(exerciseData.intrinsicFeedback || {}),
        discoveryHint: exerciseData.culturalContext,
      };
      
      const exercise = await prisma.exercise.upsert({
        where: { id: exerciseData.id },
        update: exerciseForDb,
        create: exerciseForDb,
      });
      console.log(`  ✓ Exercise: ${exercise.question.substring(0, 50)}...`);
    }
    console.log('✅ Exercises seeded successfully');

    // Create sample vocabulary entries
    console.log('📝 Seeding vocabulary...');
    const vocabularyEntries = [];
    
    // Extract vocabulary from lessons
    for (const lessonData of lessonsData.lessons) {
      if (lessonData.vocabulary) {
        for (const vocab of lessonData.vocabulary) {
          vocabularyEntries.push({
            id: `vocab-${vocab.shona.replace(/\s+/g, '-')}`,
            shona: vocab.shona,
            english: vocab.english,
            audioFile: vocab.audioFile,
            usage: vocab.usage,
            example: vocab.example,
            category: lessonData.category,
            difficulty: lessonData.level,
            lessonId: lessonData.id
          });
        }
      }
    }

    // Note: Vocabulary table doesn't exist in the current schema, 
    // so we'll store this info in the lesson content for now
    console.log(`  ✓ Vocabulary entries prepared: ${vocabularyEntries.length}`);

    // Create cultural context entries (store as JSON for now)
    console.log('🏛️ Preparing cultural context...');
    const culturalContextPath = path.join(__dirname, '..', 'content', 'cultural_context_processed.json');
    fs.writeFileSync(culturalContextPath, JSON.stringify(culturalNotes, null, 2));
    console.log('✅ Cultural context prepared');

    // Create audio manifest processing
    console.log('🎵 Processing audio manifest...');
    const audioManifestPath = path.join(__dirname, '..', 'content', 'audio_manifest_processed.json');
    fs.writeFileSync(audioManifestPath, JSON.stringify(audioManifest, null, 2));
    console.log('✅ Audio manifest processed');

    // Create lesson progress tracking data
    console.log('📊 Setting up lesson progression...');
    const lessonProgression = {
      beginner: lessonsData.lessons.filter(l => l.level === 'beginner').map(l => l.id),
      intermediate: lessonsData.lessons.filter(l => l.level === 'intermediate').map(l => l.id),
      advanced: lessonsData.lessons.filter(l => l.level === 'advanced').map(l => l.id),
      questProgression: {
        'quest-1': ['lesson-1', 'lesson-2'],
        'quest-2': ['lesson-3', 'lesson-4'],
        'quest-3': ['lesson-2', 'lesson-5'],
        'quest-4': ['lesson-6', 'lesson-7', 'lesson-8']
      }
    };

    const progressionPath = path.join(__dirname, '..', 'content', 'lesson_progression.json');
    fs.writeFileSync(progressionPath, JSON.stringify(lessonProgression, null, 2));
    console.log('✅ Lesson progression configured');

    console.log('🎉 Lesson content seeding completed successfully!');
    console.log(`
📊 Summary:
- Quests: ${questsToCreate.length}
- Lessons: ${lessonsData.lessons.length}
- Exercises: ${exercisesData.exercises.length}
- Vocabulary entries: ${vocabularyEntries.length}
- Audio files: ${audioManifest.audioManifest.totalFiles}
- Cultural notes: ${Object.keys(culturalNotes.culturalNotes).length}
    `);

  } catch (error) {
    console.error('❌ Error seeding lesson content:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to create a test user and progress
async function createTestUser() {
  try {
    console.log('👤 Creating test user...');
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test@shonalearn.com' },
      update: {},
      create: {
        email: 'test@shonalearn.com',
        password: 'test123', // In production, this should be hashed
        name: 'Test Learner',
        xp: 0,
        streak: 0,
        level: 1,
        hearts: 5,
      },
    });

    // Create intrinsic motivation tracking
    await prisma.intrinsicMotivation.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        autonomy: 5,
        competence: 5,
        relatedness: 5,
      },
    });

    // Create some sample progress
    const firstLesson = await prisma.lesson.findFirst({
      where: { orderIndex: 1 },
    });

    if (firstLesson) {
      await prisma.userProgress.upsert({
        where: {
          userId_lessonId: {
            userId: testUser.id,
            lessonId: firstLesson.id,
          },
        },
        update: {},
        create: {
          userId: testUser.id,
          lessonId: firstLesson.id,
          completed: false,
          score: 0,
          intrinsicSatisfaction: 8,
        },
      });
    }

    console.log('✅ Test user created successfully');
    return testUser;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await seedLessonContent();
    await createTestUser();
    console.log('🚀 All seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedLessonContent, createTestUser };