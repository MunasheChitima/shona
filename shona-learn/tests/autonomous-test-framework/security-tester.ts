import { Page } from 'puppeteer';
import { TestRunner, TestResult } from './types';
import { ForensicLogger } from './forensic-logger';

export class SecurityTester implements TestRunner {
  private logger: ForensicLogger;
  private baseUrl: string;

  constructor(logger: ForensicLogger, baseUrl: string) {
    this.logger = logger;
    this.baseUrl = baseUrl;
  }

  async runTests(page: Page): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    const securityTests = [
      this.testAuthenticationSecurity.bind(this),
      this.testSessionManagement.bind(this),
      this.testXSSPrevention.bind(this),
      this.testCSRFProtection.bind(this),
      this.testSQLInjectionPrevention.bind(this),
      this.testSecureHeaders.bind(this),
      this.testHTTPSEnforcement.bind(this),
      this.testPasswordSecurity.bind(this),
      this.testDataExposure.bind(this),
      this.testAccessControl.bind(this),
      this.testInputValidation.bind(this),
      this.testFileUploadSecurity.bind(this),
      this.testAPISecurityHeaders.bind(this),
      this.testRateLimiting.bind(this),
      this.testContentSecurityPolicy.bind(this)
    ];

    for (const test of securityTests) {
      try {
        const result = await test(page);
        results.push(result);
      } catch (error) {
        this.logger.logError(`Security test failed: ${error}`);
        results.push({
          testName: test.name,
          success: false,
          error: `Unexpected error: ${error}`,
          timestamp: Date.now(),
          duration: 0
        });
      }
    }

    return results;
  }

  private async testAuthenticationSecurity(page: Page): Promise<TestResult> {
    const testName = 'Authentication Security Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const vulnerabilities: string[] = [];
      
      // Test 1: Try to access protected routes without authentication
      const protectedRoutes = ['/learn', '/profile', '/quests'];
      
      for (const route of protectedRoutes) {
        await page.goto(`${this.baseUrl}${route}`, { waitUntil: 'networkidle2' });
        
        // Check if redirected to login
        if (!page.url().includes('/login')) {
          vulnerabilities.push(`Protected route ${route} accessible without authentication`);
        }
      }
      
      // Test 2: Test login with invalid credentials
      await page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
      
      // Test SQL injection attempts
      const sqlInjectionPayloads = [
        "' OR '1'='1",
        "admin'--",
        "' OR 1=1--",
        "'; DROP TABLE users;--"
      ];
      
      for (const payload of sqlInjectionPayloads) {
        await page.type('input[name="email"]', payload);
        await page.type('input[name="password"]', payload);
        await page.click('button[type="submit"]');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if login succeeded (which would be bad)
        if (page.url().includes('/learn')) {
          vulnerabilities.push(`SQL injection vulnerability detected with payload: ${payload}`);
          await page.goto(`${this.baseUrl}/logout`);
        }
        
        // Clear inputs
        await page.evaluate(() => {
          const inputs = document.querySelectorAll('input');
          inputs.forEach(input => (input as HTMLInputElement).value = '');
        });
      }
      
      // Test 3: Check for information disclosure in error messages
      await page.type('input[name="email"]', 'nonexistent@example.com');
      await page.type('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check error message
      const errorMessage = await page.$eval('[data-testid="error-message"], .error, .alert-danger', 
        el => el.textContent
      ).catch(() => null);
      
      if (errorMessage && (errorMessage.includes('user not found') || errorMessage.includes('email does not exist'))) {
        vulnerabilities.push('Username enumeration possible through error messages');
      }
      
      // Test 4: Check password field security
      const passwordField = await page.$('input[name="password"]');
      if (passwordField) {
        const type = await passwordField.evaluate(el => el.getAttribute('type'));
        if (type !== 'password') {
          vulnerabilities.push('Password field not properly masked');
        }
        
        const autocomplete = await passwordField.evaluate(el => el.getAttribute('autocomplete'));
        if (!autocomplete || autocomplete === 'on') {
          vulnerabilities.push('Password field allows autocomplete');
        }
      }
      
      return {
        testName,
        success: vulnerabilities.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: vulnerabilities
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
    const testName = 'Session Management Security Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const vulnerabilities: string[] = [];
      
      // Login first
      await this.performLogin(page);
      
      // Test 1: Check session cookie security
      const cookies = await page.cookies();
      const sessionCookies = cookies.filter(c => 
        c.name.includes('session') || 
        c.name.includes('auth') || 
        c.name.includes('token')
      );
      
      sessionCookies.forEach(cookie => {
        if (!cookie.httpOnly) {
          vulnerabilities.push(`Session cookie '${cookie.name}' missing HttpOnly flag`);
        }
        if (!cookie.secure && this.baseUrl.includes('https')) {
          vulnerabilities.push(`Session cookie '${cookie.name}' missing Secure flag`);
        }
        if (!cookie.sameSite || cookie.sameSite === 'None') {
          vulnerabilities.push(`Session cookie '${cookie.name}' missing proper SameSite attribute`);
        }
      });
      
      // Test 2: Session fixation
      const oldSessionId = sessionCookies[0]?.value;
      
      // Logout and login again
      await page.goto(`${this.baseUrl}/logout`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.performLogin(page);
      
      const newCookies = await page.cookies();
      const newSessionCookie = newCookies.find(c => c.name === sessionCookies[0]?.name);
      
      if (oldSessionId === newSessionCookie?.value) {
        vulnerabilities.push('Session ID not regenerated after login (session fixation vulnerability)');
      }
      
      // Test 3: Concurrent session handling
      const browser = page.browserContext().browser();
      if (browser) {
        const page2 = await browser.newPage();
        
        // Try to use the same session cookie
        await page2.setCookie(...sessionCookies);
        await page2.goto(`${this.baseUrl}/profile`, { waitUntil: 'networkidle2' });
        
        // Check if both sessions are valid
        const isValidSession1 = !page.url().includes('/login');
        const isValidSession2 = !page2.url().includes('/login');
        
        if (!isValidSession1 || !isValidSession2) {
          this.logger.logInfo('Concurrent session limitation detected (good security practice)');
        }
        
        await page2.close();
      }
      
      // Test 4: Session timeout
      // This would require waiting for actual timeout, so we'll check if there's a mechanism
      const hasSessionTimeout = await page.evaluate(() => {
        // Check for any session timeout handling in JavaScript
        return window.localStorage.getItem('sessionTimeout') || 
               window.sessionStorage.getItem('sessionTimeout') ||
               document.cookie.includes('expires') ||
               document.cookie.includes('max-age');
      });
      
      if (!hasSessionTimeout) {
        vulnerabilities.push('No apparent session timeout mechanism');
      }
      
      return {
        testName,
        success: vulnerabilities.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: vulnerabilities
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

  private async testXSSPrevention(page: Page): Promise<TestResult> {
    const testName = 'XSS Prevention Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const vulnerabilities: string[] = [];
      
      // XSS test payloads
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')">',
        '"><script>alert("XSS")</script>',
        '<script>document.cookie</script>',
        '<body onload=alert("XSS")>'
      ];
      
      // Test 1: Input fields
      await this.performLogin(page);
      await page.goto(`${this.baseUrl}/profile`, { waitUntil: 'networkidle2' });
      
      const inputFields = await page.$$('input[type="text"], textarea');
      
      for (const field of inputFields) {
        const fieldName = await field.evaluate(el => el.getAttribute('name') || 'unknown');
        
        for (const payload of xssPayloads.slice(0, 3)) { // Test first 3 payloads
          await field.click({ clickCount: 3 });
          await field.type(payload);
          
          // Try to save/submit
          const submitButton = await page.$('button[type="submit"], button[data-testid="save"]');
          if (submitButton) {
            await submitButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // Check if XSS executed
          const xssExecuted = await page.evaluate(() => {
            // Check for injected scripts
            const scripts = document.querySelectorAll('script');
            return Array.from(scripts).some(script => 
              script.innerHTML.includes('alert') || 
              script.getAttribute('src')?.includes('alert')
            );
          });
          
          if (xssExecuted) {
            vulnerabilities.push(`XSS vulnerability in field '${fieldName}' with payload: ${payload}`);
          }
          
          // Check if payload is displayed unescaped
          const pageContent = await page.content();
          if (pageContent.includes(payload) && !pageContent.includes(this.escapeHtml(payload))) {
            vulnerabilities.push(`Unescaped output in field '${fieldName}'`);
          }
        }
      }
      
      // Test 2: URL parameters
      for (const payload of xssPayloads.slice(0, 2)) {
        const encodedPayload = encodeURIComponent(payload);
        await page.goto(`${this.baseUrl}/learn?search=${encodedPayload}`, { waitUntil: 'networkidle2' });
        
        const pageContent = await page.content();
        if (pageContent.includes(payload) && !pageContent.includes(this.escapeHtml(payload))) {
          vulnerabilities.push(`XSS vulnerability in URL parameter with payload: ${payload}`);
        }
      }
      
      // Test 3: Check Content-Type headers for API responses
      const responses: any[] = [];
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          responses.push({
            url: response.url(),
            headers: response.headers()
          });
        }
      });
      
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      
      responses.forEach(response => {
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
          vulnerabilities.push(`API endpoint ${response.url} missing proper Content-Type header`);
        }
      });
      
      return {
        testName,
        success: vulnerabilities.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: vulnerabilities
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

  private async testCSRFProtection(page: Page): Promise<TestResult> {
    const testName = 'CSRF Protection Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const vulnerabilities: string[] = [];
      
      await this.performLogin(page);
      
      // Monitor network requests for CSRF tokens
      const requests: any[] = [];
      page.on('request', request => {
        if (request.method() === 'POST' || request.method() === 'PUT' || request.method() === 'DELETE') {
          requests.push({
            url: request.url(),
            method: request.method(),
            headers: request.headers(),
            postData: request.postData()
          });
        }
      });
      
      // Perform actions that should require CSRF protection
      await page.goto(`${this.baseUrl}/profile`, { waitUntil: 'networkidle2' });
      
      // Try to update profile
      const nameInput = await page.$('input[name="name"]');
      if (nameInput) {
        await nameInput.click({ clickCount: 3 });
        await nameInput.type('CSRF Test User');
        
        const saveButton = await page.$('button[type="submit"]');
        if (saveButton) {
          await saveButton.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Analyze requests for CSRF protection
      requests.forEach(request => {
        const hasCSRFToken = 
          request.headers['x-csrf-token'] ||
          request.headers['x-xsrf-token'] ||
          (request.postData && request.postData.includes('csrf')) ||
          (request.postData && request.postData.includes('_token'));
        
        if (!hasCSRFToken && request.url.includes('/api/')) {
          vulnerabilities.push(`No CSRF token found for ${request.method} ${request.url}`);
        }
      });
      
      // Test cross-origin requests
      const browser = page.browserContext().browser();
      if (browser) {
        const attackerPage = await browser.newPage();
        
        // Create a malicious page that tries to make requests
        await attackerPage.setContent(`
          <html>
            <body>
              <form id="csrfForm" action="${this.baseUrl}/api/profile" method="POST">
                <input name="name" value="Hacked">
              </form>
              <script>
                // Try to submit form cross-origin
                try {
                  document.getElementById('csrfForm').submit();
                } catch (e) {
                  console.log('CSRF attempt blocked:', e);
                }
                
                // Try fetch
                fetch('${this.baseUrl}/api/profile', {
                  method: 'POST',
                  credentials: 'include',
                  body: JSON.stringify({ name: 'Hacked' })
                }).catch(e => console.log('Fetch blocked:', e));
              </script>
            </body>
          </html>
        `);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if the attack succeeded
        await page.reload({ waitUntil: 'networkidle2' });
        const profileName = await page.$eval('input[name="name"]', el => (el as HTMLInputElement).value);
        
        if (profileName === 'Hacked') {
          vulnerabilities.push('CSRF attack succeeded - critical vulnerability');
        }
        
        await attackerPage.close();
      }
      
      return {
        testName,
        success: vulnerabilities.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: vulnerabilities
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

  private async testSQLInjectionPrevention(page: Page): Promise<TestResult> {
    const testName = 'SQL Injection Prevention Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const vulnerabilities: string[] = [];
      
      // SQL injection payloads
      const sqlPayloads = [
        "' OR '1'='1",
        "1' OR '1' = '1",
        "' OR 1=1--",
        "admin'--",
        "1'; DROP TABLE users--",
        "' UNION SELECT * FROM users--",
        "1' AND 1=0 UNION SELECT null, table_name FROM information_schema.tables--"
      ];
      
      // Test 1: Login form
      for (const payload of sqlPayloads) {
        await page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
        
        await page.type('input[name="email"]', payload);
        await page.type('input[name="password"]', payload);
        await page.click('button[type="submit"]');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for SQL errors in response
        const pageContent = await page.content();
        const sqlErrorPatterns = [
          /SQL syntax/i,
          /mysql_/i,
          /mysqli/i,
          /ORA-\d+/,
          /PostgreSQL/i,
          /SQLite/i,
          /syntax error/i,
          /database error/i
        ];
        
        sqlErrorPatterns.forEach(pattern => {
          if (pattern.test(pageContent)) {
            vulnerabilities.push(`SQL error exposed with payload: ${payload}`);
          }
        });
        
        // Check if login succeeded
        if (page.url().includes('/learn')) {
          vulnerabilities.push(`SQL injection successful with payload: ${payload}`);
          await page.goto(`${this.baseUrl}/logout`);
        }
      }
      
      // Test 2: Search functionality
      await this.performLogin(page);
      
      // Find search inputs
      const searchInputs = await page.$$('input[type="search"], input[placeholder*="search" i]');
      
      for (const input of searchInputs) {
        for (const payload of sqlPayloads.slice(0, 3)) {
          await input.click({ clickCount: 3 });
          await input.type(payload);
          await page.keyboard.press('Enter');
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const content = await page.content();
          const hasError = /error|exception|warning/i.test(content);
          
          if (hasError && /sql|database|query/i.test(content)) {
            vulnerabilities.push(`Potential SQL injection in search with payload: ${payload}`);
          }
        }
      }
      
      // Test 3: API endpoints
      const apiEndpoints = ['/api/lessons', '/api/profile', '/api/progress'];
      
      for (const endpoint of apiEndpoints) {
        for (const payload of sqlPayloads.slice(0, 2)) {
          const response = await page.evaluate(async (url, payload) => {
            try {
              const res = await fetch(url + '?id=' + payload, {
                credentials: 'include'
              });
              return {
                status: res.status,
                text: await res.text()
              };
            } catch (e) {
              return { error: e instanceof Error ? e.message : String(e) };
            }
          }, this.baseUrl + endpoint, payload);
          
          if (response.text && /sql|database|syntax error/i.test(response.text)) {
            vulnerabilities.push(`SQL error in API ${endpoint} with payload: ${payload}`);
          }
        }
      }
      
      return {
        testName,
        success: vulnerabilities.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: vulnerabilities
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

  private async testSecureHeaders(page: Page): Promise<TestResult> {
    const testName = 'Secure Headers Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const missingHeaders: string[] = [];
      
      // Navigate to main page
      const response = await page.goto(`${this.baseUrl}`, { waitUntil: 'networkidle2' });
      
      if (response) {
        const headers = response.headers();
        
        // Check security headers
        const securityHeaders = {
          'strict-transport-security': 'HSTS header',
          'x-content-type-options': 'X-Content-Type-Options header',
          'x-frame-options': 'X-Frame-Options header',
          'x-xss-protection': 'X-XSS-Protection header',
          'content-security-policy': 'Content-Security-Policy header',
          'referrer-policy': 'Referrer-Policy header',
          'permissions-policy': 'Permissions-Policy header'
        };
        
        Object.entries(securityHeaders).forEach(([header, name]) => {
          if (!headers[header]) {
            missingHeaders.push(`Missing ${name}`);
          } else {
            // Validate header values
            switch (header) {
              case 'x-frame-options':
                if (!['DENY', 'SAMEORIGIN'].includes(headers[header].toUpperCase())) {
                  missingHeaders.push(`Weak ${name}: ${headers[header]}`);
                }
                break;
              case 'x-content-type-options':
                if (headers[header] !== 'nosniff') {
                  missingHeaders.push(`Invalid ${name}: ${headers[header]}`);
                }
                break;
              case 'strict-transport-security':
                if (!headers[header].includes('max-age=')) {
                  missingHeaders.push(`Invalid ${name}: missing max-age`);
                }
                break;
            }
          }
        });
        
        // Check for information disclosure headers
        const disclosureHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
        disclosureHeaders.forEach(header => {
          if (headers[header]) {
            missingHeaders.push(`Information disclosure: ${header}: ${headers[header]}`);
          }
        });
      }
      
      // Test API endpoints
      await this.performLogin(page);
      
      const apiResponse = await page.evaluate(async (url) => {
        const res = await fetch(url + '/api/profile', {
          credentials: 'include'
        });
        return {
          headers: Object.fromEntries(res.headers.entries())
        };
      }, this.baseUrl);
      
      if (!apiResponse.headers['content-type']?.includes('application/json')) {
        missingHeaders.push('API responses missing proper Content-Type');
      }
      
      return {
        testName,
        success: missingHeaders.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: missingHeaders
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

  private async testHTTPSEnforcement(page: Page): Promise<TestResult> {
    const testName = 'HTTPS Enforcement Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const issues: string[] = [];
      
      // Check if base URL is HTTPS
      if (!this.baseUrl.startsWith('https://')) {
        issues.push('Application not using HTTPS');
        
        // If not HTTPS, skip remaining tests
        return {
          testName,
          success: false,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          warnings: issues
        };
      }
      
      // Test HTTP to HTTPS redirect
      const httpUrl = this.baseUrl.replace('https://', 'http://');
      const response = await page.goto(httpUrl, { 
        waitUntil: 'networkidle2',
        timeout: 10000 
      }).catch(() => null);
      
      if (response) {
        const finalUrl = page.url();
        if (!finalUrl.startsWith('https://')) {
          issues.push('No automatic redirect from HTTP to HTTPS');
        }
        
        // Check for HSTS header
        const headers = response.headers();
        if (!headers['strict-transport-security']) {
          issues.push('Missing HSTS header for HTTPS enforcement');
        }
      }
      
      // Check for mixed content
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      const mixedContent = await page.evaluate(() => {
        const insecureElements: string[] = [];
        
        // Check images
        document.querySelectorAll('img').forEach(img => {
          if (img.src.startsWith('http://')) {
            insecureElements.push(`Insecure image: ${img.src}`);
          }
        });
        
        // Check scripts
        document.querySelectorAll('script').forEach(script => {
          if (script.src && script.src.startsWith('http://')) {
            insecureElements.push(`Insecure script: ${script.src}`);
          }
        });
        
        // Check stylesheets
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
          const linkElement = link as HTMLLinkElement;
          if (linkElement.href.startsWith('http://')) {
            insecureElements.push(`Insecure stylesheet: ${linkElement.href}`);
          }
        });
        
        // Check iframes
        document.querySelectorAll('iframe').forEach(iframe => {
          if (iframe.src.startsWith('http://')) {
            insecureElements.push(`Insecure iframe: ${iframe.src}`);
          }
        });
        
        return insecureElements;
      });
      
      if (mixedContent.length > 0) {
        mixedContent.forEach(issue => issues.push(issue));
      }
      
      // Check WebSocket connections
      const hasInsecureWebSocket = await page.evaluate(() => {
        // Check if any WebSocket connections use ws:// instead of wss://
        return window.location.protocol === 'https:' && 
               typeof WebSocket !== 'undefined';
      });
      
      if (hasInsecureWebSocket) {
        this.logger.logInfo('WebSocket support detected - ensure using wss:// for secure connections');
      }
      
      return {
        testName,
        success: issues.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: issues
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

  private async testPasswordSecurity(page: Page): Promise<TestResult> {
    const testName = 'Password Security Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const issues: string[] = [];
      
      // Navigate to registration page
      await page.goto(`${this.baseUrl}/register`, { waitUntil: 'networkidle2' });
      
      // Test 1: Password requirements
      const weakPasswords = [
        '123456',
        'password',
        'abc123',
        'qwerty',
        '12345678',
        'a',
        '        '  // spaces
      ];
      
      for (const weakPassword of weakPasswords) {
        await page.type('input[name="email"]', `test${Date.now()}@example.com`);
        await page.type('input[name="password"]', weakPassword);
        
        const confirmPassword = await page.$('input[name="confirmPassword"]');
        if (confirmPassword) {
          await confirmPassword.type(weakPassword);
        }
        
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if registration succeeded with weak password
        if (page.url().includes('/learn') || page.url().includes('/onboarding')) {
          issues.push(`Weak password accepted: ${weakPassword}`);
          await page.goto(`${this.baseUrl}/logout`);
        }
        
        // Clear form
        await page.evaluate(() => {
          document.querySelectorAll('input').forEach(input => 
            (input as HTMLInputElement).value = ''
          );
        });
      }
      
      // Test 2: Password field security attributes
      const passwordFields = await page.$$('input[type="password"]');
      
      for (const field of passwordFields) {
        const attributes = await field.evaluate(el => ({
          autocomplete: el.getAttribute('autocomplete'),
          maxLength: el.getAttribute('maxlength'),
          pattern: el.getAttribute('pattern')
        }));
        
        if (!attributes.autocomplete || attributes.autocomplete === 'on') {
          issues.push('Password field allows autocomplete');
        }
        
        if (!attributes.maxLength || parseInt(attributes.maxLength) < 128) {
          issues.push('Password field has restrictive max length');
        }
      }
      
      // Test 3: Password visibility toggle
      const toggleButton = await page.$('[data-testid="password-toggle"], button[aria-label*="password"]');
      if (!toggleButton) {
        this.logger.logInfo('No password visibility toggle found');
      }
      
      // Test 4: Password strength indicator
      const strengthIndicator = await page.$('[data-testid="password-strength"], .password-strength');
      if (!strengthIndicator) {
        issues.push('No password strength indicator found');
      }
      
      // Test 5: Rate limiting on password attempts
      await page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
      
      let blockedAfterAttempts = false;
      for (let i = 0; i < 10; i++) {
        await page.type('input[name="email"]', 'test@example.com');
        await page.type('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check for rate limiting
        const errorMessage = await page.$eval(
          '[data-testid="error-message"], .error, .alert',
          el => el.textContent
        ).catch(() => null);
        
        if (errorMessage && (
          errorMessage.includes('too many attempts') ||
          errorMessage.includes('locked') ||
          errorMessage.includes('try again later')
        )) {
          blockedAfterAttempts = true;
          break;
        }
        
        // Clear inputs
        await page.evaluate(() => {
          document.querySelectorAll('input').forEach(input => 
            (input as HTMLInputElement).value = ''
          );
        });
      }
      
      if (!blockedAfterAttempts) {
        issues.push('No rate limiting on password attempts detected');
      }
      
      return {
        testName,
        success: issues.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: issues
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

  private async testDataExposure(page: Page): Promise<TestResult> {
    const testName = 'Data Exposure Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const exposures: string[] = [];
      
      await this.performLogin(page);
      
      // Test 1: Check localStorage and sessionStorage
      const storageData = await page.evaluate(() => {
        const data = {
          localStorage: {} as any,
          sessionStorage: {} as any
        };
        
        // Get all localStorage items
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            data.localStorage[key] = localStorage.getItem(key);
          }
        }
        
        // Get all sessionStorage items
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            data.sessionStorage[key] = sessionStorage.getItem(key);
          }
        }
        
        return data;
      });
      
      // Check for sensitive data in storage
      const sensitivePatterns = [
        /password/i,
        /token/i,
        /api[_-]?key/i,
        /secret/i,
        /credit[_-]?card/i,
        /ssn/i,
        /social[_-]?security/i
      ];
      
      Object.entries(storageData.localStorage).forEach(([key, value]) => {
        sensitivePatterns.forEach(pattern => {
          if (pattern.test(key) || pattern.test(String(value))) {
            exposures.push(`Sensitive data in localStorage: ${key}`);
          }
        });
      });
      
      Object.entries(storageData.sessionStorage).forEach(([key, value]) => {
        sensitivePatterns.forEach(pattern => {
          if (pattern.test(key) || pattern.test(String(value))) {
            exposures.push(`Sensitive data in sessionStorage: ${key}`);
          }
        });
      });
      
      // Test 2: Check API responses for data leakage
      const apiResponses: any[] = [];
      page.on('response', response => {
        if (response.url().includes('/api/')) {
          apiResponses.push(response);
        }
      });
      
      await page.goto(`${this.baseUrl}/profile`, { waitUntil: 'networkidle2' });
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      
      for (const response of apiResponses) {
        try {
          const json = await response.json();
          const responseStr = JSON.stringify(json);
          
          // Check for sensitive data that shouldn't be exposed
          if (responseStr.includes('password') && !responseStr.includes('password_hash')) {
            exposures.push(`Password field exposed in API: ${response.url()}`);
          }
          
          if (responseStr.includes('social_security') || responseStr.includes('ssn')) {
            exposures.push(`SSN exposed in API: ${response.url()}`);
          }
          
          // Check for internal fields
          const internalFields = ['_id', '__v', 'created_at', 'updated_at'];
          internalFields.forEach(field => {
            if (responseStr.includes(field)) {
              this.logger.logInfo(`Internal field '${field}' exposed in API response`);
            }
          });
        } catch (e) {
          // Not JSON response
        }
      }
      
      // Test 3: Check HTML comments for sensitive information
      const htmlContent = await page.content();
      const commentRegex = /<!--[\s\S]*?-->/g;
      const comments = htmlContent.match(commentRegex) || [];
      
      comments.forEach(comment => {
        sensitivePatterns.forEach(pattern => {
          if (pattern.test(comment)) {
            exposures.push('Sensitive data in HTML comment');
          }
        });
        
        if (comment.includes('TODO') || comment.includes('FIXME')) {
          this.logger.logInfo('Development comments found in production');
        }
      });
      
      // Test 4: Check for directory listing
      const commonPaths = ['/api/', '/uploads/', '/public/', '/assets/'];
      
      for (const path of commonPaths) {
        const response = await page.goto(`${this.baseUrl}${path}`, { 
          waitUntil: 'networkidle2' 
        }).catch(() => null);
        
        if (response && response.status() === 200) {
          const content = await page.content();
          if (content.includes('Index of') || content.includes('Directory listing')) {
            exposures.push(`Directory listing enabled at ${path}`);
          }
        }
      }
      
      return {
        testName,
        success: exposures.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: exposures
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

  private async testAccessControl(page: Page): Promise<TestResult> {
    const testName = 'Access Control Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const violations: string[] = [];
      
      // Test 1: Vertical privilege escalation
      // Try to access admin functions as regular user
      await this.performLogin(page);
      
      const adminPaths = [
        '/admin',
        '/admin/dashboard',
        '/api/admin/users',
        '/api/admin/settings',
        '/dashboard/admin'
      ];
      
      for (const path of adminPaths) {
        const response = await page.goto(`${this.baseUrl}${path}`, { 
          waitUntil: 'networkidle2' 
        }).catch(() => null);
        
        if (response && response.status() === 200) {
          violations.push(`Admin path accessible to regular user: ${path}`);
        }
      }
      
      // Test 2: Horizontal privilege escalation
      // Try to access other users' data
      const currentUser = await page.evaluate(async (baseUrl) => {
        try {
          const response = await fetch(`${baseUrl}/api/profile`, {
            credentials: 'include'
          });
          return await response.json();
        } catch (e) {
          return null;
        }
      }, this.baseUrl);
      
      if (currentUser && currentUser.id) {
        // Try to access other user's data
        const otherUserIds = [
          currentUser.id + 1,
          currentUser.id - 1,
          1,
          999999
        ];
        
        for (const userId of otherUserIds) {
          const response = await page.evaluate(async (baseUrl, id) => {
            try {
              const res = await fetch(`${baseUrl}/api/users/${id}`, {
                credentials: 'include'
              });
              return {
                status: res.status,
                data: res.status === 200 ? await res.json() : null
              };
            } catch (e) {
              return null;
            }
          }, this.baseUrl, userId);
          
          if (response && response.status === 200 && response.data) {
            violations.push(`Able to access other user's data: user ID ${userId}`);
          }
        }
      }
      
      // Test 3: Forced browsing
      const protectedResources = [
        '/api/lessons/premium',
        '/api/content/advanced',
        '/api/features/pro'
      ];
      
      for (const resource of protectedResources) {
        const response = await page.evaluate(async (url) => {
          try {
            const res = await fetch(url, {
              credentials: 'include'
            });
            return res.status;
          } catch (e) {
            return null;
          }
        }, this.baseUrl + resource);
        
        if (response === 200) {
          violations.push(`Protected resource accessible without proper authorization: ${resource}`);
        }
      }
      
      // Test 4: IDOR (Insecure Direct Object Reference)
      await page.goto(`${this.baseUrl}/learn`, { waitUntil: 'networkidle2' });
      
      // Monitor API calls for ID parameters
      const apiCalls: string[] = [];
      page.on('request', request => {
        if (request.url().includes('/api/') && request.url().match(/\/\d+/)) {
          apiCalls.push(request.url());
        }
      });
      
      // Trigger some actions
      const lessonCard = await page.$('[data-testid="lesson-card"]');
      if (lessonCard) {
        await lessonCard.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Try to manipulate IDs in API calls
      for (const apiCall of apiCalls) {
        const idMatch = apiCall.match(/\/(\d+)/);
        if (idMatch) {
          const originalId = idMatch[1];
          const manipulatedId = String(parseInt(originalId) + 1);
          const manipulatedUrl = apiCall.replace(`/${originalId}`, `/${manipulatedId}`);
          
          const response = await page.evaluate(async (url) => {
            try {
              const res = await fetch(url, {
                credentials: 'include'
              });
              return res.status;
            } catch (e) {
              return null;
            }
          }, manipulatedUrl);
          
          if (response === 200) {
            violations.push(`IDOR vulnerability: able to access ${manipulatedUrl}`);
          }
        }
      }
      
      return {
        testName,
        success: violations.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: violations
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

  private async testInputValidation(page: Page): Promise<TestResult> {
    const testName = 'Input Validation Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const issues: string[] = [];
      
      await this.performLogin(page);
      await page.goto(`${this.baseUrl}/profile`, { waitUntil: 'networkidle2' });
      
      // Test various malicious inputs
      const maliciousInputs = [
        // Long strings
        'A'.repeat(10000),
        // Special characters
        '!@#$%^&*()_+-=[]{}|;\':",./<>?',
        // Unicode
        '𝕋𝕙𝕚𝕤 𝕚𝕤 𝕦𝕟𝕚𝕔𝕠𝕕𝕖',
        // Null bytes
        'test\x00null',
        // Control characters
        'test\x08\x09\x0a\x0d',
        // Format string
        '%s%s%s%s%s',
        // Path traversal
        '../../../etc/passwd',
        // Command injection
        '; ls -la',
        '| whoami',
        '`id`',
        // LDAP injection
        '*)(uid=*',
        // XML injection
        '<?xml version="1.0"?><test>data</test>',
        // JSON injection
        '{"test": "data"}'
      ];
      
      const inputs = await page.$$('input[type="text"], input[type="email"], textarea');
      
      for (const input of inputs.slice(0, 3)) { // Test first 3 inputs
        const inputName = await input.evaluate(el => el.getAttribute('name') || 'unknown');
        
        for (const maliciousInput of maliciousInputs.slice(0, 5)) { // Test first 5 payloads
          await input.click({ clickCount: 3 });
          await input.type(maliciousInput);
          
          // Try to submit
          const submitButton = await page.$('button[type="submit"]');
          if (submitButton) {
            await submitButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check for errors
            const errorOccurred = await page.evaluate(() => {
              const errorElements = document.querySelectorAll('.error, .alert-danger, [role="alert"]');
              return errorElements.length > 0;
            });
            
            if (!errorOccurred) {
              // Check if the malicious input was accepted
              const currentValue = await input.evaluate(el => (el as unknown as HTMLInputElement).value);
              if (currentValue === maliciousInput) {
                issues.push(`Input '${inputName}' accepted potentially dangerous input: ${maliciousInput.substring(0, 50)}...`);
              }
            }
          }
        }
      }
      
      // Test file upload validation
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        // Test dangerous file extensions
        const dangerousFiles = [
          { name: 'test.exe', type: 'application/x-msdownload' },
          { name: 'test.php', type: 'application/x-php' },
          { name: 'test.jsp', type: 'text/html' },
          { name: '../../../test.txt', type: 'text/plain' }
        ];
        
        for (const file of dangerousFiles) {
          const accepted = await page.evaluate(async (fileName, fileType) => {
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (!input) return false;
            
            // Create a fake file
            const blob = new Blob(['test content'], { type: fileType });
            const fakeFile = new File([blob], fileName, { type: fileType });
            
            // Create a DataTransfer to simulate file selection
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(fakeFile);
            input.files = dataTransfer.files;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
            
            // Check if file was accepted
            return input.files && input.files.length > 0;
          }, file.name, file.type);
          
          if (accepted) {
            issues.push(`Dangerous file type accepted: ${file.name}`);
          }
        }
      }
      
      return {
        testName,
        success: issues.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: issues
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

  private async testFileUploadSecurity(page: Page): Promise<TestResult> {
    const testName = 'File Upload Security Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const vulnerabilities: string[] = [];
      
      await this.performLogin(page);
      
      // Find file upload inputs
      const fileInputs = await page.$$('input[type="file"]');
      
      if (fileInputs.length === 0) {
        this.logger.logInfo('No file upload functionality found');
        return {
          testName,
          success: true,
          timestamp: Date.now(),
          duration: Date.now() - startTime,
          warnings: []
        };
      }
      
      // Test each file input
      for (const fileInput of fileInputs) {
        // Check accept attribute
        const acceptAttr = await fileInput.evaluate(el => el.getAttribute('accept'));
        if (!acceptAttr) {
          vulnerabilities.push('File input missing accept attribute for type restriction');
        }
        
        // Test file size limits
        const maxSize = await fileInput.evaluate(el => el.getAttribute('data-max-size'));
        if (!maxSize) {
          vulnerabilities.push('No apparent file size limit');
        }
        
        // Test malicious filenames
        const maliciousFilenames = [
          '../../../etc/passwd',
          'test.php.jpg',
          'test.exe',
          'test%00.jpg',
          'test\x00.jpg',
          '../../test.txt',
          'test<script>.jpg'
        ];
        
        for (const filename of maliciousFilenames) {
          const uploaded = await page.evaluate(async (name) => {
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (!input) return false;
            
            try {
              const blob = new Blob(['malicious content'], { type: 'image/jpeg' });
              const file = new File([blob], name, { type: 'image/jpeg' });
              
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              input.files = dataTransfer.files;
              
              const event = new Event('change', { bubbles: true });
              input.dispatchEvent(event);
              
              return true;
            } catch (e) {
              return false;
            }
          }, filename);
          
          if (uploaded) {
            // Check if the malicious filename was rejected
            const errorShown = await page.evaluate(() => {
              const errors = document.querySelectorAll('.error, [role="alert"]');
              return errors.length > 0;
            });
            
            if (!errorShown) {
              vulnerabilities.push(`Malicious filename accepted: ${filename}`);
            }
          }
        }
      }
      
      // Test file content validation
      const maliciousContents = [
        { content: '<?php phpinfo(); ?>', type: 'image/jpeg', name: 'test.jpg' },
        { content: '<script>alert("XSS")</script>', type: 'image/png', name: 'test.png' },
        { content: '#!/bin/bash\nrm -rf /', type: 'text/plain', name: 'script.sh' }
      ];
      
      for (const malicious of maliciousContents) {
        const uploadResult = await page.evaluate(async ({ content, type, name }) => {
          const input = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (!input) return null;
          
          const blob = new Blob([content], { type });
          const file = new File([blob], name, { type });
          
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          input.files = dataTransfer.files;
          
          const event = new Event('change', { bubbles: true });
          input.dispatchEvent(event);
          
          // Wait for any validation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if file was accepted
          return {
            accepted: input.files && input.files.length > 0,
            errorShown: document.querySelectorAll('.error, [role="alert"]').length > 0
          };
        }, malicious);
        
        if (uploadResult && uploadResult.accepted && !uploadResult.errorShown) {
          vulnerabilities.push(`Malicious file content not validated: ${malicious.name}`);
        }
      }
      
      return {
        testName,
        success: vulnerabilities.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: vulnerabilities
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

  private async testAPISecurityHeaders(page: Page): Promise<TestResult> {
    const testName = 'API Security Headers Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const issues: string[] = [];
      
      await this.performLogin(page);
      
      // Test various API endpoints
      const apiEndpoints = [
        '/api/profile',
        '/api/lessons',
        '/api/progress',
        '/api/quests'
      ];
      
      for (const endpoint of apiEndpoints) {
        const response = await page.evaluate(async (url) => {
          try {
            const res = await fetch(url, {
              credentials: 'include'
            });
            
            const headers: any = {};
            res.headers.forEach((value, key) => {
              headers[key] = value;
            });
            
            return {
              status: res.status,
              headers
            };
          } catch (e) {
            return null;
          }
        }, this.baseUrl + endpoint);
        
        if (response) {
          // Check security headers
          if (!response.headers['content-type']?.includes('application/json')) {
            issues.push(`${endpoint}: Missing or incorrect Content-Type header`);
          }
          
          if (!response.headers['x-content-type-options']) {
            issues.push(`${endpoint}: Missing X-Content-Type-Options header`);
          }
          
          if (response.headers['x-powered-by']) {
            issues.push(`${endpoint}: X-Powered-By header exposes server information`);
          }
          
          // Check CORS headers
          if (response.headers['access-control-allow-origin'] === '*') {
            issues.push(`${endpoint}: Overly permissive CORS policy`);
          }
        }
      }
      
      // Test unauthorized API access
      await page.evaluate(() => {
        // Clear all cookies to simulate unauthorized access
        document.cookie.split(";").forEach(c => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      });
      
      for (const endpoint of apiEndpoints) {
        const response = await page.evaluate(async (url) => {
          try {
            const res = await fetch(url);
            return res.status;
          } catch (e) {
            return null;
          }
        }, this.baseUrl + endpoint);
        
        if (response === 200) {
          issues.push(`${endpoint}: Accessible without authentication`);
        }
      }
      
      return {
        testName,
        success: issues.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: issues
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

  private async testRateLimiting(page: Page): Promise<TestResult> {
    const testName = 'Rate Limiting Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const issues: string[] = [];
      
      // Test 1: Login endpoint rate limiting
      await page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
      
      let loginBlocked = false;
      const maxAttempts = 20;
      
      for (let i = 0; i < maxAttempts; i++) {
        const response = await page.evaluate(async (baseUrl) => {
          try {
            const res = await fetch(`${baseUrl}/api/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: 'test@example.com',
                password: 'wrongpassword'
              })
            });
            
            return {
              status: res.status,
              headers: Object.fromEntries(res.headers.entries())
            };
          } catch (e) {
            return null;
          }
        }, this.baseUrl);
        
        if (response && response.status === 429) {
          loginBlocked = true;
          this.logger.logInfo(`Login rate limited after ${i + 1} attempts`);
          
          // Check for Retry-After header
          if (!response.headers['retry-after']) {
            issues.push('Rate limit response missing Retry-After header');
          }
          break;
        }
      }
      
      if (!loginBlocked) {
        issues.push('No rate limiting on login endpoint');
      }
      
      // Test 2: API endpoint rate limiting
      await this.performLogin(page);
      
      const apiEndpoints = ['/api/lessons', '/api/profile'];
      
      for (const endpoint of apiEndpoints) {
        let apiBlocked = false;
        const requests = 100; // Higher limit for regular API
        
        const promises = [];
        for (let i = 0; i < requests; i++) {
          promises.push(
            page.evaluate(async (url) => {
              const res = await fetch(url, { credentials: 'include' });
              return res.status;
            }, this.baseUrl + endpoint)
          );
        }
        
        const results = await Promise.all(promises);
        const rateLimited = results.filter(status => status === 429);
        
        if (rateLimited.length > 0) {
          apiBlocked = true;
          this.logger.logInfo(`${endpoint} rate limited after ${requests - rateLimited.length} requests`);
        } else {
          issues.push(`No rate limiting on ${endpoint}`);
        }
      }
      
      // Test 3: Registration rate limiting
      let registrationBlocked = false;
      
      for (let i = 0; i < 10; i++) {
        const response = await page.evaluate(async (baseUrl, index) => {
          try {
            const res = await fetch(`${baseUrl}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: `test${Date.now()}${index}@example.com`,
                password: 'TestPassword123!',
                name: 'Test User'
              })
            });
            
            return res.status;
          } catch (e) {
            return null;
          }
        }, this.baseUrl, i);
        
        if (response === 429) {
          registrationBlocked = true;
          this.logger.logInfo(`Registration rate limited after ${i + 1} attempts`);
          break;
        }
      }
      
      if (!registrationBlocked) {
        issues.push('No rate limiting on registration endpoint');
      }
      
      return {
        testName,
        success: issues.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: issues
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

  private async testContentSecurityPolicy(page: Page): Promise<TestResult> {
    const testName = 'Content Security Policy Test';
    const startTime = Date.now();
    
    try {
      this.logger.logTestStart(testName);
      
      const issues: string[] = [];
      let csp: string | undefined;
      
      // Navigate to main page
      const response = await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      if (response) {
        const headers = response.headers();
        csp = headers['content-security-policy'] || headers['x-content-security-policy'];
        
        if (!csp) {
          issues.push('No Content Security Policy header found');
        } else {
          // Parse and validate CSP
          const directives = csp.split(';').map(d => d.trim());
          
          // Check for important directives
          const requiredDirectives = [
            'default-src',
            'script-src',
            'style-src',
            'img-src',
            'connect-src'
          ];
          
          requiredDirectives.forEach(directive => {
            if (!directives.some(d => d.startsWith(directive))) {
              issues.push(`CSP missing ${directive} directive`);
            }
          });
          
          // Check for unsafe directives
          if (csp.includes("'unsafe-inline'")) {
            issues.push("CSP allows 'unsafe-inline' scripts");
          }
          
          if (csp.includes("'unsafe-eval'")) {
            issues.push("CSP allows 'unsafe-eval'");
          }
          
          if (csp.includes('*') && !csp.includes('*.')) {
            issues.push('CSP contains overly permissive wildcard');
          }
        }
      }
      
      // Test CSP violations
      const violations: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
          violations.push(msg.text());
        }
      });
      
      // Try to inject inline script
      await page.evaluate(() => {
        const script = document.createElement('script');
        script.innerHTML = 'console.log("CSP test");';
        document.head.appendChild(script);
      });
      
      // Try to inject inline style
      await page.evaluate(() => {
        const style = document.createElement('style');
        style.innerHTML = 'body { background: red !important; }';
        document.head.appendChild(style);
      });
      
      // Try to load external resource
      await page.evaluate(() => {
        const img = document.createElement('img');
        img.src = 'https://evil.example.com/track.gif';
        document.body.appendChild(img);
      });
      
      // Wait for any CSP violations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (violations.length === 0 && !csp) {
        issues.push('No CSP violations detected despite missing CSP header - CSP may not be enforced');
      }
      
      return {
        testName,
        success: issues.length === 0,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        warnings: issues
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
  private async performLogin(page: Page) {
    if (!page.url().includes('/learn')) {
      await page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle2' });
      await page.type('input[name="email"]', 'test@example.com');
      await page.type('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    }
  }

  private escapeHtml(text: string): string {
    const map: any = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}