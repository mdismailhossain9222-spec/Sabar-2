const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  
  await page.goto('http://localhost:5176/product/black-swan', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  // Select a size
  const sizeBtn = await page.locator('button[role="radio"]').first();
  await sizeBtn.click();
  await page.waitForTimeout(500);
  
  // Get checkout button details
  const checkoutBtn = await page.locator('button:has-text("Checkout")').first();
  console.log('Checkout button visible:', await checkoutBtn.isVisible());
  console.log('Checkout button enabled:', !await checkoutBtn.isDisabled());
  console.log('Checkout button disabled attr:', await checkoutBtn.getAttribute('disabled'));
  
  // Listen for navigation
  page.on('framenavigated', frame => {
    if (frame === page.mainFrame()) {
      console.log('Navigation to:', frame.url());
    }
  });
  
  // Click checkout
  await checkoutBtn.click();
  await page.waitForTimeout(5000);
  
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  
  // Check for any errors
  console.log('Console errors:', errors);
  
  await browser.close();
})();
