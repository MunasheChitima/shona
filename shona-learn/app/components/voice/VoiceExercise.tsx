'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import PronunciationPractice from './PronunciationPractice'

interface Word {
  shona: string
  english: string
  phonetic: string
  tonePattern?: string
}

interface ExerciseContent {
  words?: Word[]
}

interface VoiceExerciseProps {
  exercise: {
    id: string
    type: 'pronunciation' | 'conversation' | 'listening'
    content: ExerciseContent
  }
  onComplete: (score: number) => void
}

export default function VoiceExercise({ exercise, onComplete }: VoiceExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [scores, setScores] = useState<number[]>([])

  const handleStepComplete = (score: number) => {
    setScores([...scores, score])
    
    if (exercise.type === 'pronunciation' && exercise.content.words) {
      if (currentStep < exercise.content.words.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        // Calculate average score
        const avgScore = [...scores, score].reduce((a, b) => a + b, 0) / (scores.length + 1)
        onComplete(Math.round(avgScore))
      }
    } else {
      onComplete(score)
    }
  }

  const renderExercise = () => {
    switch (exercise.type) {
      case 'pronunciation':
        if (exercise.content.words && exercise.content.words[currentStep]) {
          const word = exercise.content.words[currentStep]
          return (
            <PronunciationPractice
              word={word.shona}
              translation={word.english}
              phonetic={word.phonetic}
              tonePattern={word.tonePattern}
              onComplete={handleStepComplete}
            />
          )
        }
        break
      
      case 'conversation':
        return (
          <div className="text-center p-8">
            <h3 className="text-xl font-bold mb-4">Conversation Practice</h3>
            <p className="text-gray-600">Conversation exercises coming soon!</p>
            <button 
              onClick={() => onComplete(85)}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Complete Exercise
            </button>
          </div>
        )
      
      case 'listening':
        return (
          <div className="text-center p-8">
            <h3 className="text-xl font-bold mb-4">Listening Exercise</h3>
            <p className="text-gray-600">Listening exercises coming soon!</p>
            <button 
              onClick={() => onComplete(85)}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Complete Exercise
            </button>
          </div>
        )
      
      default:
        return <div>Unknown exercise type</div>
    }
  }

  return (
    <div>
      {/* Progress indicator for multi-word exercises */}
      {exercise.type === 'pronunciation' && exercise.content.words && exercise.content.words.length > 1 && (
        <div className="mb-6">
          <div className="flex justify-center space-x-2">
            {exercise.content.words.map((_, index: number) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index < currentStep ? 'bg-green-500' :
                  index === currentStep ? 'bg-blue-500' :
                  'bg-gray-300'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Word {currentStep + 1} of {exercise.content.words.length}
          </p>
        </div>
      )}
      
      {renderExercise()}
    </div>
  )
}
