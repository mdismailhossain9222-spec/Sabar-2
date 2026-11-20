const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Testing home page...');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  console.log('Looking for product cards...');
  const productCards = await page.locator('article').all();
  console.log(`Found ${productCards.length} product cards`);
  
  if (productCards.length > 0) {
    console.log('Clicking first product card...');
    // Click the "View" button or the card itself
    const viewButton = page.locator('button:has-text("View")').first();
    await viewButton.click();
    await page.waitForTimeout(2000);
    
    const url = page.url();
    console.log(`Current URL: ${url}`);
    
    if (url.includes('/product/')) {
      console.log('✅ SUCCESS: Navigation to PDP works!');
      
      // Check for key elements on PDP
      const title = await page.locator('h1').first().textContent();
      console.log(`Product title: ${title}`);
      
      const price = await page.locator('text=AED').first().textContent();
      console.log(`Price element found: ${price}`);
      
      const sizeButtons = await page.locator('button[role="radio"]').all();
      console.log(`Size selector buttons: ${sizeButtons.length}`);
      
      const addToCartBtn = await page.locator('button:has-text("Add to Cart")').first();
      const checkoutBtn = await page.locator('button:has-text("Checkout")').first();
      console.log(`Add to Cart button exists: ${await addToCartBtn.isVisible()}`);
      console.log(`Checkout button exists: ${await checkoutBtn.isVisible()}`);
    } else {
      console.log('❌ FAILED: Did not navigate to /product/:id');
    }
  }
  
  await browser.close();
})();
