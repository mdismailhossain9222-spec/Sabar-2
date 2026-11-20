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
  
  // Get all buttons with their aria-labels
  const allButtons = await page.locator('button').all();
  console.log(`Total buttons on page: ${allButtons.length}`);
  
  for (const btn of allButtons) {
    const ariaLabel = await btn.getAttribute('aria-label');
    if (ariaLabel) {
      console.log(`Button aria-label: ${ariaLabel}`);
    }
  }
  
  await browser.close();
})();
