// Gamification Configuration
export const gamificationConfig = {
  "achievements": {
    "first_lesson": {
      "id": "first_lesson",
      "title": "First Steps",
      "description": "Complete your first lesson",
      "icon": "🎯",
      "xpReward": 10
    },
    "lesson_streak_3": {
      "id": "lesson_streak_3",
      "title": "Learning Streak",
      "description": "Complete 3 lessons in a row",
      "icon": "🔥",
      "xpReward": 25
    },
    "lesson_streak_7": {
      "id": "lesson_streak_7",
      "title": "Week Warrior",
      "description": "Complete 7 lessons in a row",
      "icon": "⚡",
      "xpReward": 50
    },
    "lesson_streak_30": {
      "id": "lesson_streak_30",
      "title": "Monthly Master",
      "description": "Complete 30 lessons in a row",
      "icon": "👑",
      "xpReward": 100
    },
    "vocabulary_master": {
      "id": "vocabulary_master",
      "title": "Vocabulary Master",
      "description": "Learn 100 vocabulary words",
      "icon": "📚",
      "xpReward": 75
    },
    "cultural_explorer": {
      "id": "cultural_explorer",
      "title": "Cultural Explorer",
      "description": "Complete 10 cultural lessons",
      "icon": "🌍",
      "xpReward": 50
    },
    "pronunciation_perfect": {
      "id": "pronunciation_perfect",
      "title": "Pronunciation Perfect",
      "description": "Get 100% on 5 pronunciation exercises",
      "icon": "🎵",
      "xpReward": 40
    },
    "speed_learner": {
      "id": "speed_learner",
      "title": "Speed Learner",
      "description": "Complete 5 lessons in one day",
      "icon": "🚀",
      "xpReward": 30
    },
    "persistent_learner": {
      "id": "persistent_learner",
      "title": "Persistent Learner",
      "description": "Learn for 7 consecutive days",
      "icon": "💪",
      "xpReward": 60
    },
    "shona_scholar": {
      "id": "shona_scholar",
      "title": "Shona Scholar",
      "description": "Complete all beginner lessons",
      "icon": "🎓",
      "xpReward": 200
    }
  },
  "challenges": {
    "daily_vocabulary": {
      "id": "daily_vocabulary",
      "title": "Daily Vocabulary Challenge",
      "description": "Learn 10 new words today",
      "icon": "📖",
      "xpReward": 20,
      "duration": "daily",
      "target": 10,
      "type": "vocabulary"
    },
    "cultural_immersion": {
      "id": "cultural_immersion",
      "title": "Cultural Immersion",
      "description": "Complete 3 cultural lessons this week",
      "icon": "🌍",
      "xpReward": 40,
      "duration": "weekly",
      "target": 3,
      "type": "cultural"
    },
    "pronunciation_practice": {
      "id": "pronunciation_practice",
      "title": "Pronunciation Practice",
      "description": "Practice pronunciation 5 times today",
      "icon": "🎵",
      "xpReward": 25,
      "duration": "daily",
      "target": 5,
      "type": "pronunciation"
    },
    "streak_builder": {
      "id": "streak_builder",
      "title": "Streak Builder",
      "description": "Maintain a 5-day learning streak",
      "icon": "🔥",
      "xpReward": 50,
      "duration": "weekly",
      "target": 5,
      "type": "streak"
    }
  },
  "levels": {
    "1": {
      "xpRequired": 0,
      "title": "Beginner",
      "color": "green"
    },
    "2": {
      "xpRequired": 100,
      "title": "Novice",
      "color": "blue"
    },
    "3": {
      "xpRequired": 250,
      "title": "Apprentice",
      "color": "purple"
    },
    "4": {
      "xpRequired": 500,
      "title": "Intermediate",
      "color": "orange"
    },
    "5": {
      "xpRequired": 1000,
      "title": "Advanced",
      "color": "red"
    },
    "6": {
      "xpRequired": 2000,
      "title": "Expert",
      "color": "violet"
    },
    "7": {
      "xpRequired": 3500,
      "title": "Master",
      "color": "gold"
    },
    "8": {
      "xpRequired": 5000,
      "title": "Grandmaster",
      "color": "diamond"
    }
  },
  "rewards": {
    "xpMultiplier": 1,
    "streakBonus": 0.1,
    "perfectScoreBonus": 0.2,
    "culturalBonus": 0.15
  }
};

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (user: any) => boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  duration: 'daily' | 'weekly' | 'monthly';
  target: number;
  type: string;
}

export interface Level {
  xpRequired: number;
  title: string;
  color: string;
}

// Achievement checking functions
export function checkAchievements(user: any): string[] {
  const earnedAchievements: string[] = [];
  
  Object.values(gamificationConfig.achievements).forEach((achievement: any) => {
    if (achievement.condition(user) && !user.achievements?.includes(achievement.id)) {
      earnedAchievements.push(achievement.id);
    }
  });
  
  return earnedAchievements;
}

// Challenge progress tracking
export function updateChallengeProgress(user: any, action: string, value: number = 1): any {
  const updatedUser = { ...user };
  
  if (!updatedUser.challenges) {
    updatedUser.challenges = {};
  }
  
  // Update daily challenges
  const today = new Date().toDateString();
  if (!updatedUser.challenges.daily) {
    updatedUser.challenges.daily = {};
  }
  
  if (!updatedUser.challenges.daily[today]) {
    updatedUser.challenges.daily[today] = {
      vocabulary: 0,
      cultural: 0,
      pronunciation: 0,
      streak: 0
    };
  }
  
  // Update based on action
  switch (action) {
    case 'vocabulary_learned':
      updatedUser.challenges.daily[today].vocabulary += value;
      break;
    case 'cultural_lesson':
      updatedUser.challenges.daily[today].cultural += value;
      break;
    case 'pronunciation_practice':
      updatedUser.challenges.daily[today].pronunciation += value;
      break;
    case 'streak_update':
      updatedUser.challenges.daily[today].streak = value;
      break;
  }
  
  return updatedUser;
}

// Calculate XP with bonuses
export function calculateXP(baseXP: number, user: any, lessonType: string = 'regular'): number {
  let totalXP = baseXP;
  
  // Streak bonus
  if (user.streak > 1) {
    totalXP += Math.floor(baseXP * gamificationConfig.rewards.streakBonus * (user.streak - 1));
  }
  
  // Cultural lesson bonus
  if (lessonType === 'cultural') {
    totalXP += Math.floor(baseXP * gamificationConfig.rewards.culturalBonus);
  }
  
  return totalXP;
}
