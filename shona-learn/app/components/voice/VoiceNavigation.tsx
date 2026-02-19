'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaMicrophone } from 'react-icons/fa'

export default function VoiceNavigation() {
  const router = useRouter()
  const [listening, setListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  const commands = {
    'home': '/',
    'learn': '/learn',
    'profile': '/profile',
    'next lesson': 'next',
    'previous lesson': 'previous',
    'repeat': 'repeat'
  }

  useEffect(() => {
    // Check if speech recognition is supported
    const checkSupport = () => {
      if (typeof window !== 'undefined') {
        const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
        setIsSupported(supported)
        return supported
      }
      return false
    }

    const supported = checkSupport()
    if (!supported) return

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition
      recognition.continuous = true
      recognition.interimResults = false

      recognition.onresult = (event: any) => {
        try {
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
        } catch (error) {
          console.error('Error processing speech result:', error)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setListening(false)
      }

      recognition.onend = () => {
        setListening(false)
      }

      if (listening) {
        recognition.start()
      } else {
        recognition.stop()
      }
    } catch (error) {
      console.error('Error initializing speech recognition:', error)
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.error('Error stopping speech recognition:', error)
        }
        recognitionRef.current = null
      }
    }
  }, [listening, router])

  const handleSpecialCommand = (command: string) => {
    try {
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
    } catch (error) {
      console.error('Error handling special command:', error)
    }
  }

  // Don't render if speech recognition is not supported
  if (!isSupported) {
    return null
  }

  return (
    <button
      onClick={() => setListening(!listening)}
      className={`fixed bottom-4 right-4 p-4 rounded-full shadow-lg transition-all ${
        listening ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
      }`}
      title="Voice Navigation"
    >
      <FaMicrophone className="text-white text-2xl" />
    </button>
  )
} 