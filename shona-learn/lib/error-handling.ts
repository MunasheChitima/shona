// Centralized error handling utilities

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  userFriendly?: boolean
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // Create a standardized error object
  createError(
    code: string,
    message: string,
    details?: any,
    userFriendly: boolean = false
  ): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      userFriendly
    }
  }

  // Handle API errors
  handleApiError(error: any, endpoint?: string): AppError {
    console.error(`API Error${endpoint ? ` at ${endpoint}` : ''}:`, error)

    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          return this.createError(
            'VALIDATION_ERROR',
            'Invalid request data',
            data,
            true
          )
        case 401:
          return this.createError(
            'UNAUTHORIZED',
            'Please log in to continue',
            data,
            true
          )
        case 403:
          return this.createError(
            'FORBIDDEN',
            'You don\'t have permission to perform this action',
            data,
            true
          )
        case 404:
          return this.createError(
            'NOT_FOUND',
            'The requested resource was not found',
            data,
            true
          )
        case 429:
          return this.createError(
            'RATE_LIMITED',
            'Too many requests. Please try again later.',
            data,
            true
          )
        case 500:
          return this.createError(
            'SERVER_ERROR',
            'Something went wrong on our end. Please try again.',
            data,
            true
          )
        default:
          return this.createError(
            'API_ERROR',
            'An unexpected error occurred',
            { status, data },
            true
          )
      }
    } else if (error.request) {
      // Network error
      return this.createError(
        'NETWORK_ERROR',
        'Unable to connect to the server. Please check your internet connection.',
        error.request,
        true
      )
    } else {
      // Other error
      return this.createError(
        'UNKNOWN_ERROR',
        'An unexpected error occurred',
        error,
        false
      )
    }
  }

  // Handle authentication errors
  handleAuthError(error: any): AppError {
    console.error('Authentication Error:', error)

    if (error.code === 'auth/user-not-found') {
      return this.createError(
        'USER_NOT_FOUND',
        'No account found with this email address',
        error,
        true
      )
    } else if (error.code === 'auth/wrong-password') {
      return this.createError(
        'INVALID_PASSWORD',
        'Incorrect password. Please try again.',
        error,
        true
      )
    } else if (error.code === 'auth/email-already-in-use') {
      return this.createError(
        'EMAIL_IN_USE',
        'An account with this email already exists',
        error,
        true
      )
    } else if (error.code === 'auth/weak-password') {
      return this.createError(
        'WEAK_PASSWORD',
        'Password should be at least 6 characters long',
        error,
        true
      )
    } else if (error.code === 'auth/invalid-email') {
      return this.createError(
        'INVALID_EMAIL',
        'Please enter a valid email address',
        error,
        true
      )
    } else {
      return this.createError(
        'AUTH_ERROR',
        'Authentication failed. Please try again.',
        error,
        true
      )
    }
  }

  // Handle audio errors
  handleAudioError(error: any): AppError {
    console.error('Audio Error:', error)

    if (error.name === 'NotAllowedError') {
      return this.createError(
        'AUDIO_PERMISSION_DENIED',
        'Please allow microphone access to use audio features',
        error,
        true
      )
    } else if (error.name === 'NotSupportedError') {
      return this.createError(
        'AUDIO_NOT_SUPPORTED',
        'Audio features are not supported in your browser',
        error,
        true
      )
    } else if (error.name === 'NetworkError') {
      return this.createError(
        'AUDIO_NETWORK_ERROR',
        'Unable to load audio. Please check your connection.',
        error,
        true
      )
    } else {
      return this.createError(
        'AUDIO_ERROR',
        'Failed to play audio. Please try again.',
        error,
        true
      )
    }
  }

  // Handle validation errors
  handleValidationError(errors: any[]): AppError {
    console.error('Validation Error:', errors)

    const fieldErrors = errors.map(error => ({
      field: error.path?.join('.') || 'unknown',
      message: error.message
    }))

    return this.createError(
      'VALIDATION_ERROR',
      'Please check your input and try again',
      { fieldErrors },
      true
    )
  }

  // Log error for debugging
  logError(error: AppError): void {
    this.errorLog.push(error)
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }

    // In production, you might want to send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service (e.g., Sentry)
      console.error('Production Error:', error)
    }
  }

  // Get error log
  getErrorLog(): AppError[] {
    return [...this.errorLog]
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = []
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: AppError): string {
    if (error.userFriendly) {
      return error.message
    }

    // Fallback messages for non-user-friendly errors
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Connection problem. Please check your internet.'
      case 'SERVER_ERROR':
        return 'Server is having issues. Please try again later.'
      case 'UNKNOWN_ERROR':
        return 'Something went wrong. Please try again.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  // Check if error is retryable
  isRetryable(error: AppError): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'SERVER_ERROR',
      'RATE_LIMITED',
      'AUDIO_NETWORK_ERROR'
    ]
    return retryableCodes.includes(error.code)
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// React hook for error handling
export function useErrorHandler() {
  const handleError = (error: any, context?: string) => {
    const appError = errorHandler.handleApiError(error, context)
    errorHandler.logError(appError)
    return appError
  }

  const handleAuthError = (error: any) => {
    const appError = errorHandler.handleAuthError(error)
    errorHandler.logError(appError)
    return appError
  }

  const handleAudioError = (error: any) => {
    const appError = errorHandler.handleAudioError(error)
    errorHandler.logError(appError)
    return appError
  }

  const handleValidationError = (errors: any[]) => {
    const appError = errorHandler.handleValidationError(errors)
    errorHandler.logError(appError)
    return appError
  }

  return {
    handleError,
    handleAuthError,
    handleAudioError,
    handleValidationError,
    getUserFriendlyMessage: errorHandler.getUserFriendlyMessage.bind(errorHandler),
    isRetryable: errorHandler.isRetryable.bind(errorHandler)
  }
} 