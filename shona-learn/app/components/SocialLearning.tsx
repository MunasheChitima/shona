'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUsers, FaComments, FaStar } from 'react-icons/fa'

interface StudyGroup {
  id: string
  name: string
  description: string
  memberCount: number
  maxMembers: number
  level: string
  meetingTime: string
  isJoined: boolean
}

interface LearningPartner {
  id: string
  name: string
  level: number
  interests: string[]
  availability: string
  isOnline: boolean
}

interface CommunityChallenge {
  id: string
  title: string
  description: string
  participants: number
  endDate: string
  isParticipating: boolean
  type: 'collaborative' | 'supportive' | 'creative'
}

export default function SocialLearning() {
  const [activeTab, setActiveTab] = useState<'groups' | 'partners' | 'challenges'>('groups')
  const [studyGroups] = useState<StudyGroup[]>([
    {
      id: '1',
      name: 'Shona Beginners Circle',
      description: 'A supportive group for new learners to practice together',
      memberCount: 8,
      maxMembers: 12,
      level: 'Beginner',
      meetingTime: 'Tuesdays 7 PM',
      isJoined: false
    },
    {
      id: '2',
      name: 'Pronunciation Practice Partners',
      description: 'Focus on mastering Shona tones and sounds',
      memberCount: 5,
      maxMembers: 8,
      level: 'Intermediate',
      meetingTime: 'Thursdays 6 PM',
      isJoined: true
    },
    {
      id: '3',
      name: 'Cultural Exchange Group',
      description: 'Learn about Shona culture while practicing language',
      memberCount: 12,
      maxMembers: 15,
      level: 'All Levels',
      meetingTime: 'Saturdays 2 PM',
      isJoined: false
    }
  ])

  const [learningPartners] = useState<LearningPartner[]>([
    {
      id: '1',
      name: 'Sarah M.',
      level: 3,
      interests: ['Pronunciation', 'Culture'],
      availability: 'Evenings',
      isOnline: true
    },
    {
      id: '2',
      name: 'John K.',
      level: 5,
      interests: ['Grammar', 'Conversation'],
      availability: 'Weekends',
      isOnline: false
    },
    {
      id: '3',
      name: 'Maria L.',
      level: 2,
      interests: ['Vocabulary', 'Reading'],
      availability: 'Mornings',
      isOnline: true
    }
  ])

  const [challenges] = useState<CommunityChallenge[]>([
    {
      id: '1',
      title: '30-Day Vocabulary Challenge',
      description: 'Learn 5 new Shona words every day for 30 days',
      participants: 45,
      endDate: '2024-12-31',
      isParticipating: true,
      type: 'collaborative'
    },
    {
      id: '2',
      title: 'Pronunciation Support Group',
      description: 'Weekly meetups to practice difficult sounds together',
      participants: 23,
      endDate: '2024-12-15',
      isParticipating: false,
      type: 'supportive'
    },
    {
      id: '3',
      title: 'Create Your Own Story',
      description: 'Write a short story in Shona and share with the community',
      participants: 12,
      endDate: '2025-01-10',
      isParticipating: false,
      type: 'creative'
    }
  ])

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
          <FaUsers className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Social Learning</h2>
          <p className="text-gray-600">Connect with other learners</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
        {[
          { id: 'groups', label: 'Study Groups', icon: FaUsers },
          { id: 'partners', label: 'Learning Partners', icon: FaComments },
          { id: 'challenges', label: 'Community Challenges', icon: FaStar }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'groups' | 'partners' | 'challenges')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="text-sm" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {studyGroups.map((group) => (
            <motion.div
              key={group.id}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{group.name}</h3>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
                {group.isJoined && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                    Joined
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                <span>{group.memberCount}/{group.maxMembers} members</span>
                <span>{group.level}</span>
                <span>{group.meetingTime}</span>
              </div>
              <button
                className={`mt-3 w-full py-2 rounded-lg font-semibold transition-colors ${
                  group.isJoined
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {group.isJoined ? 'Leave Group' : 'Join Group'}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'partners' && (
        <div className="space-y-4">
          {learningPartners.map((partner) => (
            <motion.div
              key={partner.id}
              className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-800">{partner.name}</h3>
                    {partner.isOnline && (
                      <span className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Level {partner.level}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {partner.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-white px-2 py-1 rounded-full text-xs text-gray-600"
                  >
                    {interest}
                  </span>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Available: {partner.availability}
              </div>
              <button className="mt-3 w-full py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                Connect
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              className={`rounded-xl p-4 border ${
                challenge.type === 'collaborative'
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                  : challenge.type === 'supportive'
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
              }`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{challenge.title}</h3>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </div>
                {challenge.isParticipating && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                    Participating
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                <span>{challenge.participants} participants</span>
                <span>Ends: {challenge.endDate}</span>
              </div>
              <button
                className={`mt-3 w-full py-2 rounded-lg font-semibold transition-colors ${
                  challenge.isParticipating
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {challenge.isParticipating ? 'Leave Challenge' : 'Join Challenge'}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Community Guidelines */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
        <h4 className="font-semibold text-gray-800 mb-2">Community Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Be supportive and encouraging to fellow learners</li>
          <li>• Share your knowledge and help others grow</li>
          <li>• Respect different learning paces and styles</li>
          <li>• Celebrate everyone&apos;s progress and achievements</li>
        </ul>
      </div>
    </div>
  )
}
