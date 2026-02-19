'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AUDIO_ENABLED } from '@/lib/featureFlags'
import { FaArrowLeft } from 'react-icons/fa'
import TextToSpeech from '@/app/components/voice/TextToSpeech'
import ToneMeter from '@/app/components/voice/ToneMeter'
import ShonaPronunciationService from '@/lib/services/ShonaPronunciationService'
import { pronunciationDictionary, specialSoundTypes } from '@/lib/data/shonaPronunciationDictionary'
import PronunciationText, { PronunciationTextCompact } from '@/app/components/shared/PronunciationText'

// Group words by special sound type for testing
const wordsBySpecialSound = {
  whistled: ['svika', 'zvino', 'zvakanaka', 'svondo', 'svikiro', 'hanzvadzi'],
  prenasalized: ['mbira', 'ndimi', 'ngoma', 'ndatenda', 'gumbo', 'mangwanani'],
  breathy: ['bhazi', 'bhuku', 'mhino', 'mhepo', 'ivhu', 'muvhuro'],
  labialized: ['mwana', 'rwizi', 'mwedzi', 'mangwanani'],
  palatalized: ['kudya', 'nyama', 'nyeredzi', 'manheru', 'kunyora'],
  affricate: ['sadza', 'kudzidza', 'mudzimu', 'chikoro', 'chitima'],
  common: ['baba', 'amai', 'moyo', 'zuva', 'mvura', 'muti']
}

export default function PronunciationTestPage() {
  const router = useRouter()
  useEffect(() => {
    if (!AUDIO_ENABLED) {
      router.replace('/')
    }
  }, [router])
  const [selectedCategory, setSelectedCategory] = useState<string>('common')
  const [useElevenLabs, setUseElevenLabs] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string>('')
  const pronunciationService = ShonaPronunciationService.getInstance()

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const getWordDetails = (word: string) => {
    const entry = pronunciationDictionary.find(e => e.word === word)
    if (!entry) return null

    const specialSounds = pronunciationService.getSpecialSounds(word)
    const phoneticHint = pronunciationService.getPhonetic(word)
    const ipa = pronunciationService.toIPA(word)
    const cmu = pronunciationService.toCMU(word)

    return {
      ...entry,
      specialSounds,
      phoneticHint,
      ipa,
      cmu
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl shadow-md transition-colors border border-gray-200"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Shona Pronunciation Test
          </h1>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
        
        {/* TTS Engine Toggle */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Text-to-Speech Engine</h2>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useElevenLabs}
                onChange={(e) => setUseElevenLabs(e.target.checked)}
                className="sr-only"
              />
              <div className="relative">
                <div className={`block w-14 h-8 rounded-full ${useElevenLabs ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${useElevenLabs ? 'transform translate-x-6' : ''}`}></div>
              </div>
              <span className="ml-3 text-gray-700">{useElevenLabs ? 'ElevenLabs' : 'Browser TTS'}</span>
            </label>
          </div>
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Sound Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(specialSoundTypes).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedCategory === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {value.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedCategory('common')}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === 'common'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Common Words
            </button>
          </div>
          {selectedCategory !== 'common' && specialSoundTypes[selectedCategory as keyof typeof specialSoundTypes] && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>{specialSoundTypes[selectedCategory as keyof typeof specialSoundTypes].name}:</strong>{' '}
                {specialSoundTypes[selectedCategory as keyof typeof specialSoundTypes].description}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Examples: {specialSoundTypes[selectedCategory as keyof typeof specialSoundTypes].examples.join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Word Grid */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Practice Words</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wordsBySpecialSound[selectedCategory as keyof typeof wordsBySpecialSound]?.map((word) => (
              <button
                key={word}
                onClick={() => setSelectedWord(word)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedWord === word
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <PronunciationTextCompact
                  word={word}
                  pronunciation={getWordDetails(word)?.phoneticHint || word}
                  audioFile={undefined}
                  className="text-center"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Selected Word Details */}
        {selectedWord && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {(() => {
              const details = getWordDetails(selectedWord)
              if (!details) return null

              return (
                <>
                  <PronunciationText
                    word={selectedWord}
                    pronunciation={details.phoneticHint || selectedWord}
                    phonetic={details.ipa}
                    syllables={details.syllables?.join(' · ')}
                    audioFile={undefined}
                    size="large"
                    showDetails={true}
                    className="mb-6"
                  />
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold mb-2">Pronunciation Details</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>English:</strong> {details.english}</div>
                        <div><strong>IPA:</strong> <span className="font-mono">{details.ipa}</span></div>
                        <div><strong>CMU:</strong> <span className="font-mono">{details.cmu}</span></div>
                        <div><strong>Phonetic:</strong> <span className="font-mono">{details.phoneticHint}</span></div>
                        {details.syllables && (
                          <div><strong>Syllables:</strong> {details.syllables.join(' · ')}</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Audio Playback</h3>
                      <TextToSpeech
                        text={selectedWord}
                        phonetic={details.phoneticHint}
                        useElevenLabs={useElevenLabs}
                        rate={0.8}
                      />
                    </div>
                  </div>
                  
                  {details.specialSounds && details.specialSounds.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Special Sounds</h3>
                      <div className="space-y-2">
                        {details.specialSounds.map((sound, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{sound.token}</span>
                            <span className="text-sm text-gray-600">{sound.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {details.tonePattern && (
                    <div>
                      <h3 className="font-semibold mb-2">Tone Pattern</h3>
                      <ToneMeter pattern={details.tonePattern} word={selectedWord} />
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}