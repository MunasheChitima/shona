'use client'
import { useState, useEffect } from 'react'

export default function NoLayoutPage() {
  const [message, setMessage] = useState('Initial message')

  useEffect(() => {
    console.log('NoLayoutPage useEffect executed')
    setMessage('useEffect has been executed!')
  }, [])

  return (
    <html>
      <head>
        <title>No Layout Test</title>
      </head>
      <body>
        <div style={{ padding: '20px' }}>
          <h1>No Layout Test Page</h1>
          <p>{message}</p>
        </div>
      </body>
    </html>
  )
} 