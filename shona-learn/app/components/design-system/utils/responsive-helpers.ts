export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export const getBreakpointValue = (breakpoint: Breakpoint): number => {
  return breakpoints[breakpoint]
}

export const isBreakpointActive = (breakpoint: Breakpoint): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= getBreakpointValue(breakpoint)
}

export const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'md'
  
  const width = window.innerWidth
  
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  return 'xs'
}

export const getResponsiveValue = <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
  const currentBreakpoint = getCurrentBreakpoint()
  
  // Priority order: current breakpoint first, then fall back to smaller breakpoints
  const priorityOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = priorityOrder.indexOf(currentBreakpoint)
  
  // Check current and smaller breakpoints
  for (let i = currentIndex; i < priorityOrder.length; i++) {
    const breakpoint = priorityOrder[i]
    if (values[breakpoint] !== undefined) {
      return values[breakpoint]
    }
  }
  
  return undefined
}

export const useResponsiveValue = <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
  // For SSR compatibility, we'll use the md breakpoint as default
  if (typeof window === 'undefined') {
    return values.md || values.sm || values.xs
  }
  
  return getResponsiveValue(values)
}

// Device-specific helpers
export const isSmallDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < breakpoints.md
}

export const isMediumDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= breakpoints.md && window.innerWidth < breakpoints.lg
}

export const isLargeDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= breakpoints.lg
}

// Touch-specific helpers
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export const isHoverCapable = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover)').matches
}

// Orientation helpers
export const isPortrait = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerHeight > window.innerWidth
}

export const isLandscape = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth > window.innerHeight
}

// Platform-specific responsive values
export const getPlatformResponsiveClass = (
  platform: 'web' | 'ios' | 'android' | 'watchos',
  baseClass: string
): string => {
  const platformPrefixes = {
    web: 'web:',
    ios: 'ios:',
    android: 'android:',
    watchos: 'watchos:'
  }
  
  const prefix = platformPrefixes[platform]
  return `${prefix}${baseClass}`
}