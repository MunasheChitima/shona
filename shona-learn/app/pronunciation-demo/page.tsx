'use client';

import React, { useState } from 'react';
import AdvancedPronunciationPractice from '../components/voice/AdvancedPronunciationPractice';

const demoWords = [
  {
    word: 'mbira',
    translation: 'thumb piano',
    phonetic: 'MBEE-rah',
    tonePattern: 'HL',
    category: 'Prenasalized Consonants'
  },
  {
    word: 'svika',
    translation: 'arrive',
    phonetic: 'SVEE-kah',
    tonePattern: 'HL',
    category: 'Whistled Sibilants'
  },
  {
    word: 'bhuku',
    translation: 'book',
    phonetic: 'BHOO-koo',
    tonePattern: 'HL',
    category: 'Breathy-Voiced'
  },
  {
    word: 'tsva',
    translation: 'new',
    phonetic: 'TSVAH',
    tonePattern: 'H',
    category: 'Affricates'
  },
  {
    word: 'ndimi',
    translation: 'you (plural)',
    phonetic: 'NDEE-mee',
    tonePattern: 'HL',
    category: 'Prenasalized Consonants'
  }
];

export default function PronunciationDemo() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<string[][]>([]);

  const currentWord = demoWords[currentWordIndex];

  const handleComplete = (score: number, feedback: string[]) => {
    const newScores = [...scores];
    const newFeedback = [...feedbackHistory];
    
    newScores[currentWordIndex] = score;
    newFeedback[currentWordIndex] = feedback;
    
    setScores(newScores);
    setFeedbackHistory(newFeedback);
  };

  const nextWord = () => {
    if (currentWordIndex < demoWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const previousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  const getAverageScore = () => {
    const validScores = scores.filter(score => score !== undefined);
    if (validScores.length === 0) return 0;
    return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Muturikiri AI Pronunciation Analysis
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Advanced Shona pronunciation feedback powered by AI
          </p>
          
          {/* Progress indicator */}
          <div className="flex justify-center items-center gap-4 mb-6">
            <span className="text-sm text-gray-600">
              Word {currentWordIndex + 1} of {demoWords.length}
            </span>
            <div className="flex gap-2">
              {demoWords.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentWordIndex
                      ? 'bg-blue-500'
                      : scores[index] !== undefined
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Average score */}
          {scores.some(score => score !== undefined) && (
            <div className="bg-white rounded-lg p-4 shadow-md inline-block">
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-2xl font-bold text-blue-600">{getAverageScore()}%</p>
            </div>
          )}
        </div>

        {/* Word category indicator */}
        <div className="text-center mb-6">
          <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            {currentWord.category}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={previousWord}
            disabled={currentWordIndex === 0}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={nextWord}
            disabled={currentWordIndex === demoWords.length - 1}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {/* Pronunciation practice component */}
        <AdvancedPronunciationPractice
          word={currentWord.word}
          translation={currentWord.translation}
          phonetic={currentWord.phonetic}
          tonePattern={currentWord.tonePattern}
          onComplete={handleComplete}
        />

        {/* Word list */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">All Words</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoWords.map((word, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg p-4 shadow-md cursor-pointer transition-all ${
                  index === currentWordIndex
                    ? 'ring-2 ring-blue-500'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setCurrentWordIndex(index)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{word.word}</h3>
                  {scores[index] !== undefined && (
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                      scores[index] >= 80 ? 'bg-green-100 text-green-800' :
                      scores[index] >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {scores[index]}%
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-1">{word.translation}</p>
                <p className="text-blue-600 font-mono text-sm">{word.phonetic}</p>
                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mt-2">
                  {word.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">🎯 Step 1: Listen</h3>
              <p className="text-gray-600">
                Click the play button to hear the correct pronunciation of the word.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🎤 Step 2: Record</h3>
              <p className="text-gray-600">
                Click "Start Recording" and pronounce the word clearly into your microphone.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔍 Step 3: Analyze</h3>
              <p className="text-gray-600">
                Click "Analyze Pronunciation" to get detailed feedback on your pronunciation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📊 Step 4: Review</h3>
              <p className="text-gray-600">
                Review your score and specific feedback for each sound in the word.
              </p>
            </div>
          </div>
        </div>

        {/* Technical details */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">About Muturikiri AI</h2>
          <p className="text-gray-700 mb-4">
            This pronunciation analysis system uses advanced AI to provide detailed feedback on Shona pronunciation. 
            It analyzes specific phonetic features including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Implosives (b, d):</strong> Detects glottalic ingressive airstreams</li>
            <li><strong>Breathy-voiced sounds (bh, dh):</strong> Analyzes breathy voice murmur and tone-depressing effects</li>
            <li><strong>Whistled sibilants (sv, zv):</strong> Evaluates high-frequency whistled fricatives</li>
            <li><strong>Tone patterns:</strong> Checks for correct high and low tones</li>
            <li><strong>Vowel quality:</strong> Ensures pure vowel sounds without diphthongization</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 