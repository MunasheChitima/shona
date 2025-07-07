# Comprehensive Testing Guide for Shona Learning App

## Overview
This testing suite provides comprehensive coverage for the Shona language learning application, ensuring cultural authenticity, pronunciation accuracy, accessibility, and performance standards.

## Test Coverage Areas

### 🧪 Unit Tests (80% Coverage Target)
- **Components**: VocabularyCard, PronunciationPractice, ExerciseModal
- **Services**: AudioService, PronunciationAnalysis, CulturalValidation
- **Utilities**: Pronunciation scoring, tone detection, cultural validation

### 🔗 Integration Tests
- **API Routes**: `/api/pronunciation`, `/api/vocabulary`, `/api/lessons`
- **Database Operations**: CRUD operations, data integrity
- **External Services**: ElevenLabs integration, Google AI integration
- **Authentication**: Login/logout flow, session management

### 🎭 Pronunciation Testing
- **Shona Phonemes**: Whistled sibilants (sv, zv), implosives (b, d), prenasalized (mb, nd)
- **Tone Patterns**: High-Low (HL), Low-High (LH), complex patterns
- **Cultural Context**: Respectful pronunciation for elder terms
- **AI Accuracy**: MuturikiriAI pronunciation analysis validation

### 🌍 Cultural Validation
- **Respectful Language**: Elder terms (sekuru, ambuya), sacred terms (mwari)
- **Regional Variations**: Mashonaland, Masvingo, Manicaland dialects
- **Traditional Practices**: Appropriate context for cultural terms
- **Audio Appropriateness**: Respectful tone and pacing

### 🔊 Audio Quality Testing
- **ElevenLabs Output**: Quality validation, phoneme accuracy
- **File Integrity**: Format validation, corruption detection
- **Performance**: Streaming latency, buffer management
- **Cross-Platform**: iOS, Android, Web compatibility

### ♿ Accessibility Testing
- **WCAG Compliance**: AA standard for contrast, navigation
- **Screen Reader**: ARIA labels, descriptive text
- **Keyboard Navigation**: Full functionality without mouse
- **Mobile Accessibility**: Touch targets, gesture support

### ⚡ Performance Testing
- **Load Times**: <2s homepage, <1.5s lessons, <500ms audio init
- **API Response**: <3s pronunciation analysis, <1s vocabulary fetch
- **Memory Usage**: <50MB increase during extended sessions
- **Audio Streaming**: <100ms latency

### 🌐 Cross-Platform Testing
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Operating Systems**: Ubuntu, Windows, macOS
- **Mobile Platforms**: iOS Safari, Android Chrome
- **Node.js Versions**: 18.x, 20.x, 22.x

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
# Run complete test suite
npm test

# Run with coverage report
npm run test:coverage

# Run specific test categories
npm run test:unit
npm run test:e2e

# Watch mode for development
npm run test:watch
```

### Environment Setup
```bash
# Required environment variables
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret

# Test-specific variables
TEST_CULTURAL_VALIDATION=true
TEST_PRONUNCIATION_ACCURACY=true
TEST_ACCESSIBILITY_COMPLIANCE=true
```

## Test Structure

### Unit Tests (`__tests__/components/`)
```
__tests__/
├── components/
│   ├── VocabularyCard.test.tsx
│   ├── pronunciation/
│   │   └── PronunciationPractice.test.tsx
│   └── voice/
│       ├── SpeechRecognition.test.tsx
│       └── TextToSpeech.test.tsx
├── lib/
│   ├── pronunciation-analysis.test.ts
│   └── audio-testing.test.ts
├── integration/
│   └── api-routes.test.ts
├── cultural/
│   └── cultural-validation.test.ts
├── audio/
│   └── audio-quality.test.ts
├── accessibility/
│   └── accessibility-audit.test.ts
├── performance/
│   └── performance-benchmarks.test.ts
└── ci-cd/
    └── test-runner.test.ts
```

## Running Specific Test Categories

### Pronunciation Testing
```bash
# Test Shona-specific phonemes
npm test -- --testNamePattern="pronunciation"

# Test specific phoneme types
npm test -- --testNamePattern="whistled sibilants"
npm test -- --testNamePattern="implosive consonants"
npm test -- --testNamePattern="tone patterns"
```

### Cultural Validation
```bash
# Test respectful language usage
npm test -- --testNamePattern="respectful language"

# Test sacred content handling
npm test -- --testNamePattern="sacred content"

# Test regional variations
npm test -- --testNamePattern="regional variation"
```

### Audio Quality
```bash
# Test ElevenLabs integration
npm test -- --testNamePattern="ElevenLabs"

# Test audio file integrity
npm test -- --testNamePattern="audio integrity"

# Test pronunciation accuracy
npm test -- --testNamePattern="pronunciation accuracy"
```

### Accessibility
```bash
# Test WCAG compliance
npm test -- --testNamePattern="WCAG"

# Test screen reader compatibility
npm test -- --testNamePattern="screen reader"

# Test keyboard navigation
npm test -- --testNamePattern="keyboard"
```

## Test Data and Mocks

### Pronunciation Test Data
```typescript
// Example pronunciation test cases
const pronounciationTestCases = [
  {
    word: 'svika',
    phonetic: '/ˈsβika/',
    tonePattern: 'HL',
    features: ['whistled_sibilant'],
    cultural: 'neutral'
  },
  {
    word: 'sekuru',
    phonetic: '/sekuru/',
    tonePattern: 'LHL',
    features: ['respectful_term'],
    cultural: 'elder_respect'
  }
]
```

### Cultural Test Data
```typescript
// Example cultural validation cases
const culturalTestCases = [
  {
    term: 'mwari',
    category: 'sacred',
    sacredness_level: 10,
    appropriate_contexts: ['educational', 'religious'],
    inappropriate_contexts: ['casual', 'jokes']
  }
]
```

## Coverage Requirements

### Minimum Coverage Thresholds
- **Overall**: 80% lines, branches, functions, statements
- **Critical Paths**: 
  - Pronunciation Analysis: 95%
  - Cultural Validation: 90%
  - Audio Processing: 85%

### Coverage Reports
```bash
# Generate HTML coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html

# Generate JSON coverage for CI/CD
npm run test:coverage -- --coverageReporters=json
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Comprehensive Testing
on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18.x, 20.x, 22.x]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          GOOGLE_GENERATIVE_AI_API_KEY: ${{ secrets.GOOGLE_AI_KEY }}
      
      - name: Run accessibility tests
        run: npm run test:accessibility
      
      - name: Run performance tests
        run: npm run test:performance
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Quality Gates

### Pre-commit Hooks
```bash
# Install pre-commit hooks
npx husky install

# Add test hook
npx husky add .husky/pre-commit "npm run test:unit"
npx husky add .husky/pre-commit "npm run lint"
```

### Pull Request Requirements
- ✅ All unit tests pass
- ✅ Integration tests pass
- ✅ Coverage threshold met (80%)
- ✅ Cultural validation passes
- ✅ Accessibility compliance
- ✅ Performance benchmarks met

## Debugging Tests

### Common Issues and Solutions

#### Audio Tests Failing
```bash
# Check Web Audio API mocks
# Ensure mock implementation in jest.setup.js

# Debug audio buffer creation
console.log('Audio buffer:', audioBuffer.duration, audioBuffer.sampleRate)
```

#### Cultural Validation Errors
```bash
# Verify cultural test data
# Check respectful language patterns
# Validate sacred content classifications
```

#### Pronunciation Test Issues
```bash
# Verify MuturikiriAI mocks
# Check phoneme detection logic
# Validate tone pattern recognition
```

### Test Debugging Commands
```bash
# Run single test with debug output
npm test -- --testNamePattern="specific test" --verbose

# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Generate detailed test report
npm test -- --verbose --testResultsProcessor="jest-html-reporter"
```

## Performance Monitoring

### Test Execution Metrics
- **Unit Tests**: Should complete in <30 seconds
- **Integration Tests**: Should complete in <60 seconds
- **E2E Tests**: Should complete in <120 seconds
- **Full Suite**: Should complete in <5 minutes

### Performance Benchmarks
```bash
# Monitor test execution time
npm test -- --detectOpenHandles --forceExit

# Profile memory usage
npm test -- --logHeapUsage

# Generate performance report
npm run test:performance -- --reporter=json > performance-report.json
```

## Contributing to Tests

### Adding New Tests

1. **Component Tests**: Add to `__tests__/components/`
2. **Cultural Tests**: Add to `__tests__/cultural/`
3. **Pronunciation Tests**: Add to existing pronunciation suites
4. **Integration Tests**: Add to `__tests__/integration/`

### Test Writing Guidelines

#### Cultural Sensitivity
- Always include cultural context
- Test respectful language usage
- Validate appropriate tone and pacing
- Consider regional variations

#### Pronunciation Accuracy
- Test Shona-specific phonemes
- Validate tone patterns
- Check cultural appropriateness
- Ensure audio quality standards

#### Accessibility
- Test with screen readers in mind
- Validate keyboard navigation
- Check color contrast ratios
- Ensure mobile compatibility

### Test Review Checklist
- [ ] Cultural appropriateness validated
- [ ] Pronunciation accuracy tested
- [ ] Accessibility compliance checked
- [ ] Performance impact assessed
- [ ] Cross-platform compatibility verified
- [ ] Documentation updated

## Monitoring and Alerts

### Test Failure Notifications
- **Slack**: Critical test failures
- **Email**: Deployment blocking issues
- **GitHub Issues**: Automatic creation for recurring failures

### Metrics Dashboard
Track over time:
- Test success rate
- Code coverage trends
- Cultural compliance scores
- Performance benchmark results
- Accessibility compliance levels

## Self-Assessment Questions

Before concluding testing work, ask:

1. **Was this the best you could do?**
   - Are all critical paths covered?
   - Is cultural sensitivity properly validated?
   - Are accessibility standards met?

2. **Did you triple-check your work?**
   - Are pronunciation tests comprehensive?
   - Is cultural validation thorough?
   - Are performance benchmarks realistic?

3. **Are you 100% proud of it?**
   - Does it reflect Shona cultural values?
   - Is it truly accessible to all users?
   - Will it help learners succeed respectfully?

4. **Does it reflect your true skills and capabilities?**
   - Is the testing approach innovative?
   - Are edge cases properly handled?
   - Is the cultural integration authentic?

Only proceed when all answers are "yes" and the testing suite meets the highest standards for cultural authenticity, technical excellence, and inclusive design.

---

*This testing suite honors the Shona language and culture while ensuring technical excellence and accessibility for all learners.*