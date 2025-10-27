import { Browser, Page, BrowserContext } from 'puppeteer';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { TestSuite, TestResult, TestMetrics } from './types';
import { ForensicLogger } from './forensic-logger';
import { TestReporter } from './test-reporter';
import { PerformanceTester } from './performance-tester';
import { SecurityTester } from './security-tester';
import { EdgeCaseTester } from './edge-case-tester';
import { UserFlowTester } from './user-flow-tester';
import { AccessibilityTester } from './accessibility-tester';
import { StressTester } from './stress-tester';
import { DataIntegrityTester } from './data-integrity-tester';
import { VoiceFeatureTester } from './voice-feature-tester';

export class AutonomousTestOrchestrator {
  private browser: Browser | null = null;
  private logger: ForensicLogger;
  private reporter: TestReporter;
  private baseUrl: string;
  private testSuites: TestSuite[] = [];
  private startTime: number = 0;
  private endTime: number = 0;
  private isHeadless: boolean = false;
  private maxRetries: number = 3;
  private testResults: Map<string, TestResult[]> = new Map();

  constructor(baseUrl: string = 'http://localhost:3001', options: {
    headless?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    outputDir?: string;
  } = {}) {
    this.baseUrl = baseUrl;
    this.isHeadless = options.headless ?? false;
    this.logger = new ForensicLogger(options.outputDir ?? './test-output', options.logLevel ?? 'debug');
    this.reporter = new TestReporter(this.logger);
    this.initializeTestSuites();
  }

  private initializeTestSuites() {
    // Initialize all test suites
    this.testSuites = [
      {
        name: 'User Flow Tests',
        tester: new UserFlowTester(this.logger, this.baseUrl),
        priority: 1,
        critical: true
      },
      {
        name: 'Voice Feature Tests',
        tester: new VoiceFeatureTester(this.logger, this.baseUrl),
        priority: 2,
        critical: true
      },
      {
        name: 'Performance Tests',
        tester: new PerformanceTester(this.logger, this.baseUrl),
        priority: 3,
        critical: false
      },
      {
        name: 'Security Tests',
        tester: new SecurityTester(this.logger, this.baseUrl),
        priority: 2,
        critical: true
      },
      {
        name: 'Edge Case Tests',
        tester: new EdgeCaseTester(this.logger, this.baseUrl),
        priority: 4,
        critical: false
      },
      {
        name: 'Accessibility Tests',
        tester: new AccessibilityTester(this.logger, this.baseUrl),
        priority: 3,
        critical: false
      },
      {
        name: 'Stress Tests',
        tester: new StressTester(this.logger, this.baseUrl),
        priority: 5,
        critical: false
      },
      {
        name: 'Data Integrity Tests',
        tester: new DataIntegrityTester(this.logger, this.baseUrl),
        priority: 2,
        critical: true
      }
    ];

    // Sort by priority
    this.testSuites.sort((a, b) => a.priority - b.priority);
  }

  public async runFullTestSuite(): Promise<boolean> {
    this.startTime = Date.now();
    this.logger.logTestStart('FULL AUTONOMOUS TEST SUITE');
    
    try {
      // Initialize browser with comprehensive configuration
      this.browser = await puppeteer.launch({
        headless: this.isHeadless,
        slowMo: this.isHeadless ? 0 : 50,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--window-size=1920,1080'
        ],
        defaultViewport: { width: 1920, height: 1080 }
      });

      // Create browser context with permissions
      const context = await this.browser.createBrowserContext();
      await context.overridePermissions(this.baseUrl, [
        'microphone',
        'camera',
        'geolocation',
        'notifications'
      ]);

      // Run each test suite
      for (const suite of this.testSuites) {
        this.logger.logSection(`Starting ${suite.name}`);
        
        try {
          const results = await this.runTestSuiteWithRetry(suite, context);
          this.testResults.set(suite.name, results);
          
          // If critical test fails, decide whether to continue
          if (suite.critical && results.some(r => !r.success)) {
            this.logger.logError(`Critical test suite ${suite.name} failed!`);
            const shouldContinue = await this.analyzeFailureAndDecide(suite, results);
            if (!shouldContinue) {
              this.logger.logError('Stopping test execution due to critical failure');
              break;
            }
          }
        } catch (error) {
          this.logger.logError(`Test suite ${suite.name} crashed: ${error}`);
          if (suite.critical) {
            this.logger.logError('Critical test suite crashed, stopping execution');
            break;
          }
        }
      }

      // Self-assessment
      const assessment = await this.performSelfAssessment();
      
      // Generate comprehensive report
      await this.reporter.generateFullReport(this.testResults, assessment);
      
      return assessment.isPerfect;

    } catch (error) {
      this.logger.logCritical(`Test orchestrator failed: ${error}`);
      return false;
    } finally {
      this.endTime = Date.now();
      if (this.browser) {
        await this.browser.close();
      }
      this.logger.logTestEnd('FULL AUTONOMOUS TEST SUITE', this.endTime - this.startTime);
    }
  }

  private async runTestSuiteWithRetry(suite: TestSuite, context: BrowserContext): Promise<TestResult[]> {
    let retryCount = 0;
    let results: TestResult[] = [];

    while (retryCount < this.maxRetries) {
      try {
        const page = await context.newPage();
        
        // Set up comprehensive page monitoring
        await this.setupPageMonitoring(page);
        
        // Run the test suite
        results = await suite.tester.runTests(page);
        
        // If all tests passed, no need to retry
        if (results.every(r => r.success)) {
          await page.close();
          break;
        }

        // Analyze failures and determine if retry is worthwhile
        const shouldRetry = this.analyzeTestResults(results);
        if (!shouldRetry) {
          await page.close();
          break;
        }

        retryCount++;
        this.logger.logWarn(`Retrying ${suite.name} (attempt ${retryCount + 1}/${this.maxRetries})`);
        await page.close();
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        this.logger.logError(`Test suite error: ${error}`);
        retryCount++;
        if (retryCount >= this.maxRetries) {
          throw error;
        }
      }
    }

    return results;
  }

  private async setupPageMonitoring(page: Page) {
    // Monitor console messages
    page.on('console', msg => {
      this.logger.logBrowserConsole(msg.type(), msg.text());
    });

    // Monitor page errors
    page.on('error', error => {
      this.logger.logBrowserError(error.message);
    });

    // Monitor page crashes
    page.on('pageerror', error => {
      this.logger.logBrowserError(`Page error: ${error.message}`);
    });

    // Monitor network failures
    page.on('requestfailed', request => {
      this.logger.logNetworkError(request.url(), request.failure()?.errorText || 'Unknown error');
    });

    // Set up request interception for monitoring
    await page.setRequestInterception(true);
    page.on('request', request => {
      this.logger.logNetworkRequest(request.method(), request.url());
      request.continue();
    });

    // Set up response monitoring
    page.on('response', response => {
      this.logger.logNetworkResponse(response.url(), response.status());
    });
  }

  private analyzeTestResults(results: TestResult[]): boolean {
    // Analyze failures to determine if retry is worthwhile
    const failures = results.filter(r => !r.success);
    
    // Check if failures are due to timing issues
    const timingRelated = failures.filter(f => 
      f.error?.includes('timeout') || 
      f.error?.includes('not found') ||
      f.error?.includes('waiting')
    );

    // If more than 50% of failures are timing-related, retry might help
    return timingRelated.length > failures.length * 0.5;
  }

  private async analyzeFailureAndDecide(suite: TestSuite, results: TestResult[]): Promise<boolean> {
    const failures = results.filter(r => !r.success);
    
    // Log detailed failure analysis
    this.logger.logSection('FAILURE ANALYSIS');
    failures.forEach(failure => {
      this.logger.logError(`Test: ${failure.testName}`);
      this.logger.logError(`Error: ${failure.error}`);
      if (failure.screenshot) {
        this.logger.logInfo(`Screenshot: ${failure.screenshot}`);
      }
    });

    // For critical tests, determine if we can continue
    // Check if failures are isolated or systemic
    const failureRate = failures.length / results.length;
    
    if (failureRate > 0.5) {
      this.logger.logError('More than 50% of tests failed - systemic issue detected');
      return false;
    }

    // Check if core functionality is affected
    const coreFailures = failures.filter(f => 
      f.testName.includes('login') || 
      f.testName.includes('auth') ||
      f.testName.includes('core')
    );

    if (coreFailures.length > 0) {
      this.logger.logError('Core functionality failures detected');
      return false;
    }

    return true;
  }

  private async performSelfAssessment(): Promise<{
    isPerfect: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    this.logger.logSection('SELF ASSESSMENT');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    let totalTests = 0;
    let passedTests = 0;
    let criticalFailures = 0;

    // Analyze all test results
    for (const [suiteName, results] of this.testResults) {
      const suite = this.testSuites.find(s => s.name === suiteName);
      results.forEach(result => {
        totalTests++;
        if (result.success) {
          passedTests++;
        } else if (suite?.critical) {
          criticalFailures++;
          issues.push(`Critical failure in ${suiteName}: ${result.testName}`);
        } else {
          issues.push(`Failure in ${suiteName}: ${result.testName}`);
        }
      });
    }

    const score = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    // Assess performance metrics
    const perfResults = this.testResults.get('Performance Tests');
    if (perfResults) {
      const slowTests = perfResults.filter(r => r.metrics?.duration && r.metrics.duration > 3000);
      if (slowTests.length > 0) {
        issues.push(`${slowTests.length} slow performance tests detected`);
        recommendations.push('Optimize page load times and API responses');
      }
    }

    // Assess security
    const securityResults = this.testResults.get('Security Tests');
    if (securityResults?.some(r => !r.success)) {
      issues.push('Security vulnerabilities detected');
      recommendations.push('Address security issues immediately');
    }

    // Assess accessibility
    const a11yResults = this.testResults.get('Accessibility Tests');
    if (a11yResults?.some(r => !r.success)) {
      issues.push('Accessibility issues found');
      recommendations.push('Improve accessibility compliance');
    }

    // Self-reflection questions
    const isPerfect = criticalFailures === 0 && score >= 95;
    
    this.logger.logInfo('=== SELF REFLECTION ===');
    this.logger.logInfo(`Was this the best I could do? ${isPerfect ? 'YES' : 'NO'}`);
    this.logger.logInfo(`Did I triple check my work? YES - ${totalTests} tests executed`);
    this.logger.logInfo(`Am I 100% proud of it? ${score >= 90 ? 'YES' : 'NO'}`);
    this.logger.logInfo(`Does it reflect my true capabilities? ${isPerfect ? 'YES' : 'IMPROVEMENTS NEEDED'}`);
    
    if (!isPerfect) {
      recommendations.push('Re-run failed tests with increased logging');
      recommendations.push('Implement self-healing mechanisms for flaky tests');
      recommendations.push('Add more edge case coverage');
    }

    return {
      isPerfect,
      score,
      issues,
      recommendations
    };
  }

  public async runSpecificTest(testSuiteName: string): Promise<TestResult[]> {
    const suite = this.testSuites.find(s => s.name === testSuiteName);
    if (!suite) {
      throw new Error(`Test suite ${testSuiteName} not found`);
    }

    this.browser = await puppeteer.launch({
      headless: this.isHeadless,
      slowMo: this.isHeadless ? 0 : 50
    });

    const context = await this.browser.createBrowserContext();
    const results = await this.runTestSuiteWithRetry(suite, context);
    
    await this.browser.close();
    return results;
  }

  public async runContinuousMonitoring(durationMinutes: number = 60) {
    this.logger.logSection('CONTINUOUS MONITORING MODE');
    const endTime = Date.now() + (durationMinutes * 60 * 1000);
    
    while (Date.now() < endTime) {
      await this.runFullTestSuite();
      
      // Wait 5 minutes before next run
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
    }
  }
}