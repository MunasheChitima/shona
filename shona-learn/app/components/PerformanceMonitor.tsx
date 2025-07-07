'use client'
import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  ttfb?: number // Time to First Byte
  loadTime?: number
  domContentLoaded?: number
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceMetrics) => void
  showDebug?: boolean
}

export default function PerformanceMonitor({ onMetrics, showDebug = false }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})

  useEffect(() => {
    let observer: PerformanceObserver | null = null

    // Measure Core Web Vitals
    const measureWebVitals = () => {
      // LCP - Largest Contentful Paint
      observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            const lcp = entry.startTime
            setMetrics(prev => ({ ...prev, lcp }))
            onMetrics?.({ ...metrics, lcp })
          }
        }
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })

      // FID - First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'first-input') {
            const fid = (entry as any).processingStart - entry.startTime
            setMetrics(prev => ({ ...prev, fid }))
            onMetrics?.({ ...metrics, fid })
          }
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // CLS - Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            setMetrics(prev => ({ ...prev, cls: clsValue }))
            onMetrics?.({ ...metrics, cls: clsValue })
          }
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }

    // Measure Navigation Timing
    const measureNavigationTiming = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.fetchStart
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart
        const loadTime = navigation.loadEventEnd - navigation.fetchStart

        const newMetrics = { ttfb, domContentLoaded, loadTime }
        setMetrics(prev => ({ ...prev, ...newMetrics }))
        onMetrics?.({ ...metrics, ...newMetrics })
      }
    }

    // Initialize measurements
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      measureWebVitals()
      
      // Measure navigation timing after page load
      if (document.readyState === 'complete') {
        measureNavigationTiming()
      } else {
        window.addEventListener('load', measureNavigationTiming)
      }
    }

    return () => {
      observer?.disconnect()
      window.removeEventListener('load', measureNavigationTiming)
    }
  }, [onMetrics, metrics])

  // Send metrics to analytics
  useEffect(() => {
    if (Object.keys(metrics).length > 0) {
      // In production, send to your analytics service
      if (process.env.NODE_ENV === 'production') {
        // Example: sendToAnalytics(metrics)
        console.log('Performance metrics:', metrics)
      }
    }
  }, [metrics])

  const getScoreColor = (metric: string, value?: number) => {
    if (!value) return 'text-gray-400'
    
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'text-green-500' : value <= 4000 ? 'text-yellow-500' : 'text-red-500'
      case 'fid':
        return value <= 100 ? 'text-green-500' : value <= 300 ? 'text-yellow-500' : 'text-red-500'
      case 'cls':
        return value <= 0.1 ? 'text-green-500' : value <= 0.25 ? 'text-yellow-500' : 'text-red-500'
      case 'ttfb':
        return value <= 800 ? 'text-green-500' : value <= 1800 ? 'text-yellow-500' : 'text-red-500'
      default:
        return 'text-gray-600'
    }
  }

  const formatMetric = (value?: number) => {
    if (!value) return 'N/A'
    return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(2)}s`
  }

  if (!showDebug && process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Performance Metrics</h4>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={getScoreColor('lcp', metrics.lcp)}>
            {formatMetric(metrics.lcp)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>FID:</span>
          <span className={getScoreColor('fid', metrics.fid)}>
            {formatMetric(metrics.fid)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={getScoreColor('cls', metrics.cls)}>
            {metrics.cls?.toFixed(3) || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>TTFB:</span>
          <span className={getScoreColor('ttfb', metrics.ttfb)}>
            {formatMetric(metrics.ttfb)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Load:</span>
          <span className="text-blue-400">
            {formatMetric(metrics.loadTime)}
          </span>
        </div>
      </div>
    </div>
  )
}