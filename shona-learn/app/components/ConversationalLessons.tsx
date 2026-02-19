'use client'
import React, { useState } from 'react'
import { FaPlay, FaUser, FaUsers, FaBook, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

interface Dialogue {
  id: string
  title: string
  scenario: string
  conversation: Array<{
    speaker: string
    shona: string
    english: string
    pronunciation: string
  }>
}

interface Exercise {
  id: string
  type: string
  question: string
  correctAnswer: string
  options?: string[]
  explanation: string
  scenario?: string
  culturalContext?: string
  expectedResponse?: string
}

interface ConversationalLesson {
  id: string
  title: string
  description: string
  category: string
  level: string
  difficulty: string
  xpReward: number
  estimatedDuration: number
  emoji: string
  learningObjectives: string[]
  culturalNotes?: string[]
  vocabulary?: Array<{
    shona: string
    english: string
    pronunciation: string
  }>
  dialogues: Dialogue[]
  exercises: Exercise[]
}

interface ConversationalLessonsProps {
  lessons: ConversationalLesson[]
}

export default function ConversationalLessons({ lessons }: ConversationalLessonsProps) {
  const [selectedLesson, setSelectedLesson] = useState<ConversationalLesson | null>(null)
  const [currentDialogue, setCurrentDialogue] = useState<number>(0)
  const [currentExercise, setCurrentExercise] = useState<number>(0)
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState<Record<string, boolean>>({})
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())

  const handleLessonSelect = (lesson: ConversationalLesson) => {
    setSelectedLesson(lesson)
    setCurrentDialogue(0)
    setCurrentExercise(0)
    setExerciseAnswers({})
    setShowResults({})
    setCompletedExercises(new Set())
  }

  const handleExerciseSubmit = (exercise: Exercise) => {
    const isCorrect = exerciseAnswers[exercise.id] === exercise.correctAnswer
    setShowResults(prev => ({ ...prev, [exercise.id]: true }))
    
    if (isCorrect) {
      setCompletedExercises(prev => new Set([...prev, exercise.id]))
    }
  }

  const playPronunciation = (text: string) => {
    // This would integrate with a TTS service
    console.log('Playing pronunciation:', text)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🗣️ Conversational Shona Lessons
        </h2>
        <p className="text-gray-600">
          Practice real-world conversations and develop your speaking skills with interactive dialogues.
        </p>
      </div>

      {!selectedLesson ? (
        // Lesson Selection Grid
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-large transition-all duration-300 cursor-pointer hover:-translate-y-2"
              onClick={() => handleLessonSelect(lesson)}
            >
              <div className="text-4xl mb-4">{lesson.emoji}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {lesson.level}
                </span>
                <span>{lesson.estimatedDuration} min</span>
                <span>{lesson.xpReward} XP</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-500">
                  <FaUsers className="mr-2" />
                  {lesson.dialogues.length} dialogue{lesson.dialogues.length > 1 ? 's' : ''}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <FaBook className="mr-2" />
                  {lesson.exercises.length} exercise{lesson.exercises.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Selected Lesson View
        <div className="space-y-8">
          {/* Lesson Header */}
          <div className="bg-gradient-zimbabwe rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{selectedLesson.emoji}</div>
                <div>
                  <h1 className="text-2xl font-bold">{selectedLesson.title}</h1>
                  <p className="opacity-90">{selectedLesson.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors"
              >
                Back to Lessons
              </button>
            </div>
            
            {/* Learning Objectives */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Learning Objectives:</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {selectedLesson.learningObjectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
              
              {selectedLesson.culturalNotes && (
                <div>
                  <h3 className="font-semibold mb-2">Cultural Notes:</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {selectedLesson.culturalNotes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Vocabulary Section */}
          {selectedLesson.vocabulary && (
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="text-xl font-bold mb-4">📚 Key Vocabulary</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedLesson.vocabulary.map((word, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold text-flag-green">{word.shona}</span>
                      <button
                        onClick={() => playPronunciation(word.pronunciation)}
                        className="text-flag-red hover:text-flag-yellow transition-colors"
                      >
                        <FaPlay className="text-sm" />
                      </button>
                    </div>
                    <p className="text-gray-700 mb-1">{word.english}</p>
                    <p className="text-xs text-gray-500">{word.pronunciation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dialogues Section */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">🎭 Interactive Dialogues</h3>
              <div className="flex space-x-2">
                {selectedLesson.dialogues.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDialogue(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentDialogue === index ? 'bg-flag-green' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {selectedLesson.dialogues[currentDialogue] && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {selectedLesson.dialogues[currentDialogue].title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {selectedLesson.dialogues[currentDialogue].scenario}
                  </p>
                </div>

                <div className="space-y-3">
                  {selectedLesson.dialogues[currentDialogue].conversation.map((turn, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-zimbabwe rounded-full flex items-center justify-center text-white text-sm">
                        <FaUser />
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">{turn.speaker}</span>
                          <button
                            onClick={() => playPronunciation(turn.pronunciation)}
                            className="text-flag-red hover:text-flag-yellow transition-colors"
                          >
                            <FaPlay className="text-sm" />
                          </button>
                        </div>
                        <p className="text-flag-green font-semibold mb-1">{turn.shona}</p>
                        <p className="text-gray-700 mb-1">{turn.english}</p>
                        <p className="text-xs text-gray-500">{turn.pronunciation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exercises Section */}
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <h3 className="text-xl font-bold mb-4">📝 Practice Exercises</h3>
            
            <div className="space-y-6">
              {selectedLesson.exercises.map((exercise, index) => (
                <div key={exercise.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">
                      Exercise {index + 1}: {exercise.type.replace('_', ' ')}
                    </h4>
                    {completedExercises.has(exercise.id) && (
                      <FaCheckCircle className="text-green-500" />
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{exercise.question}</p>
                  
                  {exercise.options ? (
                    <div className="space-y-2 mb-3">
                      {exercise.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={exercise.id}
                            value={option}
                            checked={exerciseAnswers[exercise.id] === option}
                            onChange={(e) => setExerciseAnswers(prev => ({
                              ...prev,
                              [exercise.id]: e.target.value
                            }))}
                            className="text-flag-green"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={exerciseAnswers[exercise.id] || ''}
                      onChange={(e) => setExerciseAnswers(prev => ({
                        ...prev,
                        [exercise.id]: e.target.value
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-xl mb-3"
                      placeholder="Type your answer..."
                    />
                  )}
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleExerciseSubmit(exercise)}
                      disabled={!exerciseAnswers[exercise.id]}
                      className="bg-gradient-zimbabwe hover:bg-gradient-green text-white px-6 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                    
                    {showResults[exercise.id] && (
                      <div className="flex items-center space-x-2">
                        {exerciseAnswers[exercise.id] === exercise.correctAnswer ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaTimesCircle className="text-red-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {exerciseAnswers[exercise.id] === exercise.correctAnswer ? 'Correct!' : 'Try again'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {showResults[exercise.id] && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Explanation:</strong> {exercise.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 