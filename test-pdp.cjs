const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  
  console.log('Testing home page...');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(10000);
  
  console.log('Console errors:', errors);
  
  // Check page content
  const content = await page.content();
  console.log('Page length:', content.length);
  console.log('Has "The Premiere":', content.includes('The Premiere'));
  console.log('Has "The Black Swan":', content.includes('The Black Swan'));
  console.log('Has "article":', content.includes('article'));
  console.log('Has "View":', content.includes('View'));
  console.log('Has "Order Now":', content.includes('Order Now'));
  
  // Check for any buttons
  const buttons = await page.locator('button').all();
  console.log(`Total buttons: ${buttons.length}`);
  
  await browser.close();
})();
