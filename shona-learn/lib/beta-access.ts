/**
 * Open beta: no signed-in account required. Each visitor gets their own anonymous
 * user row in the DB, keyed by a UUID stored in the `shona_beta_id` cookie set
 * client-side. Set BETA_OPEN_ACCESS to false when shipping real authentication
 * to make verifyAuth strict.
 */
export const BETA_OPEN_ACCESS = true

export const BETA_COOKIE_NAME = 'shona_beta_id'
export const SESSION_COOKIE_NAME = 'shona_session'
