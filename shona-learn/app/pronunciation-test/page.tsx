'use client'

import { useState } from 'react'
import TextToSpeech from '@/app/components/voice/TextToSpeech'
import ShonaPronunciationService from '@/lib/services/ShonaPronunciationService'
import { pronunciationDictionary, specialSoundTypes } from '@/lib/data/shonaPronunciationDictionary'

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
  const [selectedCategory, setSelectedCategory] = useState<string>('common')
  const [useElevenLabs, setUseElevenLabs] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string>('')
  const pronunciationService = ShonaPronunciationService.getInstance()

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
        <h1 className="text-4xl font-bold text-center mb-8">Shona Pronunciation Test</h1>
        
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
          <h2 className="text-xl font-semibold mb-4">Select a Word</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wordsBySpecialSound[selectedCategory as keyof typeof wordsBySpecialSound]?.map(word => {
              const details = getWordDetails(word)
              if (!details) return null
              
              return (
                <button
                  key={word}
                  onClick={() => setSelectedWord(word)}
                  className={`p-4 rounded-lg border-2 transition hover:shadow-md ${
                    selectedWord === word
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-lg">{word}</div>
                  <div className="text-sm text-gray-600">{details.english}</div>
                  {details.specialSounds.length > 0 && (
                    <div className="mt-1">
                      {details.specialSounds.map((sound, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded mr-1 mt-1"
                        >
                          {sound.token}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
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
                  <h2 className="text-2xl font-bold mb-4">{selectedWord}</h2>
                  
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

                  {details.specialSounds.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-2">Special Pronunciation Notes</h3>
                      <div className="space-y-2">
                        {details.specialSounds.map((sound, idx) => (
                          <div key={idx} className="p-3 bg-yellow-50 rounded-lg">
                            <span className="font-mono font-bold text-yellow-900">{sound.token}</span>
                            <span className="text-yellow-800 ml-2">({sound.type})</span>
                            <p className="text-sm text-yellow-700 mt-1">{sound.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">How to Use This Test</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-900">
            <li>Select a sound category to focus on specific Shona pronunciation challenges</li>
            <li>Choose a word from the grid to see its detailed pronunciation information</li>
            <li>Use the audio playback to hear the correct pronunciation</li>
            <li>Toggle between Browser TTS and ElevenLabs to compare pronunciation quality</li>
            <li>Pay special attention to the highlighted special sounds (sv, zv, mb, nd, etc.)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}