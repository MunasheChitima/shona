'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowUp, FaArrowDown, FaEquals, FaTrophy, FaBullseye } from 'react-icons/fa'

interface DifficultyLevel {
  level: 1 | 2 | 3 | 4 | 5
  name: string
  description: string
  requirements: string[]
  color: string
}

interface UserProgress {
  currentLevel: number
  totalAttempts: number
  successfulAttempts: number
  weakSounds: string[]
  strongSounds: string[]
  averageScore: number
  recentScores: number[]
}

interface AdaptiveDifficultySystemProps {
  userProgress: UserProgress
  onLevelChange: (newLevel: number, reason: string) => void
  onExerciseRecommendation: (exercises: Exercise[]) => void
}

interface Exercise {
  id: string
  word: string
  type: 'cv' | 'clusters' | 'tones' | 'cultural'
  difficulty: number
  focusAreas: string[]
  description: string
}

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  {
    level: 1,
    name: 'Beginner',
    description: 'Simple consonant-vowel patterns',
    requirements: ['Basic vowel sounds', 'Simple consonants'],
    color: 'from-green-400 to-green-600'
  },
  {
    level: 2,
    name: 'Elementary',
    description: 'Basic tone patterns and common words',
    requirements: ['CV patterns mastered', 'Basic tone recognition'],
    color: 'from-blue-400 to-blue-600'
  },
  {
    level: 3,
    name: 'Intermediate',
    description: 'Special sounds and complex patterns',
    requirements: ['Tone patterns 70%+', 'Some special sounds'],
    color: 'from-yellow-400 to-orange-500'
  },
  {
    level: 4,
    name: 'Advanced',
    description: 'Cultural context and all special sounds',
    requirements: ['All special sounds 80%+', 'Cultural awareness'],
    color: 'from-red-400 to-red-600'
  },
  {
    level: 5,
    name: 'Master',
    description: 'Perfect pronunciation and cultural fluency',
    requirements: ['Consistent 90%+ scores', 'Cultural mastery'],
    color: 'from-purple-400 to-purple-600'
  }
]

export default function AdaptiveDifficultySystem({
  userProgress,
  onLevelChange,
  onExerciseRecommendation
}: AdaptiveDifficultySystemProps) {
  const [levelChange, setLevelChange] = useState<{
    direction: 'up' | 'down' | 'same'
    reason: string
  } | null>(null)
  const [recommendedExercises, setRecommendedExercises] = useState<Exercise[]>([])

  useEffect(() => {
    analyzeProgressAndAdjust()
  }, [userProgress])

  const analyzeProgressAndAdjust = () => {
    const currentLevel = userProgress.currentLevel
    const successRate = userProgress.totalAttempts > 0 
      ? userProgress.successfulAttempts / userProgress.totalAttempts 
      : 0
    const averageScore = userProgress.averageScore
    const recentPerformance = userProgress.recentScores.length > 0
      ? userProgress.recentScores.reduce((sum, score) => sum + score, 0) / userProgress.recentScores.length
      : 0

    let newLevel = currentLevel
    let reason = ''
    let direction: 'up' | 'down' | 'same' = 'same'

    // Level progression logic
    if (shouldLevelUp(successRate, averageScore, recentPerformance, currentLevel)) {
      newLevel = Math.min(5, currentLevel + 1)
      direction = 'up'
      reason = getLevelUpReason(successRate, averageScore, recentPerformance)
    } else if (shouldLevelDown(successRate, averageScore, recentPerformance, currentLevel)) {
      newLevel = Math.max(1, currentLevel - 1)
      direction = 'down'
      reason = getLevelDownReason(successRate, averageScore, recentPerformance)
    } else {
      reason = getMaintainLevelReason(successRate, averageScore)
    }

    if (newLevel !== currentLevel) {
      setLevelChange({ direction, reason })
      onLevelChange(newLevel, reason)
    }

    // Generate exercise recommendations
    const exercises = generateRecommendedExercises(newLevel, userProgress)
    setRecommendedExercises(exercises)
    onExerciseRecommendation(exercises)
  }

  const shouldLevelUp = (successRate: number, avgScore: number, recentPerf: number, level: number): boolean => {
    const thresholds = {
      1: { success: 0.8, score: 75, recent: 80 },
      2: { success: 0.75, score: 80, recent: 85 },
      3: { success: 0.8, score: 85, recent: 90 },
      4: { success: 0.85, score: 90, recent: 92 }
    }

    const threshold = thresholds[level as keyof typeof thresholds]
    if (!threshold) return false

    return successRate >= threshold.success && 
           avgScore >= threshold.score && 
           recentPerf >= threshold.recent &&
           userProgress.recentScores.length >= 5
  }

  const shouldLevelDown = (successRate: number, avgScore: number, recentPerf: number, level: number): boolean => {
    if (level === 1) return false

    const thresholds = {
      2: { success: 0.5, score: 60, recent: 65 },
      3: { success: 0.6, score: 65, recent: 70 },
      4: { success: 0.65, score: 70, recent: 75 },
      5: { success: 0.7, score: 75, recent: 80 }
    }

    const threshold = thresholds[level as keyof typeof thresholds]
    if (!threshold) return false

    return (successRate < threshold.success || 
            avgScore < threshold.score || 
            recentPerf < threshold.recent) &&
           userProgress.recentScores.length >= 3
  }

  const getLevelUpReason = (successRate: number, avgScore: number, recentPerf: number): string => {
    return `🎉 Excellent progress! Success rate: ${Math.round(successRate * 100)}%, Average: ${Math.round(avgScore)}%, Recent: ${Math.round(recentPerf)}%`
  }

  const getLevelDownReason = (successRate: number, avgScore: number, recentPerf: number): string => {
    return `📚 Let's practice fundamentals. Recent performance: ${Math.round(recentPerf)}% - we'll build you back up!`
  }

  const getMaintainLevelReason = (successRate: number, avgScore: number): string => {
    return `✨ Steady progress! Keep practicing at this level. Success rate: ${Math.round(successRate * 100)}%`
  }

  const generateRecommendedExercises = (level: number, progress: UserProgress): Exercise[] => {
    const exercises: Exercise[] = []

    // Focus on weak areas first
    if (progress.weakSounds.length > 0) {
      progress.weakSounds.slice(0, 3).forEach((sound, index) => {
        exercises.push({
          id: `weak-${sound}-${index}`,
          word: getExampleWord(sound),
          type: getExerciseType(sound),
          difficulty: Math.max(1, level - 1),
          focusAreas: [sound],
          description: `Practice the ${sound} sound - identified as a weak area`
        })
      })
    }

    // Add level-appropriate challenges
    switch (level) {
      case 1:
        exercises.push(
          {
            id: 'cv-basic-1',
            word: 'baba',
            type: 'cv',
            difficulty: 1,
            focusAreas: ['basic-consonants', 'basic-vowels'],
            description: 'Master simple consonant-vowel patterns'
          },
          {
            id: 'cv-basic-2',
            word: 'mama',
            type: 'cv',
            difficulty: 1,
            focusAreas: ['basic-consonants', 'basic-vowels'],
            description: 'Practice clear vowel pronunciation'
          }
        )
        break

      case 2:
        exercises.push(
          {
            id: 'tone-basic-1',
            word: 'sara',
            type: 'tones',
            difficulty: 2,
            focusAreas: ['low-tones'],
            description: 'Practice low tone patterns'
          },
          {
            id: 'tone-basic-2',
            word: 'sára',
            type: 'tones',
            difficulty: 2,
            focusAreas: ['high-low-contrast'],
            description: 'Master high-low tone contrast'
          }
        )
        break

      case 3:
        exercises.push(
          {
            id: 'special-1',
            word: 'mbira',
            type: 'clusters',
            difficulty: 3,
            focusAreas: ['mb', 'prenasalized'],
            description: 'Master prenasalized consonants'
          },
          {
            id: 'special-2',
            word: 'svika',
            type: 'clusters',
            difficulty: 3,
            focusAreas: ['sv', 'whistled'],
            description: 'Practice whistled sibilants'
          }
        )
        break

      case 4:
        exercises.push(
          {
            id: 'cultural-1',
            word: 'sekuru',
            type: 'cultural',
            difficulty: 4,
            focusAreas: ['respectful-tone', 'cultural-context'],
            description: 'Practice respectful pronunciation for elders'
          }
        )
        break

      case 5:
        exercises.push(
          {
            id: 'master-1',
            word: 'nharembozha',
            type: 'clusters',
            difficulty: 5,
            focusAreas: ['complex-clusters', 'tone-accuracy'],
            description: 'Master complex compound words'
          }
        )
        break
    }

    return exercises
  }

  const getExampleWord = (sound: string): string => {
    const examples = {
      'sv': 'svika',
      'zv': 'zvino',
      'mb': 'mbira',
      'nd': 'ndimi',
      'ng': 'ngoma',
      'pf': 'pfuti',
      'bv': 'bvumba'
    }
    return examples[sound as keyof typeof examples] || 'baba'
  }

  const getExerciseType = (sound: string): Exercise['type'] => {
    if (['sv', 'zv', 'mb', 'nd', 'ng', 'pf', 'bv'].includes(sound)) return 'clusters'
    return 'cv'
  }

  const currentLevelData = DIFFICULTY_LEVELS.find(l => l.level === userProgress.currentLevel)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-center mb-6 flex items-center justify-center">
        <FaTrophy className="mr-2 text-yellow-500" />
        Adaptive Learning Progress
      </h3>

      {/* Current Level Display */}
      <div className="mb-6">
        <div className={`p-4 rounded-lg bg-gradient-to-r ${currentLevelData?.color} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold">Level {userProgress.currentLevel}</h4>
              <p className="text-sm opacity-90">{currentLevelData?.name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.round(userProgress.averageScore)}%</div>
              <div className="text-sm opacity-90">Average Score</div>
            </div>
          </div>
          <p className="mt-2 text-sm opacity-90">{currentLevelData?.description}</p>
        </div>
      </div>

      {/* Level Change Notification */}
      <AnimatePresence>
        {levelChange && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className={`mb-6 p-4 rounded-lg border-2 ${
              levelChange.direction === 'up' 
                ? 'bg-green-50 border-green-500 text-green-700'
                : levelChange.direction === 'down'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-gray-50 border-gray-500 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              {levelChange.direction === 'up' && <FaArrowUp className="mr-2" />}
              {levelChange.direction === 'down' && <FaArrowDown className="mr-2" />}
              {levelChange.direction === 'same' && <FaEquals className="mr-2" />}
              <span className="font-medium">{levelChange.reason}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {userProgress.totalAttempts}
          </div>
          <div className="text-sm text-blue-700">Total Attempts</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Math.round((userProgress.successfulAttempts / Math.max(userProgress.totalAttempts, 1)) * 100)}%
          </div>
          <div className="text-sm text-green-700">Success Rate</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {userProgress.strongSounds.length}
          </div>
          <div className="text-sm text-purple-700">Mastered Sounds</div>
        </div>
      </div>

      {/* Recommended Exercises */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center">
                     <FaBullseye className="mr-2 text-blue-500" />
          Recommended Practice
        </h4>
        <div className="space-y-3">
          {recommendedExercises.slice(0, 3).map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{exercise.word}</span>
                  <span className="ml-2 text-sm text-gray-600">
                    ({exercise.type})
                  </span>
                  <div className="text-xs text-gray-500 mt-1">
                    {exercise.description}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-xs bg-white px-2 py-1 rounded">
                    Difficulty {exercise.difficulty}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weak Areas Focus */}
      {userProgress.weakSounds.length > 0 && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-700 mb-2">🎯 Focus Areas</h4>
          <div className="flex flex-wrap gap-2">
            {userProgress.weakSounds.map(sound => (
              <span 
                key={sound}
                className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
              >
                {sound}
              </span>
            ))}
          </div>
          <p className="text-sm text-red-600 mt-2">
            These sounds need extra practice. Don't worry - targeted practice will help!
          </p>
        </div>
      )}
    </div>
  )
}