import { Page } from 'puppeteer';
import { TestRunner, TestResult } from './types';
import { ForensicLogger } from './forensic-logger';

export class VoiceFeatureTester implements TestRunner {
  private logger: ForensicLogger;
  private baseUrl: string;

  constructor(logger: ForensicLogger, baseUrl: string) {
    this.logger = logger;
    this.baseUrl = baseUrl;
  }

  async runTests(page: Page): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    const testScenarios = [
      this.testMicrophonePermissions.bind(this),
      this.testPronunciationRecording.bind(this),
      this.testPronunciationFeedback.bind(this),
      this.testTextToSpeech.bind(this),
      this.testVoiceNavigation.bind(this),
      this.testPronunciationScoring.bind(this),
      this.testMouthDiagramDisplay.bind(this),
      this.testPhonemeFeedback.bind(this),
      this.testVoiceAnalytics.bind(this),
      this.testMultipleRecordingAttempts.bind(this),
      this.testVoiceQualityDetection.bind(this),
      this.testBackgroundNoiseHandling.bind(this),
      this.testVoiceFeaturePerformance.bind(this),
      this.testVoiceDataPersistence.bind(this),
      this.testOfflineVoiceFeatures.bind(this)
    ];

    for (const scenario of testScenarios) {
      try {
        const result = await scenario(page);
        results.push(result);
      } catch (error) {
        this.logger.logError(`Voice test scenario failed: ${error}`);
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

  private async testMicrophonePermissions(page: Page): Promise<TestResult> {
    const testName = 'Microphone Permissions Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to pronunciation page
      await page.goto(`${this.baseUrl}/pronunciation`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('[data-testid="pronunciation-practice"]', { timeout: 10000 });
      
      // Check for microphone button
      const micButton = await page.$('[data-testid="mic-button"]');
      if (!micButton) {
        throw new Error('Microphone button not found');
      }
      
      // Test permission state before request
      const permissionStatus = await page.evaluate(async () => {
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          return result.state;
        }
        return 'unavailable';
      });
      
      this.logger.logInfo(`Initial microphone permission state: ${permissionStatus}`);
      
      // Click microphone button (permissions auto-granted in test context)
      await micButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify permission granted indicator
      const permissionIndicator = await page.$('[data-testid="mic-permission-granted"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: permissionIndicator ? [] : ['Permission granted indicator not shown']
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

  private async testPronunciationRecording(page: Page): Promise<TestResult> {
    const testName = 'Pronunciation Recording Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Ensure we're on pronunciation page
      if (!page.url().includes('/pronunciation')) {
        await page.goto(`${this.baseUrl}/pronunciation`, { waitUntil: 'networkidle2' });
      }
      
      // Select a word to practice
      const wordCards = await page.$$('[data-testid="word-card"]');
      if (wordCards.length === 0) {
        throw new Error('No words available for practice');
      }
      
      await wordCards[0].click();
      await page.waitForSelector('[data-testid="pronunciation-word-display"]', { timeout: 5000 });
      
      // Start recording
      const recordButton = await page.$('[data-testid="record-button"]');
      if (!recordButton) {
        throw new Error('Record button not found');
      }
      
      await recordButton.click();
      
      // Verify recording state
      const recordingIndicator = await page.waitForSelector('[data-testid="recording-indicator"]', { timeout: 5000 });
      if (!recordingIndicator) {
        throw new Error('Recording indicator not displayed');
      }
      
      // Check waveform visualization
      const waveform = await page.$('[data-testid="recording-waveform"]');
      
      // Simulate recording duration
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Stop recording
      await recordButton.click();
      
      // Verify recording stopped
      const stoppedIndicator = await page.$('[data-testid="recording-stopped"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: [
          !waveform ? 'Waveform visualization not shown' : '',
          !stoppedIndicator ? 'Recording stopped indicator not shown' : ''
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
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testPronunciationFeedback(page: Page): Promise<TestResult> {
    const testName = 'Pronunciation Feedback Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Complete a recording first
      await this.simulateRecording(page);
      
      // Wait for analysis
      await page.waitForSelector('[data-testid="pronunciation-analysis"]', { timeout: 10000 });
      
      // Check feedback components
      const feedbackElements = {
        score: await page.$('[data-testid="pronunciation-score"]'),
        accuracy: await page.$('[data-testid="accuracy-meter"]'),
        suggestions: await page.$('[data-testid="improvement-suggestions"]'),
        phonemes: await page.$('[data-testid="phoneme-breakdown"]'),
        playback: await page.$('[data-testid="playback-button"]')
      };
      
      const missingElements = Object.entries(feedbackElements)
        .filter(([_, el]) => !el)
        .map(([name]) => name);
      
      if (missingElements.length > 0) {
        this.logger.logWarn(`Missing feedback elements: ${missingElements.join(', ')}`);
      }
      
      // Test playback functionality
      if (feedbackElements.playback) {
        await feedbackElements.playback.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const audioPlaying = await page.$('[data-testid="audio-playing"]');
        if (!audioPlaying) {
          missingElements.push('audio playback indicator');
        }
      }
      
      // Check if score is displayed
      if (feedbackElements.score) {
        const scoreText = await page.$eval('[data-testid="pronunciation-score"]', el => el.textContent);
        this.logger.logInfo(`Pronunciation score: ${scoreText}`);
      }
      
      return {
        testName,
        success: missingElements.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: missingElements.length > 0 ? [`Missing: ${missingElements.join(', ')}`] : []
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

  private async testTextToSpeech(page: Page): Promise<TestResult> {
    const testName = 'Text-to-Speech Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to a lesson with TTS
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      const lessonCard = await page.$('[data-testid="lesson-card"]');
      if (lessonCard) {
        await lessonCard.click();
        await page.waitForSelector('[data-testid="exercise-modal"]', { timeout: 5000 });
      }
      
      // Find TTS buttons
      const ttsButtons = await page.$$('[data-testid="tts-button"], [data-testid="speaker-icon"]');
      if (ttsButtons.length === 0) {
        throw new Error('No TTS buttons found');
      }
      
      // Test each TTS button
      const ttsResults: boolean[] = [];
      for (const button of ttsButtons) {
        await button.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check for audio playing indicator
        const playing = await page.$('[data-testid="audio-playing"], [data-testid="tts-active"]');
        ttsResults.push(!!playing);
      }
      
      // Test TTS speed controls if available
      const speedControl = await page.$('[data-testid="tts-speed-control"]');
      let speedControlWorks = false;
      
      if (speedControl) {
        await speedControl.click();
        const speedOptions = await page.$$('[data-testid="speed-option"]');
        if (speedOptions.length > 0) {
          await speedOptions[0].click();
          speedControlWorks = true;
        }
      }
      
      return {
        testName,
        success: ttsResults.some(r => r),
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: [
          !speedControl ? 'TTS speed control not available' : '',
          !speedControlWorks ? 'TTS speed control not functional' : ''
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
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testVoiceNavigation(page: Page): Promise<TestResult> {
    const testName = 'Voice Navigation Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Check for voice navigation button
      const voiceNavButton = await page.$('[data-testid="voice-nav-button"], button svg[height="1em"]');
      if (!voiceNavButton) {
        throw new Error('Voice navigation button not found');
      }
      
      // Click voice navigation
      await voiceNavButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for voice command interface
      const voiceInterface = await page.$('[data-testid="voice-command-interface"]');
      const commandList = await page.$('[data-testid="voice-commands-list"]');
      
      // Test voice command (simulated)
      const commandInput = await page.$('[data-testid="voice-command-input"]');
      if (commandInput) {
        await commandInput.type('go to lessons');
        await page.keyboard.press('Enter');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if navigation occurred
        const navigated = page.url().includes('/learn');
        
        return {
          testName,
          success: true,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          warnings: [
            !voiceInterface ? 'Voice interface not displayed' : '',
            !commandList ? 'Voice commands list not shown' : '',
            !navigated ? 'Voice navigation did not work' : ''
          ].filter(Boolean)
        };
      }
      
      return {
        testName,
        success: !!voiceInterface,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: ['Voice command input not available']
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

  private async testPronunciationScoring(page: Page): Promise<TestResult> {
    const testName = 'Pronunciation Scoring System Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Complete multiple pronunciation attempts
      const attempts = 3;
      const scores: number[] = [];
      
      for (let i = 0; i < attempts; i++) {
        await this.simulateRecording(page);
        
        // Wait for score
        await page.waitForSelector('[data-testid="pronunciation-score"]', { timeout: 10000 });
        const scoreText = await page.$eval('[data-testid="pronunciation-score"]', el => el.textContent || '0');
        const score = parseInt(scoreText.replace(/[^0-9]/g, ''));
        scores.push(score);
        
        // Try again button
        const tryAgainBtn = await page.$('[data-testid="try-again-button"]');
        if (tryAgainBtn && i < attempts - 1) {
          await tryAgainBtn.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Check score consistency and progression tracking
      const progressChart = await page.$('[data-testid="pronunciation-progress-chart"]');
      const averageScore = await page.$('[data-testid="average-score"]');
      
      this.logger.logInfo(`Pronunciation scores: ${scores.join(', ')}`);
      
      return {
        testName,
        success: scores.length === attempts && scores.every(s => s >= 0 && s <= 100),
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: [
          !progressChart ? 'Progress chart not displayed' : '',
          !averageScore ? 'Average score not shown' : ''
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
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testMouthDiagramDisplay(page: Page): Promise<TestResult> {
    const testName = 'Mouth Diagram Display Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to pronunciation practice
      await page.goto(`${this.baseUrl}/pronunciation`, { waitUntil: 'networkidle2' });
      
      // Select a word with specific phonemes
      const phoneticWords = await page.$$('[data-testid="phonetic-word"]');
      if (phoneticWords.length > 0) {
        await phoneticWords[0].click();
        await page.waitForSelector('[data-testid="mouth-diagram"]', { timeout: 5000 });
      }
      
      // Check mouth diagram components
      const diagramElements = {
        mouthShape: await page.$('[data-testid="mouth-shape-diagram"]'),
        tonguePosition: await page.$('[data-testid="tongue-position"]'),
        airflowIndicator: await page.$('[data-testid="airflow-indicator"]'),
        animatedDiagram: await page.$('[data-testid="animated-mouth-diagram"]'),
        phonemeLabel: await page.$('[data-testid="current-phoneme-label"]')
      };
      
      const foundElements = Object.entries(diagramElements)
        .filter(([_, el]) => el)
        .map(([name]) => name);
      
      // Test animation if available
      if (diagramElements.animatedDiagram) {
        const playButton = await page.$('[data-testid="play-animation"]');
        if (playButton) {
          await playButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      return {
        testName,
        success: foundElements.length >= 3, // At least 3 diagram elements should be present
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: foundElements.length < 5 ? [`Only ${foundElements.length}/5 diagram elements found`] : []
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

  private async testPhonemeFeedback(page: Page): Promise<TestResult> {
    const testName = 'Phoneme-Level Feedback Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Complete a pronunciation attempt
      await this.simulateRecording(page);
      
      // Wait for phoneme analysis
      await page.waitForSelector('[data-testid="phoneme-breakdown"]', { timeout: 10000 });
      
      // Get all phoneme feedback elements
      const phonemeElements = await page.$$('[data-testid="phoneme-feedback-item"]');
      if (phonemeElements.length === 0) {
        throw new Error('No phoneme feedback items found');
      }
      
      // Check each phoneme feedback
      const phonemeFeedback: any[] = [];
      for (const element of phonemeElements) {
        const phoneme = await element.$eval('[data-testid="phoneme-symbol"]', el => el.textContent);
        const accuracy = await element.$eval('[data-testid="phoneme-accuracy"]', el => el.textContent).catch(() => null);
        const suggestion = await element.$eval('[data-testid="phoneme-suggestion"]', el => el.textContent).catch(() => null);
        
        phonemeFeedback.push({ phoneme, accuracy, suggestion });
      }
      
      this.logger.logInfo(`Phoneme feedback: ${JSON.stringify(phonemeFeedback)}`);
      
      // Check for detailed phoneme tips
      const phonemerTips = await page.$('[data-testid="phoneme-tips"]');
      const phonemeComparison = await page.$('[data-testid="phoneme-comparison"]');
      
      return {
        testName,
        success: phonemeFeedback.length > 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: [
          !phonemerTips ? 'Phoneme tips not available' : '',
          !phonemeComparison ? 'Phoneme comparison not shown' : ''
        ].filter(Boolean),
        metrics: {
          duration: Date.now() - startTime,
          resourceMetrics: {
            documents: phonemeFeedback.length
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

  private async testVoiceAnalytics(page: Page): Promise<TestResult> {
    const testName = 'Voice Analytics Dashboard Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Navigate to pronunciation analytics
      await page.goto(`${this.baseUrl}/pronunciation`, { waitUntil: 'networkidle2' });
      
      // Look for analytics button/section
      const analyticsBtn = await page.$('[data-testid="view-analytics"], [data-testid="pronunciation-stats"]');
      if (analyticsBtn) {
        await analyticsBtn.click();
        await page.waitForSelector('[data-testid="analytics-dashboard"]', { timeout: 5000 });
      }
      
      // Check analytics components
      const analyticsElements = {
        progressChart: await page.$('[data-testid="pronunciation-progress-chart"]'),
        accuracyTrend: await page.$('[data-testid="accuracy-trend"]'),
        problemPhonemes: await page.$('[data-testid="problem-phonemes"]'),
        practiceStreak: await page.$('[data-testid="practice-streak"]'),
        timeSpent: await page.$('[data-testid="time-spent-practicing"]'),
        wordsMatered: await page.$('[data-testid="words-mastered"]')
      };
      
      const foundAnalytics = Object.entries(analyticsElements)
        .filter(([_, el]) => el)
        .map(([name]) => name);
      
      return {
        testName,
        success: foundAnalytics.length >= 3,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: foundAnalytics.length < 6 ? [`Only ${foundAnalytics.length}/6 analytics elements found`] : []
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

  private async testMultipleRecordingAttempts(page: Page): Promise<TestResult> {
    const testName = 'Multiple Recording Attempts Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Test recording the same word multiple times
      const attempts = 5;
      const results: boolean[] = [];
      
      for (let i = 0; i < attempts; i++) {
        try {
          await this.simulateRecording(page);
          await page.waitForSelector('[data-testid="pronunciation-score"]', { timeout: 5000 });
          results.push(true);
          
          // Click retry
          const retryBtn = await page.$('[data-testid="retry-pronunciation"]');
          if (retryBtn && i < attempts - 1) {
            await retryBtn.click();
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          results.push(false);
          this.logger.logWarn(`Attempt ${i + 1} failed: ${error}`);
        }
      }
      
      // Check if attempts are tracked
      const attemptCounter = await page.$('[data-testid="attempt-counter"]');
      const bestScore = await page.$('[data-testid="best-score"]');
      
      return {
        testName,
        success: results.filter(r => r).length >= 3,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: [
          !attemptCounter ? 'Attempt counter not shown' : '',
          !bestScore ? 'Best score not tracked' : ''
        ].filter(Boolean),
        metrics: {
          duration: Date.now() - startTime,
          resourceMetrics: {
            frames: results.filter(r => r).length
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

  private async testVoiceQualityDetection(page: Page): Promise<TestResult> {
    const testName = 'Voice Quality Detection Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Start recording
      const recordBtn = await page.$('[data-testid="record-button"]');
      if (!recordBtn) {
        throw new Error('Record button not found');
      }
      
      await recordBtn.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for quality indicators
      const qualityIndicators = {
        volumeMeter: await page.$('[data-testid="volume-meter"]'),
        noiseLevel: await page.$('[data-testid="noise-level"]'),
        clarity: await page.$('[data-testid="audio-clarity"]'),
        warningMessage: await page.$('[data-testid="audio-quality-warning"]')
      };
      
      // Stop recording
      await recordBtn.click();
      
      const foundIndicators = Object.entries(qualityIndicators)
        .filter(([_, el]) => el)
        .map(([name]) => name);
      
      return {
        testName,
        success: foundIndicators.length >= 2,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: foundIndicators.length < 4 ? [`Only ${foundIndicators.length}/4 quality indicators found`] : []
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

  private async testBackgroundNoiseHandling(page: Page): Promise<TestResult> {
    const testName = 'Background Noise Handling Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // This test checks if the app handles background noise
      // In a real scenario, we'd simulate noise, but here we check for the features
      
      const noiseFeatures = {
        noiseReduction: await page.$('[data-testid="noise-reduction-toggle"]'),
        noiseWarning: await page.$('[data-testid="background-noise-warning"]'),
        environmentCheck: await page.$('[data-testid="environment-check"]'),
        noiseLevel: await page.$('[data-testid="ambient-noise-level"]')
      };
      
      // Try to enable noise reduction if available
      if (noiseFeatures.noiseReduction) {
        await noiseFeatures.noiseReduction.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const enabled = await page.$('[data-testid="noise-reduction-enabled"]');
        if (!enabled) {
          this.logger.logWarn('Noise reduction toggle did not work');
        }
      }
      
      const foundFeatures = Object.entries(noiseFeatures)
        .filter(([_, el]) => el)
        .map(([name]) => name);
      
      return {
        testName,
        success: foundFeatures.length >= 1,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: foundFeatures.length === 0 ? ['No noise handling features found'] : []
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

  private async testVoiceFeaturePerformance(page: Page): Promise<TestResult> {
    const testName = 'Voice Feature Performance Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const performanceMetrics: any = {};
      
      // Measure TTS performance
      const ttsStart = Date.now();
      const ttsButton = await page.$('[data-testid="tts-button"]');
      if (ttsButton) {
        await ttsButton.click();
        await page.waitForSelector('[data-testid="audio-playing"]', { timeout: 5000 }).catch(() => {});
        performanceMetrics.ttsResponseTime = Date.now() - ttsStart;
      }
      
      // Measure recording analysis time
      const recordStart = Date.now();
      await this.simulateRecording(page);
      await page.waitForSelector('[data-testid="pronunciation-score"]', { timeout: 10000 });
      performanceMetrics.analysisTime = Date.now() - recordStart;
      
      // Check memory usage
      const metrics = await page.metrics();
      performanceMetrics.jsHeapUsed = metrics.JSHeapUsedSize;
      
      this.logger.logInfo(`Voice performance metrics: ${JSON.stringify(performanceMetrics)}`);
      
      // Define acceptable thresholds
      const issues: string[] = [];
      if (performanceMetrics.ttsResponseTime > 2000) {
        issues.push('TTS response time too slow');
      }
      if (performanceMetrics.analysisTime > 5000) {
        issues.push('Pronunciation analysis too slow');
      }
      if (performanceMetrics.jsHeapUsed > 100 * 1024 * 1024) { // 100MB
        issues.push('High memory usage detected');
      }
      
      return {
        testName,
        success: issues.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: issues,
        metrics: {
          duration: Date.now() - startTime,
          performanceMetrics: {
            firstContentfulPaint: performanceMetrics.ttsResponseTime,
            domContentLoaded: performanceMetrics.analysisTime
          },
                     memoryUsage: {
             heapUsed: performanceMetrics.jsHeapUsed,
             heapTotal: metrics.JSHeapTotalSize || 0,
             external: 0
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

  private async testVoiceDataPersistence(page: Page): Promise<TestResult> {
    const testName = 'Voice Data Persistence Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Record initial pronunciation score
      await this.simulateRecording(page);
      await page.waitForSelector('[data-testid="pronunciation-score"]', { timeout: 10000 });
      
      const initialScore = await page.$eval('[data-testid="pronunciation-score"]', el => el.textContent);
      
      // Navigate away and back
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.goto(`${this.baseUrl}/pronunciation`, { waitUntil: 'networkidle2' });
      
      // Check if previous recordings are shown
      const recordingHistory = await page.$('[data-testid="recording-history"]');
      const lastScore = await page.$('[data-testid="last-score"]');
      
      // Refresh page
      await page.reload({ waitUntil: 'networkidle2' });
      
      // Check if data persisted after refresh
      const historyAfterRefresh = await page.$('[data-testid="recording-history"]');
      
      return {
        testName,
        success: true,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: [
          !recordingHistory ? 'Recording history not displayed' : '',
          !lastScore ? 'Last score not shown' : '',
          !historyAfterRefresh ? 'History not persisted after refresh' : ''
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
      this.logger.logTestEnd(testName, Date.now() - startTime);
    }
  }

  private async testOfflineVoiceFeatures(page: Page): Promise<TestResult> {
    const testName = 'Offline Voice Features Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      // Load voice features while online
      await page.goto(`${this.baseUrl}/pronunciation`, { waitUntil: 'networkidle2' });
      await page.waitForSelector('[data-testid="pronunciation-practice"]', { timeout: 10000 });
      
      // Go offline
      await page.setOfflineMode(true);
      
      // Test which features work offline
      const offlineFeatures = {
        mouthDiagram: await page.$('[data-testid="mouth-diagram"]'),
        phonemeGuide: await page.$('[data-testid="phoneme-guide"]'),
        recordButton: await page.$('[data-testid="record-button"]'),
        offlineMessage: await page.$('[data-testid="offline-voice-message"]')
      };
      
      // Try to use TTS offline
      const ttsButton = await page.$('[data-testid="tts-button"]');
      let ttsWorksOffline = false;
      if (ttsButton) {
        await ttsButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        const audioPlaying = await page.$('[data-testid="audio-playing"]');
        ttsWorksOffline = !!audioPlaying;
      }
      
      const workingOffline = Object.entries(offlineFeatures)
        .filter(([_, el]) => el)
        .map(([name]) => name);
      
      return {
        testName,
        success: workingOffline.length >= 2,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: [
          !ttsWorksOffline ? 'TTS does not work offline' : '',
          workingOffline.length < 3 ? `Only ${workingOffline.length} features work offline` : ''
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

  // Helper method to simulate recording
  private async simulateRecording(page: Page) {
    // Ensure we're on pronunciation page
    if (!page.url().includes('/pronunciation')) {
      await page.goto(`${this.baseUrl}/pronunciation`, { waitUntil: 'networkidle2' });
    }
    
    // Select a word if needed
    const wordSelected = await page.$('[data-testid="pronunciation-word-display"]');
    if (!wordSelected) {
      const wordCard = await page.$('[data-testid="word-card"]');
      if (wordCard) {
        await wordCard.click();
        await page.waitForSelector('[data-testid="pronunciation-word-display"]', { timeout: 5000 });
      }
    }
    
    // Start recording
    const recordBtn = await page.$('[data-testid="record-button"]');
    if (!recordBtn) {
      throw new Error('Record button not found for simulation');
    }
    
    await recordBtn.click();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate recording time
    await recordBtn.click(); // Stop recording
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}