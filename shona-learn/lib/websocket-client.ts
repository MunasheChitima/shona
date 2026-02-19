'use client'

interface WebSocketMessage {
  type: string
  payload?: any
  timestamp?: number
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private listeners: Map<string, ((data: any) => void)[]> = new Map()

  constructor(url: string) {
    this.url = url
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Don't connect if we're already connected
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          resolve()
          return
        }

        // Use environment variable or fallback
        const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || this.url
        
        // Don't try to connect in SSR
        if (typeof window === 'undefined') {
          resolve()
          return
        }

        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.stopHeartbeat()
          this.attemptReconnect()
        }
      } catch (error) {
        console.error('Failed to create WebSocket:', error)
        reject(error)
      }
    })
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type) || []
    listeners.forEach(listener => listener(message.payload))

    // Handle specific message types
    switch (message.type) {
      case 'sync_status':
        console.log('Sync status:', message.payload)
        break
      case 'content_update':
        console.log('Content update:', message.payload)
        break
      case 'error':
        console.error('Server error:', message.payload)
        break
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('heartbeat', { timestamp: Date.now() })
      }
    }, 30000) // 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.connect().catch(console.error)
    }, delay)
  }

  send(type: string, payload?: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected')
      return
    }

    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now()
    }

    this.ws.send(JSON.stringify(message))
  }

  subscribe(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(callback)
  }

  unsubscribe(type: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(type) || []
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient('ws://localhost:8080')
  }
  return wsClient
}

export function initializeWebSocket() {
  if (typeof window !== 'undefined') {
    const client = getWebSocketClient()
    client.connect().catch(console.error)
  }
} 