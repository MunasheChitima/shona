'use client'
import { useState } from 'react'

export default function AlternativePage() {
  const [message, setMessage] = useState('Initial message')

  const handleClick = () => {
    console.log('Button clicked')
    setMessage('Button clicked!')
  }

  const handleLoad = () => {
    console.log('Page loaded')
    setMessage('Page loaded!')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Alternative Test Page</h1>
        <p className="text-lg text-gray-600 mb-4">{message}</p>
        <button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Click me
        </button>
        <button 
          onClick={handleLoad}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Simulate Load
        </button>
      </div>
    </div>
  )
} 