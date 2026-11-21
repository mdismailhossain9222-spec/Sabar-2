import { test, expect } from '@playwright/test';

const MAIN_URL = 'https://sabar-2.mdismailhossain9222.workers.dev';
const DASHBOARD_URL = 'https://sabar-dashboard.vercel.app';

test.describe('Sabr By Simran - Live Redirect Verification', () => {
  test('main site /admin redirects to dashboard and loads', async ({ page }) => {
    const response = await page.goto(`${MAIN_URL}/admin`, { waitUntil: 'load', timeout: 60000 });
    console.log('/admin redirect status:', response?.status());
    expect(response?.status()).toBeLessThan(400);
    
    // Verify we're on the dashboard (redirected to Vercel)
    await expect(page.locator('text=Sabr By Simran').first()).toBeVisible({ timeout: 30000 });
    
    // Check URL contains vercel.app
    const url = page.url();
    console.log('Final URL after redirect:', url);
    expect(url).toContain('vercel.app');
  });
});

test('dashboard loads with live tracking indicator', async ({ page }) => {
  await page.goto('https://sabar-dashboard.vercel.app', { waitUntil: 'load', timeout: 60000 });
  
  // Check for the dashboard title
  await expect(page.locator('text=Sabr By Simran').first()).toBeVisible({ timeout: 30000 });
  
  // Click Orders tab
  const ordersButton = page.locator('button:has-text("Orders"), a:has-text("Orders")').first();
  await expect(ordersButton).toBeVisible({ timeout: 10000 });
  await ordersButton.click();
  await page.waitForTimeout(1000);
  
  // Check for Live Tracking indicator
  const liveIndicator = page.locator('text=Live Tracking');
  await expect(liveIndicator).toBeVisible({ timeout: 10000 });
  
  console.log('Live Tracking indicator verified on dashboard');
  
  // Take screenshot of live dashboard
  await page.screenshot({ path: '/tmp/live-dashboard-verification.png', fullPage: true });
});
