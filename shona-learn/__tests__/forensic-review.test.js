const puppeteer = require('puppeteer');
const fs = require('fs');

const testUrl = 'http://localhost:3000';
const screenshotDir = './test-screenshots';

if (!fs.existsSync(screenshotDir)){
    fs.mkdirSync(screenshotDir);
}

async function runForensicReview() {
    console.log('Starting forensic review...');
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => {
            console.error('PAGE ERROR:', error.message);
        });

        // 1. Test Homepage
        console.log('Navigating to Home page...');
        await page.goto(testUrl, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: `${screenshotDir}/01-homepage.png` });
        console.log('  - Homepage screenshot captured.');

        // 2. Test Registration
        console.log('Navigating to Register page...');
        await page.goto(`${testUrl}/register`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: `${screenshotDir}/02-register-page.png` });
        console.log('  - Register page screenshot captured.');
        const uniqueEmail = `testuser_${Date.now()}@example.com`;
        await page.type('input[name="name"]', 'Test User');
        await page.type('input[name="email"]', uniqueEmail);
        await page.type('input[name="password"]', 'Password123');
        await page.type('input[name="confirmPassword"]', 'Password123');
        await page.click('button[type="submit"]');

        console.log('Waiting for navigation after registration...');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('  - Registration submitted, navigated.');
        
        // Check if we landed on the learn page, which indicates successful registration + login
        if (page.url() !== `${testUrl}/learn`) {
            console.error(`Expected to be on /learn page, but on ${page.url()}`);
        } else {
            console.log('  - Successfully redirected to /learn page.');
        }

        await page.screenshot({ path: `${screenshotDir}/03-after-registration.png` });
        console.log('  - Screenshot after registration captured.');
        
        // 3. Test Logout
        try {
            console.log('Attempting to log out...');
            // A more robust selector for a logout button
            const logoutButton = await page.waitForSelector('nav button, nav a');
            if(logoutButton) {
                const buttonText = await page.evaluate(el => el.textContent, logoutButton);
                if(buttonText.toLowerCase().includes('logout')) {
                    await logoutButton.click();
                    await page.waitForNavigation({ waitUntil: 'networkidle2' });
                    await page.screenshot({ path: `${screenshotDir}/04-after-logout.png` });
                    console.log('  - Logout successful, screenshot captured.');
                } else {
                     console.log('  - Logout button not found. Skipping logout.');
                }
            } else {
                console.log('  - Logout button not found. Skipping logout.');
            }
        } catch(e) {
            console.log('  - Could not perform logout. Maybe user is not logged in or button not found.');
            console.error(e);
        }

        // 4. Test Login
        console.log('Navigating to Login page...');
        await page.goto(`${testUrl}/login`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: `${screenshotDir}/05-login-page.png` });
        console.log('  - Login page screenshot captured.');
        await page.type('input[name="email"]', uniqueEmail);
        await page.type('input[name="password"]', 'Password123');
        await page.click('button[type="submit"]');

        console.log('Waiting for navigation after login...');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('  - Login submitted, navigated.');

        if (page.url() !== `${testUrl}/learn`) {
            console.error(`Expected to be on /learn page, but on ${page.url()}`);
        } else {
            console.log('  - Successfully redirected to /learn page after login.');
        }

        await page.screenshot({ path: `${screenshotDir}/06-after-login.png` });
        console.log('  - Login submitted, screenshot captured.');

        // 5. Test Learn Page
        console.log('Navigating to Learn page...');
        await page.goto(`${testUrl}/learn`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: `${screenshotDir}/07-learn-page.png` });
        console.log('  - Learn page screenshot captured.');
        
        console.log('Forensic review completed successfully!');
    } catch (error) {
        console.error('An error occurred during the forensic review:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

runForensicReview(); 