/* Shona Learn — minimal app-shell service worker.
 *
 * Strategy:
 *  - Versioned cache: a new deploy bumps CACHE_VERSION; the `activate` handler
 *    deletes every cache that isn't the current version, invalidating stale
 *    /_next chunks WITHOUT the client nuking caches on every load.
 *  - Navigations (HTML): network-first, fall back to cache when offline. This
 *    guarantees a deploy can't serve a stale HTML shell that references dead
 *    /_next chunks.
 *  - /_next/static/*: content-hashed and immutable, so cache-first is safe and
 *    makes repeat visits fast.
 *  - Other static same-origin GETs (images, fonts, manifest): stale-while-
 *    revalidate — serve cache instantly, refresh in the background.
 *  - NEVER cache /api/* — auth state must always hit the network.
 *  - Best-effort: failures never break the page.
 */
const CACHE_VERSION = 'v3'
const CACHE = `shona-shell-${CACHE_VERSION}`
const SHELL = ['/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

// Network-first: try the network, cache the fresh copy, fall back to cache.
function networkFirst(req) {
  return fetch(req)
    .then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone()
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {})
      }
      return res
    })
    .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
}

// Cache-first: serve cache if present, otherwise fetch and cache.
function cacheFirst(req) {
  return caches.match(req).then((hit) => {
    if (hit) return hit
    return fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone()
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {})
      }
      return res
    })
  })
}

// Stale-while-revalidate: serve cache instantly, refresh in the background.
function staleWhileRevalidate(req) {
  return caches.match(req).then((hit) => {
    const fetching = fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {})
        }
        return res
      })
      .catch(() => hit)
    return hit || fetching
  })
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  let url
  try {
    url = new URL(req.url)
  } catch {
    return
  }

  if (url.origin !== self.location.origin) return
  // Never touch API requests — auth cookies + freshness matter.
  if (url.pathname.startsWith('/api/')) return
  // Skip the SW file itself.
  if (url.pathname === '/sw.js') return

  // Navigations (HTML documents): network-first so a deploy can't serve a stale
  // shell pointing at dead chunks; fall back to cache when offline.
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req))
    return
  }

  // Content-hashed Next.js build assets are immutable — safe to cache-first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req))
    return
  }

  // Other /_next/* (data, image optimizer, etc.) change frequently — bypass.
  if (url.pathname.startsWith('/_next/')) return

  // Remaining static same-origin GETs: stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(req))
})
