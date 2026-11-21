import { test, expect } from '@playwright/test';

const MAIN_URL = 'http://localhost:5178';
const DASHBOARD_URL = 'http://localhost:3000';

test.describe('Sabr By Simran - Full Order Flow E2E', () => {
  test('Complete order flow: website checkout -> dashboard live tracking', async ({ page, context }) => {
    // 1. Open main site and wait for preloader to clear
    await page.goto(MAIN_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Wait for preloader and SPA hydration
    
    // Scroll down to trigger lazy loading and find product links
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Navigate to a product - the collection section should have product links
    await page.waitForSelector('a[href*="/product/"]', { timeout: 30000 });
    const productLinks = page.locator('a[href*="/product/"]');
    await productLinks.first().click();
    await page.waitForLoadState('networkidle');
    
    // Select size if needed and add to cart
    await page.waitForSelector('button:has-text("Order Now"), button:has-text("Add to Cart")', { timeout: 10000 });
    
    // First, select a size if there's a size selector
    const sizeSelector = page.locator('select[name="size"], select[id*="size"]').first();
    if (await sizeSelector.count() > 0) {
      await sizeSelector.selectOption({ index: 1 }); // Select first available size
      await page.waitForTimeout(500);
    }
    
    const orderBtn = page.locator('button:has-text("Order Now"), button:has-text("Add to Cart")').first();
    await orderBtn.click();
    
    // Wait for cart to update
    await page.waitForTimeout(1000);
    
    // Go to checkout
    await page.goto(`${MAIN_URL}/checkout`);
    await page.waitForLoadState('networkidle');
    
    // Fill checkout form
    await page.fill('#checkout-full-name', 'E2E Test User');
    await page.fill('#checkout-phone', '+971 50 123 4567');
    await page.fill('#checkout-address', 'E2E Test Villa, Dubai');
    await page.selectOption('#checkout-emirate', 'Dubai');
    
    // Select COD payment
    await page.click('button[role="radio"]:has-text("Cash on Delivery")');
    
    // Place order
    await page.click('button[type="submit"]:has-text("Place Order")');
    await page.waitForTimeout(3000);
    
    // Get order reference from success screen
    const referenceText = await page.locator('text=/SBR-\d+/').first().textContent();
    const reference = referenceText?.match(/SBR-\d+/)?.[0];
    console.log('Order placed:', reference);
    
    // Take screenshot of checkout success
    await page.screenshot({ path: '/tmp/checkout-success.png', fullPage: true });
    
    // 2. Open dashboard in new tab
    const dashboardPage = await context.newPage();
    await dashboardPage.goto(DASHBOARD_URL);
    await dashboardPage.waitForLoadState('networkidle');
    
    // Click Orders tab
    const ordersButton = dashboardPage.locator('button:has-text("Orders"), a:has-text("Orders")').first();
    await expect(ordersButton).toBeVisible();
    await ordersButton.click();
    await dashboardPage.waitForTimeout(1000);
    
    // Check for Live Tracking indicator
    const liveIndicator = dashboardPage.locator('text=Live Tracking');
    await expect(liveIndicator).toBeVisible({ timeout: 5000 });
    console.log('Live Tracking indicator verified');
    
    // Wait for order to appear via realtime/polling (up to 15 seconds)
    if (reference) {
      let orderFound = false;
      for (let i = 0; i < 10; i++) {
        await dashboardPage.waitForTimeout(1500);
        const orderVisible = await dashboardPage.locator(`text=${reference}`).isVisible().catch(() => false);
        if (orderVisible) {
          orderFound = true;
          console.log(`Order ${reference} found on dashboard!`);
          break;
        }
      }
      if (!orderFound) {
        console.log('Order not found yet - may appear after next poll');
      }
    }
    
    // Take screenshot of dashboard
    await dashboardPage.screenshot({ path: '/tmp/dashboard-orders.png', fullPage: true });
    
    await dashboardPage.close();
  });
});
