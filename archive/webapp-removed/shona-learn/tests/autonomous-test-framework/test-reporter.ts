import fs from 'fs';
import path from 'path';
import { TestResult, TestReport } from './types';
import { ForensicLogger } from './forensic-logger';

export class TestReporter {
  private logger: ForensicLogger;

  constructor(logger: ForensicLogger) {
    this.logger = logger;
  }

  public async generateFullReport(
    testResults: Map<string, TestResult[]>,
    assessment: {
      isPerfect: boolean;
      score: number;
      issues: string[];
      recommendations: string[];
    }
  ): Promise<string> {
    const report: TestReport = this.compileReport(testResults, assessment);
    
    // Generate multiple report formats
    const htmlReport = await this.generateHTMLReport(report);
    const markdownReport = this.generateMarkdownReport(report);
    const jsonReport = JSON.stringify(report, null, 2);
    
    // Save reports
    const reportDir = path.join(this.logger.getOutputDir(), 'reports');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    fs.writeFileSync(path.join(reportDir, `report-${timestamp}.html`), htmlReport);
    fs.writeFileSync(path.join(reportDir, `report-${timestamp}.md`), markdownReport);
    fs.writeFileSync(path.join(reportDir, `report-${timestamp}.json`), jsonReport);
    
    this.logger.logInfo('Reports generated', {
      html: `report-${timestamp}.html`,
      markdown: `report-${timestamp}.md`,
      json: `report-${timestamp}.json`
    });
    
    return markdownReport;
  }

  private compileReport(
    testResults: Map<string, TestResult[]>,
    assessment: any
  ): TestReport {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let criticalFailures = 0;
    
    const testSuites: TestReport['testSuites'] = {};
    
    // Compile test suite results
    for (const [suiteName, results] of testResults) {
      const suiteStats = {
        total: results.length,
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
      };
      
      testSuites[suiteName] = suiteStats;
      totalTests += suiteStats.total;
      passedTests += suiteStats.passed;
      failedTests += suiteStats.failed;
    }
    
    // Calculate performance metrics
    const allMetrics = Array.from(testResults.values())
      .flat()
      .filter(r => r.metrics)
      .map(r => r.metrics!);
    
    const performanceMetrics = this.calculatePerformanceStats(allMetrics);
    
    return {
      timestamp: Date.now(),
      duration: 0, // Will be set by orchestrator
      totalTests,
      passedTests,
      failedTests,
      skippedTests: 0,
      criticalFailures,
      testSuites,
      performanceMetrics,
      securityIssues: [],
      accessibilityIssues: [],
      recommendations: assessment.recommendations,
      selfAssessment: {
        isPerfect: assessment.isPerfect,
        score: assessment.score,
        issues: assessment.issues,
        improvements: assessment.recommendations
      }
    };
  }

  private calculatePerformanceStats(metrics: any[]) {
    if (metrics.length === 0) {
      return {
        average: {} as any,
        worst: {} as any,
        best: {} as any
      };
    }
    
    // Calculate averages
    const average = {
      duration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
      performanceMetrics: this.averagePerformanceMetrics(metrics)
    };
    
    // Find worst and best
    const sorted = metrics.sort((a, b) => b.duration - a.duration);
    
    return {
      average,
      worst: sorted[0],
      best: sorted[sorted.length - 1]
    };
  }

  private averagePerformanceMetrics(metrics: any[]) {
    const validMetrics = metrics.filter(m => m.performanceMetrics);
    if (validMetrics.length === 0) return {};
    
    const sum = validMetrics.reduce((acc, m) => {
      const perf = m.performanceMetrics;
      return {
        firstContentfulPaint: (acc.firstContentfulPaint || 0) + (perf.firstContentfulPaint || 0),
        domContentLoaded: (acc.domContentLoaded || 0) + (perf.domContentLoaded || 0),
        loadComplete: (acc.loadComplete || 0) + (perf.loadComplete || 0)
      };
    }, {});
    
    return {
      firstContentfulPaint: sum.firstContentfulPaint / validMetrics.length,
      domContentLoaded: sum.domContentLoaded / validMetrics.length,
      loadComplete: sum.loadComplete / validMetrics.length
    };
  }

  private generateMarkdownReport(report: TestReport): string {
    const passRate = ((report.passedTests / report.totalTests) * 100).toFixed(2);
    const timestamp = new Date(report.timestamp).toISOString();
    
    let markdown = `# Autonomous Test Report

## Summary
- **Generated**: ${timestamp}
- **Total Tests**: ${report.totalTests}
- **Passed**: ${report.passedTests} (${passRate}%)
- **Failed**: ${report.failedTests}
- **Critical Failures**: ${report.criticalFailures}

## Self Assessment
- **Perfect Execution**: ${report.selfAssessment.isPerfect ? '✅ YES' : '❌ NO'}
- **Score**: ${report.selfAssessment.score.toFixed(2)}%
- **Confidence Level**: ${this.getConfidenceLevel(report.selfAssessment.score)}

### Issues Identified
${report.selfAssessment.issues.length > 0 
  ? report.selfAssessment.issues.map(i => `- ${i}`).join('\n')
  : '- No issues identified'}

### Recommendations
${report.recommendations.length > 0
  ? report.recommendations.map(r => `- ${r}`).join('\n')
  : '- No recommendations'}

## Test Suite Results

`;

    // Add test suite details
    for (const [suiteName, suite] of Object.entries(report.testSuites)) {
      const suitePassRate = ((suite.passed / suite.total) * 100).toFixed(2);
      
      markdown += `### ${suiteName}
- Total: ${suite.total}
- Passed: ${suite.passed} (${suitePassRate}%)
- Failed: ${suite.failed}

`;

      if (suite.failed > 0) {
        markdown += `#### Failed Tests:\n`;
        suite.results
          .filter(r => !r.success)
          .forEach(r => {
            markdown += `- **${r.testName}**\n  - Error: ${r.error}\n  - Duration: ${r.duration}ms\n`;
          });
        markdown += '\n';
      }
    }

    // Add performance metrics
    if (report.performanceMetrics.average.duration) {
      markdown += `## Performance Metrics

### Average Performance
- **Duration**: ${report.performanceMetrics.average.duration.toFixed(2)}ms
- **First Contentful Paint**: ${report.performanceMetrics.average.performanceMetrics?.firstContentfulPaint?.toFixed(2) || 'N/A'}ms
- **DOM Content Loaded**: ${report.performanceMetrics.average.performanceMetrics?.domContentLoaded?.toFixed(2) || 'N/A'}ms

### Worst Performance
- **Duration**: ${report.performanceMetrics.worst.duration.toFixed(2)}ms

### Best Performance
- **Duration**: ${report.performanceMetrics.best.duration.toFixed(2)}ms

`;
    }

    return markdown;
  }

  private async generateHTMLReport(report: TestReport): Promise<string> {
    const passRate = ((report.passedTests / report.totalTests) * 100).toFixed(2);
    const timestamp = new Date(report.timestamp).toISOString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${timestamp}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        h1 {
            color: #2c3e50;
            margin: 0 0 20px 0;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-align: center;
        }
        .metric h3 {
            margin: 0 0 10px 0;
            color: #7f8c8d;
            font-size: 14px;
            text-transform: uppercase;
        }
        .metric .value {
            font-size: 36px;
            font-weight: bold;
            color: #2c3e50;
        }
        .metric.passed .value { color: #27ae60; }
        .metric.failed .value { color: #e74c3c; }
        .section {
            background: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .test-suite {
            margin-bottom: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .test-failed {
            background: #fee;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid #e74c3c;
        }
        .test-passed {
            background: #efe;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid #27ae60;
        }
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #ecf0f1;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(to right, #27ae60, #2ecc71);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 0.3s ease;
        }
        .recommendation {
            background: #f0f8ff;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            border-left: 4px solid #3498db;
        }
        .self-assessment {
            background: ${report.selfAssessment.isPerfect ? '#d4edda' : '#f8d7da'};
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Autonomous Test Report</h1>
        <p>Generated: ${timestamp}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div class="value">${report.totalTests}</div>
        </div>
        <div class="metric passed">
            <h3>Passed</h3>
            <div class="value">${report.passedTests}</div>
        </div>
        <div class="metric failed">
            <h3>Failed</h3>
            <div class="value">${report.failedTests}</div>
        </div>
        <div class="metric">
            <h3>Pass Rate</h3>
            <div class="value">${passRate}%</div>
        </div>
    </div>

    <div class="progress-bar">
        <div class="progress-fill" style="width: ${passRate}%">${passRate}%</div>
    </div>

    <div class="section">
        <h2>Self Assessment</h2>
        <div class="self-assessment">
            <h3>${report.selfAssessment.isPerfect ? '✅ Perfect Execution' : '⚠️ Improvements Needed'}</h3>
            <p><strong>Score:</strong> ${report.selfAssessment.score.toFixed(2)}%</p>
            <p><strong>Confidence Level:</strong> ${this.getConfidenceLevel(report.selfAssessment.score)}</p>
        </div>
        
        ${report.selfAssessment.issues.length > 0 ? `
        <h3>Issues Identified</h3>
        <ul>
            ${report.selfAssessment.issues.map(i => `<li>${i}</li>`).join('')}
        </ul>
        ` : ''}
        
        ${report.recommendations.length > 0 ? `
        <h3>Recommendations</h3>
        ${report.recommendations.map(r => `<div class="recommendation">${r}</div>`).join('')}
        ` : ''}
    </div>

    <div class="section">
        <h2>Test Suite Details</h2>
        ${Object.entries(report.testSuites).map(([name, suite]) => this.generateSuiteHTML(name, suite)).join('')}
    </div>

    <div class="section">
        <h2>Performance Metrics</h2>
        <div class="summary">
            <div class="metric">
                <h3>Avg Duration</h3>
                <div class="value">${report.performanceMetrics.average.duration?.toFixed(0) || 'N/A'}ms</div>
            </div>
            <div class="metric">
                <h3>Worst Duration</h3>
                <div class="value">${report.performanceMetrics.worst?.duration?.toFixed(0) || 'N/A'}ms</div>
            </div>
            <div class="metric">
                <h3>Best Duration</h3>
                <div class="value">${report.performanceMetrics.best?.duration?.toFixed(0) || 'N/A'}ms</div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  private generateSuiteHTML(name: string, suite: any): string {
    const suitePassRate = ((suite.passed / suite.total) * 100).toFixed(2);
    
    return `
    <div class="test-suite">
        <h3>${name}</h3>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${suitePassRate}%">
                ${suite.passed}/${suite.total} (${suitePassRate}%)
            </div>
        </div>
        ${suite.results
          .filter((r: any) => !r.success)
          .map((r: any) => `
            <div class="test-failed">
                <strong>${r.testName}</strong><br>
                Error: ${r.error}<br>
                Duration: ${r.duration}ms
            </div>
          `).join('')}
    </div>`;
  }

  private getConfidenceLevel(score: number): string {
    if (score >= 95) return '🌟 Exceptional';
    if (score >= 90) return '✨ Excellent';
    if (score >= 80) return '👍 Good';
    if (score >= 70) return '⚡ Acceptable';
    if (score >= 60) return '⚠️ Needs Improvement';
    return '❌ Critical Issues';
  }
}