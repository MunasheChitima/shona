'use client'
import { motion } from 'framer-motion'
import { FaAward, FaBullseye, FaVolumeUp, FaCheckCircle } from 'react-icons/fa'

interface SpecialSound {
  sound: string
  type: 'whistled' | 'prenasalized' | 'breathy' | 'affricate'
  description: string
  tip: string
  examples: string[]
  difficulty: 1 | 2 | 3 | 4 | 5
}

interface SpecialSoundsTrackerProps {
  detectedSounds: string[]
  targetSounds: string[]
  word: string
  onPracticeSound: (sound: string) => void
}

const SPECIAL_SOUNDS: Record<string, SpecialSound> = {
  'sv': {
    sound: 'sv',
    type: 'whistled',
    description: 'Whistled sibilant - high-pitched whistle sound',
    tip: 'Make a whistling sound while saying "s"',
    examples: ['svika', 'sviba', 'svondo'],
    difficulty: 4
  },
  'zv': {
    sound: 'zv',
    type: 'whistled', 
    description: 'Whistled fricative - voiced whistle',
    tip: 'Like "sv" but with vibration in your throat',
    examples: ['zvino', 'zvakare', 'zvose'],
    difficulty: 4
  },
  'mb': {
    sound: 'mb',
    type: 'prenasalized',
    description: 'Prenasalized plosive - "m" flows into "b"',
    tip: 'Start with humming "m", then explode into "b"',
    examples: ['mbira', 'mbwa', 'mbeu'],
    difficulty: 3
  },
  'nd': {
    sound: 'nd',
    type: 'prenasalized',
    description: 'Prenasalized plosive - "n" flows into "d"',
    tip: 'Start with "n" sound, then tongue tap for "d"',
    examples: ['ndimi', 'ndinoenda', 'ndege'],
    difficulty: 3
  },
  'ng': {
    sound: 'ng',
    type: 'prenasalized',
    description: 'Prenasalized plosive - like "ng" in "finger"',
    tip: 'Back of tongue touches roof of mouth',
    examples: ['ngoma', 'ngozi', 'ngororo'],
    difficulty: 3
  },
  'pf': {
    sound: 'pf',
    type: 'affricate',
    description: 'Ejective affricate - sharp "p" into "f"',
    tip: 'Pop your lips then blow air through them',
    examples: ['pfuti', 'pfungwa', 'pfumvu'],
    difficulty: 4
  },
  'bv': {
    sound: 'bv',
    type: 'affricate',
    description: 'Affricate - "b" flows into "v"',
    tip: 'Start with "b" then let air flow over bottom lip',
    examples: ['bvumba', 'bvudzi', 'bvunza'],
    difficulty: 3
  }
}

export default function SpecialSoundsTracker({
  detectedSounds,
  targetSounds,
  word,
  onPracticeSound
}: SpecialSoundsTrackerProps) {
  const getSoundColor = (sound: string): string => {
    const colors = {
      'whistled': 'from-purple-500 to-pink-500',
      'prenasalized': 'from-blue-500 to-cyan-500', 
      'breathy': 'from-green-500 to-teal-500',
      'affricate': 'from-orange-500 to-red-500'
    }
    const soundData = SPECIAL_SOUNDS[sound]
    return soundData ? colors[soundData.type] : 'from-gray-400 to-gray-500'
  }

  const getDifficultyStars = (difficulty: number): string => {
    return '⭐'.repeat(difficulty)
  }

  const getSoundIcon = (type: string): React.ReactElement => {
    switch(type) {
      case 'whistled': return <span className="text-purple-500">🎵</span>
      case 'prenasalized': return <span className="text-blue-500">🔗</span>
      case 'breathy': return <span className="text-green-500">💨</span>
      case 'affricate': return <span className="text-orange-500">💥</span>
      default: return <span>🔊</span>
    }
  }

  const soundsInWord = targetSounds.filter(sound => word.includes(sound))
  const achievedSounds = detectedSounds.filter(sound => targetSounds.includes(sound))
  const missedSounds = targetSounds.filter(sound => !detectedSounds.includes(sound))

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-center mb-6 flex items-center justify-center">
        <FaBullseye className="mr-2 text-blue-500" />
        Special Shona Sounds
      </h3>

      {/* Overall Progress */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Progress in "{word}"</span>
          <span className="text-sm font-bold">
            {achievedSounds.length}/{targetSounds.length} sounds
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${targetSounds.length > 0 ? (achievedSounds.length / targetSounds.length) * 100 : 0}%` 
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Sounds in Current Word */}
      {soundsInWord.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-gray-700">Sounds in This Word:</h4>
          <div className="grid grid-cols-1 gap-3">
            {soundsInWord.map(sound => {
              const soundData = SPECIAL_SOUNDS[sound]
              const isAchieved = achievedSounds.includes(sound)
              
              return (
                <motion.div
                  key={sound}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isAchieved 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getSoundIcon(soundData.type)}
                        <span className="font-bold text-lg ml-2">{sound}</span>
                        <span className="ml-2 text-sm">{getDifficultyStars(soundData.difficulty)}</span>
                        {isAchieved && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-2"
                          >
                            <FaCheckCircle className="text-green-500 text-xl" />
                          </motion.div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{soundData.description}</p>
                      
                      <div className={`text-xs p-2 rounded ${
                        isAchieved ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        💡 {soundData.tip}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onPracticeSound(sound)}
                      className={`ml-4 p-2 rounded-full transition-all ${
                        isAchieved
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white`}
                      title="Practice this sound"
                    >
                      <FaVolumeUp />
                    </button>
                  </div>
                  
                  {/* Achievement Badge */}
                  {isAchieved && (
                    <motion.div
                      className="absolute -top-2 -right-2"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <FaAward className="text-yellow-500 text-2xl" />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Missed Sounds Feedback */}
      {missedSounds.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-700 mb-2">💪 Sounds to Practice:</h4>
          <div className="grid grid-cols-2 gap-2">
            {missedSounds.map(sound => (
              <button
                key={sound}
                onClick={() => onPracticeSound(sound)}
                className="p-2 bg-red-100 hover:bg-red-200 rounded text-sm font-medium text-red-700 transition-colors"
              >
                {sound} - {SPECIAL_SOUNDS[sound]?.type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sound Type Categories */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(
          Object.values(SPECIAL_SOUNDS).reduce((acc, sound) => {
            if (!acc[sound.type]) acc[sound.type] = []
            acc[sound.type].push(sound)
            return acc
          }, {} as Record<string, SpecialSound[]>)
        ).map(([type, sounds]) => {
          const achievedInType = sounds.filter(s => achievedSounds.includes(s.sound)).length
          
          return (
            <div key={type} className="p-3 rounded-lg bg-gray-50 border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {getSoundIcon(type)}
                  <span className="ml-2 text-sm font-semibold capitalize">{type}</span>
                </div>
                <span className="text-xs bg-white px-2 py-1 rounded">
                  {achievedInType}/{sounds.length}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`bg-gradient-to-r ${getSoundColor(sounds[0].sound)} h-2 rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${sounds.length > 0 ? (achievedInType / sounds.length) * 100 : 0}%` 
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Encouragement */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {achievedSounds.length === targetSounds.length && targetSounds.length > 0 ? (
          <div className="text-green-600 font-bold">
            🎉 Perfect! You mastered all special sounds in this word!
          </div>
        ) : targetSounds.length > 0 ? (
          <div className="text-blue-600">
            Keep practicing! {missedSounds.length} more sound{missedSounds.length !== 1 ? 's' : ''} to master.
          </div>
        ) : (
          <div className="text-gray-600">
            This word doesn't contain special sounds - focus on tone and basic pronunciation!
          </div>
        )}
      </motion.div>
    </div>
  )
}