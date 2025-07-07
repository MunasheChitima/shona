'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaChartLine, 
  FaExclamationTriangle, 
  FaArrowUp, 
  FaArrowDown,
  FaLightbulb,
  FaCalendarAlt,
  FaPlay
} from 'react-icons/fa'

interface PronunciationHistory {
  date: string
  word: string
  overallScore: number
  toneAccuracy: number
  specialSounds: number
  culturalAppropriateness: number
  detectedIssues: string[]
}

interface SoundProgress {
  sound: string
  attempts: number
  successRate: number
  averageScore: number
  trend: 'improving' | 'declining' | 'stable'
  lastPracticed: string
  difficulty: number
}

interface PronunciationDiagnosticsProps {
  userId: string
  history: PronunciationHistory[]
  onRecommendedPractice: (sound: string) => void
}

interface DiagnosticInsight {
  type: 'weakness' | 'strength' | 'improvement' | 'plateau'
  title: string
  description: string
  actionable: string
  priority: 'high' | 'medium' | 'low'
}

export default function PronunciationDiagnostics({
  userId,
  history,
  onRecommendedPractice
}: PronunciationDiagnosticsProps) {
  const [soundProgress, setSoundProgress] = useState<SoundProgress[]>([])
  const [insights, setInsights] = useState<DiagnosticInsight[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    analyzePronunciationData()
  }, [history, selectedTimeframe])

  const analyzePronunciationData = () => {
    // Filter history based on timeframe
    const filteredHistory = filterHistoryByTimeframe(history, selectedTimeframe)
    
    // Analyze sound-specific progress
    const soundProgressData = analyzeSoundProgress(filteredHistory)
    setSoundProgress(soundProgressData)
    
    // Generate insights
    const diagnosticInsights = generateInsights(filteredHistory, soundProgressData)
    setInsights(diagnosticInsights)
  }

  const filterHistoryByTimeframe = (history: PronunciationHistory[], timeframe: string): PronunciationHistory[] => {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeframe) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case 'all':
        return history
    }
    
    return history.filter(entry => new Date(entry.date) >= cutoffDate)
  }

  const analyzeSoundProgress = (history: PronunciationHistory[]): SoundProgress[] => {
    const soundMap = new Map<string, {
      attempts: number
      totalScore: number
      scores: number[]
      lastDate: string
    }>()

    // Aggregate data by sound
    history.forEach(entry => {
      entry.detectedIssues.forEach(issue => {
        if (!soundMap.has(issue)) {
          soundMap.set(issue, {
            attempts: 0,
            totalScore: 0,
            scores: [],
            lastDate: entry.date
          })
        }
        
        const soundData = soundMap.get(issue)!
        soundData.attempts++
        soundData.totalScore += entry.specialSounds
        soundData.scores.push(entry.specialSounds)
        
        if (new Date(entry.date) > new Date(soundData.lastDate)) {
          soundData.lastDate = entry.date
        }
      })
    })

    // Convert to SoundProgress array
    return Array.from(soundMap.entries()).map(([sound, data]) => {
      const averageScore = data.totalScore / data.attempts
      const successRate = data.scores.filter(score => score >= 80).length / data.attempts
      const trend = calculateTrend(data.scores)
      
      return {
        sound,
        attempts: data.attempts,
        successRate,
        averageScore,
        trend,
        lastPracticed: data.lastDate,
        difficulty: getSoundDifficulty(sound)
      }
    }).sort((a, b) => {
      // Sort by priority: low success rate + recent attempts first
      const aPriority = (1 - a.successRate) * Math.log(a.attempts + 1)
      const bPriority = (1 - b.successRate) * Math.log(b.attempts + 1)
      return bPriority - aPriority
    })
  }

  const calculateTrend = (scores: number[]): 'improving' | 'declining' | 'stable' => {
    if (scores.length < 3) return 'stable'
    
    const recent = scores.slice(-3)
    const earlier = scores.slice(-6, -3)
    
    if (earlier.length === 0) return 'stable'
    
    const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, score) => sum + score, 0) / earlier.length
    
    const improvement = recentAvg - earlierAvg
    
    if (improvement > 5) return 'improving'
    if (improvement < -5) return 'declining'
    return 'stable'
  }

  const getSoundDifficulty = (sound: string): number => {
    const difficulties: Record<string, number> = {
      'sv': 4, 'zv': 4, 'pf': 4,
      'mb': 3, 'nd': 3, 'ng': 3, 'bv': 3,
      'tone-accuracy': 3,
      'cultural-context': 2,
      'basic-pronunciation': 1
    }
    return difficulties[sound] || 2
  }

  const generateInsights = (history: PronunciationHistory[], soundProgress: SoundProgress[]): DiagnosticInsight[] => {
    const insights: DiagnosticInsight[] = []
    
    // Overall progress trend
    if (history.length >= 5) {
      const recentScores = history.slice(-5).map(h => h.overallScore)
      const earlierScores = history.slice(-10, -5).map(h => h.overallScore)
      
      if (earlierScores.length > 0) {
        const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length
        const earlierAvg = earlierScores.reduce((sum, score) => sum + score, 0) / earlierScores.length
        
        if (recentAvg - earlierAvg > 10) {
          insights.push({
            type: 'improvement',
            title: 'Excellent Progress! 📈',
            description: `Your pronunciation has improved by ${Math.round(recentAvg - earlierAvg)}% recently`,
            actionable: 'Keep up the great work! Try more challenging words.',
            priority: 'low'
          })
        } else if (earlierAvg - recentAvg > 10) {
          insights.push({
            type: 'plateau',
            title: 'Progress Plateau 📊',
            description: 'Your scores have been declining recently',
            actionable: 'Take a break and review fundamentals, or try easier words to rebuild confidence.',
            priority: 'medium'
          })
        }
      }
    }
    
    // Identify persistent problem sounds
    const problemSounds = soundProgress.filter(s => 
      s.successRate < 0.6 && s.attempts >= 3
    ).slice(0, 3)
    
    problemSounds.forEach(sound => {
      insights.push({
        type: 'weakness',
        title: `Persistent Challenge: ${sound.sound} 🎯`,
        description: `${Math.round(sound.successRate * 100)}% success rate over ${sound.attempts} attempts`,
        actionable: `Focus on isolated practice of "${sound.sound}" sounds. Try slower pronunciation first.`,
        priority: 'high'
      })
    })
    
    // Identify improving sounds
    const improvingSounds = soundProgress.filter(s => 
      s.trend === 'improving' && s.attempts >= 3
    ).slice(0, 2)
    
    improvingSounds.forEach(sound => {
      insights.push({
        type: 'improvement',
        title: `Great Progress: ${sound.sound} ✨`,
        description: `You're improving with ${sound.sound} sounds!`,
        actionable: 'Continue practicing to maintain this momentum.',
        priority: 'low'
      })
    })
    
    // Tone-specific insights
    const toneScores = history.map(h => h.toneAccuracy).filter(score => score > 0)
    if (toneScores.length > 0) {
      const avgToneScore = toneScores.reduce((sum, score) => sum + score, 0) / toneScores.length
      
      if (avgToneScore < 70) {
        insights.push({
          type: 'weakness',
          title: 'Tone Practice Needed 🎵',
          description: `Average tone accuracy: ${Math.round(avgToneScore)}%`,
          actionable: 'Spend extra time with tone pattern exercises. Listen to examples more carefully.',
          priority: 'high'
        })
      }
    }
    
    // Cultural context insights
    const culturalScores = history.map(h => h.culturalAppropriateness).filter(score => score > 0)
    if (culturalScores.length > 0) {
      const avgCulturalScore = culturalScores.reduce((sum, score) => sum + score, 0) / culturalScores.length
      
      if (avgCulturalScore < 80) {
        insights.push({
          type: 'weakness',
          title: 'Cultural Context Awareness 🤝',
          description: `Average cultural appropriateness: ${Math.round(avgCulturalScore)}%`,
          actionable: 'Practice respectful pronunciation for elder terms and formal contexts.',
          priority: 'medium'
        })
      }
    }
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      case 'low': return 'border-green-500 bg-green-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <FaExclamationTriangle className="text-red-500" />
      case 'medium': return <FaLightbulb className="text-yellow-500" />
      case 'low': return <FaArrowUp className="text-green-500" />
      default: return null
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <FaArrowUp className="text-green-500" />
      case 'declining': return <FaArrowDown className="text-red-500" />
      case 'stable': return <div className="w-4 h-4 bg-gray-400 rounded" />
      default: return null
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <FaChartLine className="mr-2 text-blue-500" />
          Pronunciation Diagnostics
        </h3>
        
        {/* Timeframe selector */}
        <div className="flex space-x-2">
          {(['week', 'month', 'all'] as const).map(timeframe => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {timeframe === 'all' ? 'All Time' : `Last ${timeframe}`}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{history.length}</div>
          <div className="text-sm text-blue-700">Total Sessions</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {history.length > 0 ? Math.round(
              history.reduce((sum, h) => sum + h.overallScore, 0) / history.length
            ) : 0}%
          </div>
          <div className="text-sm text-green-700">Average Score</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {soundProgress.filter(s => s.successRate >= 0.8).length}
          </div>
          <div className="text-sm text-purple-700">Mastered Sounds</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {soundProgress.filter(s => s.trend === 'improving').length}
          </div>
          <div className="text-sm text-orange-700">Improving Areas</div>
        </div>
      </div>

      {/* Diagnostic Insights */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center">
          <FaLightbulb className="mr-2 text-yellow-500" />
          Diagnostic Insights
        </h4>
        
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Need more pronunciation data to generate insights.</p>
            <p className="text-sm mt-1">Complete a few more practice sessions!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    {getPriorityIcon(insight.priority)}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold mb-1">{insight.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <p className="text-sm font-medium text-gray-800">{insight.actionable}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Sound-Specific Progress */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Sound-Specific Progress</h4>
        
        {soundProgress.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No sound-specific data available yet.
          </div>
        ) : (
          <div className="space-y-2">
            {soundProgress.slice(0, 8).map((sound, index) => (
              <motion.div
                key={sound.sound}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center flex-1">
                  <div className="mr-3">
                    {getTrendIcon(sound.trend)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{sound.sound}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={getScoreColor(sound.averageScore)}>
                          {Math.round(sound.averageScore)}% avg
                        </span>
                        <span className="text-gray-500">
                          {Math.round(sound.successRate * 100)}% success
                        </span>
                        <span className="text-gray-400">
                          {sound.attempts} attempts
                        </span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            sound.successRate >= 0.8 ? 'bg-green-500' :
                            sound.successRate >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${sound.successRate * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onRecommendedPractice(sound.sound)}
                    className="ml-4 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                    title="Practice this sound"
                  >
                    <FaPlay className="text-sm" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center">
          <FaCalendarAlt className="mr-2 text-gray-500" />
          Recent Activity
        </h4>
        
        {history.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No practice sessions recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(-5).reverse().map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{session.word}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {formatDate(session.date)}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold ${getScoreColor(session.overallScore)}`}>
                    {session.overallScore}%
                  </span>
                  {session.detectedIssues.length > 0 && (
                    <div className="flex space-x-1">
                      {session.detectedIssues.slice(0, 2).map((issue, i) => (
                        <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          {issue}
                        </span>
                      ))}
                      {session.detectedIssues.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{session.detectedIssues.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}