const fetch = require('node-fetch');

class APIEndpointTester {
  constructor() {
    this.baseUrl = 'http://localhost:3004/api';
    this.token = null;
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      tests: []
    };
  }

  async runTest(testName, testFunction) {
    try {
      console.log(`🧪 Running API Test: ${testName}`);
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      console.log(`✅ PASSED: ${testName}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
      console.log(`❌ FAILED: ${testName} - ${error.message}`);
    }
  }

  async testRegistration() {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'API Test User',
        email: 'apitest@example.com',
        password: 'password123'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Registration failed: ${error}`);
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error('No token returned from registration');
    }

    this.token = data.token;
  }

  async testLogin() {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'apitest@example.com',
        password: 'password123'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Login failed: ${error}`);
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error('No token returned from login');
    }

    this.token = data.token;
  }

  async testLessonsEndpoint() {
    const response = await fetch(`${this.baseUrl}/lessons`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Lessons endpoint failed: ${error}`);
    }

    const data = await response.json();
    if (!data.lessons || !Array.isArray(data.lessons)) {
      throw new Error('Lessons endpoint did not return lessons array');
    }

    if (data.lessons.length === 0) {
      throw new Error('No lessons returned from API');
    }

    // Check lesson structure
    const lesson = data.lessons[0];
    const requiredFields = ['id', 'title', 'category', 'difficulty'];
    for (const field of requiredFields) {
      if (!lesson[field]) {
        throw new Error(`Lesson missing required field: ${field}`);
      }
    }
  }

  async testVocabularyEndpoint() {
    const response = await fetch(`${this.baseUrl}/vocabulary`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vocabulary endpoint failed: ${error}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Vocabulary endpoint did not return array');
    }

    if (data.length > 0) {
      const vocabItem = data[0];
      const requiredFields = ['shona', 'english', 'pronunciation'];
      for (const field of requiredFields) {
        if (!vocabItem[field]) {
          throw new Error(`Vocabulary item missing required field: ${field}`);
        }
      }
    }
  }

  async testProgressEndpoint() {
    // Test GET progress
    const getResponse = await fetch(`${this.baseUrl}/progress`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!getResponse.ok) {
      const error = await getResponse.text();
      throw new Error(`GET progress endpoint failed: ${error}`);
    }

    const progressData = await getResponse.json();
    if (!Array.isArray(progressData)) {
      throw new Error('Progress endpoint did not return array');
    }

    // Test POST progress
    const postResponse = await fetch(`${this.baseUrl}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({
        lessonId: 'test-lesson-1',
        score: 85
      })
    });

    if (!postResponse.ok) {
      const error = await postResponse.text();
      throw new Error(`POST progress endpoint failed: ${error}`);
    }
  }

  async testExercisesEndpoint() {
    const response = await fetch(`${this.baseUrl}/exercises/test-lesson-1`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Exercises endpoint failed: ${error}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Exercises endpoint did not return array');
    }

    if (data.length > 0) {
      const exercise = data[0];
      const requiredFields = ['id', 'question', 'correctAnswer'];
      for (const field of requiredFields) {
        if (!exercise[field]) {
          throw new Error(`Exercise missing required field: ${field}`);
        }
      }
    }
  }

  async testAuthenticationErrors() {
    // Test without token
    const response = await fetch(`${this.baseUrl}/lessons`);
    if (response.status !== 401) {
      throw new Error('Protected endpoint should return 401 without token');
    }

    // Test with invalid token
    const invalidResponse = await fetch(`${this.baseUrl}/lessons`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    if (invalidResponse.status !== 401) {
      throw new Error('Protected endpoint should return 401 with invalid token');
    }
  }

  async testErrorHandling() {
    // Test non-existent endpoint
    const response = await fetch(`${this.baseUrl}/nonexistent`);
    if (response.status !== 404) {
      throw new Error('Non-existent endpoint should return 404');
    }

    // Test invalid JSON
    const invalidJsonResponse = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid json'
    });
    if (invalidJsonResponse.status !== 400) {
      throw new Error('Invalid JSON should return 400');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting API Endpoint Test Suite...\n');
    
    await this.runTest('User Registration', () => this.testRegistration());
    await this.runTest('User Login', () => this.testLogin());
    await this.runTest('Lessons Endpoint', () => this.testLessonsEndpoint());
    await this.runTest('Vocabulary Endpoint', () => this.testVocabularyEndpoint());
    await this.runTest('Progress Endpoint', () => this.testProgressEndpoint());
    await this.runTest('Exercises Endpoint', () => this.testExercisesEndpoint());
    await this.runTest('Authentication Errors', () => this.testAuthenticationErrors());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    
    this.generateReport();
  }

  generateReport() {
    const report = {
      summary: {
        total: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(2)
      },
      tests: this.results.tests,
      errors: this.results.errors,
      timestamp: new Date().toISOString()
    };

    console.log('\n📊 API TEST RESULTS SUMMARY');
    console.log('============================');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS DETECTED:');
      this.results.errors.forEach(error => console.log(`- ${error}`));
    }
    
    console.log('\n📋 DETAILED RESULTS:');
    this.results.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`${status} ${test.name}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
    });

    // Save report to file
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, 'api-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 API test report saved to: ${reportPath}`);
  }
}

// Run the API test suite
const apiTester = new APIEndpointTester();
apiTester.runAllTests().catch(console.error); 