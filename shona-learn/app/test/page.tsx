'use client'
import { useState, useEffect } from 'react'

export default function TestPage() {
  const [count, setCount] = useState(0)
  const [message, setMessage] = useState('Initial message')

  useEffect(() => {
    console.log('Test page mounted')
    setMessage('Component mounted successfully!')
  }, [])

  const handleClick = () => {
    console.log('Button clicked')
    setCount(count + 1)
    setMessage(`Button clicked ${count + 1} times`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Test Page</h1>
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