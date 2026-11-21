import { test, expect } from '@playwright/test';

test.describe('Sabr By Simran - Live Tracking E2E', () => {
  test('main site /admin redirects to dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Wait a moment for any preloader
    await page.waitForTimeout(3000);
    
    // Test /admin redirect directly
    const response = await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
    console.log('/admin redirect status:', response?.status());
    expect(response?.status()).toBeLessThan(400);
  });
});

test('dashboard loads with live tracking indicator', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Check for the dashboard title - use first() to avoid strict mode
  await expect(page.locator('text=Sabr By Simran').first()).toBeVisible({ timeout: 15000 });
  
  // Click Orders tab - find the Orders button in sidebar
  const ordersButton = page.locator('button:has-text("Orders"), a:has-text("Orders")').first();
  await expect(ordersButton).toBeVisible();
  await ordersButton.click();
  await page.waitForTimeout(1000);
  
  // Check for Live Tracking indicator
  const liveIndicator = page.locator('text=Live Tracking');
  await expect(liveIndicator).toBeVisible({ timeout: 5000 });
  
  console.log('Live Tracking indicator verified on dashboard');
});
