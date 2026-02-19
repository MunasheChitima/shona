// Comprehensive testing utilities for the Shona learning app

export interface TestConfig {
  baseUrl: string
  timeout: number
  headless: boolean
  slowMo: number
  viewport: {
    width: number
    height: number
  }
}

export interface TestResult {
  name: string
  status: 'PASSED' | 'FAILED' | 'SKIPPED'
  duration: number
  error?: string
  screenshot?: string
  logs?: string[]
}

export class TestUtils {
  private config: TestConfig
  private results: TestResult[] = []
  private startTime: number = 0

  constructor(config: Partial<TestConfig> = {}) {
    this.config = {
      baseUrl: 'http://localhost:3000',
      timeout: 10000,
      headless: true,
      slowMo: 100,
      viewport: { width: 1280, height: 720 },
      ...config
    }
  }

  // Test runner with proper error handling
  async runTest(
    name: string,
    testFunction: () => Promise<void>,
    options: { skip?: boolean; timeout?: number } = {}
  ): Promise<TestResult> {
    const testStartTime = Date.now()
    
    if (options.skip) {
      return {
        name,
        status: 'SKIPPED',
        duration: 0
      }
    }

    try {
      console.log(`🧪 Running: ${name}`)
      await Promise.race([
        testFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), options.timeout || this.config.timeout)
        )
      ])
      
      const duration = Date.now() - testStartTime
      const result: TestResult = {
        name,
        status: 'PASSED',
        duration
      }
      
      this.results.push(result)
      console.log(`✅ PASSED: ${name} (${duration}ms)`)
      return result
    } catch (error) {
      const duration = Date.now() - testStartTime
      const result: TestResult = {
        name,
        status: 'FAILED',
        duration,
        error: error instanceof Error ? error.message : String(error)
      }
      
      this.results.push(result)
      console.log(`❌ FAILED: ${name} - ${result.error}`)
      return result
    }
  }

  // Browser setup utilities
  async setupBrowser(page: any) {
    await page.setViewport(this.config.viewport)
    await page.setDefaultTimeout(this.config.timeout)
    
    // Enable console logging
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        console.error(`Browser Error: ${msg.text()}`)
      }
    })

    // Enable error logging
    page.on('pageerror', (error: any) => {
      console.error(`Page Error: ${error.message}`)
    })
  }

  // Navigation utilities
  async navigateTo(page: any, path: string) {
    const url = `${this.config.baseUrl}${path}`
    await page.goto(url, { waitUntil: 'networkidle0' })
  }

  // Form interaction utilities
  async fillForm(page: any, formData: Record<string, string>) {
    for (const [selector, value] of Object.entries(formData)) {
      await page.type(selector, value)
    }
  }

  async submitForm(page: any, submitSelector: string) {
    await page.click(submitSelector)
    await page.waitForTimeout(1000) // Wait for form submission
  }

  // Element interaction utilities
  async waitForElement(page: any, selector: string, timeout?: number) {
    await page.waitForSelector(selector, { timeout: timeout || this.config.timeout })
  }

  async clickElement(page: any, selector: string) {
    await this.waitForElement(page, selector)
    await page.click(selector)
  }

  async getElementText(page: any, selector: string): Promise<string> {
    await this.waitForElement(page, selector)
    return page.$eval(selector, (el: any) => el.textContent.trim())
  }

  async getElementValue(page: any, selector: string): Promise<string> {
    await this.waitForElement(page, selector)
    return page.$eval(selector, (el: any) => el.value)
  }

  // Assertion utilities
  async assertElementExists(page: any, selector: string, message?: string) {
    const exists = await page.$(selector) !== null
    if (!exists) {
      throw new Error(message || `Element ${selector} not found`)
    }
  }

  async assertElementText(page: any, selector: string, expectedText: string, message?: string) {
    const actualText = await this.getElementText(page, selector)
    if (actualText !== expectedText) {
      throw new Error(message || `Expected "${expectedText}" but got "${actualText}"`)
    }
  }

  async assertUrlContains(page: any, expectedPath: string, message?: string) {
    const currentUrl = page.url()
    if (!currentUrl.includes(expectedPath)) {
      throw new Error(message || `Expected URL to contain "${expectedPath}" but got "${currentUrl}"`)
    }
  }

  // Authentication utilities
  async login(page: any, email: string, password: string) {
    await this.navigateTo(page, '/login')
    await this.fillForm(page, {
      'input[name="email"]': email,
      'input[name="password"]': password
    })
    await this.submitForm(page, 'button[type="submit"]')
    
    // Wait for redirect
    await page.waitForTimeout(2000)
  }

  async register(page: any, name: string, email: string, password: string) {
    await this.navigateTo(page, '/register')
    await this.fillForm(page, {
      'input[name="name"]': name,
      'input[name="email"]': email,
      'input[name="password"]': password
    })
    await this.submitForm(page, 'button[type="submit"]')
    
    // Wait for redirect
    await page.waitForTimeout(2000)
  }

  // Performance testing utilities
  async measurePageLoad(page: any, url: string): Promise<number> {
    const startTime = Date.now()
    await page.goto(url, { waitUntil: 'networkidle0' })
    return Date.now() - startTime
  }

  async getPerformanceMetrics(page: any) {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      }
    })
    return metrics
  }

  // Accessibility testing utilities
  async checkAccessibility(page: any) {
    // Basic accessibility checks
    const issues = []
    
    // Check for alt text on images
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img')
      return Array.from(images).filter(img => !img.alt).length
    })
    
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images missing alt text`)
    }

    // Check for proper heading structure
    const headingStructure = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const levels = Array.from(headings).map(h => parseInt(h.tagName[1]))
      return levels
    })
    
    // Check for heading level jumps
    for (let i = 1; i < headingStructure.length; i++) {
      if (headingStructure[i] - headingStructure[i - 1] > 1) {
        issues.push('Heading levels jump by more than 1')
        break
      }
    }

    return issues
  }

  // Screenshot utilities
  async takeScreenshot(page: any, name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `test-screenshots/${name}-${timestamp}.png`
    await page.screenshot({ path: filename, fullPage: true })
    return filename
  }

  // Test reporting
  generateReport(): {
    summary: {
      total: number
      passed: number
      failed: number
      skipped: number
      successRate: number
      totalDuration: number
    }
    results: TestResult[]
  } {
    const total = this.results.length
    const passed = this.results.filter(r => r.status === 'PASSED').length
    const failed = this.results.filter(r => r.status === 'FAILED').length
    const skipped = this.results.filter(r => r.status === 'SKIPPED').length
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)
    const successRate = total > 0 ? (passed / total) * 100 : 0

    return {
      summary: {
        total,
        passed,
        failed,
        skipped,
        successRate,
        totalDuration
      },
      results: [...this.results]
    }
  }

  // Cleanup
  reset() {
    this.results = []
    this.startTime = 0
  }
}

// Export singleton instance
export const testUtils = new TestUtils() 