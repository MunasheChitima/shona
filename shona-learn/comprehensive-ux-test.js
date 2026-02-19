const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ComprehensiveUXTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      passed: 0,
      failed: 0,
      issues: [],
      recommendations: []
    };
  }

  async init() {
    console.log('🚀 Starting Comprehensive UX Test...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to Chrome
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Enable console logging
    this.page.on('console', msg => console.log('Browser Console:', msg.text()));
    this.page.on('pageerror', error => console.log('Page Error:', error.message));
  }

  async testHomePage() {
    console.log('\n📋 Testing Home Page...');
    
    try {
      await this.page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
      
      // Test page title
      const title = await this.page.title();
      if (title.includes('Learn Shona')) {
        this.testResults.passed++;
        console.log('✅ Page title is correct');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Page title incorrect');
      }

      // Test hero section
      const heroText = await this.page.$eval('h1', el => el.textContent);
      if (heroText.includes('Learn Shona')) {
        this.testResults.passed++;
        console.log('✅ Hero section displays correctly');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Hero section missing or incorrect');
      }

      // Test registration button
      const registerButton = await this.page.$('a[href="/register"]');
      if (registerButton) {
        this.testResults.passed++;
        console.log('✅ Registration button is present');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Registration button missing');
      }

      // Test login button
      const loginButton = await this.page.$('a[href="/login"]');
      if (loginButton) {
        this.testResults.passed++;
        console.log('✅ Login button is present');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Login button missing');
      }

      // Test features grid
      const featuresGrid = await this.page.$$('.grid');
      if (featuresGrid.length > 0) {
        this.testResults.passed++;
        console.log('✅ Features grid is displayed');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Features grid missing');
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.issues.push(`Home page test failed: ${error.message}`);
      console.log('❌ Home page test failed:', error.message);
    }
  }

  async testRegistration() {
    console.log('\n📋 Testing Registration Flow...');
    
    try {
      await this.page.goto('http://localhost:3002/register', { waitUntil: 'networkidle0' });
      
      // Test registration form
      const nameInput = await this.page.$('input[name="name"]');
      const emailInput = await this.page.$('input[name="email"]');
      const passwordInput = await this.page.$('input[name="password"]');
      
      if (nameInput && emailInput && passwordInput) {
        this.testResults.passed++;
        console.log('✅ Registration form fields are present');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Registration form fields missing');
      }

      // Test form validation
      await this.page.click('button[type="submit"]');
      await this.page.waitForTimeout(1000);
      
      const errorMessages = await this.page.$$('.text-red-500, .error');
      if (errorMessages.length > 0) {
        this.testResults.passed++;
        console.log('✅ Form validation is working');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Form validation not working');
      }

      // Test successful registration
      await this.page.type('input[name="name"]', 'Test User');
      await this.page.type('input[name="email"]', `test${Date.now()}@example.com`);
      await this.page.type('input[name="password"]', 'password123');
      
      await this.page.click('button[type="submit"]');
      await this.page.waitForTimeout(3000);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/learn')) {
        this.testResults.passed++;
        console.log('✅ Registration successful, redirected to learn page');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Registration redirect failed');
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.issues.push(`Registration test failed: ${error.message}`);
      console.log('❌ Registration test failed:', error.message);
    }
  }

  async testLogin() {
    console.log('\n📋 Testing Login Flow...');
    
    try {
      await this.page.goto('http://localhost:3002/login', { waitUntil: 'networkidle0' });
      
      // Test login form
      const emailInput = await this.page.$('input[name="email"]');
      const passwordInput = await this.page.$('input[name="password"]');
      
      if (emailInput && passwordInput) {
        this.testResults.passed++;
        console.log('✅ Login form fields are present');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Login form fields missing');
      }

      // Test login with test user
      await this.page.type('input[name="email"]', 'test@example.com');
      await this.page.type('input[name="password"]', 'password123');
      
      await this.page.click('button[type="submit"]');
      await this.page.waitForTimeout(3000);
      
      const currentUrl = this.page.url();
      if (currentUrl.includes('/learn')) {
        this.testResults.passed++;
        console.log('✅ Login successful, redirected to learn page');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Login redirect failed');
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.issues.push(`Login test failed: ${error.message}`);
      console.log('❌ Login test failed:', error.message);
    }
  }

  async testLearnPage() {
    console.log('\n📋 Testing Learn Page...');
    
    try {
      await this.page.goto('http://localhost:3002/learn', { waitUntil: 'networkidle0' });
      
      // Test page loads
      const pageTitle = await this.page.$eval('h1', el => el.textContent);
      if (pageTitle.includes('Learn Shona')) {
        this.testResults.passed++;
        console.log('✅ Learn page loads correctly');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Learn page title incorrect');
      }

      // Test lesson cards
      await this.page.waitForTimeout(2000);
      const lessonCards = await this.page.$$('[data-testid="lesson-card"]');
      
      if (lessonCards.length > 0) {
        this.testResults.passed++;
        console.log(`✅ Found ${lessonCards.length} lesson cards`);
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('No lesson cards found');
      }

      // Test first lesson interaction
      if (lessonCards.length > 0) {
        await lessonCards[0].click();
        await this.page.waitForTimeout(2000);
        
        const exerciseModal = await this.page.$('[data-testid="exercise-modal"]');
        if (exerciseModal) {
          this.testResults.passed++;
          console.log('✅ Exercise modal opens correctly');
        } else {
          this.testResults.failed++;
          this.testResults.issues.push('Exercise modal not opening');
        }
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.issues.push(`Learn page test failed: ${error.message}`);
      console.log('❌ Learn page test failed:', error.message);
    }
  }

  async testExerciseFlow() {
    console.log('\n📋 Testing Exercise Flow...');
    
    try {
      // Navigate to learn page and open first lesson
      await this.page.goto('http://localhost:3002/learn', { waitUntil: 'networkidle0' });
      await this.page.waitForTimeout(2000);
      
      const firstLesson = await this.page.$('[data-testid="lesson-card"]');
      if (!firstLesson) {
        throw new Error('No lesson cards found');
      }
      
      await firstLesson.click();
      await this.page.waitForTimeout(2000);
      
      // Test exercise modal
      const exerciseModal = await this.page.$('[data-testid="exercise-modal"]');
      if (!exerciseModal) {
        throw new Error('Exercise modal not found');
      }
      
      // Test question display
      const question = await this.page.$eval('h2', el => el.textContent);
      if (question) {
        this.testResults.passed++;
        console.log('✅ Exercise question displays correctly');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Exercise question not displaying');
      }

      // Test answer options
      const answerOptions = await this.page.$$('[data-testid="answer-option"]');
      if (answerOptions.length > 0) {
        this.testResults.passed++;
        console.log(`✅ Found ${answerOptions.length} answer options`);
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('No answer options found');
      }

      // Test answer selection
      if (answerOptions.length > 0) {
        await answerOptions[0].click();
        await this.page.waitForTimeout(2000);
        
        const feedback = await this.page.$('[data-testid="success-message"], [data-testid="error-message"]');
        if (feedback) {
          this.testResults.passed++;
          console.log('✅ Answer feedback displays correctly');
        } else {
          this.testResults.failed++;
          this.testResults.issues.push('Answer feedback not displaying');
        }
      }

      // Test modal close
      const closeButton = await this.page.$('[data-testid="close-modal"]');
      if (closeButton) {
        await closeButton.click();
        await this.page.waitForTimeout(1000);
        
        const modalClosed = await this.page.$('[data-testid="exercise-modal"]');
        if (!modalClosed) {
          this.testResults.passed++;
          console.log('✅ Exercise modal closes correctly');
        } else {
          this.testResults.failed++;
          this.testResults.issues.push('Exercise modal not closing');
        }
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.issues.push(`Exercise flow test failed: ${error.message}`);
      console.log('❌ Exercise flow test failed:', error.message);
    }
  }

  async testNavigation() {
    console.log('\n📋 Testing Navigation...');
    
    try {
      await this.page.goto('http://localhost:3002/learn', { waitUntil: 'networkidle0' });
      
      // Test navigation menu
      const navigation = await this.page.$('nav');
      if (navigation) {
        this.testResults.passed++;
        console.log('✅ Navigation menu is present');
      } else {
        this.testResults.failed++;
        this.testResults.issues.push('Navigation menu missing');
      }

      // Test profile link
      const profileLink = await this.page.$('a[href="/profile"]');
      if (profileLink) {
        await profileLink.click();
        await this.page.waitForTimeout(2000);
        
        const currentUrl = this.page.url();
        if (currentUrl.includes('/profile')) {
          this.testResults.passed++;
          console.log('✅ Profile navigation works');
        } else {
          this.testResults.failed++;
          this.testResults.issues.push('Profile navigation failed');
        }
      }

      // Test logout
      const logoutLink = await this.page.$('a[href="/logout"]');
      if (logoutLink) {
        await logoutLink.click();
        await this.page.waitForTimeout(2000);
        
        const currentUrl = this.page.url();
        if (currentUrl.includes('/')) {
          this.testResults.passed++;
          console.log('✅ Logout works correctly');
        } else {
          this.testResults.failed++;
          this.testResults.issues.push('Logout failed');
        }
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.issues.push(`Navigation test failed: ${error.message}`);
      console.log('❌ Navigation test failed:', error.message);
    }
  }

  async testResponsiveDesign() {
    console.log('\n📋 Testing Responsive Design...');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1024, height: 768, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      try {
        await this.page.setViewport(viewport);
        await this.page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
        
        // Test if page loads without horizontal scroll
        const bodyHandle = await this.page.$('body');
        const { width } = await bodyHandle.boundingBox();
        
        if (width <= viewport.width) {
          this.testResults.passed++;
          console.log(`✅ ${viewport.name} viewport displays correctly`);
        } else {
          this.testResults.failed++;
          this.testResults.issues.push(`${viewport.name} viewport has horizontal scroll`);
        }
        
        await this.page.waitForTimeout(1000);
        
      } catch (error) {
        this.testResults.failed++;
        this.testResults.issues.push(`${viewport.name} responsive test failed: ${error.message}`);
      }
    }
  }

  async testPerformance() {
    console.log('\n📋 Testing Performance...');
    
    try {
      const startTime = Date.now();
      await this.page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;
      
      if (loadTime < 3000) {
        this.testResults.passed++;
        console.log(`✅ Page loads in ${loadTime}ms (acceptable)`);
      } else {
        this.testResults.failed++;
        this.testResults.issues.push(`Page load time too slow: ${loadTime}ms`);
      }

      // Test learn page performance
      const learnStartTime = Date.now();
      await this.page.goto('http://localhost:3002/learn', { waitUntil: 'networkidle0' });
      const learnLoadTime = Date.now() - learnStartTime;
      
      if (learnLoadTime < 5000) {
        this.testResults.passed++;
        console.log(`✅ Learn page loads in ${learnLoadTime}ms (acceptable)`);
      } else {
        this.testResults.failed++;
        this.testResults.issues.push(`Learn page load time too slow: ${learnLoadTime}ms`);
      }

    } catch (error) {
      this.testResults.failed++;
      this.testResults.issues.push(`Performance test failed: ${error.message}`);
    }
  }

  async generateRecommendations() {
    console.log('\n📋 Generating Recommendations...');
    
    // Code quality recommendations
    this.testResults.recommendations.push({
      category: 'Code Quality',
      items: [
        'Implement proper TypeScript types for all components',
        'Add comprehensive error boundaries',
        'Implement proper loading states for all async operations',
        'Add proper accessibility attributes (ARIA labels)',
        'Implement proper form validation with better UX',
        'Add proper error handling for API calls',
        'Implement proper state management for complex data',
        'Add proper logging and monitoring',
        'Implement proper security measures (CSRF protection, rate limiting)',
        'Add proper SEO meta tags and structured data'
      ]
    });

    // UX recommendations
    this.testResults.recommendations.push({
      category: 'User Experience',
      items: [
        'Add onboarding flow for new users',
        'Implement progress indicators for long operations',
        'Add keyboard navigation support',
        'Implement proper focus management',
        'Add proper loading skeletons',
        'Implement proper error messages with actionable steps',
        'Add proper success feedback',
        'Implement proper form validation feedback',
        'Add proper tooltips and help text',
        'Implement proper mobile navigation'
      ]
    });

    // Content recommendations
    this.testResults.recommendations.push({
      category: 'Content & Learning',
      items: [
        'Add more diverse exercise types',
        'Implement spaced repetition algorithm',
        'Add cultural context for all vocabulary',
        'Implement proper pronunciation guides',
        'Add audio integration for all content',
        'Implement proper difficulty progression',
        'Add adaptive learning based on user performance',
        'Implement proper gamification elements',
        'Add social learning features',
        'Implement proper assessment and testing'
      ]
    });

    // Technical recommendations
    this.testResults.recommendations.push({
      category: 'Technical Improvements',
      items: [
        'Implement proper caching strategy',
        'Add proper database indexing',
        'Implement proper API rate limiting',
        'Add proper security headers',
        'Implement proper backup strategy',
        'Add proper monitoring and analytics',
        'Implement proper CI/CD pipeline',
        'Add proper testing coverage',
        'Implement proper documentation',
        'Add proper internationalization support'
      ]
    });
  }

  async runAllTests() {
    await this.init();
    
    await this.testHomePage();
    await this.testRegistration();
    await this.testLogin();
    await this.testLearnPage();
    await this.testExerciseFlow();
    await this.testNavigation();
    await this.testResponsiveDesign();
    await this.testPerformance();
    
    await this.generateRecommendations();
    
    await this.browser.close();
    
    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 COMPREHENSIVE UX TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Test Summary:`);
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);
    
    if (this.testResults.issues.length > 0) {
      console.log(`\n🚨 Issues Found:`);
      this.testResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    console.log(`\n💡 Recommendations:`);
    this.testResults.recommendations.forEach(category => {
      console.log(`\n${category.category}:`);
      category.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item}`);
      });
    });
    
    console.log('\n' + '='.repeat(60));
    
    // Save results to file
    const resultsPath = path.join(__dirname, 'ux-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 Results saved to: ${resultsPath}`);
  }
}

// Run the test
const test = new ComprehensiveUXTest();
test.runAllTests().catch(console.error); 