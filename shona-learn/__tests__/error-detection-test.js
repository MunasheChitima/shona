const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ErrorDetectionTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.errors = [];
    this.baseUrl = 'http://localhost:3004';
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set up comprehensive error monitoring
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.errors.push({
          type: 'console_error',
          message: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });
      }
    });

    this.page.on('pageerror', error => {
      this.errors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    this.page.on('requestfailed', request => {
      this.errors.push({
        type: 'request_failed',
        url: request.url(),
        failure: request.failure().errorText,
        timestamp: new Date().toISOString()
      });
    });

    this.page.on('response', response => {
      if (response.status() >= 400) {
        this.errors.push({
          type: 'http_error',
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  async testPageLoadErrors() {
    console.log('🔍 Testing page load errors...');
    
    const pages = [
      '/',
      '/learn',
      '/quests',
      '/profile',
      '/flashcards',
      '/pronunciation-test',
      '/integrated-vocabulary',
      '/theme-demo',
      '/register',
      '/login'
    ];

    for (const pagePath of pages) {
      try {
        await this.page.goto(`${this.baseUrl}${pagePath}`, { waitUntil: 'networkidle0' });
        await this.page.waitForTimeout(2000);
        
        // Check for hydration errors
        const hydrationErrors = await this.page.evaluate(() => {
          return window.__NEXT_DATA__?.props?.pageProps?.error || null;
        });
        
        if (hydrationErrors) {
          this.errors.push({
            type: 'hydration_error',
            page: pagePath,
            error: hydrationErrors,
            timestamp: new Date().toISOString()
          });
        }
        
      } catch (error) {
        this.errors.push({
          type: 'page_load_error',
          page: pagePath,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async testImportErrors() {
    console.log('🔍 Testing import errors...');
    
    // Check for module loading errors in console
    const importErrors = this.errors.filter(error => 
      error.type === 'console_error' && 
      (error.message.includes('import') || error.message.includes('export') || error.message.includes('module'))
    );
    
    if (importErrors.length > 0) {
      console.log(`Found ${importErrors.length} import-related errors`);
    }
  }

  async testAuthenticationErrors() {
    console.log('🔍 Testing authentication errors...');
    
    // Test login with invalid credentials
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.waitForSelector('form');
    
    await this.page.type('input[name="email"]', 'invalid@example.com');
    await this.page.type('input[name="password"]', 'wrongpassword');
    await this.page.click('button[type="submit"]');
    
    await this.page.waitForTimeout(2000);
    
    // Check for authentication errors
    const authErrors = this.errors.filter(error => 
      error.type === 'console_error' && 
      (error.message.includes('auth') || error.message.includes('login') || error.message.includes('401'))
    );
    
    if (authErrors.length > 0) {
      console.log(`Found ${authErrors.length} authentication-related errors`);
    }
  }

  async testAudioFeatureErrors() {
    console.log('🔍 Testing audio feature errors...');
    
    await this.page.goto(`${this.baseUrl}/learn`);
    await this.page.waitForSelector('[data-testid="lesson-card"]', { timeout: 10000 });
    
    // Try to interact with audio features
    const audioButtons = await this.page.$$('[data-testid="pronunciation-audio-button"]');
    if (audioButtons.length > 0) {
      await audioButtons[0].click();
      await this.page.waitForTimeout(1000);
    }
    
    // Check for audio-related errors
    const audioErrors = this.errors.filter(error => 
      error.type === 'console_error' && 
      (error.message.includes('audio') || error.message.includes('Audio') || error.message.includes('speech'))
    );
    
    if (audioErrors.length > 0) {
      console.log(`Found ${audioErrors.length} audio-related errors`);
    }
  }

  async testNetworkErrors() {
    console.log('🔍 Testing network errors...');
    
    // Test API endpoints
    const apiEndpoints = [
      '/api/lessons',
      '/api/vocabulary',
      '/api/progress'
    ];
    
    for (const endpoint of apiEndpoints) {
      try {
        await this.page.goto(`${this.baseUrl}${endpoint}`);
        await this.page.waitForTimeout(1000);
      } catch (error) {
        this.errors.push({
          type: 'api_error',
          endpoint,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Check for network-related errors
    const networkErrors = this.errors.filter(error => 
      error.type === 'request_failed' || error.type === 'http_error'
    );
    
    if (networkErrors.length > 0) {
      console.log(`Found ${networkErrors.length} network-related errors`);
    }
  }

  async testComponentErrors() {
    console.log('🔍 Testing component errors...');
    
    // Test various component interactions
    await this.page.goto(`${this.baseUrl}/learn`);
    await this.page.waitForSelector('[data-testid="lesson-card"]', { timeout: 10000 });
    
    // Click on lesson cards
    const lessonCards = await this.page.$$('[data-testid="lesson-card"]');
    if (lessonCards.length > 0) {
      await lessonCards[0].click();
      await this.page.waitForTimeout(1000);
      
      // Check for modal errors
      const modal = await this.page.$('[data-testid="exercise-modal"]');
      if (modal) {
        // Test modal interactions
        const closeButton = await this.page.$('[data-testid="close-modal"]');
        if (closeButton) {
          await closeButton.click();
          await this.page.waitForTimeout(500);
        }
      }
    }
    
    // Check for component-related errors
    const componentErrors = this.errors.filter(error => 
      error.type === 'console_error' && 
      (error.message.includes('React') || error.message.includes('component') || error.message.includes('render'))
    );
    
    if (componentErrors.length > 0) {
      console.log(`Found ${componentErrors.length} component-related errors`);
    }
  }

  async testMobileErrors() {
    console.log('🔍 Testing mobile-specific errors...');
    
    // Set mobile viewport
    await this.page.setViewport({ width: 375, height: 667 });
    await this.page.goto(this.baseUrl);
    
    // Test mobile menu
    const mobileMenuButton = await this.page.$('button svg');
    if (mobileMenuButton) {
      await mobileMenuButton.click();
      await this.page.waitForTimeout(1000);
      
      // Test mobile navigation
      const mobileNavLinks = await this.page.$$('nav.md\\:hidden a');
      if (mobileNavLinks.length > 0) {
        await mobileNavLinks[0].click();
        await this.page.waitForTimeout(1000);
      }
    }
    
    // Check for mobile-specific errors
    const mobileErrors = this.errors.filter(error => 
      error.type === 'console_error' && 
      (error.message.includes('mobile') || error.message.includes('viewport') || error.message.includes('responsive'))
    );
    
    if (mobileErrors.length > 0) {
      console.log(`Found ${mobileErrors.length} mobile-specific errors`);
    }
  }

  async generateErrorReport() {
    const report = {
      summary: {
        totalErrors: this.errors.length,
        errorTypes: {},
        timestamp: new Date().toISOString()
      },
      errors: this.errors,
      recommendations: []
    };

    // Categorize errors
    this.errors.forEach(error => {
      report.summary.errorTypes[error.type] = (report.summary.errorTypes[error.type] || 0) + 1;
    });

    // Generate recommendations
    if (report.summary.errorTypes.console_error > 0) {
      report.recommendations.push('Review console errors for potential runtime issues');
    }
    if (report.summary.errorTypes.request_failed > 0) {
      report.recommendations.push('Check network connectivity and API endpoint availability');
    }
    if (report.summary.errorTypes.page_error > 0) {
      report.recommendations.push('Investigate JavaScript runtime errors');
    }
    if (report.summary.errorTypes.http_error > 0) {
      report.recommendations.push('Review HTTP error responses and API status codes');
    }

    console.log('\n🚨 ERROR DETECTION REPORT');
    console.log('==========================');
    console.log(`Total Errors Found: ${report.summary.totalErrors}`);
    
    if (report.summary.totalErrors > 0) {
      console.log('\n📊 Error Breakdown:');
      Object.entries(report.summary.errorTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
      
      console.log('\n🔍 Sample Errors:');
      this.errors.slice(0, 5).forEach(error => {
        console.log(`  [${error.type}] ${error.message}`);
      });
      
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    } else {
      console.log('✅ No errors detected!');
    }

    // Save detailed report
    const reportPath = path.join(__dirname, 'error-detection-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed error report saved to: ${reportPath}`);
  }

  async runErrorDetection() {
    console.log('🚀 Starting Comprehensive Error Detection...\n');
    
    await this.init();
    
    await this.testPageLoadErrors();
    await this.testImportErrors();
    await this.testAuthenticationErrors();
    await this.testAudioFeatureErrors();
    await this.testNetworkErrors();
    await this.testComponentErrors();
    await this.testMobileErrors();
    
    await this.browser.close();
    
    await this.generateErrorReport();
  }
}

// Run error detection
const errorDetector = new ErrorDetectionTester();
errorDetector.runErrorDetection().catch(console.error); 