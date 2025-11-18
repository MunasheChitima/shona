/**
 * Centralized JWT configuration module
 * Enforces minimum secret length and provides rotation support
 */

const MIN_SECRET_LENGTH = 32;

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is required. ' +
      'Set it to a secure random string of at least 32 characters.'
    );
  }
  
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long. ` +
      `Current length: ${secret.length}. ` +
      'Generate a secure secret using: openssl rand -base64 32'
    );
  }
  
  return secret;
}

function getJWTSecretRotation(): string | null {
  // Support for secret rotation - allows gradual migration
  return process.env.JWT_SECRET_ROTATION || null;
}

export const jwtConfig = {
  secret: getJWTSecret(),
  rotationSecret: getJWTSecretRotation(),
  minSecretLength: MIN_SECRET_LENGTH,
  
  /**
   * Verify a token with support for secret rotation
   */
  verifyToken(token: string): { userId: string } | null {
    const jwt = require('jsonwebtoken');
    
    try {
      // Try with primary secret
      return jwt.verify(token, this.secret) as { userId: string };
    } catch (error) {
      // If rotation secret exists, try with that
      if (this.rotationSecret) {
        try {
          return jwt.verify(token, this.rotationSecret) as { userId: string };
        } catch {
          return null;
        }
      }
      return null;
    }
  },
  
  /**
   * Sign a token using the current secret
   */
  signToken(payload: { userId: string }): string {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, this.secret);
  }
};
