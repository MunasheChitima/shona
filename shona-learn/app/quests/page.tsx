'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import { FaMap, FaCompass, FaUsers, FaLightbulb, FaStar, FaBookOpen, FaHeart } from 'react-icons/fa'
import { quests, getQuestsByLevel, Quest } from '../../lib/quests'

export default function Quests() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userLevel, setUserLevel] = useState(1)
  const [completedQuests, setCompletedQuests] = useState<string[]>([])
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    const userObj = JSON.parse(userData)
    setUser(userObj)
    setUserLevel(Math.floor(userObj.xp / 100) + 1)
    fetchQuestProgress()
  }, [])

  const fetchQuestProgress = async () => {
    // In a real app, this would fetch from the API
    // For now, we'll simulate completed quests based on user level
    const completed = []
    if (userLevel > 1) completed.push('quest-1')
    if (userLevel > 2) completed.push('quest-2')
    if (userLevel > 3) completed.push('quest-3')
    setCompletedQuests(completed)
    setIsLoading(false)
  }

  const availableQuests = getQuestsByLevel(userLevel)

  const handleQuestSelect = (quest: Quest) => {
    setSelectedQuest(quest)
  }

  const handleStartQuest = (quest: Quest) => {
    // Navigate to the first lesson in the quest
    router.push(`/learn?quest=${quest.id}`)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
                <FaMap className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Your Learning Journey
                </h1>
                <p className="text-gray-600">
                  Embark on quests that tell the story of Shona culture and language
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <div className="text-2xl font-bold text-green-700">{userLevel}</div>
                <div className="text-sm text-green-600">Current Level</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">{completedQuests.length}</div>
                <div className="text-sm text-blue-600">Quests Completed</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                <div className="text-2xl font-bold text-purple-700">{availableQuests.length}</div>
                <div className="text-sm text-purple-600">Available Quests</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quests Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableQuests.map((quest, index) => {
            const isCompleted = completedQuests.includes(quest.id)
            const isAvailable = quest.requiredLevel <= userLevel
            
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`relative group cursor-pointer ${
                  isCompleted ? 'opacity-75' : ''
                }`}
                onClick={() => handleQuestSelect(quest)}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20 hover:shadow-large transition-all duration-300 h-full">
                  {/* Quest Status Badge */}
                  <div className="absolute top-4 right-4">
                    {isCompleted ? (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <FaStar className="inline mr-1" />
                        Completed
                      </div>
                    ) : isAvailable ? (
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <FaCompass className="inline mr-1" />
                        Available
                      </div>
                    ) : (
                      <div className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <FaBookOpen className="inline mr-1" />
                        Level {quest.requiredLevel}
                      </div>
                    )}
                  </div>

                  {/* Quest Icon */}
                  <div className="mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-400 to-green-600' 
                        : 'bg-gradient-to-r from-blue-400 to-purple-600'
                    }`}>
                      {quest.category === 'Cultural Immersion' && <FaHeart className="text-white text-2xl" />}
                      {quest.category === 'Family & Relationships' && <FaUsers className="text-white text-2xl" />}
                      {quest.category === 'Practical Communication' && <FaCompass className="text-white text-2xl" />}
                      {quest.category === 'Pronunciation Mastery' && <FaLightbulb className="text-white text-2xl" />}
                      {quest.category === 'Zimbabwean History' && <FaBookOpen className="text-white text-2xl" />}
                      {quest.category === 'Cultural Heritage' && <FaUsers className="text-white text-2xl" />}
                    </div>
                  </div>

                  {/* Quest Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {quest.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {quest.description}
                  </p>

                  {/* Quest Features */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <FaBookOpen className="mr-2" />
                      {quest.lessons.length} lessons
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FaUsers className="mr-2" />
                      {quest.collaborativeElements.length} collaborative features
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FaLightbulb className="mr-2" />
                      {quest.discoveryElements.length} discovery elements
                    </div>
                  </div>

                  {/* Action Button */}
                  {isAvailable && !isCompleted && (
                    <motion.button
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartQuest(quest)
                      }}
                    >
                      Begin Quest
                    </motion.button>
                  )}

                  {isCompleted && (
                    <div className="w-full bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-xl text-center">
                      Quest Completed! 🎉
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quest Details Modal */}
        {selectedQuest && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedQuest(null)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  {selectedQuest.title}
                </h2>
                <button
                  onClick={() => setSelectedQuest(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Story Narrative */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">The Story</h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedQuest.storyNarrative}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">What You'll Learn</h3>
                <ul className="space-y-2">
                  {selectedQuest.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <FaStar className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Discovery Elements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Exploration Opportunities</h3>
                <ul className="space-y-2">
                  {selectedQuest.discoveryElements.map((element, index) => (
                    <li key={index} className="flex items-start">
                      <FaCompass className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{element}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Collaborative Elements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Social Learning</h3>
                <ul className="space-y-2">
                  {selectedQuest.collaborativeElements.map((element, index) => (
                    <li key={index} className="flex items-start">
                      <FaUsers className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{element}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Intrinsic Rewards */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">What You'll Gain</h3>
                <ul className="space-y-2">
                  {selectedQuest.intrinsicRewards.map((reward, index) => (
                    <li key={index} className="flex items-start">
                      <FaHeart className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{reward}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {selectedQuest.requiredLevel <= userLevel && !completedQuests.includes(selectedQuest.id) && (
                  <motion.button
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStartQuest(selectedQuest)}
                  >
                    Begin Your Journey
                  </motion.button>
                )}
                <button
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedQuest(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 