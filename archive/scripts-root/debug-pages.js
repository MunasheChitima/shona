const puppeteer = require('puppeteer');

async function debugPages() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Debugging pages...');
  
  // Check home page
  await page.goto('http://localhost:3001');
  const title = await page.$eval('h1', el => el.textContent);
  console.log('Home page title:', title);
  
  // Check register page
  await page.goto('http://localhost:3001/register');
  const inputs = await page.$$eval('input', els => els.map(el => ({ name: el.name, type: el.type })));
  console.log('Register page inputs:', inputs);
  
  // Check login page
  await page.goto('http://localhost:3001/login');
  const loginInputs = await page.$$eval('input', els => els.map(el => ({ name: el.name, type: el.type })));
  console.log('Login page inputs:', loginInputs);
  
  await browser.close();
}

debugPages().catch(console.error); 