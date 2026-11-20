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
  const articles = await page.locator('article').all();
  console.log('Product cards found:', articles.length);
  
  // Check for category filter buttons (should be removed)
  const filterButtons = await page.locator('button:has-text("All"), button:has-text("Eveningwear"), button:has-text("Occasion"), button:has-text("Tailoring"), button:has-text("Tweed")').all();
  console.log('Category filter buttons found (should be 0):', filterButtons.length);
  
  // Check for Order Now buttons with glowing style
  const orderNowBtns = await page.locator('button:has-text("Order Now")').all();
  console.log('Order Now buttons found:', orderNowBtns.length);
  
  if (orderNowBtns.length > 0) {
    // Check the first Order Now button style
    const btn = orderNowBtns[0];
    const className = await btn.getAttribute('class');
    console.log('Order Now button classes:', className);
    console.log('Has glowing white style:', className?.includes('bg-white') && className?.includes('shadow-[0_0_20px_rgba(255,255,255,0.6)'));
  }
  
  // Check product card structure (no white borders)
  if (articles.length > 0) {
    const card = articles[0];
    const cardClass = await card.getAttribute('class');
    console.log('Product card classes:', cardClass);
    console.log('Has white border:', cardClass?.includes('border-white') || cardClass?.includes('ring-white') || cardClass?.includes('border-[#FAF5EF]'));
  }
  
  // Check search bar still exists
  const searchInput = await page.locator('input[type="search"]').first();
  console.log('Search bar exists:', await searchInput.isVisible());
  
  await browser.close();
  console.log('Test completed!');
})();
