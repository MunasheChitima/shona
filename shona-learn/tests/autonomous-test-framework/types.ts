import { Page } from 'puppeteer';

export interface TestResult {
  testName: string;
  success: boolean;
  error?: string;
  screenshot?: string;
  metrics?: TestMetrics;
  timestamp: number;
  duration: number;
  retryCount?: number;
  warnings?: string[];
}

export interface TestMetrics {
  duration: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  performanceMetrics?: {
    firstContentfulPaint?: number;
    domContentLoaded?: number;
    loadComplete?: number;
    largestContentfulPaint?: number;
    cumulativeLayoutShift?: number;
    totalBlockingTime?: number;
  };
  networkMetrics?: {
    requests: number;
    failures: number;
    totalSize: number;
    totalDuration: number;
  };
  resourceMetrics?: {
    jsHeapUsed?: number;
    documents?: number;
    frames?: number;
    layoutCount?: number;
    styleRecalcCount?: number;
  };
}

export interface TestSuite {
  name: string;
  tester: TestRunner;
  priority: number;
  critical: boolean;
}

export interface TestRunner {
  runTests(page: Page): Promise<TestResult[]>;
}

export interface TestConfig {
  baseUrl: string;
  headless: boolean;
  timeout: number;
  retryCount: number;
  parallelism: number;
  outputDir: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableVideo: boolean;
  enableScreenshots: boolean;
  enableNetworkLogging: boolean;
  slowMo?: number;
}

export interface UserCredentials {
  email: string;
  password: string;
  role?: 'student' | 'teacher' | 'admin';
}

export interface TestScenario {
  name: string;
  description: string;
  steps: TestStep[];
  expectedOutcome: string;
  criticalPath: boolean;
}

export interface TestStep {
  action: string;
  selector?: string;
  value?: string;
  waitFor?: string;
  screenshot?: boolean;
  validate?: ValidationRule[];
}

export interface ValidationRule {
  type: 'text' | 'attribute' | 'count' | 'visible' | 'url' | 'custom';
  selector?: string;
  expected: any;
  operator?: 'equals' | 'contains' | 'greater' | 'less' | 'matches';
}

export interface PerformanceThresholds {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  apiResponseTime: number;
}

export interface SecurityTest {
  name: string;
  type: 'xss' | 'injection' | 'csrf' | 'auth' | 'access' | 'encryption';
  payload?: string;
  expectedBehavior: string;
}

export interface EdgeCase {
  name: string;
  description: string;
  input: any;
  expectedBehavior: string;
  category: 'boundary' | 'invalid' | 'stress' | 'concurrent' | 'timeout';
}

export interface AccessibilityIssue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  wcagCriteria?: string;
  fix?: string;
}

export interface TestReport {
  timestamp: number;
  duration: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  criticalFailures: number;
  testSuites: {
    [suiteName: string]: {
      total: number;
      passed: number;
      failed: number;
      results: TestResult[];
    };
  };
  performanceMetrics: {
    average: TestMetrics;
    worst: TestMetrics;
    best: TestMetrics;
  };
  securityIssues: SecurityTest[];
  accessibilityIssues: AccessibilityIssue[];
  recommendations: string[];
  selfAssessment: {
    isPerfect: boolean;
    score: number;
    issues: string[];
    improvements: string[];
  };
}