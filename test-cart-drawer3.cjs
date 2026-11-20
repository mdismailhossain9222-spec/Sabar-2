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
    
    // Find cart icon - use the correct aria-label
    const cartIcon = await page.locator('button[aria-label="Open shopping bag, empty"]').first();
    console.log(`Cart icon exists: ${await cartIcon.isVisible()}`);
    
    if (await cartIcon.isVisible()) {
      console.log('Clicking cart icon...');
      await cartIcon.click();
      await page.waitForTimeout(2000);
      
      // Check for checkout button in drawer
      const cartCheckoutBtn = await page.locator('button:has-text("Proceed to secure checkout")').first();
      console.log(`Cart drawer Checkout button exists: ${await cartCheckoutBtn.isVisible()}`);
      
      if (await cartCheckoutBtn.isVisible()) {
        await cartCheckoutBtn.click();
        await page.waitForTimeout(5000);
        
        const checkoutUrl = page.url();
        console.log(`Checkout URL from cart: ${checkoutUrl}`);
      }
    }
  }
  
  await browser.close();
  console.log('\n✅ Cart drawer test completed!');
})();
