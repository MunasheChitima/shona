import { WebSocketServer, WebSocket } from 'ws'
import { createHash } from 'crypto'
import { IncomingMessage } from 'http'

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'heartbeat' | 'content_update' | 'sync_status' | 'error'
  payload?: Record<string, unknown> | string | number | null
  clientId?: string
  contentType?: string
  version?: string
  timestamp?: number
}

export interface ContentUpdatePayload {
  contentType: string
  version: number
  hash: string
  timestamp: string
  affectedPlatforms: string[]
  updateType: 'full' | 'incremental' | 'metadata'
  priority: 'high' | 'normal' | 'low'
  [key: string]: unknown
}

interface ClientInfo {
  ws: WebSocket
  platform: string
  version: string
  lastHeartbeat: number
  subscriptions: Set<string>
}

// Global WebSocket server instance
let wss: WebSocketServer | null = null
const clients = new Map<string, ClientInfo>()

export function getWebSocketServer() {
  return wss
}

export function getClients() {
  return clients
}

// Initialize WebSocket server
export function initializeWebSocketServer() {
  if (wss) return wss

  // Use environment variable for port, fallback to 8080
  const port = process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : 8080

  wss = new WebSocketServer({ 
    port,
    perMessageDeflate: {
      zlibDeflateOptions: {
        level: 9,
        chunkSize: 1024,
      },
      zlibInflateOptions: {
        chunkSize: 1024,
      },
      threshold: 1024,
      concurrencyLimit: 10,
    },
    maxPayload: 1024 * 1024 // 1MB max payload
  })

  wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    const clientId = generateClientId()
    const url = new URL(request.url || '', `http://${request.headers.host}`)
    const platform = url.searchParams.get('platform') || 'unknown'
    const version = url.searchParams.get('version') || '0.0.0'

    console.log(`New WebSocket connection: ${clientId} (${platform} v${version})`)

    clients.set(clientId, {
      ws,
      platform,
      version,
      lastHeartbeat: Date.now(),
      subscriptions: new Set()
    })

    // Send welcome message
    sendMessage(ws, {
      type: 'sync_status',
      payload: {
        clientId,
        status: 'connected',
        serverVersion: '2.1.0',
        supportedFeatures: ['real-time-updates', 'content-streaming', 'conflict-resolution']
      },
      timestamp: Date.now()
    })

    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString())
        handleWebSocketMessage(clientId, message)
      } catch (error) {
        console.error('Invalid WebSocket message:', error)
        sendError(ws, 'Invalid message format')
      }
    })

    ws.on('close', () => {
      console.log(`WebSocket disconnected: ${clientId}`)
      clients.delete(clientId)
    })

    ws.on('error', (error: Error) => {
      console.error(`WebSocket error for ${clientId}:`, error)
      clients.delete(clientId)
    })

    // Setup heartbeat
    setupHeartbeat(clientId)
  })

  // Periodic cleanup of stale connections
  setInterval(() => {
    const now = Date.now()
    const staleThreshold = 60000 // 1 minute

    for (const [clientId, client] of clients.entries()) {
      if (now - client.lastHeartbeat > staleThreshold) {
        console.log(`Removing stale connection: ${clientId}`)
        client.ws.terminate()
        clients.delete(clientId)
      }
    }
  }, 30000) // Check every 30 seconds

  return wss
}

function generateClientId(): string {
  return createHash('sha256')
    .update(`${Date.now()}-${Math.random()}-${process.pid}`)
    .digest('hex')
    .substring(0, 16)
}

export function sendMessage(ws: WebSocket, message: WebSocketMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message))
  }
}

function sendError(ws: WebSocket, error: string) {
  sendMessage(ws, {
    type: 'error',
    payload: { error },
    timestamp: Date.now()
  })
}

function handleWebSocketMessage(clientId: string, message: WebSocketMessage) {
  const client = clients.get(clientId)
  if (!client) return

  switch (message.type) {
    case 'heartbeat':
      client.lastHeartbeat = Date.now()
      sendMessage(client.ws, {
        type: 'heartbeat',
        timestamp: Date.now()
      })
      break

    case 'subscribe':
      if (message.contentType) {
        client.subscriptions.add(message.contentType)
        sendMessage(client.ws, {
          type: 'sync_status',
          payload: {
            subscribed: message.contentType,
            totalSubscriptions: client.subscriptions.size
          },
          timestamp: Date.now()
        })
      }
      break

    case 'unsubscribe':
      if (message.contentType) {
        client.subscriptions.delete(message.contentType)
        sendMessage(client.ws, {
          type: 'sync_status',
          payload: {
            unsubscribed: message.contentType,
            totalSubscriptions: client.subscriptions.size
          },
          timestamp: Date.now()
        })
      }
      break

    default:
      sendError(client.ws, `Unknown message type: ${message.type}`)
  }
}

function setupHeartbeat(clientId: string) {
  const client = clients.get(clientId)
  if (!client) return

  const heartbeatInterval = setInterval(() => {
    const currentClient = clients.get(clientId)
    if (!currentClient) {
      clearInterval(heartbeatInterval)
      return
    }

    const now = Date.now()
    if (now - currentClient.lastHeartbeat > 30000) { // 30 seconds timeout
      console.log(`Heartbeat timeout for ${clientId}`)
      currentClient.ws.terminate()
      clients.delete(clientId)
      clearInterval(heartbeatInterval)
    } else {
      sendMessage(currentClient.ws, {
        type: 'heartbeat',
        timestamp: now
      })
    }
  }, 15000) // Send heartbeat every 15 seconds
} 