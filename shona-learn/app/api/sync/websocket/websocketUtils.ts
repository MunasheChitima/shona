import { getClients, sendMessage } from './websocketManager'
import type { ContentUpdatePayload, WebSocketMessage } from './websocketManager'

// Content update broadcasting
export function broadcastContentUpdate(update: ContentUpdatePayload) {
  const message: WebSocketMessage = {
    type: 'content_update',
    payload: update,
    timestamp: Date.now()
  }

  let sentCount = 0
  const targetPlatforms = new Set(update.affectedPlatforms)
  const clients = getClients()

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
        if (getClients().has(clientId)) {
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
type SyncStatus = {
  platform?: string
  operation: 'sync_started' | 'sync_completed' | 'sync_failed'
  contentTypes: string[]
  duration?: number
  errors?: string[]
}

export function broadcastSyncStatus(status: SyncStatus) {
  const message: WebSocketMessage = {
    type: 'sync_status',
    payload: status,
    timestamp: Date.now()
  }

  let sentCount = 0
  const clients = getClients()
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
  const clients = getClients()
  const stats: {
    totalClients: number
    platformBreakdown: Record<string, number>
    versionBreakdown: Record<string, number>
    subscriptionStats: Record<string, number>
    averageHeartbeatAge: number
  } = {
    totalClients: clients.size,
    platformBreakdown: {},
    versionBreakdown: {},
    subscriptionStats: {},
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
  const healthStatus: {
    status: string
    timestamp: number
    server: {
      uptime: number
      memory: NodeJS.MemoryUsage
      connections: number
    }
    issues: string[]
  } = {
    status: 'healthy',
    timestamp: Date.now(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      connections: stats.totalClients
    },
    issues: []
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