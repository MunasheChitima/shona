'use client'
import { useState } from 'react'

export default function SimplePage() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Simple Test Page</h1>
        <p className="text-lg text-gray-600 mb-4">This is a simple test page with no external dependencies.</p>
        <button 
          onClick={() => setCount(count + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Click me ({count})
        </button>
      </div>
    </div>
  )
} 