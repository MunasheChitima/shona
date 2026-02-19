import { Page } from 'puppeteer';
import { TestRunner, TestResult, PerformanceThresholds } from './types';
import { ForensicLogger } from './forensic-logger';

export class PerformanceTester implements TestRunner {
  private logger: ForensicLogger;
  private baseUrl: string;
  
  private thresholds: PerformanceThresholds = {
    pageLoadTime: 3000,
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500,
    totalBlockingTime: 300,
    cumulativeLayoutShift: 0.1,
    timeToInteractive: 3500,
    apiResponseTime: 1000
  };

  constructor(logger: ForensicLogger, baseUrl: string) {
    this.logger = logger;
    this.baseUrl = baseUrl;
  }

  async runTests(page: Page): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    const performanceTests = [
      this.testPageLoadPerformance.bind(this),
      this.testCoreWebVitals.bind(this),
      this.testResourceLoading.bind(this),
      this.testAPIResponseTimes.bind(this),
      this.testMemoryUsage.bind(this),
      this.testCPUUsage.bind(this),
      this.testRenderingPerformance.bind(this),
      this.testNavigationSpeed.bind(this),
      this.testAssetOptimization.bind(this),
      this.testCachePerformance.bind(this),
      this.testLazyLoading.bind(this),
      this.testBundleSize.bind(this),
      this.testDatabaseQueryPerformance.bind(this),
      this.testConcurrentUserLoad.bind(this),
      this.testLongRunningTasks.bind(this)
    ];

    for (const test of performanceTests) {
      try {
        const result = await test(page);
        results.push(result);
      } catch (error) {
        this.logger.logError(`Performance test failed: ${error}`);
        results.push({
          testName: test.name,
          success: false,
          error: `Unexpected error: ${error}`,
          timestamp: Date.now(),
          duration: 0
        });
      }
    }

    return results;
  }

  private async testPageLoadPerformance(page: Page): Promise<TestResult> {
    const testName = 'Page Load Performance Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const routes = [
        { path: '/', name: 'Home' },
        { path: '/learn', name: 'Learn' },
        { path: '/pronunciation', name: 'Pronunciation' },
        { path: '/quests', name: 'Quests' },
        { path: '/profile', name: 'Profile' }
      ];
      
      const loadTimeResults: any[] = [];
      
      for (const route of routes) {
        // Clear cache for accurate measurement
        await page.setCacheEnabled(false);
        
        const navigationStart = Date.now();
        await page.goto(`${this.baseUrl}${route.path}`, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
        const navigationEnd = Date.now();
        
        const loadTime = navigationEnd - navigationStart;
        
        // Get performance metrics
        const performanceData = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            responseTime: navigation.responseEnd - navigation.requestStart,
            domInteractive: navigation.domInteractive - navigation.fetchStart,
            transferSize: navigation.transferSize || 0,
            encodedBodySize: navigation.encodedBodySize || 0
          };
        });
        
        loadTimeResults.push({
          route: route.name,
          loadTime,
          ...performanceData
        });
        
        this.logger.logPerformanceMetrics(route.name, {
          duration: loadTime,
          performanceMetrics: performanceData
        });
        
        // Re-enable cache
        await page.setCacheEnabled(true);
      }
      
      // Analyze results
      const slowPages = loadTimeResults.filter(r => r.loadTime > this.thresholds.pageLoadTime);
      const avgLoadTime = loadTimeResults.reduce((sum, r) => sum + r.loadTime, 0) / loadTimeResults.length;
      
      return {
        testName,
        success: slowPages.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: slowPages.map(p => `${p.route} took ${p.loadTime}ms to load`),
        metrics: {
          duration: Date.now() - startTime,
          performanceMetrics: {
            loadComplete: avgLoadTime
          }
        }
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testCoreWebVitals(page: Page): Promise<TestResult> {
    const testName = 'Core Web Vitals Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to main page
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      
      // Wait for page to stabilize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
             // Measure Core Web Vitals
       const webVitals: any = await page.evaluate(() => {
         return new Promise((resolve) => {
           const results: any = {};
           
           // Largest Contentful Paint
           new PerformanceObserver((list) => {
             const entries = list.getEntries();
             const lastEntry = entries[entries.length - 1];
             results.lcp = lastEntry.startTime;
           }).observe({ entryTypes: ['largest-contentful-paint'] });
           
           // First Input Delay (simulated)
           results.fid = 0; // Would need actual user interaction
           
           // Cumulative Layout Shift
           let clsValue = 0;
           new PerformanceObserver((list) => {
             for (const entry of list.getEntries()) {
               if (!(entry as any).hadRecentInput) {
                 clsValue += (entry as any).value;
               }
             }
             results.cls = clsValue;
           }).observe({ entryTypes: ['layout-shift'] });
           
           // First Contentful Paint
           const paintEntries = performance.getEntriesByType('paint');
           const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');
           results.fcp = fcp ? fcp.startTime : 0;
           
           // Time to Interactive (approximate)
           results.tti = performance.timing.domInteractive - performance.timing.navigationStart;
           
           // Total Blocking Time (approximate)
           const longTasks = performance.getEntriesByType('longtask');
           results.tbt = longTasks.reduce((total, task) => total + Math.max(0, task.duration - 50), 0);
           
           setTimeout(() => resolve(results), 1000);
         });
       });
      
      this.logger.logInfo(`Core Web Vitals: ${JSON.stringify(webVitals)}`);
      
      // Check against thresholds
      const issues: string[] = [];
      
      if (webVitals.fcp > this.thresholds.firstContentfulPaint) {
        issues.push(`FCP (${webVitals.fcp}ms) exceeds threshold (${this.thresholds.firstContentfulPaint}ms)`);
      }
      if (webVitals.lcp > this.thresholds.largestContentfulPaint) {
        issues.push(`LCP (${webVitals.lcp}ms) exceeds threshold (${this.thresholds.largestContentfulPaint}ms)`);
      }
      if (webVitals.cls > this.thresholds.cumulativeLayoutShift) {
        issues.push(`CLS (${webVitals.cls}) exceeds threshold (${this.thresholds.cumulativeLayoutShift})`);
      }
      if (webVitals.tbt > this.thresholds.totalBlockingTime) {
        issues.push(`TBT (${webVitals.tbt}ms) exceeds threshold (${this.thresholds.totalBlockingTime}ms)`);
      }
      
      return {
        testName,
        success: issues.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: issues,
        metrics: {
          duration: Date.now() - startTime,
          performanceMetrics: {
            firstContentfulPaint: webVitals.fcp,
            largestContentfulPaint: webVitals.lcp,
            cumulativeLayoutShift: webVitals.cls,
            totalBlockingTime: webVitals.tbt
          }
        }
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testResourceLoading(page: Page): Promise<TestResult> {
    const testName = 'Resource Loading Performance Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const resourceMetrics: any = {
        images: [],
        scripts: [],
        stylesheets: [],
        fonts: [],
        total: 0
      };
      
      // Monitor resource loading
      page.on('response', async (response) => {
        const url = response.url();
        const timing = response.timing();
        
        if (!timing) return;
        
        const resourceType = response.request().resourceType();
        const loadTime = timing.receiveHeadersEnd - timing.requestTime;
        const size = parseInt(response.headers()['content-length'] || '0');
        
        const resourceInfo = {
          url: url.substring(url.lastIndexOf('/') + 1),
          loadTime,
          size,
          status: response.status()
        };
        
        switch (resourceType) {
          case 'image':
            resourceMetrics.images.push(resourceInfo);
            break;
          case 'script':
            resourceMetrics.scripts.push(resourceInfo);
            break;
          case 'stylesheet':
            resourceMetrics.stylesheets.push(resourceInfo);
            break;
          case 'font':
            resourceMetrics.fonts.push(resourceInfo);
            break;
        }
        
        resourceMetrics.total += size;
      });
      
      // Navigate to resource-heavy page
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      
      // Analyze resource loading
      const slowResources: any[] = [];
      const largeResources: any[] = [];
      
      Object.entries(resourceMetrics).forEach(([type, resources]: [string, any]) => {
        if (Array.isArray(resources)) {
          resources.forEach((resource: any) => {
            if (resource.loadTime > 1000) {
              slowResources.push({ type, ...resource });
            }
            if (resource.size > 500 * 1024) { // 500KB
              largeResources.push({ type, ...resource });
            }
          });
        }
      });
      
      this.logger.logInfo(`Total resources loaded: ${resourceMetrics.total} bytes`);
      
      const warnings: string[] = [];
      if (slowResources.length > 0) {
        warnings.push(`${slowResources.length} slow-loading resources detected`);
      }
      if (largeResources.length > 0) {
        warnings.push(`${largeResources.length} large resources detected (>500KB)`);
      }
      if (resourceMetrics.total > 5 * 1024 * 1024) { // 5MB
        warnings.push(`Total page size (${(resourceMetrics.total / 1024 / 1024).toFixed(2)}MB) is too large`);
      }
      
      return {
        testName,
        success: warnings.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings,
        metrics: {
          duration: Date.now() - startTime,
          networkMetrics: {
            requests: Object.values(resourceMetrics)
              .filter(Array.isArray)
              .reduce((sum: number, arr: any[]) => sum + arr.length, 0),
            failures: Object.values(resourceMetrics)
              .filter(Array.isArray)
              .flat()
              .filter((r: any) => r.status >= 400).length,
            totalSize: resourceMetrics.total,
            totalDuration: Date.now() - startTime
          }
        }
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testAPIResponseTimes(page: Page): Promise<TestResult> {
    const testName = 'API Response Time Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const apiCalls: any[] = [];
      
      // Intercept API calls
      await page.setRequestInterception(true);
      
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          (request as any).timing = Date.now();
        }
        request.continue();
      });
      
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          const request = response.request();
          const timing = (request as any).timing;
          if (timing) {
            const responseTime = Date.now() - timing;
            apiCalls.push({
              endpoint: response.url().replace(this.baseUrl, ''),
              method: request.method(),
              status: response.status(),
              responseTime
            });
          }
        }
      });
      
      // Perform actions that trigger API calls
      await page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
      await page.type('input[name="email"]', 'test@example.com');
      await page.type('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
      
      // Navigate to trigger more API calls
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      await page.goto(`${this.baseUrl}/quests`, { waitUntil: 'networkidle2' });
      
      // Analyze API performance
      const slowAPIs = apiCalls.filter(api => api.responseTime > this.thresholds.apiResponseTime);
      const failedAPIs = apiCalls.filter(api => api.status >= 400);
      const avgResponseTime = apiCalls.length > 0 
        ? apiCalls.reduce((sum, api) => sum + api.responseTime, 0) / apiCalls.length 
        : 0;
      
      this.logger.logInfo(`API calls analyzed: ${apiCalls.length}`);
      this.logger.logInfo(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
      
      const warnings: string[] = [];
      if (slowAPIs.length > 0) {
        slowAPIs.forEach(api => {
          warnings.push(`${api.endpoint} took ${api.responseTime}ms`);
        });
      }
      if (failedAPIs.length > 0) {
        failedAPIs.forEach(api => {
          warnings.push(`${api.endpoint} failed with status ${api.status}`);
        });
      }
      
      return {
        testName,
        success: slowAPIs.length === 0 && failedAPIs.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings,
        metrics: {
          duration: Date.now() - startTime,
          networkMetrics: {
            requests: apiCalls.length,
            failures: failedAPIs.length,
            totalSize: 0,
            totalDuration: avgResponseTime
          }
        }
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      await page.setRequestInterception(false);
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testMemoryUsage(page: Page): Promise<TestResult> {
    const testName = 'Memory Usage Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const memorySnapshots: any[] = [];
      const actions = [
        { name: 'Initial', action: async () => {} },
        { name: 'After Login', action: async () => {
          await page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
          await page.type('input[name="email"]', 'test@example.com');
          await page.type('input[name="password"]', 'password123');
          await page.click('button[type="submit"]');
          await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
        }},
        { name: 'After Loading Lessons', action: async () => {
          await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
        }},
        { name: 'After Exercise Modal', action: async () => {
          const lessonCard = await page.$('[data-testid="lesson-card"]');
          if (lessonCard) {
            await lessonCard.click();
            await page.waitForSelector('[data-testid="exercise-modal"]', { timeout: 5000 }).catch(() => {});
          }
        }},
        { name: 'After Heavy Navigation', action: async () => {
          for (let i = 0; i < 5; i++) {
            await page.goto(`${this.baseUrl}/pronunciation`, { waitUntil: 'networkidle2' });
            await page.goto(`${this.baseUrl}/quests`, { waitUntil: 'networkidle2' });
            await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
          }
        }}
      ];
      
      for (const { name, action } of actions) {
        await action();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Let memory settle
        
                 const metrics = await page.metrics();
         const jsHeapUsed = metrics.JSHeapUsedSize || 0;
         const jsHeapTotal = metrics.JSHeapTotalSize || 0;
         
         memorySnapshots.push({
           checkpoint: name,
           heapUsed: jsHeapUsed,
           heapTotal: jsHeapTotal,
           heapPercentage: jsHeapTotal > 0 ? (jsHeapUsed / jsHeapTotal) * 100 : 0
         });
         
         this.logger.logMemorySnapshot(name, jsHeapUsed, jsHeapTotal);
      }
      
      // Check for memory leaks
      const initialMemory = memorySnapshots[0].heapUsed;
      const finalMemory = memorySnapshots[memorySnapshots.length - 1].heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      const growthPercentage = (memoryGrowth / initialMemory) * 100;
      
      const warnings: string[] = [];
      if (memoryGrowth > 50 * 1024 * 1024) { // 50MB growth
        warnings.push(`Memory grew by ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB (${growthPercentage.toFixed(2)}%)`);
      }
      if (finalMemory > 100 * 1024 * 1024) { // 100MB total
        warnings.push(`High memory usage: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
      }
      
      // Check for consistent growth pattern (potential leak)
      let consistentGrowth = true;
      for (let i = 1; i < memorySnapshots.length - 1; i++) {
        if (memorySnapshots[i].heapUsed >= memorySnapshots[i + 1].heapUsed) {
          consistentGrowth = false;
          break;
        }
      }
      
      if (consistentGrowth && memorySnapshots.length > 3) {
        warnings.push('Potential memory leak detected - consistent memory growth');
      }
      
      return {
        testName,
        success: warnings.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings,
        metrics: {
          duration: Date.now() - startTime,
          memoryUsage: {
            heapUsed: finalMemory,
            heapTotal: memorySnapshots[memorySnapshots.length - 1].heapTotal,
            external: memoryGrowth
          }
        }
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testCPUUsage(page: Page): Promise<TestResult> {
    const testName = 'CPU Usage Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Start CPU profiling
      await page.tracing.start({ 
        path: `${this.logger.getOutputDir()}/traces/cpu-trace.json`,
        categories: ['devtools.timeline']
      });
      
      // Perform CPU-intensive operations
      const operations = [
        async () => {
          // Rapid navigation
          for (let i = 0; i < 10; i++) {
            await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'domcontentloaded' });
          }
        },
        async () => {
          // Heavy DOM manipulation
          await page.evaluate(() => {
            for (let i = 0; i < 1000; i++) {
              const div = document.createElement('div');
              div.textContent = `Test element ${i}`;
              document.body.appendChild(div);
            }
          });
        },
        async () => {
          // Animation stress test
          await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            elements.forEach((el: any) => {
              el.style.transition = 'all 0.3s';
              el.style.transform = 'scale(1.1)';
            });
          });
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      ];
      
      const cpuMetrics: any[] = [];
      
      for (const operation of operations) {
        const beforeMetrics = await page.metrics();
        const startTaskTime = beforeMetrics.TaskDuration || 0;
        
        await operation();
        
        const afterMetrics = await page.metrics();
        const endTaskTime = afterMetrics.TaskDuration || 0;
        const taskDuration = endTaskTime - startTaskTime;
        
        cpuMetrics.push({
          taskDuration,
          layoutCount: (afterMetrics as any).LayoutCount || 0,
          recalcStyleCount: (afterMetrics as any).RecalcStyleCount || 0
        });
      }
      
      // Stop tracing
      await page.tracing.stop();
      
      // Analyze CPU usage
      const avgTaskDuration = cpuMetrics.reduce((sum, m) => sum + m.taskDuration, 0) / cpuMetrics.length;
      const totalLayoutCount = cpuMetrics.reduce((sum, m) => sum + m.layoutCount, 0);
      const totalRecalcCount = cpuMetrics.reduce((sum, m) => sum + m.recalcStyleCount, 0);
      
      const warnings: string[] = [];
      if (avgTaskDuration > 100) {
        warnings.push(`High average task duration: ${avgTaskDuration.toFixed(2)}ms`);
      }
      if (totalLayoutCount > 100) {
        warnings.push(`Excessive layout recalculations: ${totalLayoutCount}`);
      }
      if (totalRecalcCount > 100) {
        warnings.push(`Excessive style recalculations: ${totalRecalcCount}`);
      }
      
      return {
        testName,
        success: warnings.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings,
        metrics: {
          duration: Date.now() - startTime,
          resourceMetrics: {
            layoutCount: totalLayoutCount,
            styleRecalcCount: totalRecalcCount
          }
        }
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testRenderingPerformance(page: Page): Promise<TestResult> {
    const testName = 'Rendering Performance Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to visually complex page
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      
      // Test scroll performance
      const scrollMetrics = await page.evaluate(async () => {
        const metrics: any = {
          scrollJank: 0,
          paintCount: 0,
          fps: []
        };
        
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFPS = () => {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;
          
          if (delta >= 1000) {
            metrics.fps.push(frameCount);
            frameCount = 0;
            lastTime = currentTime;
          }
          
          frameCount++;
          
          if (metrics.fps.length < 5) {
            requestAnimationFrame(measureFPS);
          }
        };
        
        measureFPS();
        
        // Perform smooth scroll
        const scrollHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const scrollDistance = scrollHeight - viewportHeight;
        
        if (scrollDistance > 0) {
          await new Promise((resolve) => {
            let scrolled = 0;
            const scrollStep = 50;
            
            const scrollInterval = setInterval(() => {
              window.scrollBy(0, scrollStep);
              scrolled += scrollStep;
              
              if (scrolled >= scrollDistance) {
                clearInterval(scrollInterval);
                resolve(undefined);
              }
            }, 16); // ~60fps
          });
        }
        
        // Wait for FPS measurement
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        return metrics;
      });
      
      // Test animation performance
      const animationMetrics = await page.evaluate(async () => {
        const results: any = {};
        
        // Trigger animations on all elements
        const elements = document.querySelectorAll('[data-testid="lesson-card"]');
        elements.forEach((el: any) => {
          el.style.transition = 'transform 0.3s ease';
          el.style.transform = 'translateY(-10px)';
        });
        
        // Measure repaint frequency
        let repaintCount = 0;
        const observer = new PerformanceObserver((list) => {
          repaintCount += list.getEntries().length;
        });
        observer.observe({ entryTypes: ['paint'] });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        observer.disconnect();
        results.repaintCount = repaintCount;
        
        return results;
      });
      
      // Analyze rendering performance
      const avgFPS = scrollMetrics.fps.length > 0 
        ? scrollMetrics.fps.reduce((a: number, b: number) => a + b, 0) / scrollMetrics.fps.length 
        : 0;
      
      const warnings: string[] = [];
      if (avgFPS < 50 && avgFPS > 0) {
        warnings.push(`Low FPS during scroll: ${avgFPS.toFixed(2)}`);
      }
      if (animationMetrics.repaintCount > 100) {
        warnings.push(`Excessive repaints: ${animationMetrics.repaintCount}`);
      }
      
      return {
        testName,
        success: warnings.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings,
        metrics: {
          duration: Date.now() - startTime,
          resourceMetrics: {
            frames: avgFPS
          }
        }
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testNavigationSpeed(page: Page): Promise<TestResult> {
    const testName = 'Navigation Speed Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const navigationTimings: any[] = [];
      
      // Test various navigation scenarios
      const scenarios = [
        { from: '/', to: '/learn', type: 'cold' },
        { from: '/learn', to: '/pronunciation', type: 'warm' },
        { from: '/pronunciation', to: '/quests', type: 'warm' },
        { from: '/quests', to: '/learn', type: 'back' },
        { from: '/learn', to: '/profile', type: 'warm' }
      ];
      
      for (const scenario of scenarios) {
        // Navigate to starting point
        await page.goto(`${this.baseUrl}${scenario.from}`, { waitUntil: 'networkidle2' });
        
        // Measure navigation time
        const navStart = Date.now();
        
        if (scenario.type === 'back') {
          await page.goBack({ waitUntil: 'networkidle2' });
        } else {
          await page.goto(`${this.baseUrl}${scenario.to}`, { waitUntil: 'networkidle2' });
        }
        
        const navEnd = Date.now();
        const navigationTime = navEnd - navStart;
        
        // Get detailed timing
        const timing = await page.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            fetchStart: nav.fetchStart,
            responseEnd: nav.responseEnd,
            domInteractive: nav.domInteractive,
            domComplete: nav.domComplete,
            loadComplete: nav.loadEventEnd
          };
        });
        
        navigationTimings.push({
          ...scenario,
          totalTime: navigationTime,
          serverTime: timing.responseEnd - timing.fetchStart,
          domTime: timing.domComplete - timing.domInteractive,
          resourceTime: timing.loadComplete - timing.domComplete
        });
      }
      
      // Analyze navigation performance
      const slowNavigations = navigationTimings.filter(n => n.totalTime > 2000);
      const avgNavTime = navigationTimings.reduce((sum, n) => sum + n.totalTime, 0) / navigationTimings.length;
      
      const warnings: string[] = [];
      slowNavigations.forEach(nav => {
        warnings.push(`${nav.from} → ${nav.to} took ${nav.totalTime}ms`);
      });
      
      if (avgNavTime > 1500) {
        warnings.push(`Average navigation time too high: ${avgNavTime.toFixed(2)}ms`);
      }
      
      return {
        testName,
        success: slowNavigations.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings,
        metrics: {
          duration: Date.now() - startTime,
          performanceMetrics: {
            domContentLoaded: avgNavTime
          }
        }
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testAssetOptimization(page: Page): Promise<TestResult> {
    const testName = 'Asset Optimization Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const assetIssues: string[] = [];
      
      // Monitor assets
      page.on('response', async (response) => {
        const url = response.url();
        const headers = response.headers();
        
        // Check compression
        if (!headers['content-encoding'] && response.status() === 200) {
          const contentType = headers['content-type'] || '';
          if (contentType.includes('javascript') || contentType.includes('css') || contentType.includes('json')) {
            assetIssues.push(`Uncompressed asset: ${url.substring(url.lastIndexOf('/') + 1)}`);
          }
        }
        
        // Check caching headers
        if (!headers['cache-control'] && !headers['expires']) {
          assetIssues.push(`No cache headers: ${url.substring(url.lastIndexOf('/') + 1)}`);
        }
        
        // Check image optimization
        if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
          const size = parseInt(headers['content-length'] || '0');
          if (size > 200 * 1024) { // 200KB
            assetIssues.push(`Large image (${(size / 1024).toFixed(0)}KB): ${url.substring(url.lastIndexOf('/') + 1)}`);
          }
        }
      });
      
      // Navigate to trigger asset loading
      await page.goto(`${this.baseUrl}`, { waitUntil: 'networkidle2' });
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      
      // Check for unused CSS
      const coverage = await page.coverage.startCSSCoverage();
      await page.goto(`${this.baseUrl}/pronunciation`, { waitUntil: 'networkidle2' });
      const cssCoverage = await page.coverage.stopCSSCoverage();
      
      const unusedCSS = cssCoverage.filter(entry => {
        const usedBytes = entry.ranges.reduce((sum, range) => sum + range.end - range.start, 0);
        const totalBytes = entry.text.length;
        const usedPercentage = (usedBytes / totalBytes) * 100;
        return usedPercentage < 50;
      });
      
      if (unusedCSS.length > 0) {
        unusedCSS.forEach(css => {
          assetIssues.push(`CSS file has <50% usage: ${css.url.substring(css.url.lastIndexOf('/') + 1)}`);
        });
      }
      
      return {
        testName,
        success: assetIssues.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: assetIssues
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testCachePerformance(page: Page): Promise<TestResult> {
    const testName = 'Cache Performance Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // First load (cold cache)
      await page.setCacheEnabled(false);
      const coldLoadStart = Date.now();
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      const coldLoadTime = Date.now() - coldLoadStart;
      
      const coldMetrics = await page.evaluate(() => {
        return performance.getEntriesByType('resource').length;
      });
      
      // Second load (warm cache)
      await page.setCacheEnabled(true);
      const warmLoadStart = Date.now();
      await page.reload({ waitUntil: 'networkidle2' });
      const warmLoadTime = Date.now() - warmLoadStart;
      
      const warmMetrics = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return {
          total: resources.length,
          fromCache: resources.filter(r => r.transferSize === 0).length
        };
      });
      
      // Calculate cache effectiveness
      const cacheHitRate = warmMetrics.fromCache / warmMetrics.total * 100;
      const loadTimeImprovement = ((coldLoadTime - warmLoadTime) / coldLoadTime) * 100;
      
      const warnings: string[] = [];
      if (cacheHitRate < 80) {
        warnings.push(`Low cache hit rate: ${cacheHitRate.toFixed(2)}%`);
      }
      if (loadTimeImprovement < 30) {
        warnings.push(`Minimal cache performance improvement: ${loadTimeImprovement.toFixed(2)}%`);
      }
      
      this.logger.logInfo(`Cache performance - Cold: ${coldLoadTime}ms, Warm: ${warmLoadTime}ms`);
      
      return {
        testName,
        success: warnings.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings,
        metrics: {
          duration: Date.now() - startTime,
          performanceMetrics: {
            loadComplete: warmLoadTime
          }
        }
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      await page.setCacheEnabled(true);
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testLazyLoading(page: Page): Promise<TestResult> {
    const testName = 'Lazy Loading Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const lazyLoadMetrics: any = {
        imagesLoaded: 0,
        imagesLazyLoaded: 0,
        scriptsDeferred: 0,
        totalInitialLoad: 0
      };
      
      // Monitor resource loading
      page.on('response', response => {
        const url = response.url();
        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          lazyLoadMetrics.imagesLoaded++;
        }
      });
      
      // Navigate and check initial load
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'domcontentloaded' });
      
      // Check for lazy loading attributes
      const lazyLoadingInfo = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        const lazyImages = images.filter(img => 
          img.loading === 'lazy' || 
          img.dataset.src || 
          img.classList.contains('lazy')
        );
        
        const scripts = Array.from(document.querySelectorAll('script'));
        const deferredScripts = scripts.filter(script => 
          script.defer || script.async
        );
        
        return {
          totalImages: images.length,
          lazyImages: lazyImages.length,
          totalScripts: scripts.length,
          deferredScripts: deferredScripts.length
        };
      });
      
      lazyLoadMetrics.imagesLazyLoaded = lazyLoadingInfo.lazyImages;
      lazyLoadMetrics.scriptsDeferred = lazyLoadingInfo.deferredScripts;
      
      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const warnings: string[] = [];
      
      if (lazyLoadingInfo.totalImages > 5 && lazyLoadingInfo.lazyImages < lazyLoadingInfo.totalImages * 0.5) {
        warnings.push(`Only ${lazyLoadingInfo.lazyImages}/${lazyLoadingInfo.totalImages} images are lazy loaded`);
      }
      
      if (lazyLoadingInfo.totalScripts > 3 && lazyLoadingInfo.deferredScripts < lazyLoadingInfo.totalScripts * 0.5) {
        warnings.push(`Only ${lazyLoadingInfo.deferredScripts}/${lazyLoadingInfo.totalScripts} scripts are deferred`);
      }
      
      return {
        testName,
        success: warnings.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testBundleSize(page: Page): Promise<TestResult> {
    const testName = 'Bundle Size Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const bundles: any = {
        js: [],
        css: [],
        totalSize: 0
      };
      
      // Monitor bundle loading
      page.on('response', async response => {
        const url = response.url();
        const headers = response.headers();
        const size = parseInt(headers['content-length'] || '0');
        
        if (url.match(/\.(js|mjs)$/i) || headers['content-type']?.includes('javascript')) {
          bundles.js.push({ url: url.substring(url.lastIndexOf('/') + 1), size });
          bundles.totalSize += size;
        }
        
        if (url.match(/\.css$/i) || headers['content-type']?.includes('css')) {
          bundles.css.push({ url: url.substring(url.lastIndexOf('/') + 1), size });
          bundles.totalSize += size;
        }
      });
      
      // Load the application
      await page.goto(`${this.baseUrl}`, { waitUntil: 'networkidle2' });
      
      // Calculate bundle metrics
      const jsSize = bundles.js.reduce((sum: number, b: any) => sum + b.size, 0);
      const cssSize = bundles.css.reduce((sum: number, b: any) => sum + b.size, 0);
      
      const warnings: string[] = [];
      
      // Check individual bundle sizes
      bundles.js.forEach((bundle: any) => {
        if (bundle.size > 500 * 1024) { // 500KB
          warnings.push(`Large JS bundle: ${bundle.url} (${(bundle.size / 1024).toFixed(0)}KB)`);
        }
      });
      
      // Check total sizes
      if (jsSize > 1.5 * 1024 * 1024) { // 1.5MB
        warnings.push(`Total JS size too large: ${(jsSize / 1024 / 1024).toFixed(2)}MB`);
      }
      
      if (cssSize > 300 * 1024) { // 300KB
        warnings.push(`Total CSS size too large: ${(cssSize / 1024).toFixed(0)}KB`);
      }
      
      if (bundles.totalSize > 2 * 1024 * 1024) { // 2MB
        warnings.push(`Total bundle size too large: ${(bundles.totalSize / 1024 / 1024).toFixed(2)}MB`);
      }
      
      this.logger.logInfo(`Bundle sizes - JS: ${(jsSize / 1024).toFixed(0)}KB, CSS: ${(cssSize / 1024).toFixed(0)}KB`);
      
      return {
        testName,
        success: warnings.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings,
        metrics: {
          duration: Date.now() - startTime,
          networkMetrics: {
            requests: bundles.js.length + bundles.css.length,
            failures: 0,
            totalSize: bundles.totalSize,
            totalDuration: Date.now() - startTime
          }
        }
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testDatabaseQueryPerformance(page: Page): Promise<TestResult> {
    const testName = 'Database Query Performance Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // This test monitors API response times as a proxy for database performance
      const queryMetrics: any[] = [];
      
      // Intercept API calls that likely involve database queries
      page.on('response', async response => {
        const url = response.url();
        if (url.includes('/api/')) {
          const timing = response.timing();
          if (timing) {
            queryMetrics.push({
              endpoint: url.replace(this.baseUrl, ''),
              responseTime: timing.receiveHeadersEnd,
              status: response.status()
            });
          }
        }
      });
      
      // Perform actions that trigger database queries
      const actions = [
        async () => {
          // Load lessons (likely queries lessons table)
          await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
        },
        async () => {
          // Load user profile (queries user data)
          await page.goto(`${this.baseUrl}/profile`, { waitUntil: 'networkidle2' });
        },
        async () => {
          // Load quests (queries quests and progress)
          await page.goto(`${this.baseUrl}/quests`, { waitUntil: 'networkidle2' });
        }
      ];
      
      for (const action of actions) {
        await action();
      }
      
      // Analyze query performance
      const slowQueries = queryMetrics.filter(q => q.responseTime > 500);
      const avgResponseTime = queryMetrics.length > 0
        ? queryMetrics.reduce((sum, q) => sum + q.responseTime, 0) / queryMetrics.length
        : 0;
      
      const warnings: string[] = [];
      slowQueries.forEach(query => {
        warnings.push(`Slow query: ${query.endpoint} (${query.responseTime.toFixed(0)}ms)`);
      });
      
      if (avgResponseTime > 200) {
        warnings.push(`High average query time: ${avgResponseTime.toFixed(0)}ms`);
      }
      
      return {
        testName,
        success: slowQueries.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testConcurrentUserLoad(page: Page): Promise<TestResult> {
    const testName = 'Concurrent User Load Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Simulate concurrent requests
      const concurrentRequests = 10;
      const requestPromises: Promise<any>[] = [];
      
      // Create multiple page contexts to simulate concurrent users
      const browser = page.browserContext().browser();
      if (!browser) {
        throw new Error('Browser not available');
      }
      
      // Create multiple pages directly instead of contexts
      const pages = await Promise.all(
        Array(concurrentRequests).fill(null).map(() => browser.newPage())
      );
       
       // Measure concurrent load
       const loadStart = Date.now();
       
       const loadPromises = pages.map(async (p: Page, index: number) => {
         const pageStart = Date.now();
         try {
           await p.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
           return {
             success: true,
             loadTime: Date.now() - pageStart,
             index
           };
         } catch (error) {
           return {
             success: false,
             error: error,
             loadTime: Date.now() - pageStart,
             index
           };
         }
       });
       
       const results = await Promise.all(loadPromises);
       const totalLoadTime = Date.now() - loadStart;
       
       // Cleanup
       await Promise.all(pages.map((p: any) => p.close()));
       
       // Analyze results
       const failures = results.filter((r: any) => !r.success);
       const avgLoadTime = results.reduce((sum: number, r: any) => sum + r.loadTime, 0) / results.length;
      const maxLoadTime = Math.max(...results.map(r => r.loadTime));
      
      const warnings: string[] = [];
      if (failures.length > 0) {
        warnings.push(`${failures.length}/${concurrentRequests} requests failed under load`);
      }
      if (avgLoadTime > 5000) {
        warnings.push(`High average load time under concurrent load: ${avgLoadTime.toFixed(0)}ms`);
      }
      if (maxLoadTime > 10000) {
        warnings.push(`Maximum load time too high: ${maxLoadTime.toFixed(0)}ms`);
      }
      
      this.logger.logInfo(`Concurrent load test - Total time: ${totalLoadTime}ms, Avg: ${avgLoadTime.toFixed(0)}ms`);
      
      return {
        testName,
        success: failures.length === 0 && avgLoadTime < 5000,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testLongRunningTasks(page: Page): Promise<TestResult> {
    const testName = 'Long Running Tasks Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Monitor long tasks
      const longTasks = await page.evaluateHandle(() => {
        return new Promise((resolve) => {
          const tasks: any[] = [];
          
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              tasks.push({
                name: entry.name,
                duration: entry.duration,
                startTime: entry.startTime
              });
            }
          });
          
          observer.observe({ entryTypes: ['longtask'] });
          
          // Perform actions that might trigger long tasks
          setTimeout(() => {
            // Simulate heavy computation
            let sum = 0;
            for (let i = 0; i < 1000000; i++) {
              sum += Math.sqrt(i);
            }
            
            // Trigger layout thrashing
            for (let i = 0; i < 100; i++) {
              document.body.style.padding = `${i}px`;
              document.body.offsetHeight; // Force layout
            }
            
            resolve(tasks);
          }, 100);
        });
      });
      
             const tasksArray = await longTasks.jsonValue() as any[];
       
       // Navigate and check for long tasks during normal usage
       await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
       
       // Check for tasks longer than 50ms
       const problematicTasks = tasksArray.filter((task: any) => task.duration > 50);
      
      const warnings: string[] = [];
      if (problematicTasks.length > 0) {
        problematicTasks.forEach((task: any) => {
          warnings.push(`Long task detected: ${task.duration.toFixed(0)}ms`);
        });
      }
      
      return {
        testName,
        success: problematicTasks.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings
      };
      
    } catch (error: any) {
      return {
        testName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }
}