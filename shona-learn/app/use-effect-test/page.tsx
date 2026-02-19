'use client'
import { useState, useEffect } from 'react'

export default function UseEffectTestPage() {
  const [message, setMessage] = useState('Initial message')
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log('useEffect executed')
    setMessage('useEffect has been executed!')
  }, [])

  const handleClick = () => {
    console.log('Button clicked')
    setCount(count + 1)
    setMessage(`Button clicked ${count + 1} times`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">useEffect Test Page</h1>
        <p className="text-lg text-gray-600 mb-4">{message}</p>
        <button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Click me ({count})
        </button>
      </div>
    </div>
  )
} 