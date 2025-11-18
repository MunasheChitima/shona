'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FaMicrophone } from 'react-icons/fa'

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition?: {
    new (): SpeechRecognition
  }
  SpeechRecognition?: {
    new (): SpeechRecognition
  }
}

export default function VoiceNavigation() {
  const router = useRouter()
  const [listening, setListening] = useState(false)

  const commands = useMemo(() => ({
    'home': '/',
    'learn': '/learn',
    'profile': '/profile',
    'next lesson': 'next',
    'previous lesson': 'previous',
    'repeat': 'repeat'
  }), [])

  const handleSpecialCommand = useCallback((command: string) => {
    switch(command) {
      case 'next':
        // Trigger next lesson
        (document.querySelector('[data-action="next-lesson"]') as HTMLElement)?.click()
        break
      case 'previous':
        // Trigger previous lesson
        (document.querySelector('[data-action="prev-lesson"]') as HTMLElement)?.click()
        break
      case 'repeat':
        // Repeat current audio
        (document.querySelector('[data-action="play-audio"]') as HTMLElement)?.click()
        break
    }
  }, [])

  useEffect(() => {
    const windowWithSR = window as unknown as WindowWithSpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return

    const SpeechRecognitionClass = windowWithSR.SpeechRecognition || windowWithSR.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase()
      
      Object.entries(commands).forEach(([key, value]) => {
        if (command.includes(key)) {
          if (value.startsWith('/')) {
            router.push(value)
          } else {
            // Handle special commands
            handleSpecialCommand(value)
          }
        }
      })
    }

    if (listening) {
      recognition.start()
    } else {
      recognition.stop()
    }

    return () => {
      recognition.stop()
    }
  }, [listening, router, handleSpecialCommand, commands])

  return (
    <button
      onClick={() => setListening(!listening)}
      className={`fixed bottom-4 right-4 p-4 rounded-full shadow-lg transition-all ${
        listening ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      <FaMicrophone className="text-white text-2xl" />
    </button>
  )
}
