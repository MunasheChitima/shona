const AUDIO_CACHE_NAME = 'shona-audio-v1'
const AUDIO_CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days

// Audio file patterns to cache
const AUDIO_PATTERNS = [
  /\/audio\/.*\.(mp3|wav|ogg)$/,
  /\/_next\/static\/audio\/.*\.(mp3|wav|ogg)$/
]

// Install event - pre-cache critical audio files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(AUDIO_CACHE_NAME).then((cache) => {
      // Pre-cache common audio files
      return cache.addAll([
        '/audio/common/button-click.mp3',
        '/audio/common/success.mp3',
        '/audio/common/error.mp3'
      ]).catch(() => {
        // Ignore errors for missing files
        console.log('Some audio files not found for pre-caching')
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('shona-audio-') && cacheName !== AUDIO_CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - cache audio files
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Only handle audio requests
  if (!AUDIO_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return
  }

  event.respondWith(
    caches.open(AUDIO_CACHE_NAME).then(async (cache) => {
      try {
        // Try to get from cache first
        const cachedResponse = await cache.match(event.request)
        
        if (cachedResponse) {
          // Check if cache is still valid
          const cachedDate = cachedResponse.headers.get('cached-date')
          if (cachedDate && Date.now() - parseInt(cachedDate) < AUDIO_CACHE_TTL) {
            return cachedResponse
          }
        }

        // Fetch from network
        const networkResponse = await fetch(event.request)
        
        // Only cache successful responses
        if (networkResponse.ok) {
          // Clone response and add cache timestamp
          const responseToCache = networkResponse.clone()
          const headers = new Headers(responseToCache.headers)
          headers.set('cached-date', Date.now().toString())
          
          const cachedResponse = new Response(await responseToCache.blob(), {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers
          })
          
          // Cache the response
          cache.put(event.request, cachedResponse.clone())
          
          return networkResponse
        }
        
        // If network fails and we have a cached version, return it
        return cachedResponse || networkResponse
        
      } catch (error) {
        // Network error - try to return cached version
        const cachedResponse = await cache.match(event.request)
        if (cachedResponse) {
          return cachedResponse
        }
        
        // Return a fallback audio file or error response
        return new Response(null, { 
          status: 404, 
          statusText: 'Audio file not available offline' 
        })
      }
    })
  )
})

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_AUDIO_CACHE') {
    event.waitUntil(
      caches.delete(AUDIO_CACHE_NAME).then(() => {
        event.ports[0].postMessage({ success: true })
      })
    )
  } else if (event.data && event.data.type === 'PRELOAD_AUDIO') {
    event.waitUntil(
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        const urls = event.data.urls || []
        return Promise.allSettled(
          urls.map(url => cache.add(url).catch(() => null))
        ).then(() => {
          event.ports[0].postMessage({ success: true })
        })
      })
    )
  }
})