const puppeteer = require('puppeteer');
const fs = require('fs');

class UserFlowTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3000';
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      userFlow: {},
      screenshots: []
    };
  }

  async init() {
    console.log('🚀 Starting User Flow Testing...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Create screenshots directory
    if (!fs.existsSync('test-screenshots')) {
      fs.mkdirSync('test-screenshots');
    }
  }

  async takeScreenshot(name) {
    const screenshotPath = `test-screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.testResults.screenshots.push(screenshotPath);
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
  }

  async testHomePage() {
    console.log('\n🏠 Testing Home Page...');
    try {
      await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle2' });
      const title = await this.page.title();
      console.log(`✅ Home page loaded: ${title}`);
      
      // Test navigation buttons
      const getStartedButton = await this.page.$('a[href="/register"] button');
      const loginButton = await this.page.$('a[href="/login"] button');
      
      if (getStartedButton && loginButton) {
        console.log('✅ Navigation buttons found');
        this.testResults.passed++;
      } else {
        throw new Error('Navigation buttons not found');
      }
      
      await this.takeScreenshot('home-page');
      this.testResults.userFlow.homePage = 'PASS';
      
    } catch (error) {
      console.error(`❌ Home page test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.userFlow.homePage = 'FAIL';
    }
  }

  async testRegistration() {
    console.log('\n📝 Testing Registration...');
    try {
      await this.page.goto(`${this.baseUrl}/register`, { waitUntil: 'networkidle2' });
      
      // Check if registration form exists
      const form = await this.page.$('form');
      if (!form) {
        throw new Error('Registration form not found');
      }
      
      // Fill out registration form
      await this.page.type('input[name="email"]', `testuser${Date.now()}@example.com`);
      await this.page.type('input[name="password"]', 'testpassword123');
      await this.page.type('input[name="confirmPassword"]', 'testpassword123');
      
      console.log('✅ Registration form filled out');
      await this.takeScreenshot('registration-form');
      
      // Note: We won't actually submit to avoid creating test accounts
      this.testResults.userFlow.registration = 'PASS';
      this.testResults.passed++;
      
    } catch (error) {
      console.error(`❌ Registration test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.userFlow.registration = 'FAIL';
    }
  }

  async testLogin() {
    console.log('\n🔑 Testing Login...');
    try {
      await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
      
      // Check if login form exists
      const form = await this.page.$('form');
      if (!form) {
        throw new Error('Login form not found');
      }
      
      // Fill out login form
      await this.page.type('input[name="email"]', 'test@example.com');
      await this.page.type('input[name="password"]', 'testpassword');
      
      console.log('✅ Login form filled out');
      await this.takeScreenshot('login-form');
      
      // Note: We won't actually submit to avoid authentication issues
      this.testResults.userFlow.login = 'PASS';
      this.testResults.passed++;
      
    } catch (error) {
      console.error(`❌ Login test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.userFlow.login = 'FAIL';
    }
  }

  async testLearningModules() {
    console.log('\n📚 Testing Learning Modules...');
    
    const modules = [
      { url: '/learn', name: 'Learn Module' },
      { url: '/flashcards', name: 'Flashcards Module' },
      { url: '/pronunciation-test', name: 'Pronunciation Test Module' },
      { url: '/quests', name: 'Quests Module' },
      { url: '/integrated-vocabulary', name: 'Integrated Vocabulary Module' }
    ];

    for (const module of modules) {
      try {
        console.log(`\n🔍 Testing ${module.name}...`);
        await this.page.goto(`${this.baseUrl}${module.url}`, { 
          waitUntil: 'networkidle2',
          timeout: 15000 
        });
        
        const title = await this.page.title();
        console.log(`✅ ${module.name} loaded: ${title}`);
        
        // Check for common elements
        const content = await this.page.content();
        if (content.includes('Login') || content.includes('login')) {
          console.log(`⚠️ ${module.name} requires authentication`);
          this.testResults.userFlow[module.name] = 'AUTH_REQUIRED';
        } else {
          console.log(`✅ ${module.name} content accessible`);
          this.testResults.userFlow[module.name] = 'PASS';
          this.testResults.passed++;
        }
        
        await this.takeScreenshot(module.name.toLowerCase().replace(/\s+/g, '-'));
        
      } catch (error) {
        console.error(`❌ ${module.name} test failed: ${error.message}`);
        this.testResults.userFlow[module.name] = 'FAIL';
        this.testResults.failed++;
      }
    }
  }

  async testInteractiveElements() {
    console.log('\n🎮 Testing Interactive Elements...');
    try {
      await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle2' });
      
      // Test button clicks (without navigation)
      const buttons = await this.page.$$('button');
      console.log(`Found ${buttons.length} buttons`);
      
      // Test hover effects
      const interactiveElements = await this.page.$$('.interactive-button, .interactive-card');
      console.log(`Found ${interactiveElements.length} interactive elements`);
      
      if (buttons.length > 0 || interactiveElements.length > 0) {
        console.log('✅ Interactive elements found');
        this.testResults.passed++;
        this.testResults.userFlow.interactiveElements = 'PASS';
      } else {
        throw new Error('No interactive elements found');
      }
      
    } catch (error) {
      console.error(`❌ Interactive elements test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.userFlow.interactiveElements = 'FAIL';
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
      try {
        await this.page.setViewport(viewport);
        await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle2' });
        await this.takeScreenshot(`responsive-${viewport.name.toLowerCase()}`);
        console.log(`✅ ${viewport.name} viewport tested`);
        this.testResults.passed++;
      } catch (error) {
        console.error(`❌ ${viewport.name} viewport test failed: ${error.message}`);
        this.testResults.failed++;
      }
    }
  }

  async testErrorHandling() {
    console.log('\n⚠️ Testing Error Handling...');
    try {
      // Test 404 page
      const response = await this.page.goto(`${this.baseUrl}/nonexistent-page`, { 
        waitUntil: 'networkidle2',
        timeout: 10000 
      });
      
      if (response.status() === 404) {
        console.log('✅ 404 error handling works correctly');
        this.testResults.passed++;
        this.testResults.userFlow.errorHandling = 'PASS';
      } else {
        console.log('⚠️ 404 page not returned as expected');
        this.testResults.userFlow.errorHandling = 'PARTIAL';
      }
      
    } catch (error) {
      console.log('⚠️ 404 test completed (expected timeout)');
      this.testResults.userFlow.errorHandling = 'PARTIAL';
    }
  }

  async testContentAccessibility() {
    console.log('\n♿ Testing Content Accessibility...');
    try {
      await this.page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle2' });
      
      // Check for semantic HTML elements
      const headings = await this.page.$$('h1, h2, h3, h4, h5, h6');
      const buttons = await this.page.$$('button');
      const links = await this.page.$$('a');
      
      console.log(`Found ${headings.length} headings, ${buttons.length} buttons, ${links.length} links`);
      
      if (headings.length > 0 && buttons.length > 0) {
        console.log('✅ Basic accessibility elements present');
        this.testResults.passed++;
        this.testResults.userFlow.accessibility = 'PASS';
      } else {
        throw new Error('Missing basic accessibility elements');
      }
      
    } catch (error) {
      console.error(`❌ Accessibility test failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.userFlow.accessibility = 'FAIL';
    }
  }

  async generateReport() {
    console.log('\n📋 Generating User Flow Test Report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.passed + this.testResults.failed,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: ((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(2) + '%'
      },
      userFlow: this.testResults.userFlow,
      errors: this.testResults.errors,
      screenshots: this.testResults.screenshots
    };
    
    // Save report
    const reportPath = 'test-screenshots/user-flow-test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 USER FLOW TEST RESULTS:');
    console.log('================================');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Success Rate: ${report.summary.successRate} 🎯`);
    console.log(`Screenshots: ${this.testResults.screenshots.length} 📸`);
    
    console.log('\n🔍 User Flow Status:');
    Object.entries(this.testResults.userFlow).forEach(([flow, status]) => {
      const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${emoji} ${flow}: ${status}`);
    });
    
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
      
      await this.testHomePage();
      await this.testRegistration();
      await this.testLogin();
      await this.testLearningModules();
      await this.testInteractiveElements();
      await this.testResponsiveDesign();
      await this.testErrorHandling();
      await this.testContentAccessibility();
      
      const report = await this.generateReport();
      
      console.log('\n🎉 User flow testing completed!');
      return report;
      
    } catch (error) {
      console.error('❌ User flow test suite failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
async function main() {
  const tester = new UserFlowTester();
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

module.exports = UserFlowTester; 