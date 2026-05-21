const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ErrorDetection {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  logError(message, fix = null) {
    this.errors.push(message);
    if (fix) this.fixes.push(fix);
    console.log(`❌ ERROR: ${message}`);
  }

  logWarning(message) {
    this.warnings.push(message);
    console.log(`⚠️  WARNING: ${message}`);
  }

  logSuccess(message) {
    console.log(`✅ ${message}`);
  }

  // Check for audioService import issues
  checkAudioServiceImports() {
    console.log('\n🔍 Checking audioService imports...');
    
    const filesToCheck = [
      'app/components/shared/PronunciationText.tsx',
      'app/components/shared/VocabularyDisplay.tsx',
      'app/components/voice/PronunciationPractice.tsx',
      'app/components/ExerciseModal.tsx'
    ];

    filesToCheck.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for import statements
        const importMatch = content.match(/import.*audioService.*from.*['"]([^'"]+)['"]/);
        if (importMatch) {
          const importPath = importMatch[1];
          
          // Check if the import path is correct
          if (importPath.includes('@/lib/services/AudioService')) {
            // Check if the target file exists
            const targetPath = path.join('lib/services/AudioService.ts');
            if (!fs.existsSync(targetPath)) {
              this.logError(
                `Import target not found: ${targetPath} (imported in ${filePath})`,
                `Create or fix the AudioService.ts file at ${targetPath}`
              );
            } else {
              // Check if audioService is exported
              const audioServiceContent = fs.readFileSync(targetPath, 'utf8');
              if (!audioServiceContent.includes('export default audioService')) {
                this.logError(
                  `audioService not exported as default in ${targetPath}`,
                  `Add 'export default audioService' at the end of ${targetPath}`
                );
              } else {
                this.logSuccess(`audioService import in ${filePath} is correct`);
              }
            }
          } else {
            this.logWarning(`Non-standard import path in ${filePath}: ${importPath}`);
          }
        } else {
          this.logWarning(`No audioService import found in ${filePath}`);
        }
      } else {
        this.logError(`File not found: ${filePath}`);
      }
    });
  }

  // Check for build configuration issues
  checkBuildConfig() {
    console.log('\n🔍 Checking build configuration...');
    
    // Check tsconfig.json
    if (fs.existsSync('tsconfig.json')) {
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      
      if (!tsconfig.compilerOptions?.paths?.['@/*']) {
        this.logError(
          'Missing @/* path alias in tsconfig.json',
          'Add "paths": { "@/*": ["./*"] } to compilerOptions in tsconfig.json'
        );
      } else {
        this.logSuccess('Path aliases configured correctly');
      }
    } else {
      this.logError('tsconfig.json not found');
    }

    // Check next.config.js
    if (fs.existsSync('next.config.js')) {
      const nextConfig = fs.readFileSync('next.config.js', 'utf8');
      
      if (nextConfig.includes('swcMinify')) {
        this.logWarning('swcMinify option is deprecated in Next.js 15');
      }
    }
  }

  // Check for missing dependencies
  checkDependencies() {
    console.log('\n🔍 Checking dependencies...');
    
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const requiredDeps = [
        'next',
        'react',
        'react-dom',
        'framer-motion',
        'react-icons'
      ];
      
      requiredDeps.forEach(dep => {
        if (!dependencies[dep]) {
          this.logError(`Missing dependency: ${dep}`, `Run: npm install ${dep}`);
        } else {
          this.logSuccess(`Dependency ${dep} is installed`);
        }
      });
    }
  }

  // Check for file structure issues
  checkFileStructure() {
    console.log('\n🔍 Checking file structure...');
    
    const requiredFiles = [
      'app/layout.tsx',
      'app/page.tsx',
      'lib/services/AudioService.ts',
      'lib/auth.tsx',
      'app/components/Navigation.tsx'
    ];
    
    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        this.logError(`Required file missing: ${file}`);
      } else {
        this.logSuccess(`File exists: ${file}`);
      }
    });
  }

  // Check for syntax errors in TypeScript files
  checkTypeScriptErrors() {
    console.log('\n🔍 Checking TypeScript syntax...');
    
    try {
      // Run TypeScript compiler check
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.logSuccess('No TypeScript errors found');
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString();
      if (output) {
        this.logError(`TypeScript compilation errors:\n${output}`);
      }
    }
  }

  // Check for runtime errors in the browser
  async checkRuntimeErrors() {
    console.log('\n🔍 Checking for runtime errors...');
    
    try {
      // Check if the dev server is running
      const response = await fetch('http://localhost:3004');
      if (response.ok) {
        this.logSuccess('Development server is running');
      } else {
        this.logError('Development server returned error status');
      }
    } catch (error) {
      this.logError('Development server is not running', 'Start the dev server with: npm run dev');
    }
  }

  // Check for accessibility issues
  checkAccessibility() {
    console.log('\n🔍 Checking accessibility...');
    
    const filesToCheck = [
      'app/layout.tsx',
      'app/components/Navigation.tsx'
    ];
    
    filesToCheck.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for skip link
        if (!content.includes('href="#main-content"')) {
          this.logWarning(`Skip link not found in ${filePath}`);
        } else {
          this.logSuccess(`Skip link found in ${filePath}`);
        }
        
        // Check for proper heading structure
        if (!content.includes('<h1') && !content.includes('<h2')) {
          this.logWarning(`No headings found in ${filePath}`);
        }
      }
    });
  }

  // Check for mobile responsiveness
  checkMobileResponsiveness() {
    console.log('\n🔍 Checking mobile responsiveness...');
    
    const filesToCheck = [
      'app/components/Navigation.tsx',
      'app/styles/globals.css'
    ];
    
    filesToCheck.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for mobile breakpoints
        if (!content.includes('md:hidden') && !content.includes('sm:') && !content.includes('lg:')) {
          this.logWarning(`No mobile breakpoints found in ${filePath}`);
        } else {
          this.logSuccess(`Mobile breakpoints found in ${filePath}`);
        }
      }
    });
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n📊 ERROR DETECTION REPORT');
    console.log('==========================');
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`🔧 Suggested fixes: ${this.fixes.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ CRITICAL ERRORS:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
        if (this.fixes[index]) {
          console.log(`   Fix: ${this.fixes[index]}`);
        }
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        errors: this.errors.length,
        warnings: this.warnings.length,
        fixes: this.fixes.length
      },
      errors: this.errors,
      warnings: this.warnings,
      fixes: this.fixes
    };
    
    fs.writeFileSync(
      'error-detection-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Detailed report saved to error-detection-report.json');
    
    // Overall assessment
    if (this.errors.length === 0) {
      console.log('\n🎉 No critical errors found! The application should work correctly.');
    } else {
      console.log('\n🚨 Critical errors found. Please fix them before proceeding.');
    }
  }

  async runAllChecks() {
    console.log('🔍 Starting comprehensive error detection...\n');
    
    this.checkAudioServiceImports();
    this.checkBuildConfig();
    this.checkDependencies();
    this.checkFileStructure();
    this.checkTypeScriptErrors();
    this.checkAccessibility();
    this.checkMobileResponsiveness();
    
    this.generateReport();
  }
}

// Run error detection
const errorDetection = new ErrorDetection();
errorDetection.runAllChecks().catch(console.error); 