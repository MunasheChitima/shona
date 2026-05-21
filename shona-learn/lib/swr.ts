/**
 * Shared SWR configuration for the Shona webapp.
 *
 * - `fetcher` always sends credentials so the `shona_session` cookie
 *   accompanies same-origin requests.
 * - We disable focus revalidation because lessons/progress rarely change
 *   while the tab is in the background — the noise made navigation feel
 *   janky.
 * - A 30s deduping interval means rapid cross-page navigation reuses an
 *   in-flight or freshly resolved request instead of hammering the API.
 */
import type { SWRConfiguration } from 'swr'

export class FetchError extends Error {
  status: number
  info: unknown
  constructor(message: string, status: number, info: unknown) {
    super(message)
    this.status = status
    this.info = info
  }
}

export const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
  const res = await fetch(input, {
    credentials: 'include',
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    let info: unknown = null
    try {
      info = await res.json()
    } catch {
      /* ignore */
    }
    throw new FetchError(`Request failed: ${res.status}`, res.status, info)
  }
  // Some endpoints return 204 No Content
  if (res.status === 204) return null
  return res.json()
}

export const swrDefaults: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  dedupingInterval: 30_000,
  errorRetryCount: 2,
  shouldRetryOnError: (err) => {
    // Don't bother retrying auth errors — user just needs to log in.
    if (err instanceof FetchError && (err.status === 401 || err.status === 403)) {
      return false
    }
    return true
  },
}

/**
 * Prefetch a SWR key by populating the cache. Used to make the next-lesson
 * transition feel instant when the user is mid-lesson.
 */
export async function prefetch(key: string): Promise<void> {
  try {
    const { mutate } = await import('swr')
    await mutate(key, fetcher(key), { revalidate: false })
  } catch {
    /* prefetch is best-effort */
  }
}
