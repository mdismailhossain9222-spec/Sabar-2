const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  console.log('Console errors:', errors);
  
  // Check for Order Now buttons
  const orderNowBtns = await page.locator('button:has-text("Order Now")').all();
  console.log(`Order Now buttons found: ${orderNowBtns.length}`);
  
  // Check for product articles
  const articles = await page.locator('article').all();
  console.log(`Product articles found: ${articles.length}`);
  
  // Check for View buttons
  const viewBtns = await page.locator('button:has-text("View")').all();
  console.log(`View buttons found: ${viewBtns.length}`);
  
  await browser.close();
})();
