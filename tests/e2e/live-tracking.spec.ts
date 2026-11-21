import { test, expect } from '@playwright/test';

const MAIN_URL = 'http://localhost:5177';
const DASHBOARD_URL = 'http://localhost:3000';

test.describe('Sabr By Simran - Live Tracking E2E', () => {
  test('main site /admin proxies to dashboard', async ({ page }) => {
    const response = await page.goto(`${MAIN_URL}/admin`, { waitUntil: 'networkidle' });
    console.log('/admin proxy status:', response?.status());
    expect(response?.status()).toBeLessThan(400);
    
    // Verify we're on the dashboard
    await expect(page.locator('text=Sabr By Simran').first()).toBeVisible({ timeout: 15000 });
  });
});

test('dashboard loads with live tracking indicator', async ({ page }) => {
  await page.goto(DASHBOARD_URL);
  await page.waitForLoadState('networkidle');
  
  // Check for the dashboard title
  await expect(page.locator('text=Sabr By Simran').first()).toBeVisible({ timeout: 15000 });
  
  // Click Orders tab
  const ordersButton = page.locator('button:has-text("Orders"), a:has-text("Orders")').first();
  await expect(ordersButton).toBeVisible();
  await ordersButton.click();
  await page.waitForTimeout(1000);
  
  // Check for Live Tracking indicator
  const liveIndicator = page.locator('text=Live Tracking');
  await expect(liveIndicator).toBeVisible({ timeout: 5000 });
  
  console.log('Live Tracking indicator verified on dashboard');
});
