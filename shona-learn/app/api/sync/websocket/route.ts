import { NextRequest } from 'next/server'
import { initializeWebSocketServer, getWebSocketServer } from './websocketManager'
import { broadcastContentUpdate, broadcastSyncStatus, getWebSocketStats, healthCheck } from './websocketUtils'
import type { ContentUpdatePayload } from './websocketManager'

// API route handler for WebSocket upgrade
export async function GET() {
  // Initialize WebSocket server if not already done
  const wss = getWebSocketServer()
  if (!wss) {
    initializeWebSocketServer()
  }

  // Return WebSocket server info
  const port = process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : 8080
  return Response.json({
    status: 'WebSocket server running',
    port,
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

// Note: WebSocket server initialization is handled lazily in the GET handler
// to avoid port binding during build time

// Export only types (this is allowed in Next.js API routes)
export type { ContentUpdatePayload }