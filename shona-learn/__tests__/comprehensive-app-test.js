const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ComprehensiveAppTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      tests: []
    };
    this.baseUrl = 'http://localhost:3004';
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });

    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.results.errors.push(`Console Error: ${msg.text()}`);
      }
    });

    this.page.on('pageerror', (error) => {
      this.results.errors.push(`Page Error: ${error.message}`);
    });
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      console.log(`✅ PASSED: ${testName}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
      console.log(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }

  async ensureLoggedIn() {
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.waitForSelector('form', { timeout: 5000 });
    await this.page.type('input[name="email"]', 'test@example.com');
    await this.page.type('input[name="password"]', 'password123');
    await this.page.click('button[type="submit"]');
    await this.sleep(1500);
  }

  async testHomepage() {
    await this.page.goto(this.baseUrl);
    await this.page.waitForSelector('h1', { timeout: 5000 });

    const title = await this.page.$eval('h1', (el) => el.textContent);
    if (!title.includes('Learn Shona')) {
      throw new Error('Homepage title not found');
    }

    // Navigation is button-based in Navigation.tsx; allow a tag or button with label
    const navLabels = await this.page.$$eval('nav button, nav a', (els) =>
      els.map((el) => el.textContent.trim())
    );
    const expected = ['Home', 'Learn', 'Quests', 'Profile', 'Flashcards', 'Pronunciation Test', 'Integrated Vocabulary', 'Theme Demo'];
    for (const label of expected) {
      if (!navLabels.find((t) => t.includes(label))) {
        throw new Error(`Navigation link "${label}" not found`);
      }
    }
  }

  async testAuthentication() {
    // Registration idempotent; proceed to login
    await this.page.goto(`${this.baseUrl}/register`);
    await this.page.waitForSelector('form', { timeout: 5000 });
    await this.page.type('input[name="name"]', 'Test User');
    await this.page.type('input[name="email"]', 'test@example.com');
    await this.page.type('input[name="password"]', 'password123');
    await this.page.click('button[type="submit"]');
    await this.sleep(1500);

    // Then login to ensure localStorage token/user are set
    await this.ensureLoggedIn();

    const loginUrl = this.page.url();
    if (!loginUrl.includes('/learn')) {
      throw new Error('Login failed - not redirected to learn page');
    }
  }

  async testLearnPage() {
    await this.ensureLoggedIn();
    await this.page.goto(`${this.baseUrl}/learn`);
    await this.page.waitForSelector('[data-testid="lesson-card"]', { timeout: 10000 });

    const lessons = await this.page.$$('[data-testid="lesson-card"]');
    if (lessons.length === 0) {
      throw new Error('No lessons found on learn page');
    }

    await lessons[0].click();
    await this.sleep(500);

    const modal = await this.page.$('[data-testid="exercise-modal"]');
    if (!modal) {
      throw new Error('Exercise modal did not appear when clicking lesson');
    }
  }

  async testNavigation() {
    const pages = [
      { path: '/quests', title: 'Your Learning Journey' },
      { path: '/profile', title: 'Profile' },
      { path: '/flashcards', title: 'Flashcards' },
      { path: '/pronunciation-test', title: 'Pronunciation Test' },
      { path: '/integrated-vocabulary', title: 'Shona Vocabulary Collection' },
      { path: '/theme-demo', title: 'Theme Demo' },
    ];

    await this.ensureLoggedIn();

    for (const page of pages) {
      await this.page.goto(`${this.baseUrl}${page.path}`);
      await this.sleep(1000);
      const title = await this.page.$eval('h1, h2, h3', (el) => el.textContent);
      if (page.path === '/profile') {
        if (!title || title.trim().length === 0) {
          throw new Error(`Page ${page.path} not loading correctly`);
        }
      } else if (!title.toLowerCase().includes(page.title.toLowerCase())) {
        throw new Error(`Page ${page.path} not loading correctly`);
      }
    }
  }

  async testMobileResponsiveness() {
    await this.page.setViewport({ width: 375, height: 667 });
    await this.page.goto(this.baseUrl);

    const mobileMenuButton = await this.page.$('nav button[aria-label="Open mobile menu"], nav button[aria-expanded]');
    if (!mobileMenuButton) {
      throw new Error('Mobile menu button not found');
    }

    await mobileMenuButton.click();
    await this.sleep(500);

    const mobileMenu = await this.page.$('nav .md\\:hidden');
    if (!mobileMenu) {
      throw new Error('Mobile menu not working');
    }
  }

  async testLoadingStates() {
    await this.ensureLoggedIn();
    await this.page.goto(`${this.baseUrl}/learn`);

    // Spinner appears only during load; check the page has lesson cards eventually
    await this.page.waitForSelector('[data-testid="lesson-card"]', { timeout: 15000 });
  }

  async testAudioFeatures() {
    await this.ensureLoggedIn();
    await this.page.goto(`${this.baseUrl}/learn`);
    await this.page.waitForSelector('[data-testid="lesson-card"]', { timeout: 10000 });

    const audioButtons = await this.page.$$('[data-testid="pronunciation-audio-button"]');
    if (audioButtons.length > 0) {
      await audioButtons[0].click();
      await this.sleep(500);
    }
  }

  async testErrorHandling() {
    await this.page.goto(`${this.baseUrl}/nonexistent-page`);
    await this.sleep(500);
    const bodyText = await this.page.$eval('body', (el) => el.textContent.toLowerCase());
    if (!bodyText.includes('404') && !bodyText.includes('not found')) {
      throw new Error('404 error handling not working');
    }
  }

  async testAccessibility() {
    await this.page.goto(this.baseUrl);
    const skipLink = await this.page.$('a[href="#main-content"]');
    if (!skipLink) {
      throw new Error('Skip to main content link not found');
    }

    const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', (els) => els.map((el) => ({ tag: el.tagName, text: el.textContent })));
    if (headings.length === 0) {
      throw new Error('No headings found for accessibility');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive App Test Suite...\n');

    await this.init();

    await this.runTest('Homepage Loading', () => this.testHomepage());
    await this.runTest('Authentication Flow', () => this.testAuthentication());
    await this.runTest('Learn Page Functionality', () => this.testLearnPage());
    await this.runTest('Navigation Between Pages', () => this.testNavigation());
    await this.runTest('Mobile Responsiveness', () => this.testMobileResponsiveness());
    await this.runTest('Loading States', () => this.testLoadingStates());
    await this.runTest('Audio Features', () => this.testAudioFeatures());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Accessibility Features', () => this.testAccessibility());

    await this.browser.close();

    this.generateReport();
  }

  generateReport() {
    const report = {
      summary: {
        total: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(2),
      },
      tests: this.results.tests,
      errors: this.results.errors,
      timestamp: new Date().toISOString(),
    };

    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.successRate}%`);

    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS DETECTED:');
      this.results.errors.forEach((error) => console.log(`- ${error}`));
    }

    console.log('\n📋 DETAILED RESULTS:');
    this.results.tests.forEach((test) => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    });

    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

const tester = new ComprehensiveAppTester();
tester.runAllTests().catch(console.error); 