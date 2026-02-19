'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVolumeUp, FaVolumeMute, FaRedo } from 'react-icons/fa';

interface VocabularyCardProps {
  shona: string;
  english: string;
  phonetic: string;
  tonePattern?: string;
  onFlip?: () => void;
  showAnswer?: boolean;
  className?: string;
}

export default function VocabularyCard({
  shona,
  english,
  phonetic,
  tonePattern,
  onFlip,
  showAnswer = false,
  className = ''
}: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = (text: string) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  const renderTonePattern = (pattern: string) => {
    return (
      <div className="flex items-center gap-1 mb-3">
        <span className="text-sm text-gray-500">Tone:</span>
        <div className="flex gap-1">
          {pattern.split('').map((tone, index) => (
            <div
              key={index}
              className={`w-4 h-2 rounded-sm ${
                tone === 'H' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              title={tone === 'H' ? 'High tone' : 'Low tone'}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative w-full h-64 cursor-pointer perspective-1000"
        onClick={handleFlip}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            // Front of card - Shona word
            <motion.div
              key="front"
              className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white"
              initial={{ rotateY: -180 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: 180 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="h-full flex flex-col justify-center items-center text-center">
                {/* Audio button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(shona);
                    }}
                    disabled={isPlaying}
                    className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50"
                    title="Listen to pronunciation"
                  >
                    {isPlaying ? (
                      <FaVolumeMute className="text-white text-sm" />
                    ) : (
                      <FaVolumeUp className="text-white text-sm" />
                    )}
                  </button>
                </div>

                {/* Shona word */}
                <h2 className="text-4xl font-bold mb-4">{shona}</h2>
                
                {/* Phonetic pronunciation */}
                <p className="text-xl font-mono mb-3 text-blue-100">{phonetic}</p>
                
                {/* Tone pattern */}
                {tonePattern && renderTonePattern(tonePattern)}
                
                {/* Hint */}
                <p className="text-sm text-blue-100 mt-auto">
                  Click to see translation
                </p>
              </div>
            </motion.div>
          ) : (
            // Back of card - English translation
            <motion.div
              key="back"
              className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white"
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: -180 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="h-full flex flex-col justify-center items-center text-center">
                {/* Audio button */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(shona);
                    }}
                    disabled={isPlaying}
                    className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-50"
                    title="Listen to pronunciation"
                  >
                    {isPlaying ? (
                      <FaVolumeMute className="text-white text-sm" />
                    ) : (
                      <FaVolumeUp className="text-white text-sm" />
                    )}
                  </button>
                </div>

                {/* English translation */}
                <h2 className="text-3xl font-bold mb-4">{english}</h2>
                
                {/* Shona word (smaller) */}
                <p className="text-lg text-green-100 mb-2">{shona}</p>
                
                {/* Phonetic pronunciation */}
                <p className="text-lg font-mono mb-3 text-green-100">{phonetic}</p>
                
                {/* Tone pattern */}
                {tonePattern && renderTonePattern(tonePattern)}
                
                {/* Flip back hint */}
                <p className="text-sm text-green-100 mt-auto">
                  Click to see Shona word
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Flip indicator */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <motion.button
          onClick={handleFlip}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaRedo className="text-gray-600" />
          <span className="text-gray-700">
            {isFlipped ? 'Show Shona' : 'Show English'}
          </span>
        </motion.button>
      </div>
    </div>
  );
}

// Flash card deck component
interface VocabularyDeckProps {
  words: Array<{
    shona: string;
    english: string;
    phonetic: string;
    tonePattern?: string;
  }>;
  className?: string;
}

export function VocabularyDeck({ words, className = '' }: VocabularyDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % words.length);
    setShowAnswer(false);
  };

  const previousCard = () => {
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
    setShowAnswer(false);
  };

  const currentWord = words[currentIndex];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Progress indicator */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Card {currentIndex + 1} of {words.length}
        </p>
        <div className="flex gap-1">
          {words.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Current card */}
      <VocabularyCard
        shona={currentWord.shona}
        english={currentWord.english}
        phonetic={currentWord.phonetic}
        tonePattern={currentWord.tonePattern}
        showAnswer={showAnswer}
        className="mb-8"
      />

      {/* Navigation */}
      <div className="flex gap-4">
        <motion.button
          onClick={previousCard}
          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Previous
        </motion.button>
        <motion.button
          onClick={nextCard}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
} 