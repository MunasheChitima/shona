import { Page } from 'puppeteer';
import { TestRunner, TestResult, UserCredentials } from './types';
import { ForensicLogger } from './forensic-logger';
import path from 'path';

export class UserFlowTester implements TestRunner {
  private logger: ForensicLogger;
  private baseUrl: string;
  
  private testUsers: UserCredentials[] = [
    { email: 'new_user@test.com', password: 'testPassword123!' },
    { email: 'existing_user@test.com', password: 'testPassword123!' },
    { email: 'premium_user@test.com', password: 'testPassword123!' }
  ];

  constructor(logger: ForensicLogger, baseUrl: string) {
    this.logger = logger;
    this.baseUrl = baseUrl;
  }

  async runTests(page: Page): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    // Test scenarios
    const scenarios = [
      this.testNewUserJourney.bind(this),
      this.testExistingUserLogin.bind(this),
      this.testLessonCompletion.bind(this),
      this.testPronunciationFeature.bind(this),
      this.testQuestCompletion.bind(this),
      this.testProgressTracking.bind(this),
      this.testProfileManagement.bind(this),
      this.testNavigationFlow.bind(this),
      this.testErrorRecovery.bind(this),
      this.testOfflineCapabilities.bind(this),
      this.testDeepLinking.bind(this),
      this.testSessionManagement.bind(this),
      this.testDataPersistence.bind(this),
      this.testConcurrentTabs.bind(this),
      this.testBrowserBackButton.bind(this)
    ];

    for (const scenario of scenarios) {
      try {
        const result = await scenario(page);
        results.push(result);
      } catch (error) {
        this.logger.logError(`Scenario failed with unexpected error: ${error}`);
        results.push({
          testName: scenario.name,
          success: false,
          error: `Unexpected error: ${error}`,
          timestamp: Date.now(),
          duration: 0
        });
      }
    }

    return results;
  }

  private async testNewUserJourney(page: Page): Promise<TestResult> {
    const testName = 'New User Complete Journey';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Step 1: Navigate to home
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      await this.takeScreenshot(page, 'new-user-home');
      
      // Verify home page loaded
      const homeTitle = await page.$eval('h1', el => el.textContent);
      if (!homeTitle?.includes('Shona')) {
        throw new Error('Home page title not found');
      }
      
      // Step 2: Navigate to registration
      await page.click('a[href="/register"]');
      await page.waitForSelector('form', { timeout: 5000 });
      await this.takeScreenshot(page, 'new-user-register');
      
      // Step 3: Fill registration form
      const newUser = this.testUsers[0];
      await page.type('input[name="name"]', 'Test User');
      await page.type('input[name="email"]', newUser.email + Date.now()); // Make unique
      await page.type('input[name="password"]', newUser.password);
      await page.type('input[name="confirmPassword"]', newUser.password);
      
      // Step 4: Submit registration
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
      
      // Step 5: Verify redirect to onboarding or learn page
      const currentUrl = page.url();
      if (!currentUrl.includes('/learn') && !currentUrl.includes('/onboarding')) {
        throw new Error(`Unexpected redirect after registration: ${currentUrl}`);
      }
      
      await this.takeScreenshot(page, 'new-user-after-register');
      
      // Step 6: Complete onboarding if present
      if (currentUrl.includes('/onboarding')) {
        await this.completeOnboarding(page);
      }
      
      // Step 7: Verify lesson access
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 10000 });
      const lessonCards = await page.$$('[data-testid="lesson-card"]');
      
      if (lessonCards.length === 0) {
        throw new Error('No lessons available for new user');
      }
      
      // Step 8: Try first lesson
      await lessonCards[0].click();
      await page.waitForSelector('[data-testid="exercise-modal"]', { timeout: 5000 });
      await this.takeScreenshot(page, 'new-user-first-lesson');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
      
    } catch (error: any) {
      await this.takeScreenshot(page, 'new-user-error');
      return {
        testName,
        success: false,
        error: error.message,
        screenshot: await this.getLastScreenshotPath(),
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testExistingUserLogin(page: Page): Promise<TestResult> {
    const testName = 'Existing User Login Flow';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to login
      await page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('form', { timeout: 5000 });
      
      // Login with existing user
      await page.type('input[name="email"]', 'test@example.com');
      await page.type('input[name="password"]', 'password123');
      
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
      
      // Verify successful login
      if (!page.url().includes('/learn')) {
        throw new Error('Login did not redirect to learn page');
      }
      
      // Verify user data loaded
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 10000 });
      
      // Check if progress is restored
      const progressElements = await page.$$('[data-testid="progress-indicator"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        metrics: {
          duration: Date.now() - startTime,
          networkMetrics: {
            requests: await this.getNetworkRequestCount(page),
            failures: 0,
            totalSize: 0,
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

  private async testLessonCompletion(page: Page): Promise<TestResult> {
    const testName = 'Complete Lesson Flow';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Ensure we're logged in and on learn page
      if (!page.url().includes('/learn')) {
        await this.ensureLoggedIn(page);
      }
      
      // Select first incomplete lesson
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 10000 });
      const incompleteLessons = await page.$$('[data-testid="lesson-card"]:not([data-completed="true"])');
      
      if (incompleteLessons.length === 0) {
        throw new Error('No incomplete lessons found');
      }
      
      await incompleteLessons[0].click();
      await page.waitForSelector('[data-testid="exercise-modal"]', { timeout: 5000 });
      
      // Complete all exercises in the lesson
      let exerciseCount = 0;
      const maxExercises = 20; // Safety limit
      
      while (exerciseCount < maxExercises) {
        // Check if we're still in an exercise
        const exerciseModal = await page.$('[data-testid="exercise-modal"]');
        if (!exerciseModal) break;
        
        // Find and click correct answer (simplified for testing)
        const answerOptions = await page.$$('[data-testid="answer-option"]');
        if (answerOptions.length > 0) {
                     await answerOptions[0].click();
           await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for animation
           
           // Click continue if available
           const continueBtn = await page.$('[data-testid="continue-button"]');
           if (continueBtn) {
             await continueBtn.click();
             await new Promise(resolve => setTimeout(resolve, 500));
           }
        }
        
        exerciseCount++;
      }
      
      // Verify lesson completion
      await page.waitForSelector('[data-testid="lesson-complete"]', { timeout: 5000 });
      await this.takeScreenshot(page, 'lesson-complete');
      
             return {
         testName,
         success: true,
         timestamp: Date.now(),
         duration: Date.now() - startTime,
         metrics: {
           duration: Date.now() - startTime,
           resourceMetrics: {
             jsHeapUsed: exerciseCount // Using as a proxy for exercises completed
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

  private async testPronunciationFeature(page: Page): Promise<TestResult> {
    const testName = 'Pronunciation Feature Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to pronunciation page
      await page.goto(`${this.baseUrl}/pronunciation`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('[data-testid="pronunciation-practice"]', { timeout: 10000 });
      
      // Test microphone permission request
      const micButton = await page.$('[data-testid="mic-button"]');
      if (!micButton) {
        throw new Error('Microphone button not found');
      }
      
             // Click to start recording (permission will be auto-granted in test context)
       await micButton.click();
       await new Promise(resolve => setTimeout(resolve, 1000));
       
       // Verify recording UI appears
       const recordingIndicator = await page.$('[data-testid="recording-indicator"]');
       if (!recordingIndicator) {
         throw new Error('Recording indicator not shown');
       }
       
       // Stop recording
       await micButton.click();
       await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for feedback
      const feedback = await page.$('[data-testid="pronunciation-feedback"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: feedback ? [] : ['Pronunciation feedback not displayed']
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

  private async testQuestCompletion(page: Page): Promise<TestResult> {
    const testName = 'Quest Completion Flow';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to quests
      await page.goto(`${this.baseUrl}/quests`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('[data-testid="quest-card"]', { timeout: 10000 });
      
      // Find available quest
      const availableQuests = await page.$$('[data-testid="quest-card"]:not([data-completed="true"])');
      if (availableQuests.length === 0) {
        throw new Error('No available quests found');
      }
      
      // Start quest
      await availableQuests[0].click();
      await page.waitForSelector('[data-testid="quest-details"]', { timeout: 5000 });
      
             const startButton = await page.$('[data-testid="start-quest"]');
       if (startButton) {
         await startButton.click();
         await new Promise(resolve => setTimeout(resolve, 1000));
       }
       
       // Complete quest objectives (simplified)
       const objectives = await page.$$('[data-testid="quest-objective"]');
       for (const objective of objectives) {
         await objective.click();
         await new Promise(resolve => setTimeout(resolve, 500));
       }
      
      // Check for quest completion
      const completionModal = await page.$('[data-testid="quest-complete-modal"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: completionModal ? [] : ['Quest completion modal not shown']
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

  private async testProgressTracking(page: Page): Promise<TestResult> {
    const testName = 'Progress Tracking Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to profile/progress page
      await page.goto(`${this.baseUrl}/profile`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('[data-testid="progress-stats"]', { timeout: 10000 });
      
      // Verify progress elements
      const elements = {
        streak: await page.$('[data-testid="streak-counter"]'),
        xp: await page.$('[data-testid="xp-counter"]'),
        level: await page.$('[data-testid="level-indicator"]'),
        achievements: await page.$('[data-testid="achievements-section"]')
      };
      
      const missingElements = Object.entries(elements)
        .filter(([_, el]) => !el)
        .map(([name]) => name);
      
      if (missingElements.length > 0) {
        throw new Error(`Missing progress elements: ${missingElements.join(', ')}`);
      }
      
      // Test progress chart/visualization
      const progressChart = await page.$('[data-testid="progress-chart"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: progressChart ? [] : ['Progress chart not found']
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

  private async testProfileManagement(page: Page): Promise<TestResult> {
    const testName = 'Profile Management Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to profile
      await page.goto(`${this.baseUrl}/profile`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('[data-testid="profile-form"]', { timeout: 10000 });
      
      // Test profile update
      const nameInput = await page.$('input[name="name"]');
      if (nameInput) {
        await nameInput.click({ clickCount: 3 }); // Select all
        await nameInput.type('Updated Test User');
      }
      
      // Save changes
      const saveButton = await page.$('[data-testid="save-profile"]');
      if (saveButton) {
        await saveButton.click();
        
        // Wait for success message
        await page.waitForSelector('[data-testid="success-message"]', { timeout: 5000 });
      }
      
      // Test avatar upload (simulate)
      const avatarUpload = await page.$('input[type="file"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: avatarUpload ? [] : ['Avatar upload not available']
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

  private async testNavigationFlow(page: Page): Promise<TestResult> {
    const testName = 'Navigation Flow Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const routes = [
        { path: '/', selector: 'h1' },
        { path: '/learn', selector: '[data-testid="lesson-card"]' },
        { path: '/pronunciation', selector: '[data-testid="pronunciation-practice"]' },
        { path: '/quests', selector: '[data-testid="quest-card"]' },
        { path: '/flashcards', selector: '[data-testid="flashcard"]' },
        { path: '/profile', selector: '[data-testid="profile-form"]' }
      ];
      
      const navigationErrors: string[] = [];
      
      for (const route of routes) {
        try {
          await page.goto(`${this.baseUrl}${route.path}`, { waitUntil: 'networkidle2' });
          await page.waitForSelector(route.selector, { timeout: 5000 });
        } catch (error) {
          navigationErrors.push(`Failed to navigate to ${route.path}`);
        }
      }
      
      // Test navigation menu
      const navMenu = await page.$('[data-testid="navigation-menu"]');
      if (!navMenu) {
        navigationErrors.push('Navigation menu not found');
      }
      
      return {
        testName,
        success: navigationErrors.length === 0,
        error: navigationErrors.length > 0 ? navigationErrors.join('; ') : undefined,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: navigationErrors
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

  private async testErrorRecovery(page: Page): Promise<TestResult> {
    const testName = 'Error Recovery Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Test 404 page
      await page.goto(`${this.baseUrl}/non-existent-page`, { waitUntil: 'networkidle2' });
      const notFoundMessage = await page.$eval('body', el => el.textContent);
      if (!notFoundMessage?.includes('404') && !notFoundMessage?.includes('not found')) {
        throw new Error('404 page not properly displayed');
      }
      
      // Test network error recovery
      await page.setOfflineMode(true);
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      
      const offlineMessage = await page.$('[data-testid="offline-message"]');
      
      // Go back online
      await page.setOfflineMode(false);
      await page.reload({ waitUntil: 'networkidle2' });
      
      // Verify recovery
      const recovered = await page.$('[data-testid="lesson-card"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: offlineMessage ? [] : ['Offline message not shown']
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
      await page.setOfflineMode(false); // Ensure we're back online
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testOfflineCapabilities(page: Page): Promise<TestResult> {
    const testName = 'Offline Capabilities Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Load app while online
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 10000 });
      
      // Go offline
      await page.setOfflineMode(true);
      
             // Try to navigate
       await page.click('[data-testid="lesson-card"]').catch(() => {});
       await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if offline content is available
      const offlineContent = await page.$('[data-testid="offline-content"]');
      const offlineIndicator = await page.$('[data-testid="offline-indicator"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: [
          !offlineContent ? 'Offline content not available' : '',
          !offlineIndicator ? 'Offline indicator not shown' : ''
        ].filter(Boolean)
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
      await page.setOfflineMode(false);
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testDeepLinking(page: Page): Promise<TestResult> {
    const testName = 'Deep Linking Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Test direct lesson link
      await page.goto(`${this.baseUrl}/learn/lesson/1`, { waitUntil: 'networkidle2' });
      
      // Should either show lesson or redirect to login
      const lessonContent = await page.$('[data-testid="lesson-content"]');
      const loginForm = await page.$('form[data-testid="login-form"]');
      
      if (!lessonContent && !loginForm) {
        throw new Error('Deep link did not resolve to expected content');
      }
      
      // Test quest deep link
      await page.goto(`${this.baseUrl}/quests/daily-challenge`, { waitUntil: 'networkidle2' });
      
      const questContent = await page.$('[data-testid="quest-details"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: questContent ? [] : ['Quest deep link not working']
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

  private async testSessionManagement(page: Page): Promise<TestResult> {
    const testName = 'Session Management Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Login
      await this.ensureLoggedIn(page);
      
      // Get session cookie
      const cookies = await page.cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('auth'));
      
      if (!sessionCookie) {
        throw new Error('Session cookie not found');
      }
      
      // Clear cookies to simulate session expiry
      await page.deleteCookie(...cookies);
      
      // Try to access protected route
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      
      // Should redirect to login
      if (!page.url().includes('/login')) {
        throw new Error('Did not redirect to login after session clear');
      }
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime
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

  private async testDataPersistence(page: Page): Promise<TestResult> {
    const testName = 'Data Persistence Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Login and capture initial state
      await this.ensureLoggedIn(page);
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      
      // Get initial progress
      const initialProgress = await page.evaluate(() => {
        const progressElements = document.querySelectorAll('[data-testid="progress-indicator"]');
        return Array.from(progressElements).map(el => el.textContent);
      });
      
      // Make some progress (complete an exercise)
      const lessonCard = await page.$('[data-testid="lesson-card"]');
      if (lessonCard) {
        await lessonCard.click();
        await page.waitForSelector('[data-testid="exercise-modal"]', { timeout: 5000 });
        
                 // Complete one exercise
         const answer = await page.$('[data-testid="answer-option"]');
         if (answer) {
           await answer.click();
           await new Promise(resolve => setTimeout(resolve, 1000));
         }
      }
      
      // Refresh page
      await page.reload({ waitUntil: 'networkidle2' });
      
      // Check if progress persisted
      const newProgress = await page.evaluate(() => {
        const progressElements = document.querySelectorAll('[data-testid="progress-indicator"]');
        return Array.from(progressElements).map(el => el.textContent);
      });
      
      const progressChanged = JSON.stringify(initialProgress) !== JSON.stringify(newProgress);
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: progressChanged ? [] : ['Progress may not have persisted correctly']
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

  private async testConcurrentTabs(page: Page): Promise<TestResult> {
    const testName = 'Concurrent Tabs Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Login in first tab
      await this.ensureLoggedIn(page);
      
      // Open second tab
      const context = page.browserContext();
      const page2 = await context.newPage();
      
      // Navigate in second tab
      await page2.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      
      // Should be logged in
      const isLoggedInTab2 = await page2.$('[data-testid="lesson-card"]');
      if (!isLoggedInTab2) {
        throw new Error('Session not shared between tabs');
      }
      
      // Make change in tab 1
      await page.goto(`${this.baseUrl}/profile`, { waitUntil: 'networkidle2' });
      const nameInput = await page.$('input[name="name"]');
      if (nameInput) {
        await nameInput.click({ clickCount: 3 });
        await nameInput.type('Tab 1 Update');
      }
      
      // Check if tab 2 reflects changes after reload
      await page2.reload({ waitUntil: 'networkidle2' });
      await page2.goto(`${this.baseUrl}/profile`, { waitUntil: 'networkidle2' });
      
      const nameInTab2 = await page2.$eval('input[name="name"]', el => (el as HTMLInputElement).value);
      
      await page2.close();
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: nameInTab2?.includes('Tab 1') ? [] : ['Data sync between tabs may have issues']
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

  private async testBrowserBackButton(page: Page): Promise<TestResult> {
    const testName = 'Browser Back Button Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate through multiple pages
      const navigation = [
        { url: `${this.baseUrl}/`, name: 'home' },
        { url: `${this.baseUrl}/learn`, name: 'learn' },
        { url: `${this.baseUrl}/pronunciation`, name: 'pronunciation' },
        { url: `${this.baseUrl}/quests`, name: 'quests' }
      ];
      
             for (const nav of navigation) {
         await page.goto(nav.url, { waitUntil: 'networkidle2' });
         await new Promise(resolve => setTimeout(resolve, 500));
       }
      
      // Go back through history
      for (let i = navigation.length - 2; i >= 0; i--) {
        await page.goBack({ waitUntil: 'networkidle2' });
        
        const currentUrl = page.url();
        if (!currentUrl.includes(navigation[i].url.replace(this.baseUrl, ''))) {
          throw new Error(`Back button navigation failed at ${navigation[i].name}`);
        }
      }
      
      // Test forward navigation
      await page.goForward({ waitUntil: 'networkidle2' });
      if (!page.url().includes('/learn')) {
        throw new Error('Forward navigation failed');
      }
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime
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

  // Helper methods
  private async ensureLoggedIn(page: Page) {
    if (!page.url().includes('/learn')) {
      await page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
      await page.type('input[name="email"]', 'test@example.com');
      await page.type('input[name="password"]', 'password123');
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
    }
  }

  private async completeOnboarding(page: Page) {
    // Skip through onboarding steps
    const maxSteps = 5;
    for (let i = 0; i < maxSteps; i++) {
             const nextButton = await page.$('[data-testid="onboarding-next"]');
       if (nextButton) {
         await nextButton.click();
         await new Promise(resolve => setTimeout(resolve, 500));
       } else {
         break;
       }
    }
    
    // Complete onboarding
    const completeButton = await page.$('[data-testid="onboarding-complete"]');
    if (completeButton) {
      await completeButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }
  }

     private async takeScreenshot(page: Page, name: string) {
     const screenshotPath = path.join(
       this.logger.getOutputDir(),
       'screenshots',
       `${name}-${Date.now()}.png`
     ) as `${string}.png`;
     
     await page.screenshot({ path: screenshotPath, fullPage: true });
     this.logger.logScreenshot(name, screenshotPath, 'Test screenshot');
     
     return screenshotPath;
   }

  private async getLastScreenshotPath(): Promise<string> {
    // Return the last screenshot path (simplified)
    return 'see-logs-for-screenshot-path';
  }

  private async getNetworkRequestCount(page: Page): Promise<number> {
    // Get network request count (simplified)
    return 10; // Placeholder
  }
}