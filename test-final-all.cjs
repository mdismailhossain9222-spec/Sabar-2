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
  
  // Check for product cards
  const viewButtons = await page.locator('button:has-text("View")').all();
  console.log(`Found ${viewButtons.length} View buttons`);
  
  if (viewButtons.length > 0) {
    console.log('\n=== Test 2: Navigate to PDP ===');
    await viewButtons[0].click();
    await page.waitForTimeout(5000);
    
    const pdpUrl = page.url();
    console.log(`PDP URL: ${pdpUrl}`);
    
    if (pdpUrl.includes('/product/')) {
      console.log('✅ PDP navigation works!');
      
      // Select a size first
      console.log('\n=== Test 2b: Select Size on PDP ===');
      const sizeBtn = await page.locator('button[role="radio"]').first();
      console.log(`Size button exists: ${await sizeBtn.isVisible()}`);
      await sizeBtn.click();
      await page.waitForTimeout(500);
      
      // Now click checkout
      console.log('\n=== Test 3: Navigate to Checkout Page from PDP ===');
      const pdpCheckoutBtn = await page.locator('button:has-text("Checkout")').first();
      console.log(`PDP Checkout button exists: ${await pdpCheckoutBtn.isVisible()}`);
      console.log(`PDP Checkout button enabled: ${!await pdpCheckoutBtn.isDisabled()}`);
      await pdpCheckoutBtn.click();
      await page.waitForTimeout(5000);
      
      const checkoutUrl = page.url();
      console.log(`Checkout URL: ${checkoutUrl}`);
      
      if (checkoutUrl.includes('/checkout')) {
        console.log('✅ Checkout page navigation from PDP works!');
        
        // Check for Emirate dropdown
        const emirateSelect = await page.locator('#checkout-emirate').first();
        console.log(`Emirate dropdown exists: ${await emirateSelect.isVisible()}`);
        
        if (await emirateSelect.isVisible()) {
          // Test selecting an emirate
          await emirateSelect.selectOption('Abu Dhabi');
          await page.waitForTimeout(500);
          const selectedValue = await emirateSelect.inputValue();
          console.log(`Selected emirate: ${selectedValue}`);
        }
        
        // Check for Delivery Method box
        const deliveryMethod = await page.locator('text=Delivery Method').first();
        console.log(`Delivery Method box exists: ${await deliveryMethod.isVisible()}`);
        
        // Check for Footer on Checkout page
        const footer = await page.locator('footer').first();
        console.log(`Footer on Checkout page: ${await footer.isVisible()}`);
      } else {
        console.log('❌ Failed to navigate to /checkout from PDP');
      }
    } else {
      console.log('❌ Failed to navigate to PDP');
    }
  }
  
  console.log('\n=== Test 4: Policy Modals in Footer ===');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  // Check for "Return & Exchange Policy" link in footer
  const returnPolicyBtn = await page.locator('button[data-policy="return"]').first();
  console.log(`Return Policy button exists: ${await returnPolicyBtn.isVisible()}`);
  
  if (await returnPolicyBtn.isVisible()) {
    await returnPolicyBtn.click();
    await page.waitForTimeout(1000);
    const modal = await page.locator('[role="dialog"]').first();
    console.log(`Return Policy modal opens: ${await modal.isVisible()}`);
    
    if (await modal.isVisible()) {
      // Close modal
      const closeBtn = await modal.locator('button[aria-label*="Close"]').first();
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }
  
  // Check for "Shipping Policy" link in footer
  const shippingPolicyBtn = await page.locator('button[data-policy="shipping"]').first();
  console.log(`Shipping Policy button exists: ${await shippingPolicyBtn.isVisible()}`);
  
  if (await shippingPolicyBtn.isVisible()) {
    await shippingPolicyBtn.click();
    await page.waitForTimeout(1000);
    const modal = await page.locator('[role="dialog"]').first();
    console.log(`Shipping Policy modal opens: ${await modal.isVisible()}`);
    
    if (await modal.isVisible()) {
      // Close modal
      const closeBtn = await modal.locator('button[aria-label*="Close"]').first();
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }
  
  console.log('\n=== Test 5: Cart Drawer Checkout Button ===');
  // Add item to cart first - go to PDP and use Add to Cart
  await page.goto('http://localhost:5176/product/black-swan', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  const orderNowBtn = await page.locator('button:has-text("Order Now")').first();
  console.log(`Order Now button exists: ${await orderNowBtn.isVisible()}`);
  
  if (await orderNowBtn.isVisible()) {
    // Use Checkout button instead (it also adds to cart)
    const pdpCheckoutBtn = await page.locator('button:has-text("Checkout")').first();
    console.log(`PDP Checkout button exists: ${await pdpCheckoutBtn.isVisible()}`);
    console.log(`PDP Checkout button enabled: ${!await pdpCheckoutBtn.isDisabled()}`);
    await pdpCheckoutBtn.click();
    await page.waitForTimeout(5000);
    
    const checkoutUrl = page.url();
    console.log(`Checkout URL from PDP Checkout: ${checkoutUrl}`);
    
    if (checkoutUrl.includes('/checkout')) {
      console.log('✅ PDP Checkout navigates to /checkout');
      
      // Go back to home
      await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3000);
      
      // Check cart icon
      const cartIcon = await page.locator('button[aria-label^="Open shopping bag"]').first();
      console.log(`Cart icon on home exists: ${await cartIcon.isVisible()}`);
      
      if (await cartIcon.isVisible()) {
        const ariaLabel = await cartIcon.getAttribute('aria-label');
        console.log(`Cart icon aria-label: ${ariaLabel}`);
        
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
          console.log(`Checkout URL from cart drawer: ${checkoutUrl}`);
        }
      }
    }
  }
  
  await browser.close();
  console.log('\n✅ All tests completed!');
})();
