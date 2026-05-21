/**
 * Same-origin requests now authenticate via the HttpOnly `shona_session`
 * cookie set by /api/auth/{login,register}. The cookie is sent automatically,
 * so an explicit Authorization header is no longer required. We keep this
 * helper around as a no-op so existing call sites don't break.
 */
export function apiAuthHeaders(): HeadersInit {
  return {}
}
