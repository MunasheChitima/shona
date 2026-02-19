const fs = require('fs');
const path = require('path');

function consolidateLessons() {
  console.log('🔄 Consolidating lesson files...');
  
  // Read the main lessons file
  const mainLessonsPath = path.join(__dirname, '..', 'content', 'lessons_enhanced.json');
  const mainLessons = JSON.parse(fs.readFileSync(mainLessonsPath, 'utf8'));
  
  // Create optimized structure
  const consolidatedLessons = {
    metadata: {
      version: "4.0.0",
      lastUpdated: new Date().toISOString(),
      totalLessons: mainLessons.lessons.length,
      source: "consolidated_enhanced",
      features: [
        "pronunciation_text",
        "cultural_context", 
        "enhanced_exercises",
        "audio_integration",
        "tone_patterns",
        "explanations",
        "retry_hints"
      ],
      description: "Consolidated lessons with enhanced content quality and user experience"
    },
    lessons: mainLessons.lessons.map(lesson => ({
      ...lesson,
      // Add metadata for better organization
      metadata: {
        category: lesson.category,
        level: lesson.level,
        difficulty: lesson.difficulty,
        estimatedDuration: lesson.estimatedDuration,
        xpReward: lesson.xpReward,
        vocabularyCount: lesson.vocabulary?.length || 0,
        exerciseCount: lesson.exercises?.length || 0
      },
      // Ensure all required fields are present
      vocabulary: lesson.vocabulary || [],
      exercises: lesson.exercises || [],
      culturalNotes: lesson.culturalNotes || [],
      learningObjectives: lesson.learningObjectives || [],
      discoveryElements: lesson.discoveryElements || []
    }))
  };
  
  // Save consolidated file
  const consolidatedPath = path.join(__dirname, '..', 'content', 'lessons_consolidated.json');
  fs.writeFileSync(consolidatedPath, JSON.stringify(consolidatedLessons, null, 2));
  
  // Update API to use consolidated file
  const apiPath = path.join(__dirname, '..', 'app', 'api', 'lessons', 'route.ts');
  let apiContent = fs.readFileSync(apiPath, 'utf8');
  
  // Update the file path in the API
  apiContent = apiContent.replace(
    /const lessonsPath = path\.join\(process\.cwd\(\), 'content', 'lessons_enhanced\.json'\)/,
    "const lessonsPath = path.join(process.cwd(), 'content', 'lessons_consolidated.json')"
  );
  
  fs.writeFileSync(apiPath, apiContent);
  
  // Update exercises API as well
  const exercisesApiPath = path.join(__dirname, '..', 'app', 'api', 'exercises', '[id]', 'route.ts');
  let exercisesApiContent = fs.readFileSync(exercisesApiPath, 'utf8');
  
  exercisesApiContent = exercisesApiContent.replace(
    /const lessonsPath = path\.join\(process\.cwd\(\), 'content', 'lessons_enhanced\.json'\)/,
    "const lessonsPath = path.join(process.cwd(), 'content', 'lessons_consolidated.json')"
  );
  
  fs.writeFileSync(exercisesApiPath, exercisesApiContent);
  
  console.log(`✅ Consolidated ${consolidatedLessons.lessons.length} lessons`);
  console.log('📁 Created single source of truth: lessons_consolidated.json');
  console.log('🔧 Updated API routes to use consolidated file');
  
  // Create backup of old files
  const backupDir = path.join(__dirname, '..', 'content', 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  const filesToBackup = [
    'lessons_enhanced.json',
    'lessons_harmonized.json', 
    'lessons_comprehensive.json',
    'lessons_updated_harmonized.json'
  ];
  
  filesToBackup.forEach(file => {
    const sourcePath = path.join(__dirname, '..', 'content', file);
    if (fs.existsSync(sourcePath)) {
      const backupPath = path.join(backupDir, `${file}.backup`);
      fs.copyFileSync(sourcePath, backupPath);
    }
  });
  
  console.log('💾 Created backups of original files');
  console.log('🎯 Lesson consolidation completed!');
}

consolidateLessons(); 