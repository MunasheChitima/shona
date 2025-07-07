// Service Worker for Shona Learning App
// Handles offline audio caching, background sync, and PWA functionality

const CACHE_NAME = 'shona-audio-v2'
const AUDIO_CACHE_NAME = 'shona-audio-files-v2'
const STATIC_CACHE_NAME = 'shona-static-v2'

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/learn',
  '/flashcards', 
  '/pronunciation-test',
  '/manifest.json',
  '/offline.html'
]

// Audio file patterns
const AUDIO_PATTERNS = [
  /\/api\/audio\/.+/,
  /\/content\/audio\/.+/,
  /\.mp3$/,
  /\.opus$/,
  /\.ogg$/,
  /\.wav$/
]

// Install event - cache static resources
self.addEventListener('install', event => {
  console.log('[SW] Install event')
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[SW] Caching static resources')
        return cache.addAll(STATIC_RESOURCES)
      }),
      
      // Initialize audio cache
      caches.open(AUDIO_CACHE_NAME).then(cache => {
        console.log('[SW] Audio cache initialized')
        return cache
      })
    ])
  )
  
  // Take control immediately
  self.skipWaiting()
})

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activate event')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== AUDIO_CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  )
})

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle audio requests
  if (isAudioRequest(request)) {
    event.respondWith(handleAudioRequest(request))
    return
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle static resources
  event.respondWith(handleStaticRequest(request))
})

// Check if request is for audio content
function isAudioRequest(request) {
  const url = new URL(request.url)
  return AUDIO_PATTERNS.some(pattern => pattern.test(url.pathname)) ||
         request.headers.get('accept')?.includes('audio/')
}

// Handle audio requests with cache-first strategy
async function handleAudioRequest(request) {
  const cache = await caches.open(AUDIO_CACHE_NAME)
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      console.log('[SW] Audio cache hit:', request.url)
      
      // Update access time in background
      updateAudioAccessTime(request.url)
      
      return cachedResponse
    }
    
    // Fetch from network
    console.log('[SW] Audio cache miss, fetching:', request.url)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache the response for future use
      const responseClone = networkResponse.clone()
      cache.put(request, responseClone)
      
      // Track download metrics
      trackAudioDownload(request.url, 'success', networkResponse.headers.get('content-length'))
    }
    
    return networkResponse
    
  } catch (error) {
    console.error('[SW] Audio request failed:', error)
    
    // Track error
    trackAudioDownload(request.url, 'error', 0)
    
    // Return offline fallback if available
    const offlineAudio = await cache.match('/audio/offline-placeholder.mp3')
    if (offlineAudio) {
      return offlineAudio
    }
    
    // Return error response
    return new Response('Audio unavailable offline', { 
      status: 503,
      statusText: 'Service Unavailable' 
    })
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses for some endpoints
    if (networkResponse.ok && isCacheableApiRequest(request)) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[SW] Network failed for API request, trying cache')
    
    // Fallback to cache
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response
    return new Response(JSON.stringify({
      error: 'Offline - data not available',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME)
  
  try {
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match('/offline.html')
      if (offlinePage) {
        return offlinePage
      }
    }
    
    throw error
  }
}

// Check if API request should be cached
function isCacheableApiRequest(request) {
  const url = new URL(request.url)
  const cacheableEndpoints = [
    '/api/vocabulary',
    '/api/lessons',
    '/api/audio/priority',
    '/api/cultural-context'
  ]
  
  return cacheableEndpoints.some(endpoint => url.pathname.startsWith(endpoint))
}

// Background sync for audio downloads
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'audio-sync') {
    event.waitUntil(syncAudioDownloads())
  } else if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics())
  }
})

// Sync pending audio downloads
async function syncAudioDownloads() {
  try {
    console.log('[SW] Syncing audio downloads')
    
    // Get pending downloads from IndexedDB
    const pendingDownloads = await getPendingDownloads()
    
    for (const download of pendingDownloads) {
      try {
        const response = await fetch(download.url)
        if (response.ok) {
          const cache = await caches.open(AUDIO_CACHE_NAME)
          await cache.put(download.url, response)
          
          // Remove from pending
          await removePendingDownload(download.id)
          
          console.log('[SW] Synced audio:', download.url)
        }
      } catch (error) {
        console.error('[SW] Failed to sync audio:', download.url, error)
      }
    }
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Sync analytics data
async function syncAnalytics() {
  try {
    console.log('[SW] Syncing analytics data')
    
    const analytics = await getLocalAnalytics()
    if (analytics.length > 0) {
      const response = await fetch('/api/analytics/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analytics)
      })
      
      if (response.ok) {
        await clearLocalAnalytics()
        console.log('[SW] Analytics synced successfully')
      }
    }
    
  } catch (error) {
    console.error('[SW] Analytics sync failed:', error)
  }
}

// Message handling for cache management
self.addEventListener('message', event => {
  const { type, payload } = event.data
  
  console.log('[SW] Message received:', type)
  
  switch (type) {
    case 'CACHE_AUDIO':
      event.waitUntil(cacheAudioFiles(payload.urls))
      break
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearAudioCache())
      break
      
    case 'GET_CACHE_SIZE':
      event.waitUntil(getCacheSize().then(size => {
        event.ports[0].postMessage({ size })
      }))
      break
      
    case 'PREFETCH_LESSON':
      event.waitUntil(prefetchLessonAudio(payload.lessonId, payload.priority))
      break
      
    default:
      console.log('[SW] Unknown message type:', type)
  }
})

// Cache multiple audio files
async function cacheAudioFiles(urls) {
  const cache = await caches.open(AUDIO_CACHE_NAME)
  const results = []
  
  for (const url of urls) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        await cache.put(url, response)
        results.push({ url, success: true })
      } else {
        results.push({ url, success: false, error: response.statusText })
      }
    } catch (error) {
      results.push({ url, success: false, error: error.message })
    }
  }
  
  // Notify main thread
  const clients = await self.clients.matchAll()
  clients.forEach(client => {
    client.postMessage({
      type: 'CACHE_COMPLETE',
      payload: { results }
    })
  })
}

// Clear audio cache
async function clearAudioCache() {
  try {
    await caches.delete(AUDIO_CACHE_NAME)
    console.log('[SW] Audio cache cleared')
    
    // Notify main thread
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'CACHE_CLEARED'
      })
    })
  } catch (error) {
    console.error('[SW] Failed to clear cache:', error)
  }
}

// Get total cache size
async function getCacheSize() {
  let totalSize = 0
  
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME)
    const requests = await cache.keys()
    
    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const size = response.headers.get('content-length')
        if (size) {
          totalSize += parseInt(size, 10)
        }
      }
    }
  } catch (error) {
    console.error('[SW] Failed to calculate cache size:', error)
  }
  
  return totalSize
}

// Prefetch lesson audio
async function prefetchLessonAudio(lessonId, priority = 'prefetch') {
  try {
    const response = await fetch(`/api/audio/priority/${priority}?lesson=${lessonId}&limit=20`)
    if (response.ok) {
      const data = await response.json()
      const urls = data.files.map(file => file.url)
      await cacheAudioFiles(urls)
    }
  } catch (error) {
    console.error('[SW] Failed to prefetch lesson audio:', error)
  }
}

// Utility functions for IndexedDB operations
async function getPendingDownloads() {
  // Implementation would use IndexedDB to get pending downloads
  return []
}

async function removePendingDownload(id) {
  // Implementation would remove download from IndexedDB
  console.log('[SW] Remove pending download:', id)
}

async function getLocalAnalytics() {
  // Implementation would get analytics from IndexedDB
  return []
}

async function clearLocalAnalytics() {
  // Implementation would clear analytics from IndexedDB
  console.log('[SW] Clear local analytics')
}

// Track audio access time
function updateAudioAccessTime(url) {
  // Implementation would update access time in IndexedDB
  console.log('[SW] Update access time:', url)
}

// Track audio download metrics
function trackAudioDownload(url, status, size) {
  // Implementation would track metrics in IndexedDB
  console.log('[SW] Track download:', url, status, size)
}

// Push notification handling
self.addEventListener('push', event => {
  if (!event.data) return
  
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || []
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  const data = event.notification.data
  let url = '/'
  
  if (data.url) {
    url = data.url
  } else if (event.action) {
    // Handle action buttons
    switch (event.action) {
      case 'open-lesson':
        url = `/learn?lesson=${data.lessonId}`
        break
      case 'practice':
        url = '/pronunciation-test'
        break
    }
  }
  
  event.waitUntil(
    clients.openWindow(url)
  )
})

console.log('[SW] Service Worker loaded successfully')