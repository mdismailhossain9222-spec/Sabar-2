const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  
  console.log('Testing home page...');
  await page.goto('http://localhost:5176/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  console.log('Console errors:', errors);
  
  // Click the first "View" button
  console.log('Clicking first View button...');
  const viewButtons = await page.locator('button:has-text("View")').all();
  console.log(`Found ${viewButtons.length} View buttons`);
  
  if (viewButtons.length > 0) {
    await viewButtons[0].click();
    await page.waitForTimeout(5000);
    
    const url = page.url();
    console.log(`Current URL: ${url}`);
    
    if (url.includes('/product/')) {
      console.log('✅ SUCCESS: Navigation to PDP works!');
      
      // Check for key elements on PDP
      const title = await page.locator('h1').first().textContent();
      console.log(`Product title: ${title}`);
      
      const sizeButtons = await page.locator('button[role="radio"]').all();
      console.log(`Size selector buttons: ${sizeButtons.length}`);
      
      const addToCartBtn = await page.locator('button:has-text("Add to Cart")').first();
      const checkoutBtn = await page.locator('button:has-text("Checkout")').first();
      console.log(`Add to Cart button exists: ${await addToCartBtn.isVisible()}`);
      console.log(`Checkout button exists: ${await checkoutBtn.isVisible()}`);
      
      // Check for red background on first image
      const hasRedBg = await page.evaluate(() => {
        const img = document.querySelector('img');
        if (!img) return false;
        const parent = img.parentElement;
        if (!parent) return false;
        const style = window.getComputedStyle(parent);
        return style.backgroundColor.includes('232') || style.backgroundColor.includes('E8') || parent.classList.contains('bg-[#E87272]');
      });
      console.log(`Red background on first image: ${hasRedBg}`);
      
      // Check for size chart
      const sizeGuideBtn = await page.locator('button:has-text("Size guide")').first();
      console.log(`Size guide button exists: ${await sizeGuideBtn.isVisible()}`);
      
      // Check for gallery thumbnails
      const thumbnails = await page.locator('img[alt=""]').all();
      console.log(`Gallery thumbnails: ${thumbnails.length}`);
      
    } else {
      console.log('❌ FAILED: Did not navigate to /product/:id');
    }
  }
  
  await browser.close();
})();
