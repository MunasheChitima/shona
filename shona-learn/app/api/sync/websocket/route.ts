import { NextRequest } from 'next/server'
import { WebSocketServer } from 'ws'
import { createHash } from 'crypto'

// Global WebSocket server instance
let wss: WebSocketServer | null = null
const clients = new Map<string, {
  ws: any,
  platform: string,
  version: string,
  lastHeartbeat: number,
  subscriptions: Set<string>
}>()

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'heartbeat' | 'content_update' | 'sync_status' | 'error'
  payload?: any
  clientId?: string
  contentType?: string
  version?: string
  timestamp?: number
}

interface ContentUpdatePayload {
  contentType: string
  version: number
  hash: string
  timestamp: string
  affectedPlatforms: string[]
  updateType: 'full' | 'incremental' | 'metadata'
  priority: 'high' | 'normal' | 'low'
}

// Initialize WebSocket server
function initializeWebSocketServer() {
  if (wss) return wss

  wss = new WebSocketServer({ 
    port: 8080,
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

  wss.on('connection', (ws, request) => {
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

    ws.on('message', (data) => {
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

    ws.on('error', (error) => {
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

function sendMessage(ws: any, message: WebSocketMessage) {
  if (ws.readyState === 1) { // WebSocket.OPEN
    ws.send(JSON.stringify(message))
  }
}

function sendError(ws: any, error: string) {
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

// Content update broadcasting
export function broadcastContentUpdate(update: ContentUpdatePayload) {
  const message: WebSocketMessage = {
    type: 'content_update',
    payload: update,
    timestamp: Date.now()
  }

  let sentCount = 0
  const targetPlatforms = new Set(update.affectedPlatforms)

  for (const [clientId, client] of clients.entries()) {
    // Check if client's platform is affected
    if (targetPlatforms.size > 0 && !targetPlatforms.has(client.platform)) {
      continue
    }

    // Check if client is subscribed to this content type
    if (client.subscriptions.size > 0 && !client.subscriptions.has(update.contentType)) {
      continue
    }

    // Send priority updates immediately, queue others
    if (update.priority === 'high') {
      sendMessage(client.ws, message)
      sentCount++
    } else {
      // For normal/low priority, batch and send after a short delay
      setTimeout(() => {
        if (clients.has(clientId)) {
          sendMessage(client.ws, message)
        }
      }, update.priority === 'normal' ? 1000 : 5000)
      sentCount++
    }
  }

  console.log(`Broadcast content update (${update.contentType}) to ${sentCount} clients`)
  return sentCount
}

// Sync status broadcasting
export function broadcastSyncStatus(status: {
  platform?: string
  operation: 'sync_started' | 'sync_completed' | 'sync_failed'
  contentTypes: string[]
  duration?: number
  errors?: string[]
}) {
  const message: WebSocketMessage = {
    type: 'sync_status',
    payload: status,
    timestamp: Date.now()
  }

  let sentCount = 0
  for (const [clientId, client] of clients.entries()) {
    if (status.platform && client.platform !== status.platform) {
      continue
    }

    sendMessage(client.ws, message)
    sentCount++
  }

  console.log(`Broadcast sync status to ${sentCount} clients`)
  return sentCount
}

// Get connected clients stats
export function getWebSocketStats() {
  const stats = {
    totalClients: clients.size,
    platformBreakdown: {} as Record<string, number>,
    versionBreakdown: {} as Record<string, number>,
    subscriptionStats: {} as Record<string, number>,
    averageHeartbeatAge: 0
  }

  let totalHeartbeatAge = 0
  const now = Date.now()

  for (const client of clients.values()) {
    // Platform breakdown
    stats.platformBreakdown[client.platform] = (stats.platformBreakdown[client.platform] || 0) + 1
    
    // Version breakdown
    stats.versionBreakdown[client.version] = (stats.versionBreakdown[client.version] || 0) + 1
    
    // Subscription stats
    for (const subscription of client.subscriptions) {
      stats.subscriptionStats[subscription] = (stats.subscriptionStats[subscription] || 0) + 1
    }
    
    // Heartbeat age
    totalHeartbeatAge += now - client.lastHeartbeat
  }

  stats.averageHeartbeatAge = clients.size > 0 ? totalHeartbeatAge / clients.size : 0

  return stats
}

// WebSocket health check
export function healthCheck() {
  const stats = getWebSocketStats()
  const healthStatus = {
    status: 'healthy',
    timestamp: Date.now(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      connections: stats.totalClients
    },
    issues: [] as string[]
  }

  // Check for potential issues
  if (stats.totalClients === 0) {
    healthStatus.issues.push('No active connections')
  }

  if (stats.averageHeartbeatAge > 30000) {
    healthStatus.issues.push('High average heartbeat age')
  }

  const memoryUsage = process.memoryUsage()
  if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
    healthStatus.issues.push('High memory usage')
  }

  if (healthStatus.issues.length > 0) {
    healthStatus.status = 'degraded'
  }

  return healthStatus
}

// API route handler for WebSocket upgrade
export async function GET(request: NextRequest) {
  // Initialize WebSocket server if not already done
  if (!wss) {
    initializeWebSocketServer()
  }

  // Return WebSocket server info
  return Response.json({
    status: 'WebSocket server running',
    port: 8080,
    stats: getWebSocketStats(),
    health: healthCheck()
  })
}

// For manual content updates (called from admin dashboard)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'broadcast_update') {
      const update: ContentUpdatePayload = body.update
      const sentCount = broadcastContentUpdate(update)
      
      return Response.json({
        success: true,
        message: `Content update broadcasted to ${sentCount} clients`,
        update
      })
    }
    
    if (body.action === 'broadcast_sync_status') {
      const status = body.status
      const sentCount = broadcastSyncStatus(status)
      
      return Response.json({
        success: true,
        message: `Sync status broadcasted to ${sentCount} clients`,
        status
      })
    }
    
    return Response.json({ error: 'Unknown action' }, { status: 400 })
    
  } catch (error) {
    console.error('WebSocket API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Initialize WebSocket server on module load
if (typeof window === 'undefined') {
  initializeWebSocketServer()
}