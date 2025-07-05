'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUsers, FaComments, FaHandshake, FaLightbulb, FaHeart, FaStar } from 'react-icons/fa'

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
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([
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

  const [learningPartners, setLearningPartners] = useState<LearningPartner[]>([
    {
      id: '1',
      name: 'Sarah M.',
      level: 3,
      interests: ['Greetings', 'Family', 'Culture'],
      availability: 'Weekday evenings',
      isOnline: true
    },
    {
      id: '2',
      name: 'David K.',
      level: 2,
      interests: ['Numbers', 'Basic phrases'],
      availability: 'Weekends',
      isOnline: false
    },
    {
      id: '3',
      name: 'Maria L.',
      level: 4,
      interests: ['Pronunciation', 'Advanced conversation'],
      availability: 'Flexible',
      isOnline: true
    }
  ])

  const [communityChallenges, setCommunityChallenges] = useState<CommunityChallenge[]>([
    {
      id: '1',
      title: '7-Day Greeting Challenge',
      description: 'Practice a different Shona greeting each day and share your experience',
      participants: 24,
      endDate: '2024-01-15',
      isParticipating: true,
      type: 'collaborative'
    },
    {
      id: '2',
      title: 'Help a Fellow Learner',
      description: 'Support someone who is struggling with a concept you've mastered',
      participants: 18,
      endDate: '2024-01-20',
      isParticipating: false,
      type: 'supportive'
    },
    {
      id: '3',
      title: 'Create a Shona Story',
      description: 'Write a short story using the vocabulary you've learned',
      participants: 12,
      endDate: '2024-01-25',
      isParticipating: false,
      type: 'creative'
    }
  ])

  const handleJoinGroup = (groupId: string) => {
    setStudyGroups(groups => 
      groups.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
          : group
      )
    )
  }

  const handleJoinChallenge = (challengeId: string) => {
    setCommunityChallenges(challenges =>
      challenges.map(challenge =>
        challenge.id === challengeId
          ? { ...challenge, isParticipating: true, participants: challenge.participants + 1 }
          : challenge
      )
    )
  }

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'collaborative': return <FaUsers className="text-blue-500" />
      case 'supportive': return <FaHandshake className="text-green-500" />
      case 'creative': return <FaLightbulb className="text-purple-500" />
      default: return <FaStar className="text-yellow-500" />
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
          <FaUsers className="text-white text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Learn Together</h2>
          <p className="text-gray-600">Connect with fellow learners and grow together</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
        {[
          { id: 'groups', label: 'Study Groups', icon: FaUsers },
          { id: 'partners', label: 'Learning Partners', icon: FaComments },
          { id: 'challenges', label: 'Community Challenges', icon: FaStar }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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

      {/* Study Groups Tab */}
      {activeTab === 'groups' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {studyGroups.map((group) => (
            <div key={group.id} className="bg-gray-50 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{group.name}</h3>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {group.memberCount}/{group.maxMembers} members
                  </div>
                  <div className="text-xs text-gray-400">{group.level}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <FaComments className="inline mr-1" />
                  {group.meetingTime}
                </div>
                {!group.isJoined && group.memberCount < group.maxMembers ? (
                  <motion.button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    Join Group
                  </motion.button>
                ) : (
                  <div className="text-green-600 text-sm font-medium">
                    {group.isJoined ? '✓ Joined' : 'Full'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Learning Partners Tab */}
      {activeTab === 'partners' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {learningPartners.map((partner) => (
            <div key={partner.id} className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {partner.name.charAt(0)}
                    </div>
                    {partner.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{partner.name}</h3>
                    <div className="text-sm text-gray-600">Level {partner.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{partner.availability}</div>
                  <div className={`text-xs ${partner.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                    {partner.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">Interests:</div>
                <div className="flex flex-wrap gap-1">
                  {partner.interests.map((interest, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              
              <button className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                Send Message
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Community Challenges Tab */}
      {activeTab === 'challenges' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {communityChallenges.map((challenge) => (
            <div key={challenge.id} className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getChallengeIcon(challenge.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{challenge.participants} participants</div>
                  <div className="text-xs text-gray-400">Ends {challenge.endDate}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaHeart className="text-red-500 text-sm" />
                  <span className="text-sm text-gray-600">Supportive community challenge</span>
                </div>
                {!challenge.isParticipating ? (
                  <motion.button
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleJoinChallenge(challenge.id)}
                  >
                    Join Challenge
                  </motion.button>
                ) : (
                  <div className="text-green-600 text-sm font-medium">✓ Participating</div>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Community Guidelines */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
        <h4 className="font-semibold text-gray-800 mb-2">Community Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Be supportive and encouraging to fellow learners</li>
          <li>• Share your knowledge and help others grow</li>
          <li>• Respect different learning paces and styles</li>
          <li>• Celebrate everyone's progress and achievements</li>
        </ul>
      </div>
    </div>
  )
} 