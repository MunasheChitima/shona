'use client'

import React, { useState, useEffect } from 'react'
import { contentSyncService } from '@/lib/services/ContentSyncService'
import type { ContentManifest, SyncResult } from '@/lib/services/ContentSyncService'

interface SyncStatusProps {
  variant?: 'default' | 'compact' | 'detailed'
  showControls?: boolean
  autoRefresh?: boolean
  className?: string
}

export default function SyncStatus({ 
  variant = 'default', 
  showControls = true, 
  autoRefresh = true, 
  className = '' 
}: SyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState<{
    inProgress: boolean
    queueLength: number
    lastSync?: string
  }>({ inProgress: false, queueLength: 0 })
  
  const [manifest, setManifest] = useState<ContentManifest | null>(null)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Initial status load
    updateSyncStatus()
    
    // Set up event listeners
    const handleSyncStarted = () => {
      updateSyncStatus()
    }
    
    const handleSyncCompleted = (result: SyncResult) => {
      setLastSyncResult(result)
      updateSyncStatus()
    }
    
    const handleContentUpdated = () => {
      updateSyncStatus()
    }
    
    contentSyncService.on('syncStarted', handleSyncStarted)
    contentSyncService.on('syncCompleted', handleSyncCompleted)
    contentSyncService.on('contentUpdated', handleContentUpdated)
    
    // Auto-refresh status
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(updateSyncStatus, 5000) // Update every 5 seconds
    }
    
    return () => {
      contentSyncService.off('syncStarted', handleSyncStarted)
      contentSyncService.off('syncCompleted', handleSyncCompleted)
      contentSyncService.off('contentUpdated', handleContentUpdated)
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const updateSyncStatus = () => {
    const status = contentSyncService.getSyncStatus()
    setSyncStatus(status)
    
    const localManifest = contentSyncService.getLocalManifest()
    setManifest(localManifest)
  }

  const handleCheckUpdates = async () => {
    setIsCheckingUpdates(true)
    try {
      const hasUpdates = await contentSyncService.checkForUpdates()
      if (!hasUpdates) {
        // Show temporary message
        setLastSyncResult({
          success: true,
          updatedContent: [],
          errors: [],
          totalUpdates: 0,
          syncDuration: 0
        })
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
      setLastSyncResult({
        success: false,
        updatedContent: [],
        errors: ['Failed to check for updates'],
        totalUpdates: 0,
        syncDuration: 0
      })
    } finally {
      setIsCheckingUpdates(false)
    }
  }

  const handleForceSync = async () => {
    try {
      await contentSyncService.forceSyncAll()
    } catch (error) {
      console.error('Failed to force sync:', error)
    }
  }

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all cached content? This will require re-downloading all content.')) {
      await contentSyncService.clearLocalContent()
      updateSyncStatus()
    }
  }

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return 'Never'
    
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSyncStatusIcon = () => {
    if (syncStatus.inProgress) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
      )
    }
    
    if (lastSyncResult?.success === false) {
      return (
        <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
          <span className="text-white text-xs">!</span>
        </div>
      )
    }
    
    if (syncStatus.queueLength > 0) {
      return (
        <div className="h-4 w-4 rounded-full bg-yellow-500 flex items-center justify-center">
          <span className="text-white text-xs">{syncStatus.queueLength}</span>
        </div>
      )
    }
    
    return (
      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
        <span className="text-white text-xs">✓</span>
      </div>
    )
  }

  const getSyncStatusText = () => {
    if (syncStatus.inProgress) return 'Syncing...'
    if (lastSyncResult?.success === false) return 'Sync failed'
    if (syncStatus.queueLength > 0) return `${syncStatus.queueLength} queued`
    return 'Up to date'
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getSyncStatusIcon()}
        <span className="text-sm text-gray-600">
          {getSyncStatusText()}
        </span>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Content Sync Status</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-3">
            {getSyncStatusIcon()}
            <div>
              <p className="text-sm font-medium text-gray-900">{getSyncStatusText()}</p>
              <p className="text-xs text-gray-500">Current Status</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {formatLastSync(syncStatus.lastSync)}
            </p>
            <p className="text-xs text-gray-500">Last Sync</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {manifest?.version || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500">Content Version</p>
          </div>
        </div>
        
        {showDetails && manifest && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Content Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Total Size</p>
                <p className="text-sm font-medium">{formatFileSize(manifest.metadata.totalSize)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Platform</p>
                <p className="text-sm font-medium capitalize">{manifest.platform}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Required Version</p>
                <p className="text-sm font-medium">{manifest.metadata.requiredVersion}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Compatibility</p>
                <p className="text-sm font-medium">{manifest.metadata.compatibilityVersion}</p>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Content Types</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(manifest.content).map(([type, version]) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {type}: v{version.version}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {lastSyncResult && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Last Sync Result</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className={`text-sm font-medium ${lastSyncResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {lastSyncResult.success ? 'Success' : 'Failed'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Updates</p>
                <p className="text-sm font-medium">{lastSyncResult.totalUpdates}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium">{lastSyncResult.syncDuration.toFixed(1)}s</p>
              </div>
            </div>
            
            {lastSyncResult.updatedContent.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Updated Content</p>
                <div className="flex flex-wrap gap-1">
                  {lastSyncResult.updatedContent.map((content) => (
                    <span key={content} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {content}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {lastSyncResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Errors</p>
                <div className="space-y-1">
                  {lastSyncResult.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {showControls && (
          <div className="flex space-x-2">
            <button
              onClick={handleCheckUpdates}
              disabled={isCheckingUpdates || syncStatus.inProgress}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingUpdates ? 'Checking...' : 'Check Updates'}
            </button>
            <button
              onClick={handleForceSync}
              disabled={syncStatus.inProgress}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Force Sync
            </button>
            <button
              onClick={handleClearCache}
              disabled={syncStatus.inProgress}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Cache
            </button>
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
        {getSyncStatusIcon()}
        <div>
          <p className="text-sm font-medium text-gray-900">{getSyncStatusText()}</p>
          <p className="text-xs text-gray-500">
            Last sync: {formatLastSync(syncStatus.lastSync)}
          </p>
        </div>
      </div>
      
      {showControls && (
        <div className="flex space-x-2">
          <button
            onClick={handleCheckUpdates}
            disabled={isCheckingUpdates || syncStatus.inProgress}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckingUpdates ? 'Checking...' : 'Check'}
          </button>
          {syncStatus.inProgress && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
              Syncing...
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { SyncStatus }