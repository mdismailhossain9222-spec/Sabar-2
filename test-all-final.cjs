const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  
  console.log('=== Test 1: Home Page ===');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  console.log('Console errors:', errors);
  
  const viewButtons = await page.locator('button:has-text("View")').all();
  console.log('Found ' + viewButtons.length + ' View buttons');
  
  if (viewButtons.length > 0) {
    console.log('=== Test 2: Navigate to PDP ===');
    await viewButtons[0].click();
    await page.waitForTimeout(5000);
    
    const pdpUrl = page.url();
    console.log('PDP URL: ' + pdpUrl);
    
    if (pdpUrl.includes('/product/')) {
      console.log('PDP navigation works!');
      
      console.log('=== Test 2b: Select Size on PDP ===');
      const sizeBtn = await page.locator('button[role="radio"]').first();
      console.log('Size button exists: ' + await sizeBtn.isVisible());
      await sizeBtn.click();
      await page.waitForTimeout(500);
      
      console.log('=== Test 3: Navigate to Checkout Page from PDP ===');
      const pdpCheckoutBtn = await page.locator('button:has-text("Checkout")').first();
      console.log('PDP Checkout button exists: ' + await pdpCheckoutBtn.isVisible());
      console.log('PDP Checkout button enabled: ' + !await pdpCheckoutBtn.isDisabled());
      await pdpCheckoutBtn.click();
      await page.waitForTimeout(5000);
      
      const checkoutUrl = page.url();
      console.log('Checkout URL: ' + checkoutUrl);
      
      if (checkoutUrl.includes('/checkout')) {
        console.log('Checkout page navigation from PDP works!');
        
        const emirateSelect = await page.locator('#checkout-emirate').first();
        console.log('Emirate dropdown exists: ' + await emirateSelect.isVisible());
        
        if (await emirateSelect.isVisible()) {
          await emirateSelect.selectOption('Abu Dhabi');
          await page.waitForTimeout(500);
          const selectedValue = await emirateSelect.inputValue();
          console.log('Selected emirate: ' + selectedValue);
        }
        
        const deliveryMethod = await page.locator('text=Delivery Method').first();
        console.log('Delivery Method box exists: ' + await deliveryMethod.isVisible());
        
        const footer = await page.locator('footer').first();
        console.log('Footer on Checkout page: ' + await footer.isVisible());
      } else {
        console.log('Failed to navigate to /checkout from PDP');
      }
    } else {
      console.log('Failed to navigate to PDP');
    }
  }
  
  console.log('=== Test 4: Policy Modals in Footer ===');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  const returnPolicyBtn = await page.locator('button[data-policy="return"]').first();
  console.log('Return Policy button exists: ' + await returnPolicyBtn.isVisible());
  
  if (await returnPolicyBtn.isVisible()) {
    await returnPolicyBtn.click();
    await page.waitForTimeout(1000);
    const modal = await page.locator('[role="dialog"]').first();
    console.log('Return Policy modal opens: ' + await modal.isVisible());
    
    if (await modal.isVisible()) {
      const closeBtn = await modal.locator('button[aria-label*="Close"]').first();
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }
  
  const shippingPolicyBtn = await page.locator('button[data-policy="shipping"]').first();
  console.log('Shipping Policy button exists: ' + await shippingPolicyBtn.isVisible());
  
  if (await shippingPolicyBtn.isVisible()) {
    await shippingPolicyBtn.click();
    await page.waitForTimeout(1000);
    const modal = await page.locator('[role="dialog"]').first();
    console.log('Shipping Policy modal opens: ' + await modal.isVisible());
    
    if (await modal.isVisible()) {
      const closeBtn = await modal.locator('button[aria-label*="Close"]').first();
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }
  
  console.log('=== Test 5: Cart Drawer Checkout Button (from Home Page) ===');
  // Go to home page and use Order Now -> Add to Cart -> Cart Drawer -> Checkout
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  const orderNowBtns = await page.locator('button:has-text("Order Now")').all();
  console.log('Order Now buttons on Home page: ' + orderNowBtns.length);
  
  if (orderNowBtns.length > 0) {
    const orderNowBtn = orderNowBtns[0];
    console.log('Order Now button exists: ' + await orderNowBtn.isVisible());
    
    await orderNowBtn.click();
    await page.waitForTimeout(5000);
    
    console.log('After Order Now click, URL: ' + page.url());
    
    const sizeBtn = await page.locator('button[role="radio"]').first();
    await sizeBtn.click();
    await page.waitForTimeout(500);
    
    const addToCartBtn = await page.locator('button:has-text("Add to Cart")').first();
    console.log('Add to Cart button exists: ' + await addToCartBtn.isVisible());
    await addToCartBtn.click();
    await page.waitForTimeout(2000);
    
    // Go back to home page using navigation
    await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const cartIcon = await page.locator('button[aria-label^="Open shopping bag"]').first();
    console.log('After add to cart - cart icon exists: ' + await cartIcon.isVisible());
    
    if (await cartIcon.isVisible()) {
      const ariaLabel = await cartIcon.getAttribute('aria-label');
      console.log('Cart icon aria-label: ' + ariaLabel);
      
      console.log('Clicking cart icon...');
      await cartIcon.click();
      await page.waitForTimeout(3000);  // Longer wait for drawer animation
      
      const cartCheckoutBtn = await page.locator('button:has-text("Proceed to secure checkout")').first();
      console.log('Cart drawer Checkout button exists: ' + await cartCheckoutBtn.isVisible());
      
      if (await cartCheckoutBtn.isVisible()) {
        await cartCheckoutBtn.click();
        await page.waitForTimeout(5000);
        
        const checkoutUrl = page.url();
        console.log('Checkout URL from cart drawer: ' + checkoutUrl);
      }
    }
  } else {
    console.log('No Order Now buttons found on Home page');
  }
  
  await browser.close();
  console.log('All tests completed!');
})();
