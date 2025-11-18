'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaVolumeUp, FaVolumeMute, FaRotateLeft } from 'react-icons/fa';

interface VocabularyCardProps {
  shona: string;
  english: string;
  phonetic: string;
  tonePattern?: string;
  onFlip?: () => void;
  className?: string;
}

export default function VocabularyCard({
  shona,
  english,
  phonetic,
  tonePattern,
  onFlip,
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
                <h2 className="text-4xl font-bold mb-4">{english}</h2>
                
                {/* Shona word (smaller) */}
                <p className="text-xl text-green-100 mb-3">{shona}</p>
                
                {/* Phonetic pronunciation */}
                <p className="text-lg font-mono mb-3 text-green-100">{phonetic}</p>
                
                {/* Tone pattern */}
                {tonePattern && renderTonePattern(tonePattern)}
                
                {/* Flip hint */}
                <div className="mt-auto flex items-center gap-2 text-sm text-green-100">
                  <FaRotateLeft />
                  <span>Click to flip back</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

interface VocabularyWord {
  shona: string;
  english: string;
  phonetic: string;
  tonePattern?: string;
}

interface VocabularyDeckProps {
  words: VocabularyWord[];
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
        className="mb-8"
      />

      {/* Navigation */}
      <div className="flex gap-4">
        <motion.button
          onClick={previousCard}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Previous
        </motion.button>
        
        <motion.button
          onClick={() => setShowAnswer(!showAnswer)}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showAnswer ? 'Hide Answer' : 'Show Answer'}
        </motion.button>
        
        <motion.button
          onClick={nextCard}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
}
