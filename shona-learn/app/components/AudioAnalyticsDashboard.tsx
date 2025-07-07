'use client'

import { useState, useEffect } from 'react'
import { AdvancedAudioService } from '@/lib/services/AdvancedAudioService'
import { AudioCacheManager } from '@/lib/services/AudioCacheManager'

interface AnalyticsData {
  cachePerformance: {
    hitRate: number
    totalHits: number
    totalMisses: number
    storageUsed: number
    storageTotal: number
  }
  popularContent: Array<{
    audioId: string
    playCount: number
    category: string
    level: number
  }>
  downloadStats: {
    totalDownloads: number
    successRate: number
    avgDownloadTime: number
    errorCount: number
  }
  userBehavior: {
    preferredSpeed: number
    skipRate: number
    completionRate: number
    weakAreas: string[]
  }
  systemHealth: {
    audioContext: boolean
    cacheManager: boolean
    currentlyPlaying: number
    compressionSupport: any
  }
}

export default function AudioAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [audioService] = useState(() => new AdvancedAudioService())
  const [cacheManager] = useState(() => new AudioCacheManager())
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadAnalytics()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000)
    setRefreshInterval(interval)
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)

      // Get cache analytics
      const cacheAnalytics = await cacheManager.getAnalytics()
      
      // Get audio service status
      const serviceStatus = audioService.getServiceStatus()
      
      // Get storage info
      const storageInfo = cacheManager.getStorageInfo()
      
      // Get audio metrics
      const audioMetrics = await audioService.getAudioMetrics() as Map<string, any>
      
      // Process popular content
      const popularContent = Array.from(audioMetrics.entries())
        .sort((a, b) => b[1].playCount - a[1].playCount)
        .slice(0, 10)
        .map(([audioId, metrics]) => ({
          audioId,
          playCount: metrics.playCount,
          category: 'unknown', // Would need to lookup from manifest
          level: 1 // Would need to lookup from manifest
        }))

      // Calculate user behavior metrics
      const allMetrics = Array.from(audioMetrics.values())
      const userBehavior = {
        preferredSpeed: allMetrics.reduce((sum, m) => sum + m.preferredSpeed, 0) / allMetrics.length || 1.0,
        skipRate: allMetrics.reduce((sum, m) => sum + m.skipRate, 0) / allMetrics.length || 0,
        completionRate: allMetrics.reduce((sum, m) => sum + m.completionRate, 0) / allMetrics.length || 0,
        weakAreas: ['pronunciation', 'tones'] // Would be calculated from actual data
      }

      setAnalytics({
        cachePerformance: {
          hitRate: cacheAnalytics.totalCacheHits / (cacheAnalytics.totalCacheHits + cacheAnalytics.totalCacheMisses) * 100 || 0,
          totalHits: cacheAnalytics.totalCacheHits,
          totalMisses: cacheAnalytics.totalCacheMisses,
          storageUsed: storageInfo.used,
          storageTotal: storageInfo.total
        },
        popularContent,
        downloadStats: cacheAnalytics.downloadStats,
        userBehavior,
        systemHealth: {
          audioContext: serviceStatus.audioContext,
          cacheManager: serviceStatus.cacheManager,
          currentlyPlaying: serviceStatus.currentlyPlaying,
          compressionSupport: serviceStatus.compressionSupport
        }
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <p className="text-red-600">Failed to load analytics data</p>
        <button 
          onClick={loadAnalytics}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Audio System Analytics</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${analytics.systemHealth.audioContext ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">System Status</span>
          <button 
            onClick={loadAnalytics}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Cache Performance */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Cache Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {formatPercentage(analytics.cachePerformance.hitRate)}
            </div>
            <div className="text-sm text-gray-600">Hit Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {analytics.cachePerformance.totalHits}
            </div>
            <div className="text-sm text-gray-600">Cache Hits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {analytics.cachePerformance.totalMisses}
            </div>
            <div className="text-sm text-gray-600">Cache Misses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {formatBytes(analytics.cachePerformance.storageUsed)}
            </div>
            <div className="text-sm text-gray-600">Storage Used</div>
          </div>
        </div>
        
        {/* Storage Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Storage Usage</span>
            <span>{formatBytes(analytics.cachePerformance.storageTotal)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ 
                width: `${(analytics.cachePerformance.storageUsed / analytics.cachePerformance.storageTotal) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Popular Content */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Most Played Audio</h3>
        <div className="space-y-2">
          {analytics.popularContent.map((item, index) => (
            <div key={item.audioId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="font-medium">{item.audioId}</span>
                <span className="text-sm text-gray-600">({item.category})</span>
              </div>
              <div className="text-sm font-medium text-blue-600">
                {item.playCount} plays
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Behavior */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">User Behavior</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {analytics.userBehavior.preferredSpeed.toFixed(1)}x
            </div>
            <div className="text-sm text-gray-600">Preferred Speed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {formatPercentage(analytics.userBehavior.completionRate)}
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {formatPercentage(analytics.userBehavior.skipRate)}
            </div>
            <div className="text-sm text-gray-600">Skip Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {analytics.userBehavior.weakAreas.length}
            </div>
            <div className="text-sm text-gray-600">Weak Areas</div>
          </div>
        </div>
        
        {/* Weak Areas List */}
        <div className="mt-4">
          <h4 className="font-medium mb-2">Areas for Improvement:</h4>
          <div className="flex flex-wrap gap-2">
            {analytics.userBehavior.weakAreas.map(area => (
              <span key={area} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Download Stats */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Download Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {analytics.downloadStats.totalDownloads}
            </div>
            <div className="text-sm text-gray-600">Total Downloads</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {formatPercentage(analytics.downloadStats.successRate)}
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {analytics.downloadStats.avgDownloadTime.toFixed(1)}s
            </div>
            <div className="text-sm text-gray-600">Avg Download Time</div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">System Health</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Components Status</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span>Audio Context</span>
                <div className={`w-3 h-3 rounded-full ${analytics.systemHealth.audioContext ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="flex items-center justify-between">
                <span>Cache Manager</span>
                <div className={`w-3 h-3 rounded-full ${analytics.systemHealth.cacheManager ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              <div className="flex items-center justify-between">
                <span>Currently Playing</span>
                <span className="text-sm font-medium">{analytics.systemHealth.currentlyPlaying}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Format Support</h4>
            <div className="space-y-1">
              {Object.entries(analytics.systemHealth.compressionSupport).map(([format, supported]) => (
                <div key={format} className="flex items-center justify-between">
                  <span className="capitalize">{format}</span>
                  <div className={`w-3 h-3 rounded-full ${supported ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export and Actions */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Export Analytics
          </button>
          <button 
            onClick={() => cacheManager.clearCache()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Cache
          </button>
          <button 
            onClick={() => audioService.performMaintenance()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Run Maintenance
          </button>
        </div>
      </div>
    </div>
  )
}