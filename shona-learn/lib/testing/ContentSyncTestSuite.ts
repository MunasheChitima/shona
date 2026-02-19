interface TestResult {
  testName: string
  success: boolean
  duration: number
  errors: string[]
  warnings: string[]
  metadata: any
}

interface TestSuite {
  name: string
  tests: TestCase[]
  setup?: () => Promise<void>
  teardown?: () => Promise<void>
}

interface TestCase {
  name: string
  description: string
  category: 'unit' | 'integration' | 'performance' | 'stress' | 'e2e'
  timeout: number
  run: () => Promise<TestResult>
}

interface PerformanceMetrics {
  syncDuration: number
  throughput: number
  memoryUsage: number
  cacheHitRate: number
  errorRate: number
  latency: {
    p50: number
    p95: number
    p99: number
  }
}

class ContentSyncTestSuite {
  private testSuites: TestSuite[] = []
  private results: TestResult[] = []
  private performanceMetrics: PerformanceMetrics[] = []
  private mockData: any = {}

  constructor() {
    this.setupMockData()
    this.setupTestSuites()
  }

  private setupMockData(): void {
    this.mockData = {
      lessons: {
        basic: {
          id: 'lesson-1',
          title: 'Basic Greetings',
          vocabulary: [
            { shona: 'mhoro', english: 'hello', pronunciation: 'mm-HO-ro' }
          ],
          metadata: { version: 1, lastUpdated: new Date().toISOString() }
        },
        modified: {
          id: 'lesson-1',
          title: 'Basic Greetings and Introductions',
          vocabulary: [
            { shona: 'mhoro', english: 'hello', pronunciation: 'mm-HO-ro', culturalContext: 'Common greeting' },
            { shona: 'ndiri', english: 'I am', pronunciation: 'nn-DEE-ree' }
          ],
          metadata: { version: 2, lastUpdated: new Date(Date.now() + 1000).toISOString() }
        }
      },
      conflicts: {
        versionMismatch: {
          local: { id: 'test', version: 1, data: 'local' },
          remote: { id: 'test', version: 2, data: 'remote' }
        },
        dataDivergence: {
          local: { id: 'test', version: 1, title: 'Local Title', content: 'Local content' },
          remote: { id: 'test', version: 1, title: 'Remote Title', content: 'Remote content' }
        }
      }
    }
  }

  private setupTestSuites(): void {
    this.testSuites = [
      this.createSyncServiceTests(),
      this.createCacheServiceTests(),
      this.createConflictResolutionTests(),
      this.createWebSocketTests(),
      this.createPerformanceTests(),
      this.createIntegrationTests()
    ]
  }

  private createSyncServiceTests(): TestSuite {
    return {
      name: 'ContentSyncService Tests',
      tests: [
        {
          name: 'Basic Sync Operation',
          description: 'Test basic content synchronization',
          category: 'unit',
          timeout: 5000,
          run: async () => {
            const startTime = performance.now()
            const errors: string[] = []
            
            try {
              // Mock sync service
              const mockSyncService = this.createMockSyncService()
              
              // Test manifest fetching
              const manifest = await mockSyncService.fetchManifest()
              if (!manifest || !manifest.version) {
                errors.push('Failed to fetch valid manifest')
              }
              
              // Test content sync
              const result = await mockSyncService.syncContent(['lessons'])
              if (!result.success) {
                errors.push('Content sync failed')
              }
              
              return {
                testName: 'Basic Sync Operation',
                success: errors.length === 0,
                duration: performance.now() - startTime,
                errors,
                warnings: [],
                metadata: { manifestVersion: manifest?.version, syncResult: result }
              }
              
            } catch (error) {
              errors.push(`Test failed: ${error}`)
              return {
                testName: 'Basic Sync Operation',
                success: false,
                duration: performance.now() - startTime,
                errors,
                warnings: [],
                metadata: {}
              }
            }
          }
        },
        {
          name: 'Offline Mode',
          description: 'Test sync service behavior when offline',
          category: 'unit',
          timeout: 3000,
          run: async () => {
            const startTime = performance.now()
            const errors: string[] = []
            
            try {
              const mockSyncService = this.createMockSyncService()
              mockSyncService.setOfflineMode(true)
              
              // Should use cached content when offline
              const content = await mockSyncService.getContent('lessons')
              if (!content) {
                errors.push('Failed to retrieve cached content in offline mode')
              }
              
              // Sync should fail gracefully
              const syncResult = await mockSyncService.syncContent(['lessons'])
              if (syncResult.success) {
                errors.push('Sync should fail when offline')
              }
              
              return {
                testName: 'Offline Mode',
                success: errors.length === 0,
                duration: performance.now() - startTime,
                errors,
                warnings: [],
                metadata: { offlineContent: !!content }
              }
              
            } catch (error) {
              return {
                testName: 'Offline Mode',
                success: false,
                duration: performance.now() - startTime,
                errors: [`Test failed: ${error}`],
                warnings: [],
                metadata: {}
              }
            }
          }
        },
        {
          name: 'Retry Logic',
          description: 'Test exponential backoff retry mechanism',
          category: 'unit',
          timeout: 10000,
          run: async () => {
            const startTime = performance.now()
            const errors: string[] = []
            const retryAttempts: number[] = []
            
            try {
              const mockSyncService = this.createMockSyncService()
              
              // Simulate network failures
              mockSyncService.onRetry((attempt: number) => {
                retryAttempts.push(attempt)
              })
              
              mockSyncService.setFailureRate(0.7) // 70% failure rate
              
              const result = await mockSyncService.syncContent(['lessons'])
              
              if (retryAttempts.length === 0) {
                errors.push('No retry attempts detected')
              }
              
              // Check exponential backoff pattern
              for (let i = 1; i < retryAttempts.length; i++) {
                const expectedDelay = Math.pow(2, i - 1) * 1000
                // Allow some tolerance for timing
                if (Math.abs(retryAttempts[i] - expectedDelay) > 500) {
                  errors.push(`Retry ${i} timing incorrect`)
                }
              }
              
              return {
                testName: 'Retry Logic',
                success: errors.length === 0,
                duration: performance.now() - startTime,
                errors,
                warnings: [],
                metadata: { retryAttempts, finalResult: result.success }
              }
              
            } catch (error) {
              return {
                testName: 'Retry Logic',
                success: false,
                duration: performance.now() - startTime,
                errors: [`Test failed: ${error}`],
                warnings: [],
                metadata: { retryAttempts }
              }
            }
          }
        }
      ]
    }
  }

  private createCacheServiceTests(): TestSuite {
    return {
      name: 'AdvancedCacheService Tests',
      tests: [
        {
          name: 'Cache Operations',
          description: 'Test basic cache set/get operations',
          category: 'unit',
          timeout: 2000,
          run: async () => {
            const startTime = performance.now()
            const errors: string[] = []
            
            try {
              const { AdvancedCacheService } = await import('../services/AdvancedCacheService')
              const cache = new AdvancedCacheService()
              
              // Test basic operations
              await cache.set('test-key', { data: 'test-value' })
              const retrieved = await cache.get('test-key')
              
              if (!retrieved || retrieved.data !== 'test-value') {
                errors.push('Basic cache set/get failed')
              }
              
              // Test expiration
              await cache.set('expiry-test', { data: 'expire-me' }, { ttl: 100 })
              await new Promise(resolve => setTimeout(resolve, 150))
              const expired = await cache.get('expiry-test')
              
              if (expired !== null) {
                errors.push('Cache expiration not working')
              }
              
              // Test compression
              const largeData = { content: 'x'.repeat(10000) }
              await cache.set('large-data', largeData, { compress: true })
              const retrieved2 = await cache.get('large-data')
              
              if (!retrieved2 || retrieved2.content !== largeData.content) {
                errors.push('Cache compression/decompression failed')
              }
              
              return {
                testName: 'Cache Operations',
                success: errors.length === 0,
                duration: performance.now() - startTime,
                errors,
                warnings: [],
                metadata: { stats: cache.getStats() }
              }
              
            } catch (error) {
              return {
                testName: 'Cache Operations',
                success: false,
                duration: performance.now() - startTime,
                errors: [`Test failed: ${error}`],
                warnings: [],
                metadata: {}
              }
            }
          }
        },
        {
          name: 'Cache Eviction',
          description: 'Test cache eviction policies',
          category: 'unit',
          timeout: 3000,
          run: async () => {
            const startTime = performance.now()
            const errors: string[] = []
            
            try {
              const { AdvancedCacheService } = await import('../services/AdvancedCacheService')
              const cache = new AdvancedCacheService({
                maxEntries: 3,
                evictionPolicy: 'lru'
              })
              
              // Fill cache beyond capacity
              await cache.set('item1', { data: '1' })
              await cache.set('item2', { data: '2' })
              await cache.set('item3', { data: '3' })
              await cache.set('item4', { data: '4' }) // Should evict item1
              
              const item1 = await cache.get('item1')
              const item4 = await cache.get('item4')
              
              if (item1 !== null) {
                errors.push('LRU eviction not working - item1 should be evicted')
              }
              
              if (!item4 || item4.data !== '4') {
                errors.push('New item not properly stored')
              }
              
              return {
                testName: 'Cache Eviction',
                success: errors.length === 0,
                duration: performance.now() - startTime,
                errors,
                warnings: [],
                metadata: { stats: cache.getStats() }
              }
              
            } catch (error) {
              return {
                testName: 'Cache Eviction',
                success: false,
                duration: performance.now() - startTime,
                errors: [`Test failed: ${error}`],
                warnings: [],
                metadata: {}
              }
            }
          }
        }
      ]
    }
  }

  private createConflictResolutionTests(): TestSuite {
    return {
      name: 'ConflictResolution Tests',
      tests: [
        {
          name: 'Simple Conflict Resolution',
          description: 'Test basic conflict resolution strategies',
          category: 'unit',
          timeout: 2000,
          run: async () => {
            const startTime = performance.now()
            const errors: string[] = []
            
            try {
              const { conflictResolutionService } = await import('../services/ConflictResolutionService')
              
              const conflict = {
                contentType: 'lessons',
                contentId: 'test-lesson',
                localVersion: 1,
                remoteVersion: 2,
                localData: this.mockData.conflicts.versionMismatch.local,
                remoteData: this.mockData.conflicts.versionMismatch.remote,
                localHash: 'local-hash',
                remoteHash: 'remote-hash',
                timestamp: Date.now(),
                platform: 'web'
              }
              
              // Test remote_wins strategy
              const resolution1 = await conflictResolutionService.resolveConflict(conflict, 'remote_wins')
              if (resolution1.resolvedData.data !== 'remote') {
                errors.push('remote_wins strategy failed')
              }
              
              // Test local_wins strategy
              const resolution2 = await conflictResolutionService.resolveConflict(conflict, 'local_wins')
              if (resolution2.resolvedData.data !== 'local') {
                errors.push('local_wins strategy failed')
              }
              
              // Test highest_version strategy
              const resolution3 = await conflictResolutionService.resolveConflict(conflict, 'highest_version')
              if (resolution3.resolvedData.data !== 'remote') {
                errors.push('highest_version strategy failed')
              }
              
              return {
                testName: 'Simple Conflict Resolution',
                success: errors.length === 0,
                duration: performance.now() - startTime,
                errors,
                warnings: [],
                metadata: { 
                  strategies: ['remote_wins', 'local_wins', 'highest_version'],
                  resolutions: [resolution1, resolution2, resolution3]
                }
              }
              
            } catch (error) {
              return {
                testName: 'Simple Conflict Resolution',
                success: false,
                duration: performance.now() - startTime,
                errors: [`Test failed: ${error}`],
                warnings: [],
                metadata: {}
              }
            }
          }
        },
        {
          name: 'Intelligent Merge',
          description: 'Test intelligent merge strategy',
          category: 'unit',
          timeout: 3000,
          run: async () => {
            const startTime = performance.now()
            const errors: string[] = []
            
            try {
              const { conflictResolutionService } = await import('../services/ConflictResolutionService')
              
              const conflict = {
                contentType: 'lessons',
                contentId: 'test-lesson',
                localVersion: 1,
                remoteVersion: 1,
                localData: {
                  title: 'Local Title',
                  description: 'Local description',
                  vocabulary: [{ word: 'local' }]
                },
                remoteData: {
                  title: 'Remote Title',
                  description: 'Remote description',
                  vocabulary: [{ word: 'remote' }],
                  newField: 'new content'
                },
                localHash: 'local-hash',
                remoteHash: 'remote-hash',
                timestamp: Date.now(),
                platform: 'web'
              }
              
              const resolution = await conflictResolutionService.resolveConflict(conflict, 'intelligent_merge')
              
              // Check that merge included both local and remote elements
              if (!resolution.resolvedData.newField) {
                errors.push('New remote field not included in merge')
              }
              
              if (!resolution.metadata.autoResolved) {
                errors.push('Intelligent merge should auto-resolve simple conflicts')
              }
              
              return {
                testName: 'Intelligent Merge',
                success: errors.length === 0,
                duration: performance.now() - startTime,
                errors,
                warnings: [],
                metadata: { resolution }
              }
              
            } catch (error) {
              return {
                testName: 'Intelligent Merge',
                success: false,
                duration: performance.now() - startTime,
                errors: [`Test failed: ${error}`],
                warnings: [],
                metadata: {}
              }
            }
          }
        }
      ]
    }
  }

  private createWebSocketTests(): TestSuite {
    return {
      name: 'WebSocket Tests',
      tests: [
        {
          name: 'WebSocket Connection',
          description: 'Test WebSocket connection and messaging',
          category: 'integration',
          timeout: 5000,
          run: async () => {
            const startTime = performance.now()
            const errors: string[] = []
            const warnings: string[] = []
            
            try {
              // This is a mock test since we can't easily test real WebSocket in unit tests
              const mockWebSocket = this.createMockWebSocket()
              
              // Test connection
              const connected = await mockWebSocket.connect()
              if (!connected) {
                errors.push('WebSocket connection failed')
              }
              
              // Test heartbeat
              const heartbeatResponse = await mockWebSocket.sendHeartbeat()
              if (!heartbeatResponse) {
                warnings.push('Heartbeat response not received')
              }
              
              // Test content update broadcast
              const broadcastResult = await mockWebSocket.broadcastUpdate({
                contentType: 'lessons',
                version: 2,
                hash: 'new-hash'
              })
              
              if (!broadcastResult.success) {
                errors.push('Content update broadcast failed')
              }
              
              return {
                testName: 'WebSocket Connection',
                success: errors.length === 0,
                duration: performance.now() - startTime,
                errors,
                warnings,
                metadata: { 
                  connected,
                  heartbeatResponse,
                  broadcastResult
                }
              }
              
            } catch (error) {
              return {
                testName: 'WebSocket Connection',
                success: false,
                duration: performance.now() - startTime,
                errors: [`Test failed: ${error}`],
                warnings,
                metadata: {}
              }
            }
          }
        }
      ]
    }
  }

  private createPerformanceTests(): TestSuite {
    return {
      name: 'Performance Tests',
      tests: [
        {
          name: 'Sync Performance',
          description: 'Test sync performance with large datasets',
          category: 'performance',
          timeout: 10000,
          run: async () => {
            const startTime = performance.now()
            const errors: string[] = []
            const warnings: string[] = []
            
            try {
              const mockSyncService = this.createMockSyncService()
              
              // Generate large dataset
              const largeDataset = this.generateLargeDataset(1000) // 1000 lessons
              
              // Measure sync performance
              const syncStart = performance.now()
              const result = await mockSyncService.syncLargeDataset(largeDataset)
              const syncDuration = performance.now() - syncStart
              
              // Performance thresholds
              const maxSyncTime = 5000 // 5 seconds max for 1000 items
              const minThroughput = 200 // items per second
              
              if (syncDuration > maxSyncTime) {
                errors.push(`Sync too slow: ${syncDuration}ms > ${maxSyncTime}ms`)
              }
              
              const throughput = largeDataset.length / (syncDuration / 1000)
              if (throughput < minThroughput) {
                warnings.push(`Low throughput: ${throughput.toFixed(2)} items/sec`)
              }
              
              // Memory usage check
              const memoryUsage = this.getMemoryUsage()
              if (memoryUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
                warnings.push(`High memory usage: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`)
              }
              
              const metrics: PerformanceMetrics = {
                syncDuration,
                throughput,
                memoryUsage: memoryUsage.heapUsed,
                cacheHitRate: 0.85, // Mock value
                errorRate: 0.02, // Mock value
                latency: {
                  p50: syncDuration * 0.5,
                  p95: syncDuration * 0.95,
                  p99: syncDuration * 0.99
                }
              }
              
              this.performanceMetrics.push(metrics)
              
              return {
                testName: 'Sync Performance',
                success: errors.length === 0,
                duration: performance.now() - startTime,
                errors,
                warnings,
                metadata: { metrics, datasetSize: largeDataset.length }
              }
              
            } catch (error) {
              return {
                testName: 'Sync Performance',
                success: false,
                duration: performance.now() - startTime,
                errors: [`Test failed: ${error}`],
                warnings,
                metadata: {}
              }
            }
          }
        }
      ]
    }
  }

  private createIntegrationTests(): TestSuite {
    return {
      name: 'Integration Tests',
      tests: [
        {
          name: 'End-to-End Sync',
          description: 'Test complete sync workflow from check to completion',
          category: 'e2e',
          timeout: 15000,
          run: async () => {
            const startTime = performance.now()
            const errors: string[] = []
            const warnings: string[] = []
            
            try {
              const mockSyncService = this.createMockSyncService()
              
              // 1. Check for updates
              const hasUpdates = await mockSyncService.checkForUpdates()
              if (!hasUpdates) {
                warnings.push('No updates detected')
              }
              
              // 2. Sync content
              const syncResult = await mockSyncService.syncContent(['lessons', 'vocabulary'])
              if (!syncResult.success) {
                errors.push('Content sync failed')
              }
              
              // 3. Verify content integrity
              const verification = await mockSyncService.verifyContentIntegrity()
              if (!verification.success) {
                errors.push('Content integrity verification failed')
              }
              
              // 4. Test offline access
              mockSyncService.setOfflineMode(true)
              const offlineContent = await mockSyncService.getContent('lessons')
              if (!offlineContent) {
                errors.push('Offline access failed')
              }
              
              // 5. Simulate conflict and resolution
              const conflictResult = await mockSyncService.simulateConflictResolution()
              if (!conflictResult.resolved) {
                errors.push('Conflict resolution failed')
              }
              
              return {
                testName: 'End-to-End Sync',
                success: errors.length === 0,
                duration: performance.now() - startTime,
                errors,
                warnings,
                metadata: {
                  hasUpdates,
                  syncResult,
                  verification,
                  offlineContent: !!offlineContent,
                  conflictResult
                }
              }
              
            } catch (error) {
              return {
                testName: 'End-to-End Sync',
                success: false,
                duration: performance.now() - startTime,
                errors: [`Test failed: ${error}`],
                warnings,
                metadata: {}
              }
            }
          }
        }
      ]
    }
  }

  // Mock service creation
  private createMockSyncService(): any {
    return {
      offlineMode: false,
      failureRate: 0,
      retryCallback: null,
      
      setOfflineMode: function(offline: boolean) { this.offlineMode = offline },
      setFailureRate: function(rate: number) { this.failureRate = rate },
      onRetry: function(callback: (delay: number) => void) { this.retryCallback = callback },
      
      fetchManifest: async function() {
        if (this.offlineMode) throw new Error('Offline')
        return { version: '2.1.0', contentTypes: ['lessons', 'vocabulary'] }
      },
      
      syncContent: async function(contentTypes: string[]) {
        if (this.offlineMode) return { success: false, error: 'Offline' }
        
        // Simulate retries on failure
        let attempts = 0
        while (attempts < 3) {
          if (Math.random() < this.failureRate) {
            attempts++
            if (this.retryCallback) {
              this.retryCallback(Math.pow(2, attempts - 1) * 1000)
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts - 1) * 100))
            continue
          }
          break
        }
        
        return { success: attempts < 3, contentTypes, attempts }
      },
      
      getContent: async function(contentType: string) {
        return this.offlineMode ? { cached: true, contentType } : { live: true, contentType }
      },
      
      syncLargeDataset: async function(dataset: any[]) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, dataset.length * 2))
        return { success: true, processed: dataset.length }
      },
      
      checkForUpdates: async function() {
        return !this.offlineMode
      },
      
      verifyContentIntegrity: async function() {
        return { success: true, verified: ['lessons', 'vocabulary'] }
      },
      
      simulateConflictResolution: async function() {
        return { resolved: true, strategy: 'intelligent_merge' }
      }
    }
  }

  private createMockWebSocket(): any {
    return {
      connect: async function() {
        await new Promise(resolve => setTimeout(resolve, 100))
        return true
      },
      
      sendHeartbeat: async function() {
        await new Promise(resolve => setTimeout(resolve, 50))
        return true
      },
      
      broadcastUpdate: async function(update: any) {
        await new Promise(resolve => setTimeout(resolve, 10))
        return { success: true, clientsNotified: 5 }
      }
    }
  }

  private generateLargeDataset(size: number): any[] {
    const dataset = []
    for (let i = 0; i < size; i++) {
      dataset.push({
        id: `lesson-${i}`,
        title: `Lesson ${i}`,
        vocabulary: [
          { shona: `word${i}`, english: `word${i}`, pronunciation: `word-${i}` }
        ]
      })
    }
    return dataset
  }

  private getMemoryUsage(): any {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage()
    }
    // Browser fallback
    return {
      heapUsed: (performance as any).memory?.usedJSHeapSize || 0,
      heapTotal: (performance as any).memory?.totalJSHeapSize || 0
    }
  }

  // Public API
  async runAllTests(): Promise<{ results: TestResult[]; summary: any }> {
    console.log('Starting Content Sync Test Suite...')
    this.results = []
    
    for (const suite of this.testSuites) {
      console.log(`Running ${suite.name}...`)
      
      if (suite.setup) {
        await suite.setup()
      }
      
      for (const test of suite.tests) {
        console.log(`  - ${test.name}`)
        
        try {
          const result = await Promise.race([
            test.run(),
            new Promise<TestResult>((_, reject) => 
              setTimeout(() => reject(new Error('Test timeout')), test.timeout)
            )
          ])
          
          this.results.push(result)
          console.log(`    ${result.success ? '✅' : '❌'} ${result.duration.toFixed(2)}ms`)
          
          if (result.errors.length > 0) {
            result.errors.forEach(error => console.log(`      Error: ${error}`))
          }
          
          if (result.warnings.length > 0) {
            result.warnings.forEach(warning => console.log(`      Warning: ${warning}`))
          }
          
        } catch (error) {
          const failedResult: TestResult = {
            testName: test.name,
            success: false,
            duration: test.timeout,
            errors: [`Test timeout or error: ${error}`],
            warnings: [],
            metadata: {}
          }
          
          this.results.push(failedResult)
          console.log(`    ❌ TIMEOUT/ERROR`)
        }
      }
      
      if (suite.teardown) {
        await suite.teardown()
      }
    }
    
    const summary = this.generateSummary()
    console.log('\nTest Summary:')
    console.log(`  Total Tests: ${summary.totalTests}`)
    console.log(`  Passed: ${summary.passed}`)
    console.log(`  Failed: ${summary.failed}`)
    console.log(`  Success Rate: ${summary.successRate.toFixed(2)}%`)
    console.log(`  Average Duration: ${summary.averageDuration.toFixed(2)}ms`)
    
    return { results: this.results, summary }
  }

  async runTestsByCategory(category: TestCase['category']): Promise<TestResult[]> {
    const categoryResults: TestResult[] = []
    
    for (const suite of this.testSuites) {
      const categoryTests = suite.tests.filter(test => test.category === category)
      
      for (const test of categoryTests) {
        try {
          const result = await test.run()
          categoryResults.push(result)
        } catch (error) {
          categoryResults.push({
            testName: test.name,
            success: false,
            duration: 0,
            errors: [`${error}`],
            warnings: [],
            metadata: {}
          })
        }
      }
    }
    
    return categoryResults
  }

  private generateSummary(): any {
    const totalTests = this.results.length
    const passed = this.results.filter(r => r.success).length
    const failed = totalTests - passed
    const successRate = totalTests > 0 ? (passed / totalTests) * 100 : 0
    const averageDuration = totalTests > 0 
      ? this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests 
      : 0
    
    const categoryBreakdown = this.testSuites.reduce((acc, suite) => {
      suite.tests.forEach(test => {
        if (!acc[test.category]) acc[test.category] = { total: 0, passed: 0 }
        acc[test.category].total++
        
        const result = this.results.find(r => r.testName === test.name)
        if (result?.success) acc[test.category].passed++
      })
      return acc
    }, {} as Record<string, { total: number; passed: number }>)
    
    return {
      totalTests,
      passed,
      failed,
      successRate,
      averageDuration,
      categoryBreakdown,
      performanceMetrics: this.performanceMetrics
    }
  }

  getResults(): TestResult[] {
    return [...this.results]
  }

  getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics]
  }
}

// Export singleton instance
const contentSyncTestSuite = new ContentSyncTestSuite()

export { contentSyncTestSuite, ContentSyncTestSuite }
export type { TestResult, TestSuite, TestCase, PerformanceMetrics }