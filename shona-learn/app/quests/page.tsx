'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaMap, FaCompass, FaStar, FaBookOpen } from 'react-icons/fa'
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
    const level = Math.floor(userObj.xp / 100) + 1
    setUserLevel(level)

    // Simulate quest completion based on level
    const completed = quests
      .filter(q => q.requiredLevel < level)
      .map(q => q.id)
    setCompletedQuests(completed)
    setIsLoading(false)
  }, [])

  const availableQuests = getQuestsByLevel(userLevel)

  const handleStartQuest = (quest: Quest) => {
    router.push(`/learn?quest=${quest.id}`)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'from-green-400 to-green-600'
      case 'intermediate': return 'from-blue-400 to-blue-600'
      case 'advanced': return 'from-red-500 to-red-700'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-blue-100 text-blue-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (!user) return null

  // Group quests by level
  const beginnerQuests = availableQuests.filter(q => q.level === 'beginner')
  const intermediateQuests = availableQuests.filter(q => q.level === 'intermediate')
  const advancedQuests = availableQuests.filter(q => q.level === 'advanced')

  const renderQuestGroup = (title: string, groupQuests: Quest[], level: string) => {
    if (groupQuests.length === 0) return null
    return (
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelBadgeColor(level)}`}>
            {level}
          </span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupQuests.map((quest) => {
            const isCompleted = completedQuests.includes(quest.id)
            const isAvailable = quest.requiredLevel <= userLevel

            return (
              <div
                key={quest.id}
                className={`relative group cursor-pointer ${isCompleted ? 'opacity-75' : ''}`}
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20 hover:shadow-large transition-all duration-300 h-full">
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {isCompleted ? (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <FaStar className="inline mr-1" /> Completed
                      </div>
                    ) : isAvailable ? (
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <FaCompass className="inline mr-1" /> Available
                      </div>
                    ) : (
                      <div className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Level {quest.requiredLevel}
                      </div>
                    )}
                  </div>

                  {/* Quest Emoji + Color Bar */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r ${getLevelColor(quest.level)} mb-4`}>
                    <span className="text-2xl">{quest.emoji}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">{quest.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{quest.description}</p>

                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <FaBookOpen className="mr-2" />
                    {quest.lessons.length} lessons
                  </div>

                  {isAvailable && !isCompleted && (
                    <button
                      className={`w-full bg-gradient-to-r ${getLevelColor(quest.level)} text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105`}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        handleStartQuest(quest)
                      }}
                    >
                      Begin Quest
                    </button>
                  )}

                  {isCompleted && (
                    <div className="w-full bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-xl text-center">
                      Completed!
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
                <FaMap className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Your Learning Journey</h1>
                <p className="text-gray-600">13 units across beginner, intermediate, and advanced levels</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                <div className="text-2xl font-bold text-green-700">{userLevel}</div>
                <div className="text-sm text-green-600">Current Level</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">{completedQuests.length}/{quests.length}</div>
                <div className="text-sm text-blue-600">Units Completed</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                <div className="text-2xl font-bold text-purple-700">52</div>
                <div className="text-sm text-purple-600">Total Lessons</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quest Groups by Level */}
        {renderQuestGroup('Beginner', beginnerQuests, 'beginner')}
        {renderQuestGroup('Intermediate', intermediateQuests, 'intermediate')}
        {renderQuestGroup('Advanced', advancedQuests, 'advanced')}

        {/* Quest Details Modal */}
        {selectedQuest && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedQuest(null)}
          >
            <div
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{selectedQuest.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedQuest.title}</h2>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getLevelBadgeColor(selectedQuest.level)}`}>
                      {selectedQuest.level}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuest(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Story */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">The Story</h3>
                <p className="text-gray-700 leading-relaxed">{selectedQuest.storyNarrative}</p>
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

              {/* Lessons in this quest */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  {selectedQuest.lessons.length} Lessons
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedQuest.lessons.map((lessonId) => (
                    <span key={lessonId} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {lessonId.replace('lesson-', 'Lesson ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="flex space-x-4">
                {selectedQuest.requiredLevel <= userLevel && !completedQuests.includes(selectedQuest.id) && (
                  <button
                    className={`flex-1 bg-gradient-to-r ${getLevelColor(selectedQuest.level)} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105`}
                    onClick={() => handleStartQuest(selectedQuest)}
                  >
                    Begin Quest
                  </button>
                )}
                <button
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedQuest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
