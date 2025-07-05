'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaHeart, FaStar, FaUsers, FaLightbulb, FaChartLine } from 'react-icons/fa'
import { motivationPrompts, calculateMotivationScore, getMotivationInsights, getMotivationRecommendations, IntrinsicMotivationData } from '../../lib/intrinsic-motivation'

export default function IntrinsicMotivationTracker() {
  const [motivation, setMotivation] = useState<IntrinsicMotivationData>({
    autonomy: 5,
    competence: 5,
    relatedness: 5,
    lastUpdated: new Date()
  })
  const [showPrompts, setShowPrompts] = useState(false)
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [responses, setResponses] = useState<{ type: string; value: number }[]>([])

  const insights = getMotivationInsights(motivation)
  const recommendations = getMotivationRecommendations(motivation)

  const handlePromptResponse = (value: number) => {
    const currentPrompt = motivationPrompts[currentPromptIndex]
    const newResponses = [...responses, { type: currentPrompt.type, value }]
    setResponses(newResponses)

    if (currentPromptIndex < motivationPrompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1)
    } else {
      // Calculate final motivation score
      const newMotivation = calculateMotivationScore(newResponses)
      setMotivation(newMotivation)
      setShowPrompts(false)
      setCurrentPromptIndex(0)
      setResponses([])
    }
  }

  const getMotivationColor = (value: number) => {
    if (value >= 8) return 'text-green-600'
    if (value >= 6) return 'text-blue-600'
    if (value >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMotivationLabel = (value: number) => {
    if (value >= 8) return 'Excellent'
    if (value >= 6) return 'Good'
    if (value >= 4) return 'Fair'
    return 'Needs Support'
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
          <FaHeart className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your Learning Motivation</h2>
          <p className="text-gray-600">Track what drives your learning journey</p>
        </div>
      </div>

      {/* Motivation Scores */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <FaStar className="text-green-600" />
            <span className="font-semibold text-gray-800">Autonomy</span>
          </div>
          <div className={`text-2xl font-bold ${getMotivationColor(motivation.autonomy)}`}>
            {motivation.autonomy}/10
          </div>
          <div className="text-sm text-gray-600">{getMotivationLabel(motivation.autonomy)}</div>
          <div className="text-xs text-gray-500 mt-1">Choice & Control</div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <FaChartLine className="text-blue-600" />
            <span className="font-semibold text-gray-800">Competence</span>
          </div>
          <div className={`text-2xl font-bold ${getMotivationColor(motivation.competence)}`}>
            {motivation.competence}/10
          </div>
          <div className="text-sm text-gray-600">{getMotivationLabel(motivation.competence)}</div>
          <div className="text-xs text-gray-500 mt-1">Mastery & Growth</div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <FaUsers className="text-purple-600" />
            <span className="font-semibold text-gray-800">Relatedness</span>
          </div>
          <div className={`text-2xl font-bold ${getMotivationColor(motivation.relatedness)}`}>
            {motivation.relatedness}/10
          </div>
          <div className="text-sm text-gray-600">{getMotivationLabel(motivation.relatedness)}</div>
          <div className="text-xs text-gray-500 mt-1">Connection & Community</div>
        </div>
      </div>

      {/* Check-in Button */}
      <div className="text-center mb-6">
        <motion.button
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPrompts(true)}
        >
          Check Your Motivation
        </motion.button>
        <p className="text-xs text-gray-500 mt-2">
          Last updated: {motivation.lastUpdated.toLocaleDateString()}
        </p>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <FaLightbulb className="text-yellow-500 mr-2" />
            Insights
          </h3>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Personalized Recommendations</h3>
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <FaStar className="text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivation Prompts Modal */}
      {showPrompts && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                How are you feeling about your learning?
              </h3>
              <p className="text-gray-600">
                Question {currentPromptIndex + 1} of {motivationPrompts.length}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-lg text-gray-800 mb-4">
                {motivationPrompts[currentPromptIndex].question}
              </p>
              
              <div className="space-y-3">
                {motivationPrompts[currentPromptIndex].options.map((option, index) => (
                  <motion.button
                    key={index}
                    className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePromptResponse(index + 1)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">{option}</span>
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                onClick={() => setShowPrompts(false)}
              >
                Skip for now
              </button>
              <div className="text-sm text-gray-500">
                {Math.round(((currentPromptIndex + 1) / motivationPrompts.length) * 100)}% complete
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Motivation Philosophy */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
        <h4 className="font-semibold text-gray-800 mb-2">Why Intrinsic Motivation Matters</h4>
        <p className="text-sm text-gray-700 leading-relaxed">
          True learning happens when you're driven by curiosity, connection, and personal growth rather than external rewards. 
          We focus on building your internal motivation to create lasting learning habits.
        </p>
      </div>
    </div>
  )
} 