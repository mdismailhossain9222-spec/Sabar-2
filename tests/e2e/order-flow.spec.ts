import { test, expect } from '@playwright/test';

test.describe('Sabr By Simran E2E Test', () => {
  test('place order on main site and verify on dashboard', async ({ page }) => {
    // 1. Go to main site
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Navigate to a product - click first product link
    await page.waitForSelector('a[href*="/product/"]', { timeout: 10000 });
    const productLinks = page.locator('a[href*="/product/"]');
    await productLinks.first().click();
    await page.waitForLoadState('networkidle');
    
    // Select size and add to cart
    await page.waitForSelector('button:has-text("Order Now"), button:has-text("Add to Cart")', { timeout: 10000 });
    const orderBtn = page.locator('button:has-text("Order Now"), button:has-text("Add to Cart")').first();
    await orderBtn.click();
    
    // Wait for cart to update
    await page.waitForTimeout(1000);
    
    // Go to checkout
    await page.goto('http://localhost:5173/checkout');
    await page.waitForLoadState('networkidle');
    
    // Fill checkout form
    await page.fill('#checkout-full-name', 'Test User');
    await page.fill('#checkout-phone', '+971 50 123 4567');
    await page.fill('#checkout-address', 'Test Villa, Dubai');
    await page.selectOption('#checkout-emirate', 'Dubai');
    
    // Select COD payment
    await page.click('button[role="radio"]:has-text("Cash on Delivery")');
    
    // Place order
    await page.click('button[type="submit"]:has-text("Place Order")');
    await page.waitForTimeout(2000);
    
    // Get order reference
    const referenceText = await page.locator('text=/SBR-\d+/').first().textContent();
    const reference = referenceText?.match(/SBR-\d+/)?.[0];
    console.log('Order placed:', reference);
    
    // 2. Go to Dashboard and verify
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Click Orders tab
    await page.click('button:has-text("Orders"), a:has-text("Orders"), [data-tab="orders"]').first();
    await page.waitForTimeout(1000);
    
    // Check if order appears
    if (reference) {
      const orderVisible = await page.locator(`text=${reference}`).isVisible();
      console.log('Order visible on dashboard:', orderVisible);
    }
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/dashboard-orders.png' });
  });
});

test('dashboard loads without errors', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Check for console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.waitForTimeout(2000);
  console.log('Console errors:', errors);
  expect(errors.length).toBe(0);
});
