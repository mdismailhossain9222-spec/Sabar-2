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
  
  // Check for View buttons and click
  const viewButtons = await page.locator('button:has-text("View")').all();
  console.log(`Found ${viewButtons.length} View buttons`);
  
  if (viewButtons.length > 0) {
    // Check what happens on click
    await page.waitForTimeout(1000);
    const beforeUrl = page.url();
    console.log(`Before click URL: ${beforeUrl}`);
    
    await viewButtons[0].click();
    await page.waitForTimeout(5000);
    
    const afterUrl = page.url();
    console.log(`After click URL: ${afterUrl}`);
    
    // Check for any navigation events
    const networkRequests = [];
    page.on('request', req => {
      if (req.url().includes('/product/')) {
        networkRequests.push(req.url());
      }
    });
    
    console.log('Product navigation requests:', networkRequests);
  }
  
  // Check footer content
  await page.waitForTimeout(2000);
  const footerContent = await page.locator('footer').textContent();
  console.log('\nFooter text sample:', footerContent?.substring(0, 500));
  
  // Check for policy buttons
  const policyButtons = await page.locator('button[data-policy]').all();
  console.log(`\nPolicy buttons found: ${policyButtons.length}`);
  
  await browser.close();
})();
