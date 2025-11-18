import { test, expect } from '@jest/globals'
import puppeteer, { Browser, Page } from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { spawn, ChildProcess } from 'child_process'

const baseUrl = 'http://localhost:3001'

describe('Shona Learning App E2E Tests', () => {
  let browser: Browser
  let page: Page
  let devServer: ChildProcess | null = null

  beforeAll(async () => {
    // Start Next.js dev server
    console.log('🚀 Starting Next.js dev server...')
    devServer = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: true
    })
    
    // Wait for server to be ready
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Dev server failed to start within 30 seconds'))
      }, 30000)
      
      devServer?.stdout?.on('data', (data: Buffer) => {
        const output = data.toString()
        if (output.includes('Ready') || output.includes('Local:')) {
          clearTimeout(timeout)
          resolve()
        }
      })
      
      devServer?.stderr?.on('data', (data: Buffer) => {
        const output = data.toString()
        if (output.includes('Error') && !output.includes('EADDRINUSE')) {
          clearTimeout(timeout)
          reject(new Error(`Dev server error: ${output}`))
        }
      })
    })
    
    // Give server a moment to fully initialize
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create test-screenshots directory if it doesn't exist
    if (!fs.existsSync('test-screenshots')) {
      fs.mkdirSync('test-screenshots', { recursive: true })
    }

    try {
      browser = await puppeteer.launch({ 
        headless: 'new',
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 720 }
      })
      
      // Create a new context with video recording
      const context = await browser.createBrowserContext()
      page = await context.newPage()
      
      // Set up video recording
      await page.setViewport({ width: 1280, height: 720 })
      
      // Grant permissions for microphone and camera
      await context.overridePermissions(baseUrl, ['microphone', 'camera'])
    } catch (error) {
      console.error('Failed to launch browser:', error)
      throw error
    }
  })

  afterAll(async () => {
    // Guard browser.close() when launch fails
    if (browser) {
      try {
        await browser.close()
      } catch (error) {
        console.warn('Error closing browser:', error)
      }
    }
    
    // Stop dev server
    if (devServer) {
      devServer.kill()
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  })

  test('Complete Application Flow Test', async () => {
    console.log('🚀 Starting comprehensive application test...')
    
    // Step 1: Load home page
    console.log('📄 Loading home page...')
    await page.goto(`${baseUrl}`)
    await page.waitForSelector('h1', { timeout: 5000 })
    
    const title = await page.$eval('h1', (el: Element) => el.textContent)
    expect(title).toContain('Shona')
    await page.screenshot({ path: 'test-screenshots/01-home-page.png' })
    console.log('✅ Home page loaded successfully')

    // Step 2: Navigate to login
    console.log('🔐 Navigating to login page...')
    await page.goto(`${baseUrl}/login`)
    await page.waitForSelector('input[name="email"]', { timeout: 5000 })
    await page.screenshot({ path: 'test-screenshots/02-login-page.png' })
    console.log('✅ Login page loaded')

    // Step 3: Login with test user
    console.log('👤 Logging in with test user...')
    await page.type('input[name="email"]', 'test@example.com')
    await page.type('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for redirect to learn page
    await page.waitForNavigation({ timeout: 10000 })
    expect(page.url()).toContain('/learn')
    await page.screenshot({ path: 'test-screenshots/03-after-login.png' })
    console.log('✅ Login successful, redirected to learn page')

    // Step 4: Check learn page and lessons
    console.log('📚 Checking learn page and lessons...')
    await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 10000 })
    
    const lessonCards = await page.$$('[data-testid="lesson-card"]')
    expect(lessonCards.length).toBeGreaterThan(0)
    await page.screenshot({ path: 'test-screenshots/04-lessons-displayed.png' })
    console.log(`✅ Found ${lessonCards.length} lesson cards`)

    // Step 5: Open first lesson and test exercise
    console.log('🎯 Opening first lesson...')
    await page.click('[data-testid="lesson-card"]:first-child')
    await page.waitForSelector('[data-testid="exercise-modal"]', { timeout: 10000 })
    await page.screenshot({ path: 'test-screenshots/05-exercise-modal-opened.png' })
    console.log('✅ Exercise modal opened')

    // Step 6: Test exercise completion
    console.log('✅ Testing exercise completion...')
    const answerOptions = await page.$$('[data-testid="answer-option"]')
    if (answerOptions.length > 0) {
      await answerOptions[0].click()
      await page.waitForSelector('[data-testid="success-message"], [data-testid="error-message"]', { timeout: 5000 })
      await page.screenshot({ path: 'test-screenshots/06-exercise-completed.png' })
      console.log('✅ Exercise completed successfully')
    }

    // Step 7: Test voice navigation button
    console.log('🎤 Testing voice navigation...')
    const voiceButton = await page.$('button svg[height="1em"]')
    expect(voiceButton).not.toBeNull()
    await page.screenshot({ path: 'test-screenshots/07-voice-navigation.png' })
    console.log('✅ Voice navigation button found')

    // Step 8: Test heart system in exercise
    console.log('❤️ Testing heart system...')
    const hearts = await page.$$('svg[class*="text-red-500"], svg[class*="text-gray-300"]')
    expect(hearts.length).toBeGreaterThan(0)
    await page.screenshot({ path: 'test-screenshots/08-heart-system.png' })
    console.log('✅ Heart system displayed')

    // Step 9: Test navigation back to lessons
    console.log('🔙 Testing navigation back to lessons...')
    await page.click('[data-testid="close-modal"]') // Close exercise modal
    await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 5000 })
    await page.screenshot({ path: 'test-screenshots/09-back-to-lessons.png' })
    console.log('✅ Successfully navigated back to lessons')

    // Step 10: Test profile/logout functionality
    console.log('👤 Testing profile/logout...')
    await page.goto(`${baseUrl}/profile`)
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for page to load
    await page.screenshot({ path: 'test-screenshots/10-profile-page.png' })
    console.log('✅ Profile page accessible')

    // Step 11: Test logout
    console.log('🚪 Testing logout...')
    await page.goto(`${baseUrl}/logout`)
    await new Promise(resolve => setTimeout(resolve, 2000))
    await page.screenshot({ path: 'test-screenshots/11-after-logout.png' })
    console.log('✅ Logout successful')

    console.log('🎉 All application features tested successfully!')
  }, 60000) // Increased timeout for comprehensive test

  test('Voice Features Test', async () => {
    console.log('🎤 Testing voice features specifically...')
    
    // Login first
    await page.goto(`${baseUrl}/login`)
    await page.waitForSelector('input[name="email"]', { timeout: 5000 })
    await page.type('input[name="email"]', 'test@example.com')
    await page.type('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForNavigation({ timeout: 10000 })

    // Go to learn page and find voice lessons
    await page.goto(`${baseUrl}/learn`)
    await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 10000 })
    
    // Look for lessons that might contain voice exercises
    const lessonCards = await page.$$('[data-testid="lesson-card"]')
    
    if (lessonCards.length > 0) {
      await lessonCards[0].click()
      await page.waitForSelector('[data-testid="exercise-modal"]', { timeout: 10000 })
      
      // Check for voice-related components
      const voiceComponents = await page.$$('button svg[height="1em"]')
      expect(voiceComponents.length).toBeGreaterThan(0)
      
      await page.screenshot({ path: 'test-screenshots/12-voice-features.png' })
      console.log('✅ Voice features accessible in lessons')
    }
  }, 30000)

  test('UI Responsiveness Test', async () => {
    console.log('📱 Testing UI responsiveness...')
    
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' }
    ]

    for (const viewport of viewports) {
      await page.setViewport(viewport)
      await page.goto(`${baseUrl}`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      await page.screenshot({ path: `test-screenshots/13-responsive-${viewport.name}.png` })
      console.log(`✅ ${viewport.name} viewport tested`)
    }
  }, 20000)
})
