/* Shona Learn — minimal app-shell service worker.
 *
 * Strategy:
 *  - Cache static same-origin GETs (JS, CSS, images, fonts).
 *  - NEVER cache /api/* — auth state must always hit the network.
 *  - Cache-first, fall back to network. Best-effort: failures don't break the page.
 */
const CACHE = 'shona-shell-v1'
const SHELL = ['/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

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

  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit
      return fetch(req)
        .then((res) => {
          // Only cache successful, basic-type responses.
          if (!res || res.status !== 200 || res.type !== 'basic') return res
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {})
          return res
        })
        .catch(() => hit)
    })
  )
})
