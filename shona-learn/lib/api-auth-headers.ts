/** Use on client fetches to `/api/*` that call verifyAuth: omit header when no JWT so open beta can use the server anonymous user. */
export function apiAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  if (token) return { Authorization: `Bearer ${token}` }
  return {}
}
