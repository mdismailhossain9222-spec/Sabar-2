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
  
  // Check initial cart icon
  let cartIcon = await page.locator('button[aria-label^="Open shopping bag"]').first();
  console.log(`Initial cart icon exists: ${await cartIcon.isVisible()}`);
  if (await cartIcon.isVisible()) {
    const ariaLabel = await cartIcon.getAttribute('aria-label');
    console.log(`Initial cart icon aria-label: ${ariaLabel}`);
  }
  
  // Click Order Now on first product
  const orderNowBtn = await page.locator('button:has-text("Order Now")').first();
  console.log(`Order Now button exists: ${await orderNowBtn.isVisible()}`);
  
  if (await orderNowBtn.isVisible()) {
    await orderNowBtn.click();
    await page.waitForTimeout(3000);
    
    // Select size
    const sizeBtn = await page.locator('button[role="radio"]').first();
    await sizeBtn.click();
    await page.waitForTimeout(500);
    
    // Add to cart
    const addToCartBtn = await page.locator('button:has-text("Add to Cart")').first();
    console.log(`Add to Cart button exists: ${await addToCartBtn.isVisible()}`);
    await addToCartBtn.click();
    await page.waitForTimeout(2000);
    
    // After modal closes, check for cart icon - it might have different aria-label now
    cartIcon = await page.locator('button[aria-label*="shopping bag"]').first();
    console.log(`After add to cart - cart icon exists: ${await cartIcon.isVisible()}`);
    if (await cartIcon.isVisible()) {
      const ariaLabel = await cartIcon.getAttribute('aria-label');
      console.log(`Cart icon aria-label: ${ariaLabel}`);
    } else {
      // Debug: find all buttons with their aria-labels
      const allButtons = await page.locator('button').all();
      for (const btn of allButtons) {
        const ariaLabel = await btn.getAttribute('aria-label');
        if (ariaLabel) {
          console.log(`Button aria-label: ${ariaLabel}`);
        }
      }
    }
  }
  
  await browser.close();
  console.log('\n✅ Cart drawer test completed!');
})();
