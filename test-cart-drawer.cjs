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
    
    // Find cart icon - try different selectors
    const cartIconSelectors = [
      'button[aria-label*="shopping bag"]',
      'button[aria-label*="Shopping Bag"]',
      'button[aria-label*="cart"]',
      'button[aria-label*="Cart"]',
      'button:has-text("Your edit")',
      '.liquid-glass-nav button:has(svg)',
      'button:has-text("bag")',
    ];
    
    let cartIcon = null;
    for (const selector of cartIconSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`Found cart icon with selector: ${selector}`);
        cartIcon = elements[0];
        break;
      }
    }
    
    if (!cartIcon) {
      // Try to find all buttons and check their aria-labels
      const allButtons = await page.locator('button').all();
      for (const btn of allButtons) {
        const ariaLabel = await btn.getAttribute('aria-label');
        if (ariaLabel && (ariaLabel.toLowerCase().includes('bag') || ariaLabel.toLowerCase().includes('cart'))) {
          console.log(`Found cart button with aria-label: ${ariaLabel}`);
          cartIcon = btn;
          break;
        }
      }
    }
    
    if (cartIcon) {
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
    } else {
      console.log('Could not find cart icon');
    }
  }
  
  await browser.close();
  console.log('\n✅ Cart drawer test completed!');
})();
