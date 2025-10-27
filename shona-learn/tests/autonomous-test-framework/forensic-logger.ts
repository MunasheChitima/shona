import fs from 'fs';
import path from 'path';
import { TestMetrics } from './types';

export class ForensicLogger {
  private outputDir: string;
  private logLevel: 'debug' | 'info' | 'warn' | 'error';
  private currentLogFile: string;
  private networkLogFile: string;
  private performanceLogFile: string;
  private errorLogFile: string;
  private sessionId: string;
  private startTime: number;
  private logBuffer: string[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor(outputDir: string, logLevel: 'debug' | 'info' | 'warn' | 'error' = 'debug') {
    this.outputDir = outputDir;
    this.logLevel = logLevel;
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();

    // Create output directory structure
    this.createOutputStructure();

    // Initialize log files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentLogFile = path.join(this.outputDir, `session-${this.sessionId}`, `full-log-${timestamp}.log`);
    this.networkLogFile = path.join(this.outputDir, `session-${this.sessionId}`, `network-log-${timestamp}.log`);
    this.performanceLogFile = path.join(this.outputDir, `session-${this.sessionId}`, `performance-log-${timestamp}.log`);
    this.errorLogFile = path.join(this.outputDir, `session-${this.sessionId}`, `error-log-${timestamp}.log`);

    // Initialize log files with headers
    this.initializeLogFiles();

    // Set up periodic flush
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private createOutputStructure() {
    const dirs = [
      this.outputDir,
      path.join(this.outputDir, `session-${this.sessionId}`),
      path.join(this.outputDir, `session-${this.sessionId}`, 'screenshots'),
      path.join(this.outputDir, `session-${this.sessionId}`, 'videos'),
      path.join(this.outputDir, `session-${this.sessionId}`, 'har'),
      path.join(this.outputDir, `session-${this.sessionId}`, 'traces'),
      path.join(this.outputDir, `session-${this.sessionId}`, 'memory-dumps'),
      path.join(this.outputDir, `session-${this.sessionId}`, 'reports')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private initializeLogFiles() {
    const header = `
===================================================================
FORENSIC TEST LOG - SESSION ${this.sessionId}
Started: ${new Date(this.startTime).toISOString()}
Log Level: ${this.logLevel}
===================================================================
`;

    fs.writeFileSync(this.currentLogFile, header);
    fs.writeFileSync(this.networkLogFile, header);
    fs.writeFileSync(this.performanceLogFile, header);
    fs.writeFileSync(this.errorLogFile, header);
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatLogEntry(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;
    let entry = `[${timestamp}] [${elapsed}ms] [${level.toUpperCase()}] ${message}`;
    
    if (data) {
      entry += '\n' + JSON.stringify(data, null, 2);
    }
    
    return entry + '\n';
  }

  private writeToFile(file: string, content: string) {
    this.logBuffer.push(`${file}|||${content}`);
    
    // If buffer is large, flush immediately
    if (this.logBuffer.length > 100) {
      this.flush();
    }
  }

  private flush() {
    if (this.logBuffer.length === 0) return;

    const grouped = new Map<string, string[]>();
    
    this.logBuffer.forEach(entry => {
      const [file, content] = entry.split('|||');
      if (!grouped.has(file)) {
        grouped.set(file, []);
      }
      grouped.get(file)!.push(content);
    });

    grouped.forEach((contents, file) => {
      fs.appendFileSync(file, contents.join(''));
    });

    this.logBuffer = [];
  }

  public logDebug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      const entry = this.formatLogEntry('DEBUG', message, data);
      this.writeToFile(this.currentLogFile, entry);
    }
  }

  public logInfo(message: string, data?: any) {
    if (this.shouldLog('info')) {
      const entry = this.formatLogEntry('INFO', message, data);
      this.writeToFile(this.currentLogFile, entry);
    }
  }

  public logWarn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      const entry = this.formatLogEntry('WARN', message, data);
      this.writeToFile(this.currentLogFile, entry);
    }
  }

  public logError(message: string, data?: any) {
    if (this.shouldLog('error')) {
      const entry = this.formatLogEntry('ERROR', message, data);
      this.writeToFile(this.currentLogFile, entry);
      this.writeToFile(this.errorLogFile, entry);
    }
  }

  public logCritical(message: string, data?: any) {
    const entry = this.formatLogEntry('CRITICAL', message, data);
    this.writeToFile(this.currentLogFile, entry);
    this.writeToFile(this.errorLogFile, entry);
    
    // Critical errors are flushed immediately
    this.flush();
  }

  public logTestStart(testName: string) {
    const separator = '='.repeat(70);
    const entry = `\n${separator}\nTEST START: ${testName}\n${separator}\n`;
    this.writeToFile(this.currentLogFile, entry);
  }

  public logTestEnd(testName: string, duration: number) {
    const separator = '='.repeat(70);
    const entry = `\n${separator}\nTEST END: ${testName} (Duration: ${duration}ms)\n${separator}\n`;
    this.writeToFile(this.currentLogFile, entry);
  }

  public logSection(sectionName: string) {
    const separator = '-'.repeat(50);
    const entry = `\n${separator}\n${sectionName}\n${separator}\n`;
    this.writeToFile(this.currentLogFile, entry);
  }

  public logNetworkRequest(method: string, url: string, data?: any) {
    const entry = this.formatLogEntry('REQUEST', `${method} ${url}`, data);
    this.writeToFile(this.networkLogFile, entry);
  }

  public logNetworkResponse(url: string, status: number, data?: any) {
    const entry = this.formatLogEntry('RESPONSE', `${status} ${url}`, data);
    this.writeToFile(this.networkLogFile, entry);
  }

  public logNetworkError(url: string, error: string) {
    const entry = this.formatLogEntry('NET_ERROR', `${url}: ${error}`);
    this.writeToFile(this.networkLogFile, entry);
    this.writeToFile(this.errorLogFile, entry);
  }

  public logPerformanceMetrics(pageName: string, metrics: TestMetrics) {
    const entry = this.formatLogEntry('PERF', pageName, metrics);
    this.writeToFile(this.performanceLogFile, entry);
  }

  public logBrowserConsole(type: string, message: string) {
    const entry = this.formatLogEntry(`CONSOLE_${type.toUpperCase()}`, message);
    this.writeToFile(this.currentLogFile, entry);
  }

  public logBrowserError(error: string) {
    const entry = this.formatLogEntry('BROWSER_ERROR', error);
    this.writeToFile(this.currentLogFile, entry);
    this.writeToFile(this.errorLogFile, entry);
  }

  public logScreenshot(testName: string, screenshotPath: string, reason: string) {
    const entry = this.formatLogEntry('SCREENSHOT', `${testName}: ${reason}`, { path: screenshotPath });
    this.writeToFile(this.currentLogFile, entry);
  }

  public logMemorySnapshot(testName: string, heapUsed: number, heapTotal: number) {
    const entry = this.formatLogEntry('MEMORY', testName, {
      heapUsed: `${(heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(heapTotal / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${((heapUsed / heapTotal) * 100).toFixed(2)}%`
    });
    this.writeToFile(this.performanceLogFile, entry);
  }

  public async saveHAR(har: any, testName: string) {
    const harFile = path.join(
      this.outputDir, 
      `session-${this.sessionId}`, 
      'har', 
      `${testName}-${Date.now()}.har`
    );
    fs.writeFileSync(harFile, JSON.stringify(har, null, 2));
    this.logInfo(`HAR file saved: ${harFile}`);
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getOutputDir(): string {
    return path.join(this.outputDir, `session-${this.sessionId}`);
  }

  public close() {
    this.flush();
    clearInterval(this.flushInterval);
    
    const summary = `
===================================================================
SESSION ENDED: ${this.sessionId}
Duration: ${Date.now() - this.startTime}ms
Ended: ${new Date().toISOString()}
===================================================================
`;
    
    fs.appendFileSync(this.currentLogFile, summary);
  }
}