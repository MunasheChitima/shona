export type Platform = 'web' | 'ios' | 'android' | 'watchos'

export const detectPlatform = (): Platform => {
  if (typeof window === 'undefined') return 'web'
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  // Check for iOS
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios'
  }
  
  // Check for Android
  if (/android/.test(userAgent)) {
    return 'android'
  }
  
  // Check for watchOS (Apple Watch)
  if (/watch/.test(userAgent)) {
    return 'watchos'
  }
  
  return 'web'
}

export const isIOS = (): boolean => detectPlatform() === 'ios'
export const isAndroid = (): boolean => detectPlatform() === 'android'
export const isWatchOS = (): boolean => detectPlatform() === 'watchos'
export const isWeb = (): boolean => detectPlatform() === 'web'
export const isMobile = (): boolean => isIOS() || isAndroid()
export const isDesktop = (): boolean => isWeb() && !isMobile()

export const getPlatformStyles = (platform: Platform) => {
  const styles = {
    web: {
      borderRadius: '0.375rem', // 6px
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.2s ease-in-out'
    },
    ios: {
      borderRadius: '0.5rem', // 8px
      padding: '0.75rem 1.5rem',
      fontSize: '1.0625rem', // 17px
      fontWeight: '600',
      transition: 'all 0.3s ease-out'
    },
    android: {
      borderRadius: '0.25rem', // 4px
      padding: '0.5rem 1rem',
      fontSize: '0.875rem', // 14px
      fontWeight: '500',
      transition: 'all 0.15s ease-out'
    },
    watchos: {
      borderRadius: '0.5rem', // 8px
      padding: '0.375rem 0.75rem',
      fontSize: '0.75rem', // 12px
      fontWeight: '600',
      transition: 'all 0.2s ease-in-out'
    }
  }
  
  return styles[platform]
}