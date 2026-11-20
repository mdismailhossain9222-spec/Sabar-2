const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  
  console.log('=== Test Home Page ===');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  console.log('Console errors:', errors);
  
  // Check for product cards
  const orderNowBtns = await page.locator('button:has-text("Order Now")').all();
  console.log('Home Order Now buttons:', orderNowBtns.length);
  
  if (orderNowBtns.length > 0) {
    const btn = orderNowBtns[0];
    const className = await btn.getAttribute('class');
    console.log('Home Order Now style correct:', className?.includes('bg-white') && className?.includes('shadow-[0_0_20px_rgba(255,255,255,0.6)'));
  }
  
  console.log('\n=== Test ProductDetail Page ===');
  await page.goto('http://localhost:5176/product/black-swan', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  // Check Add to Cart button
  const addToCartBtn = await page.locator('button:has-text("Add to Cart")').first();
  console.log('Add to Cart button exists:', await addToCartBtn.isVisible());
  if (await addToCartBtn.isVisible()) {
    const className = await addToCartBtn.getAttribute('class');
    console.log('Add to Cart style correct:', className?.includes('bg-white') && className?.includes('shadow-[0_0_20px_rgba(255,255,255,0.6)'));
  }
  
  // Check Checkout button
  const checkoutBtn = await page.locator('button:has-text("Checkout")').first();
  console.log('Checkout button exists:', await checkoutBtn.isVisible());
  if (await checkoutBtn.isVisible()) {
    const className = await checkoutBtn.getAttribute('class');
    console.log('Checkout style correct:', className?.includes('bg-white') && className?.includes('shadow-[0_0_20px_rgba(255,255,255,0.6)'));
  }
  
  // Select size
  const sizeBtn = await page.locator('button[role="radio"]').first();
  await sizeBtn.click();
  await page.waitForTimeout(500);
  
  // Check if Checkout button becomes enabled
  console.log('Checkout button enabled after size select:', !await checkoutBtn.isDisabled());
  
  console.log('\n=== Test Cart Drawer ===');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Add to cart via Order Now
  const orderNowBtn = await page.locator('button:has-text("Order Now")').first();
  await orderNowBtn.click();
  await page.waitForTimeout(5000);
  
  const sizeBtn2 = await page.locator('button[role="radio"]').first();
  await sizeBtn2.click();
  await page.waitForTimeout(500);
  
  const addToCartBtn2 = await page.locator('button:has-text("Add to Cart")').first();
  await addToCartBtn2.click();
  await page.waitForTimeout(2000);
  
  // Go back to home
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Open cart
  const cartIcon = await page.locator('button[aria-label^="Open shopping bag"]').first();
  console.log('Cart icon exists:', await cartIcon.isVisible());
  
  if (await cartIcon.isVisible()) {
    await cartIcon.click();
    await page.waitForTimeout(2000);
    
    // Check Proceed to secure checkout button
    const proceedBtn = await page.locator('button:has-text("Proceed to secure checkout")').first();
    console.log('Proceed to checkout button exists:', await proceedBtn.isVisible());
    
    if (await proceedBtn.isVisible()) {
      const className = await proceedBtn.getAttribute('class');
      console.log('Proceed button style correct:', className?.includes('bg-white') && className?.includes('shadow-[0_0_20px_rgba(255,255,255,0.6)'));
    }
  }
  
  console.log('\n=== Test Checkout Page ===');
  await page.goto('http://localhost:5176/checkout', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  // Check Place Order button
  const placeOrderBtn = await page.locator('button:has-text("Place Order")').first();
  console.log('Place Order button exists:', await placeOrderBtn.isVisible());
  
  if (await placeOrderBtn.isVisible()) {
    const className = await placeOrderBtn.getAttribute('class');
    console.log('Place Order style correct:', className?.includes('bg-white') && className?.includes('shadow-[0_0_20px_rgba(255,255,255,0.6)'));
  }
  
  await browser.close();
  console.log('\n✅ All tests completed!');
})();
