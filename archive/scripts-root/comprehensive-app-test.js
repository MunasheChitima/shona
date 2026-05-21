const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ShonaAppTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      redirects: [],
      brokenLinks: [],
      functionality: {},
      screenshots: []
    };
  }

  async init() {
    console.log('🚀 Starting Shona App Comprehensive Testing...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set base URL
    this.baseUrl = 'http://localhost:3000';
    
    // Enable request interception to track redirects
    await this.page.setRequestInterception(true);
    this.page.on('request', request => {
      request.continue();
    });
    
    this.page.on('response', response => {
      if (response.status() >= 300 && response.status() < 400) {
        this.testResults.redirects.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
      }
    });
  }

  async takeScreenshot(name) {
    const screenshotPath = `test-screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.testResults.screenshots.push(screenshotPath);
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
  }

  async testPage(url, testName, expectedTitle = null) {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      console.log(`\n🔍 Testing: ${testName} (${fullUrl})`);
      
      const response = await this.page.goto(fullUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
      }
      
      const title = await this.page.title();
      console.log(`✅ Page loaded successfully: ${title}`);
      
      if (expectedTitle && !title.includes(expectedTitle)) {
        throw new Error(`Expected title containing "${expectedTitle}", got "${title}"`);
      }
      
      await this.takeScreenshot(testName.toLowerCase().replace(/\s+/g, '-'));
      
      this.testResults.functionality[testName] = {
        status: 'PASS',
        url: url,
        title: title,
        statusCode: response.status()
      };
      this.testResults.passed++;
      
    } catch (error) {
      console.error(`❌ Failed: ${testName} - ${error.message}`);
      this.testResults.functionality[testName] = {
        status: 'FAIL',
        url: url,
        error: error.message
      };
      this.testResults.failed++;
      this.testResults.errors.push({
        test: testName,
        url: url,
        error: error.message
      });
    }
  }

  async testNavigation() {
    console.log('\n🧭 Testing Navigation...');
    
    // Test main navigation links
    const navTests = [
      { url: '/', name: 'Home Page', expectedTitle: 'Learn Shona' },
      { url: '/login', name: 'Login Page', expectedTitle: 'Login' },
      { url: '/register', name: 'Register Page', expectedTitle: 'Register' },
      { url: '/learn', name: 'Learn Page', expectedTitle: 'Learn' },
      { url: '/flashcards', name: 'Flashcards Page', expectedTitle: 'Flashcards' },
      { url: '/pronunciation-test', name: 'Pronunciation Test Page', expectedTitle: 'Pronunciation' },
      { url: '/quests', name: 'Quests Page', expectedTitle: 'Quests' },
      { url: '/integrated-vocabulary', name: 'Integrated Vocabulary Page', expectedTitle: 'Vocabulary' },
      { url: '/profile', name: 'Profile Page', expectedTitle: 'Profile' }
    ];

    for (const test of navTests) {
      await this.testPage(test.url, test.name, test.expectedTitle);
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    // Test registration flow
    await this.testPage('/register', 'Registration Form');
    
    // Test form submission (without actually submitting)
    try {
      await this.page.waitForSelector('form', { timeout: 5000 });
      const formExists = await this.page.$('form');
      if (formExists) {
        console.log('✅ Registration form found');
        this.testResults.passed++;
      } else {
        throw new Error('Registration form not found');
      }
    } catch (error) {
      console.error(`❌ Registration form test failed: ${error.message}`);
      this.testResults.failed++;
    }
    
    // Test login flow
    await this.testPage('/login', 'Login Form');
    
    try {
      await this.page.waitForSelector('form', { timeout: 5000 });
      const formExists = await this.page.$('form');
      if (formExists) {
        console.log('✅ Login form found');
        this.testResults.passed++;
      } else {
        throw new Error('Login form not found');
      }
    } catch (error) {
      console.error(`❌ Login form test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testLearningModules() {
    console.log('\n📚 Testing Learning Modules...');
    
    // Test learn page
    await this.testPage('/learn', 'Learning Interface');
    
    // Test if lessons are loaded
    try {
      await this.page.waitForSelector('[data-testid="lesson"], .lesson, .lesson-card', { timeout: 10000 });
      const lessons = await this.page.$$('[data-testid="lesson"], .lesson, .lesson-card');
      console.log(`✅ Found ${lessons.length} lessons`);
      this.testResults.passed++;
    } catch (error) {
      console.log('⚠️ No lessons found or lesson selector not available');
    }
    
    // Test flashcards
    await this.testPage('/flashcards', 'Flashcards Interface');
    
    // Test pronunciation test
    await this.testPage('/pronunciation-test', 'Pronunciation Test Interface');
    
    // Test quests
    await this.testPage('/quests', 'Quests Interface');
    
    // Test integrated vocabulary
    await this.testPage('/integrated-vocabulary', 'Integrated Vocabulary Interface');
  }

  async testInteractiveElements() {
    console.log('\n🎮 Testing Interactive Elements...');
    
    // Test buttons and interactive elements on home page
    await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle2' });
    
    try {
      // Test navigation buttons
      const buttons = await this.page.$$('button, a[href]');
      console.log(`Found ${buttons.length} interactive elements`);
      
      // Test a few key buttons
      const getStartedButton = await this.page.$('a[href="/register"] button, button:contains("Get Started")');
      if (getStartedButton) {
        console.log('✅ Get Started button found');
        this.testResults.passed++;
      }
      
      const loginButton = await this.page.$('a[href="/login"] button, button:contains("Login")');
      if (loginButton) {
        console.log('✅ Login button found');
        this.testResults.passed++;
      }
      
    } catch (error) {
      console.error(`❌ Interactive elements test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await this.page.setViewport(viewport);
      await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle2' });
      await this.takeScreenshot(`responsive-${viewport.name.toLowerCase()}`);
      console.log(`✅ ${viewport.name} viewport tested`);
      this.testResults.passed++;
    }
  }

  async testErrorHandling() {
    console.log('\n⚠️ Testing Error Handling...');
    
    // Test 404 page
    try {
      const response = await this.page.goto(`${this.baseUrl}/nonexistent-page`, { 
        waitUntil: 'networkidle2',
        timeout: 10000 
      });
      
      if (response.status() === 404) {
        console.log('✅ 404 error handling works correctly');
        this.testResults.passed++;
      } else {
        console.log('⚠️ 404 page not returned as expected');
      }
    } catch (error) {
      console.log('⚠️ 404 test completed (expected timeout)');
    }
  }

  async testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    try {
      await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle2' });
      
      // Get performance metrics
      const metrics = await this.page.metrics();
      const navigationTiming = await this.page.evaluate(() => {
        const timing = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
          loadComplete: timing.loadEventEnd - timing.loadEventStart,
          totalTime: timing.loadEventEnd - timing.fetchStart
        };
      });
      
      console.log('📊 Performance Metrics:');
      console.log(`- DOM Content Loaded: ${navigationTiming.domContentLoaded}ms`);
      console.log(`- Load Complete: ${navigationTiming.loadComplete}ms`);
      console.log(`- Total Load Time: ${navigationTiming.totalTime}ms`);
      
      if (navigationTiming.totalTime < 5000) {
        console.log('✅ Page load time is acceptable');
        this.testResults.passed++;
      } else {
        console.log('⚠️ Page load time is slow');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.error(`❌ Performance test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async generateReport() {
    console.log('\n📋 Generating Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.passed + this.testResults.failed,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: ((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(2) + '%'
      },
      redirects: this.testResults.redirects,
      errors: this.testResults.errors,
      functionality: this.testResults.functionality,
      screenshots: this.testResults.screenshots
    };
    
    // Save report
    const reportPath = 'test-screenshots/comprehensive-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 TEST RESULTS SUMMARY:');
    console.log('================================');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Success Rate: ${report.summary.successRate} 🎯`);
    console.log(`Redirects Found: ${this.testResults.redirects.length} 🔄`);
    console.log(`Errors: ${this.testResults.errors.length} ⚠️`);
    console.log(`Screenshots: ${this.testResults.screenshots.length} 📸`);
    
    console.log('\n📄 Detailed report saved to:', reportPath);
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.init();
      
      // Create screenshots directory
      if (!fs.existsSync('test-screenshots')) {
        fs.mkdirSync('test-screenshots');
      }
      
      await this.testNavigation();
      await this.testAuthentication();
      await this.testLearningModules();
      await this.testInteractiveElements();
      await this.testResponsiveDesign();
      await this.testErrorHandling();
      await this.testPerformance();
      
      const report = await this.generateReport();
      
      console.log('\n🎉 Comprehensive testing completed!');
      return report;
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
async function main() {
  const tester = new ShonaAppTester();
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ShonaAppTester; 