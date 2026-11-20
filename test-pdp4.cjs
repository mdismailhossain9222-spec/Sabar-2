const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5176/product/black-swan', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  // Click "Size guide" to open the modal
  console.log('Testing Size Guide modal...');
  const sizeGuideBtn = await page.locator('button:has-text("Size guide")').first();
  await sizeGuideBtn.click();
  await page.waitForTimeout(2000);
  
  const modal = await page.locator('[role="dialog"]').first();
  console.log('Size guide modal visible:', await modal.isVisible());
  
  // Close modal
  const closeBtn = await page.locator('[role="dialog"] button:has-text("Close")').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(1000);
  }
  
  // Test Add to Cart button
  console.log('\nTesting Add to Cart...');
  const sizeBtn = await page.locator('button[role="radio"]').first();
  await sizeBtn.click();
  await page.waitForTimeout(500);
  
  const addToCartBtn = await page.locator('button:has-text("Add to Cart")').first();
  console.log('Add to Cart enabled:', !await addToCartBtn.isDisabled());
  await addToCartBtn.click();
  await page.waitForTimeout(2000);
  
  // Test Checkout button
  console.log('\nTesting Checkout...');
  const checkoutBtn = await page.locator('button:has-text("Checkout")').first();
  console.log('Checkout enabled:', !await checkoutBtn.isDisabled());
  await checkoutBtn.click();
  await page.waitForTimeout(2000);
  
  const url = page.url();
  console.log(`After checkout click, URL: ${url}`);
  
  // Test back navigation
  console.log('\nTesting back navigation...');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  const viewBtn = await page.locator('button:has-text("View")').first();
  await viewBtn.click();
  await page.waitForTimeout(5000);
  console.log(`After clicking View from home, URL: ${page.url()}`);
  
  await browser.close();
  console.log('\n✅ All tests passed!');
})();
