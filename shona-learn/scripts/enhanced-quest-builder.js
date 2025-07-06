#!/usr/bin/env node

/**
 * Enhanced Quest Builder for Shona Language Learning
 * Generates dynamic, seasonal, and adaptive quests
 */

const fs = require('fs');
const path = require('path');

class EnhancedQuestBuilder {
  constructor() {
    this.questTemplates = {
      seasonal: this.getSeasonalTemplates(),
      special_events: this.getSpecialEventTemplates(),
      adaptive: this.getAdaptiveTemplates(),
      community: this.getCommunityTemplates()
    };
  }

  getSeasonalTemplates() {
    return {
      spring: {
        theme: "New Beginnings",
        activities: ["planting", "renewal", "growth"],
        vocabulary_focus: ["plants", "farming", "weather"],
        cultural_elements: ["harvest preparation", "seasonal ceremonies"]
      },
      summer: {
        theme: "Abundance",
        activities: ["festivals", "community gatherings", "outdoor activities"],
        vocabulary_focus: ["celebrations", "food", "social interactions"],
        cultural_elements: ["harvest festivals", "traditional dances"]
      },
      autumn: {
        theme: "Harvest and Gratitude",
        activities: ["harvesting", "preservation", "thanksgiving"],
        vocabulary_focus: ["crops", "gratitude", "preservation"],
        cultural_elements: ["thanksgiving ceremonies", "food storage"]
      },
      winter: {
        theme: "Stories and Reflection",
        activities: ["storytelling", "crafts", "indoor activities"],
        vocabulary_focus: ["stories", "wisdom", "family time"],
        cultural_elements: ["oral traditions", "winter crafts"]
      }
    };
  }

  getSpecialEventTemplates() {
    return {
      independence_day: {
        title: "Heroes of Zimbabwe",
        theme: "Learning about Zimbabwean independence and heroes",
        activities: ["history lessons", "hero stories", "patriotic songs"],
        vocabulary_focus: ["history", "heroes", "independence"],
        duration: "3 days"
      },
      cultural_heritage: {
        title: "Preserving Our Heritage",
        theme: "Exploring and preserving Shona cultural traditions",
        activities: ["cultural practices", "traditional arts", "elder interviews"],
        vocabulary_focus: ["traditions", "customs", "heritage"],
        duration: "1 week"
      },
      international_womens_day: {
        title: "Celebrating Shona Women",
        theme: "Honoring the role of women in Shona culture",
        activities: ["women's stories", "traditional roles", "modern achievements"],
        vocabulary_focus: ["women", "family", "achievements"],
        duration: "2 days"
      },
      youth_day: {
        title: "Future Keepers",
        theme: "Young people preserving and modernizing culture",
        activities: ["youth perspectives", "modern adaptations", "future planning"],
        vocabulary_focus: ["youth", "future", "change"],
        duration: "2 days"
      }
    };
  }

  getAdaptiveTemplates() {
    return {
      beginner_boost: {
        title: "Confidence Builder",
        description: "Extra practice for beginners who need more support",
        adaptive_triggers: ["low_confidence", "repeated_mistakes", "slow_progress"],
        activities: ["simplified_exercises", "extra_practice", "positive_reinforcement"]
      },
      advanced_challenge: {
        title: "Master's Challenge",
        description: "Advanced activities for quick learners",
        adaptive_triggers: ["high_performance", "quick_completion", "seeking_challenge"],
        activities: ["complex_scenarios", "creative_tasks", "leadership_roles"]
      },
      cultural_deep_dive: {
        title: "Cultural Explorer",
        description: "Extended cultural learning for interested learners",
        adaptive_triggers: ["high_cultural_interest", "asking_questions", "sharing_insights"],
        activities: ["deep_cultural_study", "research_projects", "cultural_comparison"]
      }
    };
  }

  getCommunityTemplates() {
    return {
      learning_circle: {
        title: "Learning Circle",
        description: "Small group collaborative learning",
        activities: ["peer_teaching", "group_projects", "collaborative_storytelling"],
        group_size: "3-5 people"
      },
      cultural_exchange: {
        title: "Cultural Exchange",
        description: "Share cultures with learners from different backgrounds",
        activities: ["culture_sharing", "language_exchange", "tradition_comparison"],
        group_size: "6-10 people"
      },
      community_service: {
        title: "Community Service",
        description: "Use Shona skills to help others",
        activities: ["teaching_others", "translation_help", "cultural_preservation"],
        group_size: "unlimited"
      }
    };
  }

  generateSeasonalQuest(season, userLevel) {
    const template = this.questTemplates.seasonal[season];
    const questId = `seasonal-${season}-${Date.now()}`;
    
    return {
      id: questId,
      title: `${template.theme} - ${season.charAt(0).toUpperCase() + season.slice(1)} Quest`,
      description: `Explore Shona culture through the lens of ${season}`,
      storyNarrative: this.generateSeasonalNarrative(season, template),
      category: "Seasonal Adventure",
      orderIndex: 100 + userLevel,
      requiredLevel: Math.max(1, userLevel - 1),
      duration: "2 weeks",
      isTimeLimit: true,
      expiryDate: this.getSeasonEndDate(season),
      learningObjectives: this.generateSeasonalObjectives(template),
      discoveryElements: this.generateSeasonalDiscovery(template),
      collaborativeElements: this.generateSeasonalCollaboration(template),
      intrinsicRewards: this.generateSeasonalRewards(template),
      activities: this.generateSeasonalActivities(template, userLevel),
      lessons: this.generateSeasonalLessons(template, userLevel)
    };
  }

  generateSpecialEventQuest(eventType, userLevel) {
    const template = this.questTemplates.special_events[eventType];
    const questId = `event-${eventType}-${Date.now()}`;
    
    return {
      id: questId,
      title: template.title,
      description: template.theme,
      storyNarrative: this.generateEventNarrative(eventType, template),
      category: "Special Event",
      orderIndex: 200 + userLevel,
      requiredLevel: Math.max(1, userLevel - 1),
      duration: template.duration,
      isTimeLimit: true,
      expiryDate: this.getEventEndDate(eventType),
      learningObjectives: this.generateEventObjectives(template),
      discoveryElements: this.generateEventDiscovery(template),
      collaborativeElements: this.generateEventCollaboration(template),
      intrinsicRewards: this.generateEventRewards(template),
      activities: this.generateEventActivities(template, userLevel),
      lessons: this.generateEventLessons(template, userLevel),
      specialRewards: this.generateEventSpecialRewards(eventType)
    };
  }

  generateAdaptiveQuest(adaptiveType, userProfile) {
    const template = this.questTemplates.adaptive[adaptiveType];
    const questId = `adaptive-${adaptiveType}-${Date.now()}`;
    
    return {
      id: questId,
      title: template.title,
      description: template.description,
      storyNarrative: this.generateAdaptiveNarrative(adaptiveType, userProfile),
      category: "Adaptive Learning",
      orderIndex: 300 + userProfile.level,
      requiredLevel: userProfile.level,
      duration: "flexible",
      isAdaptive: true,
      adaptiveTriggers: template.adaptive_triggers,
      learningObjectives: this.generateAdaptiveObjectives(template, userProfile),
      discoveryElements: this.generateAdaptiveDiscovery(template, userProfile),
      collaborativeElements: this.generateAdaptiveCollaboration(template, userProfile),
      intrinsicRewards: this.generateAdaptiveRewards(template, userProfile),
      activities: this.generateAdaptiveActivities(template, userProfile),
      lessons: this.generateAdaptiveLessons(template, userProfile)
    };
  }

  generateCommunityQuest(communityType, participants) {
    const template = this.questTemplates.community[communityType];
    const questId = `community-${communityType}-${Date.now()}`;
    
    return {
      id: questId,
      title: template.title,
      description: template.description,
      storyNarrative: this.generateCommunityNarrative(communityType, participants),
      category: "Community Learning",
      orderIndex: 400,
      requiredLevel: 1,
      duration: "ongoing",
      isCommunity: true,
      maxParticipants: template.group_size,
      currentParticipants: participants.length,
      learningObjectives: this.generateCommunityObjectives(template, participants),
      discoveryElements: this.generateCommunityDiscovery(template, participants),
      collaborativeElements: this.generateCommunityCollaboration(template, participants),
      intrinsicRewards: this.generateCommunityRewards(template, participants),
      activities: this.generateCommunityActivities(template, participants),
      lessons: this.generateCommunityLessons(template, participants)
    };
  }

  // Narrative generation methods
  generateSeasonalNarrative(season, template) {
    const narratives = {
      spring: "The rains have come, and the village is preparing for planting season. You'll join the community as they prepare the fields, select seeds, and celebrate the renewal of life. Through this journey, you'll learn about the cycle of seasons and the wisdom of working with nature.",
      summer: "The village is alive with abundance! The crops are growing strong, and the community is preparing for the harvest festival. You'll experience the joy of plenty and learn about sharing, celebration, and gratitude in Shona culture.",
      autumn: "Harvest time has arrived! The village is busy gathering crops, preserving food, and giving thanks for the year's bounty. You'll participate in the harvest activities and learn about the importance of preparation and gratitude.",
      winter: "The harvest is complete, and the village settles into the quiet season. This is the time for storytelling, crafts, and reflection. You'll gather around the fire with the elders and learn the deep wisdom passed down through generations."
    };
    return narratives[season] || "A seasonal journey awaits you in the village.";
  }

  generateEventNarrative(eventType, template) {
    const narratives = {
      independence_day: "The village is preparing to celebrate Zimbabwe's independence. You'll learn about the heroes who fought for freedom and the journey to independence. Through their stories, you'll understand the courage and sacrifice that built modern Zimbabwe.",
      cultural_heritage: "The village elders are worried that young people are forgetting their traditions. You'll help organize a cultural heritage festival to preserve and share the rich traditions of the Shona people.",
      international_womens_day: "The village is celebrating the strength and wisdom of Shona women. You'll learn about the crucial role women play in families, communities, and society, from traditional times to today.",
      youth_day: "The young people of the village are organizing to show how they're preserving culture while embracing the future. You'll join them in exploring how to honor the past while building tomorrow."
    };
    return narratives[eventType] || "A special event is taking place in the village.";
  }

  generateAdaptiveNarrative(adaptiveType, userProfile) {
    const narratives = {
      beginner_boost: `The village teacher has noticed you need extra support and has created a special learning path just for you. With patience and encouragement, you'll build your confidence step by step.`,
      advanced_challenge: `The village elders have recognized your exceptional progress and invite you to take on advanced challenges. You'll explore complex aspects of Shona culture and language.`,
      cultural_deep_dive: `Your curiosity about Shona culture has impressed the village storytellers. They invite you on a deep exploration of cultural traditions, beliefs, and practices.`
    };
    return narratives[adaptiveType] || "A personalized learning journey awaits you.";
  }

  generateCommunityNarrative(communityType, participants) {
    const narratives = {
      learning_circle: `You've joined a small learning circle with other dedicated students. Together, you'll support each other's learning and share your unique perspectives on Shona culture.`,
      cultural_exchange: `Learners from different cultural backgrounds have come together to share their traditions and learn from each other. You'll explore how different cultures compare and connect.`,
      community_service: `The village needs your help! You'll use your growing Shona skills to assist others in the community, whether through teaching, translation, or cultural preservation projects.`
    };
    return narratives[communityType] || "A community learning adventure begins.";
  }

  // Objective generation methods
  generateSeasonalObjectives(template) {
    return [
      `Learn ${template.vocabulary_focus.join(", ")} vocabulary`,
      `Understand seasonal ${template.activities.join(" and ")}`,
      `Participate in ${template.cultural_elements.join(" and ")}`,
      "Connect language learning with natural cycles"
    ];
  }

  generateEventObjectives(template) {
    return [
      `Learn ${template.vocabulary_focus.join(", ")} vocabulary`,
      `Understand the significance of ${template.theme}`,
      `Participate in ${template.activities.join(", ")}`,
      "Connect language with cultural celebration"
    ];
  }

  generateAdaptiveObjectives(template, userProfile) {
    const baseObjectives = [
      "Strengthen areas of difficulty",
      "Build confidence through appropriate challenges",
      "Develop personalized learning strategies"
    ];
    
    if (template.adaptive_triggers.includes("high_performance")) {
      baseObjectives.push("Explore advanced language concepts");
    }
    
    return baseObjectives;
  }

  generateCommunityObjectives(template, participants) {
    return [
      "Collaborate effectively with other learners",
      "Share and learn from diverse perspectives",
      "Support community learning goals",
      "Develop leadership and teaching skills"
    ];
  }

  // Activity generation methods
  generateSeasonalActivities(template, userLevel) {
    const activities = [];
    
    template.activities.forEach(activity => {
      activities.push({
        type: activity,
        title: this.capitalizeFirst(activity.replace("_", " ")),
        description: `Participate in seasonal ${activity}`,
        difficulty: this.getDifficultyForLevel(userLevel),
        estimatedTime: "15-30 minutes"
      });
    });
    
    return activities;
  }

  generateEventActivities(template, userLevel) {
    const activities = [];
    
    template.activities.forEach(activity => {
      activities.push({
        type: activity,
        title: this.capitalizeFirst(activity.replace("_", " ")),
        description: `Engage in ${activity} for the special event`,
        difficulty: this.getDifficultyForLevel(userLevel),
        estimatedTime: "20-40 minutes"
      });
    });
    
    return activities;
  }

  // Utility methods
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getDifficultyForLevel(level) {
    if (level <= 3) return "beginner";
    if (level <= 6) return "intermediate";
    return "advanced";
  }

  getSeasonEndDate(season) {
    const now = new Date();
    const year = now.getFullYear();
    const seasonEndDates = {
      spring: new Date(year, 8, 21), // September 21
      summer: new Date(year, 11, 21), // December 21
      autumn: new Date(year, 2, 21), // March 21
      winter: new Date(year, 5, 21) // June 21
    };
    return seasonEndDates[season];
  }

  getEventEndDate(eventType) {
    const now = new Date();
    const eventEndDates = {
      independence_day: new Date(now.getFullYear(), 3, 20), // April 20
      cultural_heritage: new Date(now.getFullYear(), 4, 31), // May 31
      international_womens_day: new Date(now.getFullYear(), 2, 10), // March 10
      youth_day: new Date(now.getFullYear(), 7, 15) // August 15
    };
    return eventEndDates[eventType];
  }

  // Main generation method
  generateQuest(type, options = {}) {
    switch (type) {
      case 'seasonal':
        return this.generateSeasonalQuest(options.season, options.userLevel);
      case 'special_event':
        return this.generateSpecialEventQuest(options.eventType, options.userLevel);
      case 'adaptive':
        return this.generateAdaptiveQuest(options.adaptiveType, options.userProfile);
      case 'community':
        return this.generateCommunityQuest(options.communityType, options.participants);
      default:
        throw new Error(`Unknown quest type: ${type}`);
    }
  }

  // Save quest to file
  saveQuest(quest, filename) {
    const questsDir = path.join(__dirname, '../content/quests');
    if (!fs.existsSync(questsDir)) {
      fs.mkdirSync(questsDir, { recursive: true });
    }
    
    const filepath = path.join(questsDir, `${filename}.json`);
    fs.writeFileSync(filepath, JSON.stringify(quest, null, 2));
    console.log(`Quest saved to ${filepath}`);
  }

  // Generate multiple quests
  generateMultipleQuests(configurations) {
    const quests = [];
    
    configurations.forEach(config => {
      try {
        const quest = this.generateQuest(config.type, config.options);
        quests.push(quest);
        
        if (config.save) {
          this.saveQuest(quest, config.filename || quest.id);
        }
      } catch (error) {
        console.error(`Error generating quest: ${error.message}`);
      }
    });
    
    return quests;
  }

  // Default generation methods for missing implementations
  generateSeasonalDiscovery(template) {
    return template.cultural_elements.map(element => `Explore ${element}`);
  }

  generateSeasonalCollaboration(template) {
    return ["Share seasonal experiences", "Work together on seasonal activities", "Learn from community members"];
  }

  generateSeasonalRewards(template) {
    return ["Experience the rhythm of natural cycles", "Feel connected to the land", "Appreciate seasonal wisdom"];
  }

  generateSeasonalLessons(template, userLevel) {
    return [`seasonal-${template.theme.toLowerCase().replace(/\s+/g, '-')}-${userLevel}`];
  }

  generateEventObjectives(template) {
    return [
      `Learn about ${template.theme}`,
      `Understand historical significance`,
      `Participate in cultural celebration`
    ];
  }

  generateEventDiscovery(template) {
    return [`Explore ${template.theme}`, "Discover cultural significance", "Learn about historical context"];
  }

  generateEventCollaboration(template) {
    return ["Share cultural celebrations", "Learn from different perspectives", "Participate in community events"];
  }

  generateEventRewards(template) {
    return ["Feel pride in cultural heritage", "Experience community celebration", "Gain historical understanding"];
  }

  generateEventActivities(template, userLevel) {
    return template.activities.map(activity => ({
      type: activity,
      title: this.capitalizeFirst(activity.replace("_", " ")),
      difficulty: this.getDifficultyForLevel(userLevel)
    }));
  }

  generateEventLessons(template, userLevel) {
    return [`event-${template.title.toLowerCase().replace(/\s+/g, '-')}-${userLevel}`];
  }

  generateEventSpecialRewards(eventType) {
    return {
      badge: `${eventType}_celebrant`,
      title: `${this.capitalizeFirst(eventType.replace("_", " "))} Celebrant`,
      description: `Participated in the ${eventType} special event`
    };
  }

  // Add missing methods for other quest types
  generateAdaptiveDiscovery(template, userProfile) {
    return ["Discover your learning style", "Explore personalized content", "Find your learning strengths"];
  }

  generateAdaptiveCollaboration(template, userProfile) {
    return ["Share learning strategies", "Help others with similar challenges", "Learn from peer feedback"];
  }

  generateAdaptiveRewards(template, userProfile) {
    return ["Feel confident in your abilities", "Experience personalized growth", "Appreciate your unique learning journey"];
  }

  generateAdaptiveActivities(template, userProfile) {
    return template.activities.map(activity => ({
      type: activity,
      title: this.capitalizeFirst(activity.replace("_", " ")),
      difficulty: this.getDifficultyForLevel(userProfile.level)
    }));
  }

  generateAdaptiveLessons(template, userProfile) {
    return [`adaptive-${template.title.toLowerCase().replace(/\s+/g, '-')}-${userProfile.level}`];
  }

  generateCommunityObjectives(template, participants) {
    return [
      "Collaborate with other learners",
      "Share cultural insights",
      "Support community learning goals"
    ];
  }

  generateCommunityDiscovery(template, participants) {
    return ["Discover diverse perspectives", "Explore collaborative learning", "Learn from community wisdom"];
  }

  generateCommunityCollaboration(template, participants) {
    return ["Work together on projects", "Share knowledge and skills", "Support each other's learning"];
  }

  generateCommunityRewards(template, participants) {
    return ["Feel part of a learning community", "Experience collaborative success", "Build lasting friendships"];
  }

  generateCommunityActivities(template, participants) {
    return template.activities.map(activity => ({
      type: activity,
      title: this.capitalizeFirst(activity.replace("_", " ")),
      participants: participants.length
    }));
  }

  generateCommunityLessons(template, participants) {
    return [`community-${template.title.toLowerCase().replace(/\s+/g, '-')}`];
  }
}

// CLI Interface
if (require.main === module) {
  const builder = new EnhancedQuestBuilder();
  
  // Example usage
  const exampleConfigurations = [
    {
      type: 'seasonal',
      options: { season: 'spring', userLevel: 3 },
      save: true,
      filename: 'spring-renewal-quest'
    },
    {
      type: 'special_event',
      options: { eventType: 'independence_day', userLevel: 5 },
      save: true,
      filename: 'independence-heroes-quest'
    },
    {
      type: 'adaptive',
      options: { 
        adaptiveType: 'beginner_boost', 
        userProfile: { level: 2, confidence: 3, interests: ['culture', 'stories'] }
      },
      save: true,
      filename: 'confidence-builder-quest'
    }
  ];
  
  console.log('Generating enhanced quests...');
  const generatedQuests = builder.generateMultipleQuests(exampleConfigurations);
  
  console.log(`\nGenerated ${generatedQuests.length} quests:`);
  generatedQuests.forEach(quest => {
    console.log(`- ${quest.title} (${quest.category})`);
  });
}

module.exports = EnhancedQuestBuilder;