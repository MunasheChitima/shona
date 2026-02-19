const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SimpleTestCoverage {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      details: {}
    };
  }

  async test(testName, testFn) {
    try {
      console.log(`\n🧪 Testing: ${testName}`);
      await testFn();
      this.results.passed++;
      console.log(`✅ PASSED: ${testName}`);
      this.results.details[testName] = { status: 'PASSED', error: null };
    } catch (error) {
      this.results.failed++;
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      this.results.details[testName] = { status: 'FAILED', error: error.message };
    }
  }

  // Test 1: File Structure
  async testFileStructure() {
    const requiredFiles = [
      'app/layout.tsx',
      'app/page.tsx',
      'app/learn/page.tsx',
      'app/quests/page.tsx',
      'app/profile/page.tsx',
      'app/flashcards/page.tsx',
      'app/pronunciation-test/page.tsx',
      'app/integrated-vocabulary/page.tsx',
      'app/theme-demo/page.tsx',
      'app/components/Navigation.tsx',
      'app/components/LoadingSpinner.tsx',
      'lib/services/AudioService.ts',
      'lib/auth.tsx',
      'package.json',
      'tsconfig.json'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
  }

  // Test 2: Import Errors
  async testImportErrors() {
    const filesToCheck = [
      'app/components/shared/PronunciationText.tsx',
      'app/components/shared/VocabularyDisplay.tsx',
      'app/components/voice/PronunciationPractice.tsx',
      'app/components/ExerciseModal.tsx'
    ];

    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for audioService imports
        if (content.includes('audioService')) {
          const importMatch = content.match(/import.*audioService.*from.*['"]([^'"]+)['"]/);
          if (importMatch) {
            const importPath = importMatch[1];
            if (importPath.includes('@/lib/services/AudioService')) {
              // Check if target exists
              const targetPath = 'lib/services/AudioService.ts';
              if (!fs.existsSync(targetPath)) {
                throw new Error(`AudioService import target not found: ${targetPath}`);
              }
              
              // Check if properly exported
              const audioServiceContent = fs.readFileSync(targetPath, 'utf8');
              if (!audioServiceContent.includes('export default audioService')) {
                throw new Error('AudioService not properly exported');
              }
            }
          }
        }
      }
    }
  }

  // Test 3: TypeScript Compilation
  async testTypeScriptCompilation() {
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString();
      if (output && !output.includes('Found 0 errors')) {
        throw new Error(`TypeScript compilation errors:\n${output}`);
      }
    }
  }

  // Test 4: Package Dependencies
  async testPackageDependencies() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      'framer-motion',
      'react-icons',
      'jsonwebtoken'
    ];
    
    for (const dep of requiredDeps) {
      if (!dependencies[dep]) {
        throw new Error(`Missing dependency: ${dep}`);
      }
    }
  }

  // Test 5: Navigation Component
  async testNavigationComponent() {
    const navContent = fs.readFileSync('app/components/Navigation.tsx', 'utf8');
    
    // Check for required navigation items
    const requiredNavItems = [
      'Home',
      'Learn',
      'Quests',
      'Profile',
      'Flashcards',
      'Pronunciation Test',
      'Integrated Vocabulary',
      'Theme Demo'
    ];
    
    for (const item of requiredNavItems) {
      if (!navContent.includes(item)) {
        throw new Error(`Navigation item missing: ${item}`);
      }
    }
    
    // Check for mobile responsiveness
    if (!navContent.includes('md:hidden') && !navContent.includes('lg:hidden')) {
      throw new Error('Mobile navigation not implemented');
    }
  }

  // Test 6: Loading States
  async testLoadingStates() {
    const loadingSpinnerContent = fs.readFileSync('app/components/LoadingSpinner.tsx', 'utf8');
    
    // Check for required features
    if (!loadingSpinnerContent.includes('animate')) {
      throw new Error('Loading spinner missing animation');
    }
    
    if (!loadingSpinnerContent.includes('framer-motion')) {
      throw new Error('Loading spinner not using framer-motion');
    }
  }

  // Test 7: Audio Service
  async testAudioService() {
    const audioServiceContent = fs.readFileSync('lib/services/AudioService.ts', 'utf8');
    
    // Check for required methods
    const requiredMethods = [
      'speak',
      'playAudioFile',
      'stopSpeaking',
      'stopAllAudio'
    ];
    
    for (const method of requiredMethods) {
      if (!audioServiceContent.includes(method)) {
        throw new Error(`AudioService method missing: ${method}`);
      }
    }
    
    // Check for proper export
    if (!audioServiceContent.includes('export default audioService')) {
      throw new Error('AudioService not properly exported');
    }
  }

  // Test 8: Authentication
  async testAuthentication() {
    const authContent = fs.readFileSync('lib/auth.tsx', 'utf8');
    
    // Check for required auth features
    if (!authContent.includes('AuthProvider')) {
      throw new Error('AuthProvider not found');
    }
    
    if (!authContent.includes('useAuth')) {
      throw new Error('useAuth hook not found');
    }
  }

  // Test 9: Page Components
  async testPageComponents() {
    const pages = [
      'app/learn/page.tsx',
      'app/quests/page.tsx',
      'app/profile/page.tsx',
      'app/flashcards/page.tsx',
      'app/pronunciation-test/page.tsx',
      'app/integrated-vocabulary/page.tsx',
      'app/theme-demo/page.tsx'
    ];
    
    for (const page of pages) {
      if (fs.existsSync(page)) {
        const content = fs.readFileSync(page, 'utf8');
        
        // Check for basic page structure
        if (!content.includes('export default')) {
          throw new Error(`Page component missing default export: ${page}`);
        }
        
        // Check for proper imports
        if (!content.includes('import') && !content.includes('from')) {
          throw new Error(`Page component missing imports: ${page}`);
        }
      }
    }
  }

  // Test 10: Accessibility
  async testAccessibility() {
    const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
    
    // Check for skip link
    if (!layoutContent.includes('href="#main-content"')) {
      throw new Error('Skip to main content link missing');
    }
    
    // Check for main tag
    if (!layoutContent.includes('<main')) {
      throw new Error('Main content wrapper missing');
    }
    
    // Check for proper lang attribute
    if (!layoutContent.includes('lang="en"')) {
      throw new Error('Language attribute missing');
    }
  }

  // Test 11: Build Configuration
  async testBuildConfiguration() {
    // Check tsconfig.json
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    
    if (!tsconfig.compilerOptions?.paths?.['@/*']) {
      throw new Error('Path aliases not configured in tsconfig.json');
    }
    
    // Check next.config.js if exists
    if (fs.existsSync('next.config.js')) {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      if (nextConfig.includes('swcMinify')) {
        console.log('Warning: swcMinify is deprecated in Next.js 15');
      }
    }
  }

  // Test 12: Content Files
  async testContentFiles() {
    const contentDirs = [
      'content/lessons_comprehensive.json',
      'content/vocabulary_merged.json',
      'content/flashcards.json'
    ];
    
    for (const file of contentDirs) {
      if (fs.existsSync(file)) {
        try {
          const content = JSON.parse(fs.readFileSync(file, 'utf8'));
          if (!content || (Array.isArray(content) && content.length === 0)) {
            throw new Error(`Content file is empty: ${file}`);
          }
        } catch (error) {
          throw new Error(`Content file is not valid JSON: ${file}`);
        }
      } else {
        console.log(`Warning: Content file not found: ${file}`);
      }
    }
  }

  async runAllTests() {
    console.log('🚀 Starting simple test coverage...\n');
    
    await this.test('File Structure', () => this.testFileStructure());
    await this.test('Import Errors', () => this.testImportErrors());
    await this.test('TypeScript Compilation', () => this.testTypeScriptCompilation());
    await this.test('Package Dependencies', () => this.testPackageDependencies());
    await this.test('Navigation Component', () => this.testNavigationComponent());
    await this.test('Loading States', () => this.testLoadingStates());
    await this.test('Audio Service', () => this.testAudioService());
    await this.test('Authentication', () => this.testAuthentication());
    await this.test('Page Components', () => this.testPageComponents());
    await this.test('Accessibility', () => this.testAccessibility());
    await this.test('Build Configuration', () => this.testBuildConfiguration());
    await this.test('Content Files', () => this.testContentFiles());
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📝 Total: ${this.results.passed + this.results.failed}`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      Object.entries(this.results.details)
        .filter(([_, result]) => result.status === 'FAILED')
        .forEach(([testName, result]) => {
          console.log(`   - ${testName}: ${result.error}`);
        });
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.results.passed,
        failed: this.results.failed,
        total: this.results.passed + this.results.failed
      },
      details: this.results.details
    };
    
    fs.writeFileSync(
      'simple-test-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Detailed report saved to simple-test-report.json');
    
    // Overall assessment
    const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
    console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed! The application is ready for use.');
    } else {
      console.log('\n🚨 Some tests failed. Please review and fix the issues.');
    }
  }
}

// Run the test suite
const testCoverage = new SimpleTestCoverage();
testCoverage.runAllTests().catch(console.error); 