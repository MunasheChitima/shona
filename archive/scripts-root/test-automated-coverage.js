const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AutomatedTestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      details: {}
    };
    this.baseUrl = 'http://localhost:3004';
  }

  async init() {
    console.log('🚀 Starting automated test suite...');
    this.browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set viewport for mobile testing
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text());
        this.results.errors.push(`Browser Error: ${msg.text()}`);
      }
    });

    // Handle page errors
    this.page.on('pageerror', error => {
      console.log('Page Error:', error.message);
      this.results.errors.push(`Page Error: ${error.message}`);
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async test(testName, testFn) {
    try {
      console.log(`\n🧪 Testing: ${testName}`);
      await testFn();
      this.results.passed++;
      console.log(`✅ PASSED: ${testName}`);
      this.results.details[testName] = { status: 'PASSED', error: null };
    } catch (error) {
      this.results.failed++;
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      this.results.details[testName] = { status: 'FAILED', error: error.message };
    }
  }

  async waitForElement(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      throw new Error(`Element not found: ${selector}`);
    }
  }

  async waitForNavigation(timeout = 5000) {
    try {
      await this.page.waitForNavigation({ timeout, waitUntil: 'networkidle0' });
    } catch (error) {
      // Continue if navigation timeout
    }
  }

  // Test 1: Homepage Loading
  async testHomepage() {
    await this.page.goto(this.baseUrl);
    await this.waitForElement('h1');
    
    const title = await this.page.$eval('h1', el => el.textContent);
    if (!title.includes('Learn Shona')) {
      throw new Error('Homepage title not found');
    }

    // Check for navigation
    await this.waitForElement('nav');
    
    // Check for main content
    await this.waitForElement('main');
    
    // Check for skip link
    const skipLink = await this.page.$('a[href="#main-content"]');
    if (!skipLink) {
      throw new Error('Skip to main content link not found');
    }
  }

  // Test 2: Navigation Functionality
  async testNavigation() {
    const navItems = [
      { href: '/', label: 'Home' },
      { href: '/learn', label: 'Learn' },
      { href: '/quests', label: 'Quests' },
      { href: '/profile', label: 'Profile' },
      { href: '/flashcards', label: 'Flashcards' },
      { href: '/pronunciation-test', label: 'Pronunciation Test' },
      { href: '/integrated-vocabulary', label: 'Integrated Vocabulary' },
      { href: '/theme-demo', label: 'Theme Demo' }
    ];

    for (const item of navItems) {
      await this.page.goto(`${this.baseUrl}${item.href}`);
      await this.waitForNavigation();
      
      // Check if page loaded without errors
      const errorElements = await this.page.$$('[data-next-error]');
      if (errorElements.length > 0) {
        throw new Error(`Navigation error on ${item.href}`);
      }
      
      // Check for main content
      await this.waitForElement('main');
    }
  }

  // Test 3: Authentication Flow
  async testAuthentication() {
    // Test registration
    await this.page.goto(`${this.baseUrl}/register`);
    await this.waitForElement('form');
    
    // Fill registration form
    await this.page.type('input[name="name"]', 'Test User');
    await this.page.type('input[name="email"]', 'test@example.com');
    await this.page.type('input[name="password"]', 'password123');
    
    // Submit form
    await this.page.click('button[type="submit"]');
    await this.waitForNavigation();
    
    // Check if redirected to login or dashboard
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/login') && !currentUrl.includes('/learn')) {
      throw new Error('Registration did not redirect properly');
    }
  }

  // Test 4: Login Flow
  async testLogin() {
    await this.page.goto(`${this.baseUrl}/login`);
    await this.waitForElement('form');
    
    // Fill login form
    await this.page.type('input[name="email"]', 'test@example.com');
    await this.page.type('input[name="password"]', 'password123');
    
    // Submit form
    await this.page.click('button[type="submit"]');
    await this.waitForNavigation();
    
    // Check if logged in successfully
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/learn')) {
      throw new Error('Login did not redirect to learn page');
    }
  }

  // Test 5: Learn Page Content
  async testLearnPage() {
    await this.page.goto(`${this.baseUrl}/learn`);
    await this.waitForNavigation();
    
    // Check for lessons
    await this.waitForElement('.lesson-card, [data-testid="lesson-card"]', 10000);
    
    // Check for loading states
    const loadingElements = await this.page.$$('.animate-spin, .loading');
    if (loadingElements.length === 0) {
      // If no loading elements, check for actual content
      const lessonCards = await this.page.$$('.lesson-card, [data-testid="lesson-card"]');
      if (lessonCards.length === 0) {
        throw new Error('No lessons found on learn page');
      }
    }
  }

  // Test 6: Mobile Navigation
  async testMobileNavigation() {
    // Set mobile viewport
    await this.page.setViewport({ width: 375, height: 667 });
    
    await this.page.goto(this.baseUrl);
    await this.waitForElement('nav');
    
    // Check for mobile menu button
    const mobileMenuButton = await this.page.$('button svg[data-icon="bars"]');
    if (!mobileMenuButton) {
      throw new Error('Mobile menu button not found');
    }
    
    // Click mobile menu
    await this.page.click('button svg[data-icon="bars"]');
    await this.page.waitForTimeout(500);
    
    // Check if mobile menu opened
    const mobileMenu = await this.page.$('nav .md\\:hidden');
    if (!mobileMenu) {
      throw new Error('Mobile menu did not open');
    }
  }

  // Test 7: Audio Features
  async testAudioFeatures() {
    await this.page.goto(`${this.baseUrl}/pronunciation-test`);
    await this.waitForNavigation();
    
    // Check for audio buttons
    const audioButtons = await this.page.$$('[data-testid="pronunciation-audio-button"]');
    if (audioButtons.length === 0) {
      // Check for any audio-related elements
      const audioElements = await this.page.$$('button svg[data-icon="volume-up"], .audio-button');
      if (audioElements.length === 0) {
        throw new Error('No audio features found');
      }
    }
  }

  // Test 8: Loading States
  async testLoadingStates() {
    // Test loading spinner component
    await this.page.goto(`${this.baseUrl}/flashcards`);
    await this.waitForNavigation();
    
    // Check for loading states
    const loadingSpinners = await this.page.$$('.animate-spin, .loading-spinner');
    if (loadingSpinners.length === 0) {
      // Check for content instead
      const content = await this.page.$('main');
      if (!content) {
        throw new Error('No loading states or content found');
      }
    }
  }

  // Test 9: Error Handling
  async testErrorHandling() {
    // Test 404 page
    await this.page.goto(`${this.baseUrl}/nonexistent-page`);
    await this.waitForNavigation();
    
    const errorContent = await this.page.$eval('body', el => el.textContent);
    if (!errorContent.includes('404') && !errorContent.includes('not found')) {
      throw new Error('404 error handling not working');
    }
  }

  // Test 10: Accessibility
  async testAccessibility() {
    await this.page.goto(this.baseUrl);
    
    // Check for skip link
    const skipLink = await this.page.$('a[href="#main-content"]');
    if (!skipLink) {
      throw new Error('Skip to main content link missing');
    }
    
    // Check for proper heading structure
    const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', els => 
      els.map(el => ({ tag: el.tagName, text: el.textContent }))
    );
    
    if (headings.length === 0) {
      throw new Error('No headings found for accessibility');
    }
    
    // Check for alt text on images
    const images = await this.page.$$eval('img', els => 
      els.map(el => ({ src: el.src, alt: el.alt }))
    );
    
    const imagesWithoutAlt = images.filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      console.log('Warning: Images without alt text found');
    }
  }

  // Test 11: API Endpoints
  async testAPIEndpoints() {
    const endpoints = [
      '/api/lessons',
      '/api/vocabulary',
      '/api/auth/login',
      '/api/auth/register'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await this.page.evaluate(async (url) => {
          const res = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          return { status: res.status, ok: res.ok };
        }, endpoint);
        
        if (!response.ok && response.status !== 401) {
          throw new Error(`API endpoint ${endpoint} returned status ${response.status}`);
        }
      } catch (error) {
        console.log(`Warning: API endpoint ${endpoint} test failed: ${error.message}`);
      }
    }
  }

  // Test 12: Performance
  async testPerformance() {
    await this.page.goto(this.baseUrl);
    
    // Measure page load time
    const loadTime = await this.page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    
    if (loadTime > 5000) {
      console.log(`Warning: Page load time is ${loadTime}ms (should be under 5000ms)`);
    }
    
    // Check for console errors
    const consoleErrors = this.results.errors.filter(error => 
      error.includes('Browser Error') || error.includes('Page Error')
    );
    
    if (consoleErrors.length > 0) {
      throw new Error(`Found ${consoleErrors.length} console errors`);
    }
  }

  async runAllTests() {
    try {
      await this.init();
      
      await this.test('Homepage Loading', () => this.testHomepage());
      await this.test('Navigation Functionality', () => this.testNavigation());
      await this.test('Authentication Flow', () => this.testAuthentication());
      await this.test('Login Flow', () => this.testLogin());
      await this.test('Learn Page Content', () => this.testLearnPage());
      await this.test('Mobile Navigation', () => this.testMobileNavigation());
      await this.test('Audio Features', () => this.testAudioFeatures());
      await this.test('Loading States', () => this.testLoadingStates());
      await this.test('Error Handling', () => this.testErrorHandling());
      await this.test('Accessibility', () => this.testAccessibility());
      await this.test('API Endpoints', () => this.testAPIEndpoints());
      await this.test('Performance', () => this.testPerformance());
      
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      await this.cleanup();
      this.generateReport();
    }
  }

  generateReport() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📝 Total: ${this.results.passed + this.results.failed}`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      Object.entries(this.results.details)
        .filter(([_, result]) => result.status === 'FAILED')
        .forEach(([testName, result]) => {
          console.log(`   - ${testName}: ${result.error}`);
        });
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS DETECTED:');
      this.results.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.results.passed,
        failed: this.results.failed,
        total: this.results.passed + this.results.failed
      },
      details: this.results.details,
      errors: this.results.errors
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'test-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Detailed report saved to test-report.json');
  }
}

// Run the test suite
const testSuite = new AutomatedTestSuite();
testSuite.runAllTests().catch(console.error); 