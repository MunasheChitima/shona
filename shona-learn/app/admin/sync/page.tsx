'use client'

import React, { useState, useEffect } from 'react'
import { SyncStatus } from '@/app/components/shared/SyncStatus'
import { contentSyncService } from '@/lib/services/ContentSyncService'
import type { ContentManifest } from '@/lib/services/ContentSyncService'

interface ContentStats {
  lessons: number
  vocabulary: number
  exercises: number
  culturalNotes: number
  audioFiles: number
  totalSize: number
}

interface PlatformStats {
  platform: string
  lastSync: string
  version: string
  status: 'online' | 'offline' | 'syncing'
  contentVersion: string
}

export default function AdminSyncPage() {
  const [contentStats, setContentStats] = useState<ContentStats | null>(null)
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([])
  const [syncLogs, setSyncLogs] = useState<any[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 10000) // Update every 10 seconds
    
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load content statistics
      await loadContentStats()
      
      // Load platform statistics
      await loadPlatformStats()
      
      // Load sync logs
      await loadSyncLogs()
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadContentStats = async () => {
    try {
      // Get lessons content
      const lessonsContent = await contentSyncService.getLocalContent('lessons')
      const vocabularyContent = await contentSyncService.getLocalContent('vocabulary')
      const exercisesContent = await contentSyncService.getLocalContent('exercises')
      const culturalNotesContent = await contentSyncService.getLocalContent('cultural_notes')
      const audioContent = await contentSyncService.getLocalContent('audio')
      
      const manifest = contentSyncService.getLocalManifest()
      
      const stats: ContentStats = {
        lessons: lessonsContent?.lessons?.length || 0,
        vocabulary: vocabularyContent?.vocabulary?.length || 0,
        exercises: exercisesContent?.exercises?.length || 0,
        culturalNotes: culturalNotesContent?.notes?.length || 0,
        audioFiles: audioContent?.files?.length || 0,
        totalSize: manifest?.metadata?.totalSize || 0
      }
      
      setContentStats(stats)
    } catch (error) {
      console.error('Failed to load content stats:', error)
    }
  }

  const loadPlatformStats = async () => {
    // Mock platform stats - in real implementation, this would come from a backend API
    const mockStats: PlatformStats[] = [
      {
        platform: 'Web',
        lastSync: new Date().toISOString(),
        version: '2.1.0',
        status: 'online',
        contentVersion: '2.1.0'
      },
      {
        platform: 'iOS',
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        version: '2.1.0',
        status: 'online',
        contentVersion: '2.1.0'
      },
      {
        platform: 'Android',
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        version: '2.0.0',
        status: 'offline',
        contentVersion: '2.0.0'
      }
    ]
    
    setPlatformStats(mockStats)
  }

  const loadSyncLogs = async () => {
    // Mock sync logs - in real implementation, this would come from a backend API
    const mockLogs = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        platform: 'Web',
        action: 'sync_completed',
        details: 'Updated 3 content types',
        duration: 2.5,
        status: 'success'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        platform: 'iOS',
        action: 'sync_started',
        details: 'Checking for updates',
        duration: 1.2,
        status: 'success'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        platform: 'Android',
        action: 'sync_failed',
        details: 'Network timeout',
        duration: 30.0,
        status: 'error'
      }
    ]
    
    setSyncLogs(mockLogs)
  }

  const handleRefreshContent = async () => {
    setIsLoading(true)
    await loadDashboardData()
  }

  const handlePurgeCache = async () => {
    if (confirm('Are you sure you want to purge all cached content? This will force all clients to re-download content.')) {
      try {
        await contentSyncService.clearLocalContent()
        await loadDashboardData()
      } catch (error) {
        console.error('Failed to purge cache:', error)
      }
    }
  }

  const handleForceSyncAll = async () => {
    try {
      await contentSyncService.forceSyncAll()
      await loadDashboardData()
    } catch (error) {
      console.error('Failed to force sync:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800'
      case 'offline':
        return 'bg-red-100 text-red-800'
      case 'syncing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLogStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Sync Dashboard</h1>
          <p className="text-gray-600">Monitor and manage content synchronization across all platforms</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex space-x-4">
          <button
            onClick={handleRefreshContent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Data
          </button>
          <button
            onClick={handleForceSyncAll}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Force Sync All
          </button>
          <button
            onClick={handlePurgeCache}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Purge Cache
          </button>
        </div>

        {/* Content Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Lessons</p>
                <p className="text-2xl font-bold text-gray-900">{contentStats?.lessons || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vocabulary</p>
                <p className="text-2xl font-bold text-gray-900">{contentStats?.vocabulary || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Exercises</p>
                <p className="text-2xl font-bold text-gray-900">{contentStats?.exercises || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">🏛️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cultural Notes</p>
                <p className="text-2xl font-bold text-gray-900">{contentStats?.culturalNotes || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🔊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Audio Files</p>
                <p className="text-2xl font-bold text-gray-900">{contentStats?.audioFiles || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <span className="text-2xl">💾</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(contentStats?.totalSize || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Status</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App Version</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content Version</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {platformStats.map((platform) => (
                    <tr key={platform.platform}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {platform.platform}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(platform.status)}`}>
                          {platform.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {platform.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {platform.contentVersion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimestamp(platform.lastSync)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sync Status Component */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Sync Status</h2>
          <SyncStatus variant="detailed" showControls={true} />
        </div>

        {/* Sync Logs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Sync Logs</h2>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="web">Web</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {syncLogs
                    .filter(log => selectedPlatform === 'all' || log.platform.toLowerCase() === selectedPlatform.toLowerCase())
                    .map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.platform}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.action.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.details}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.duration}s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}