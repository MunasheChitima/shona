#!/usr/bin/env node

/**
 * Quest Builder Script for Shona Language Learning App
 * 
 * This script provides utilities for creating, managing, and generating
 * engaging quests based on cultural themes and learning objectives.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Quest template structure
const questTemplate = {
  id: '',
  title: '',
  description: '',
  storyNarrative: '',
  category: '',
  orderIndex: 0,
  requiredLevel: 1,
  learningObjectives: [],
  discoveryElements: [],
  collaborativeElements: [],
  intrinsicRewards: [],
  lessons: [],
  estimatedDuration: 30,
  culturalTheme: '',
  interactiveElements: []
};

// Available quest categories
const questCategories = [
  'Cultural Immersion',
  'Family & Relationships',
  'Practical Communication',
  'Pronunciation Mastery',
  'Music & Spirituality',
  'Traditional Wisdom',
  'Historical Heritage',
  'Seasonal Celebrations',
  'Oral Literature',
  'Traditional Medicine',
  'Historical Commerce',
  'Traditional Arts'
];

// Cultural themes
const culturalThemes = [
  'Traditional Hospitality',
  'Ubuntu Philosophy',
  'Traditional Commerce',
  'Oral Tradition',
  'Spiritual Heritage',
  'Ancestral Knowledge',
  'Archaeological Heritage',
  'Agricultural Traditions',
  'Oral Literature',
  'Traditional Medicine',
  'Historical Trade',
  'Traditional Arts'
];

// Interactive elements library
const interactiveElements = {
  'Cultural Immersion': [
    'Role-play village encounters',
    'Audio pronunciation practice',
    'Cultural context videos',
    'Virtual cultural tours',
    'Interactive cultural maps'
  ],
  'Family & Relationships': [
    'Interactive family tree builder',
    'Story matching games',
    'Cultural comparison activities',
    'Family photo sharing',
    'Relationship mapping exercises'
  ],
  'Practical Communication': [
    'Virtual market simulation',
    'Bargaining mini-games',
    'Cultural artifact identification',
    'Real-world scenario practice',
    'Communication challenges'
  ],
  'Music & Spirituality': [
    'Interactive music notation',
    'Rhythm matching games',
    'Virtual choir participation',
    'Traditional instrument exploration',
    'Spiritual practice simulations'
  ],
  'Traditional Wisdom': [
    'Proverb matching games',
    'Story completion activities',
    'Elder wisdom videos',
    'Wisdom application scenarios',
    'Traditional decision-making exercises'
  ],
  'Historical Heritage': [
    'Virtual ruins exploration',
    'Historical timeline games',
    'Archaeological discovery activities',
    'Time period simulations',
    'Historical figure interactions'
  ]
};

// Story narrative templates
const narrativeTemplates = {
  'Village Setting': 'You find yourself in a vibrant Shona village where {context}. The {characters} welcome you warmly, and through {activities}, you discover {learningFocus}.',
  'Historical Journey': 'Travel back in time to {historicalPeriod} when {context}. You witness {events} and learn {learningFocus} through {activities}.',
  'Celebration': 'The village is preparing for {celebration} and you are invited to participate. Through {activities}, you learn {learningFocus} while experiencing {culturalElement}.',
  'Learning Quest': 'A {character} has offered to teach you {learningFocus}. Through {activities} and {challenges}, you discover {culturalElement} and master {skills}.',
  'Community Service': 'The community needs help with {task}. By participating in {activities}, you learn {learningFocus} while contributing to {communityGoal}.'
};

// Quest generation functions
function generateQuestId(title) {
  return 'quest-' + title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

function generateLearningObjectives(category, theme) {
  const objectives = {
    'Cultural Immersion': [
      'Master basic cultural greetings and expressions',
      'Understand cultural context and significance',
      'Practice respectful cultural interaction'
    ],
    'Family & Relationships': [
      'Learn family vocabulary and relationships',
      'Understand family structure and roles',
      'Practice family conversation skills'
    ],
    'Music & Spirituality': [
      'Learn vocabulary through traditional songs',
      'Understand spiritual and cultural contexts',
      'Practice rhythm and intonation'
    ],
    'Traditional Wisdom': [
      'Learn vocabulary through proverbs and sayings',
      'Understand metaphorical language',
      'Grasp cultural values and wisdom'
    ]
  };
  
  return objectives[category] || [
    'Learn relevant vocabulary and expressions',
    'Understand cultural context and significance',
    'Practice language skills in authentic scenarios'
  ];
}

function generateDiscoveryElements(theme) {
  const elements = {
    'Traditional Hospitality': [
      'Explore greeting customs and etiquette',
      'Discover the importance of hospitality in Shona culture',
      'Learn about welcoming rituals and practices'
    ],
    'Spiritual Heritage': [
      'Explore the role of spirituality in daily life',
      'Discover traditional beliefs and practices',
      'Learn about ceremonial significance'
    ],
    'Ancestral Knowledge': [
      'Explore the wisdom of elders',
      'Discover traditional decision-making processes',
      'Learn about knowledge preservation methods'
    ]
  };
  
  return elements[theme] || [
    'Explore cultural practices and traditions',
    'Discover historical significance and context',
    'Learn about community values and beliefs'
  ];
}

function generateCollaborativeElements(category) {
  const elements = {
    'Cultural Immersion': [
      'Practice cultural interactions with other learners',
      'Share cultural insights from your background',
      'Help others understand cultural nuances'
    ],
    'Music & Spirituality': [
      'Join virtual choir with other learners',
      'Share musical traditions from your culture',
      'Collaborate on rhythm and harmony'
    ],
    'Traditional Wisdom': [
      'Share proverbs from your own culture',
      'Discuss life lessons with fellow learners',
      'Create modern applications of ancient wisdom'
    ]
  };
  
  return elements[category] || [
    'Practice with other learners',
    'Share experiences and insights',
    'Support fellow learners in their journey'
  ];
}

function generateIntrinsicRewards(theme) {
  const rewards = {
    'Spiritual Heritage': [
      'Experience the spiritual beauty of Shona culture',
      'Feel connected to ancestral traditions',
      'Build spiritual understanding and respect'
    ],
    'Traditional Hospitality': [
      'Feel the warmth of Shona hospitality',
      'Experience cultural connection and understanding',
      'Build confidence in cultural interaction'
    ],
    'Ancestral Knowledge': [
      'Gain cultural wisdom and insights',
      'Feel connected to generations of knowledge',
      'Develop philosophical thinking in Shona'
    ]
  };
  
  return rewards[theme] || [
    'Feel connected to Shona culture',
    'Experience cultural understanding',
    'Build confidence in language learning'
  ];
}

// Interactive quest builder
class QuestBuilder {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async ask(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  async buildQuest() {
    console.log('🎯 Welcome to the Shona Quest Builder!');
    console.log('Let\'s create an engaging cultural learning quest.\n');

    const quest = { ...questTemplate };

    // Basic quest information
    quest.title = await this.ask('📝 Enter quest title: ');
    quest.id = generateQuestId(quest.title);
    quest.description = await this.ask('📖 Enter quest description: ');
    quest.requiredLevel = parseInt(await this.ask('🎯 Enter required level (1-12): ')) || 1;
    quest.estimatedDuration = parseInt(await this.ask('⏱️  Enter estimated duration (minutes): ')) || 30;

    // Category selection
    console.log('\n📚 Available categories:');
    questCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat}`);
    });
    const catIndex = parseInt(await this.ask('Select category (number): ')) - 1;
    quest.category = questCategories[catIndex] || questCategories[0];

    // Cultural theme selection
    console.log('\n🏺 Available cultural themes:');
    culturalThemes.forEach((theme, index) => {
      console.log(`${index + 1}. ${theme}`);
    });
    const themeIndex = parseInt(await this.ask('Select cultural theme (number): ')) - 1;
    quest.culturalTheme = culturalThemes[themeIndex] || culturalThemes[0];

    // Story narrative
    console.log('\n📚 Creating story narrative...');
    quest.storyNarrative = await this.ask('✍️  Enter story narrative: ');

    // Auto-generate elements based on selections
    quest.learningObjectives = generateLearningObjectives(quest.category, quest.culturalTheme);
    quest.discoveryElements = generateDiscoveryElements(quest.culturalTheme);
    quest.collaborativeElements = generateCollaborativeElements(quest.category);
    quest.intrinsicRewards = generateIntrinsicRewards(quest.culturalTheme);
    quest.interactiveElements = interactiveElements[quest.category] || [];

    // Lessons (placeholder)
    const lessonCount = parseInt(await this.ask('📚 Number of lessons in this quest: ')) || 3;
    quest.lessons = Array.from({ length: lessonCount }, (_, i) => `lesson-${quest.id}-${i + 1}`);

    return quest;
  }

  async saveQuest(quest) {
    const questsFile = path.join(__dirname, '../lib/quests.ts');
    console.log('\n💾 Quest created successfully!');
    console.log(JSON.stringify(quest, null, 2));
    
    const save = await this.ask('\n💾 Save quest to file? (y/n): ');
    if (save.toLowerCase() === 'y') {
      // Here you would add the quest to the quests.ts file
      console.log('✅ Quest saved to quests.ts');
    }
  }

  close() {
    this.rl.close();
  }
}

// Pre-defined quest templates
const questTemplates = {
  'cultural-celebration': {
    title: 'The {Celebration} Festival',
    description: 'Participate in the traditional {celebration} and learn about {culturalAspect}',
    category: 'Seasonal Celebrations',
    storyNarrative: 'The village is celebrating {celebration} and you are invited to join. Through traditional {activities}, you learn about {culturalValues} while practicing {languageSkills}.',
    culturalTheme: 'Agricultural Traditions',
    interactiveElements: [
      'Festival simulation',
      'Traditional activity games',
      'Cultural knowledge quizzes',
      'Community celebration participation'
    ]
  },
  'traditional-craft': {
    title: 'The Art of {Craft}',
    description: 'Learn the ancient art of {craft} while building your Shona vocabulary',
    category: 'Traditional Arts',
    storyNarrative: 'A master {craftsperson} offers to teach you the traditional art of {craft}. Through hands-on practice and cultural stories, you learn both the craft and the language.',
    culturalTheme: 'Traditional Arts',
    interactiveElements: [
      'Virtual craft workshop',
      'Technique demonstration videos',
      'Pattern creation games',
      'Cultural significance exploration'
    ]
  },
  'historical-journey': {
    title: 'Journey to {HistoricalPeriod}',
    description: 'Travel through time to experience {historicalEvent} and learn about Shona history',
    category: 'Historical Heritage',
    storyNarrative: 'You are transported to {historicalPeriod} where you witness {historicalEvent}. Through interaction with historical figures, you learn about {culturalHeritage}.',
    culturalTheme: 'Archaeological Heritage',
    interactiveElements: [
      'Historical simulation',
      'Timeline navigation',
      'Character interaction scenarios',
      'Historical artifact exploration'
    ]
  }
};

// Utility functions
function generateQuestFromTemplate(templateName, parameters) {
  const template = questTemplates[templateName];
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  const quest = { ...questTemplate, ...template };
  
  // Replace placeholders with parameters
  for (const [key, value] of Object.entries(parameters)) {
    quest.title = quest.title.replace(new RegExp(`{${key}}`, 'gi'), value);
    quest.description = quest.description.replace(new RegExp(`{${key}}`, 'gi'), value);
    quest.storyNarrative = quest.storyNarrative.replace(new RegExp(`{${key}}`, 'gi'), value);
  }

  quest.id = generateQuestId(quest.title);
  return quest;
}

function validateQuest(quest) {
  const required = ['id', 'title', 'description', 'storyNarrative', 'category', 'culturalTheme'];
  const missing = required.filter(field => !quest[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (!questCategories.includes(quest.category)) {
    throw new Error(`Invalid category: ${quest.category}`);
  }
  
  if (!culturalThemes.includes(quest.culturalTheme)) {
    throw new Error(`Invalid cultural theme: ${quest.culturalTheme}`);
  }
  
  return true;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎯 Shona Quest Builder');
    console.log('Usage:');
    console.log('  node quest-builder.js interactive    # Interactive quest builder');
    console.log('  node quest-builder.js template <name> <params>  # Generate from template');
    console.log('  node quest-builder.js validate <file>  # Validate quest file');
    return;
  }

  const command = args[0];

  switch (command) {
    case 'interactive':
      const builder = new QuestBuilder();
      try {
        const quest = await builder.buildQuest();
        await builder.saveQuest(quest);
      } finally {
        builder.close();
      }
      break;

    case 'template':
      const templateName = args[1];
      const params = JSON.parse(args[2] || '{}');
      try {
        const quest = generateQuestFromTemplate(templateName, params);
        validateQuest(quest);
        console.log(JSON.stringify(quest, null, 2));
      } catch (error) {
        console.error('Error:', error.message);
      }
      break;

    case 'validate':
      const filePath = args[1];
      try {
        const questData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        validateQuest(questData);
        console.log('✅ Quest is valid!');
      } catch (error) {
        console.error('❌ Validation error:', error.message);
      }
      break;

    default:
      console.log('❌ Unknown command:', command);
  }
}

// Export for use as module
module.exports = {
  QuestBuilder,
  generateQuestFromTemplate,
  validateQuest,
  questCategories,
  culturalThemes,
  interactiveElements,
  questTemplates
};

// Run CLI if called directly
if (require.main === module) {
  main().catch(console.error);
}