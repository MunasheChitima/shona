'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaMicrophone } from 'react-icons/fa'

export default function VoiceNavigation() {
  const router = useRouter()
  const [listening, setListening] = useState(false)

  const commands = {
    'home': '/',
    'learn': '/learn',
    'profile': '/profile',
    'next lesson': 'next',
    'previous lesson': 'previous',
    'repeat': 'repeat'
  }

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
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
  }, [listening])

  const handleSpecialCommand = (command: string) => {
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
  }

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