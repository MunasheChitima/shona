'use client'
import { useEffect } from 'react'

async function clearServiceWorkerState(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  const regs = await navigator.serviceWorker.getRegistrations()
  await Promise.all(regs.map((reg) => reg.unregister()))
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }
}

export default function ServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const setup = async () => {
      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'

      // In development / on localhost, purge stale SW + caches and DON'T register.
      // Old cached /_next chunks cause "Cannot read properties of undefined
      // (reading 'call')" after git branch switches. Never cache during dev.
      if (process.env.NODE_ENV === 'development' || isLocal) {
        await clearServiceWorkerState()
        return
      }

      // In production, do NOT nuke caches on every load — let the SW actually
      // cache. The SW's own `activate` handler deletes stale cache versions on
      // deploy, and its network-first strategy avoids serving broken old chunks.
      if (!('serviceWorker' in navigator)) return

      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* SW registration is best-effort */
      })
    }

    if (document.readyState === 'complete') {
      void setup()
    } else {
      window.addEventListener('load', () => void setup(), { once: true })
    }
  }, [])

  return null
}
