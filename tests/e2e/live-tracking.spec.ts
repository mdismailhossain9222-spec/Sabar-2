import { test, expect } from '@playwright/test';

const MAIN_URL = 'https://sabar-2.mdismailhossain9222.workers.dev';
const DASHBOARD_URL = 'https://sabar-dashboard.vercel.app';

test.describe('Sabr By Simran - Live Dashboard Verification', () => {
  test('main site /admin redirects to dashboard and loads real products', async ({ page }) => {
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

test('dashboard loads with real products and live tracking indicator', async ({ page }) => {
  await page.goto('https://sabar-dashboard.vercel.app', { waitUntil: 'load', timeout: 60000 });
  
  // Check for the dashboard title
  await expect(page.locator('text=Sabr By Simran').first()).toBeVisible({ timeout: 30000 });
  
  // Click Products tab
  const productsButton = page.locator('button:has-text("Products"), a:has-text("Products")').first();
  await expect(productsButton).toBeVisible({ timeout: 10000 });
  await productsButton.click();
  await page.waitForTimeout(1000);
  
  // Verify real products are showing (not fake seed data)
  await expect(page.locator('text=The Black Swan')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=The Éclat')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=The Espresso')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=The Coco')).toBeVisible({ timeout: 10000 });
  
  // Verify NO fake seed data (Noor Al-Layl, etc.)
  await expect(page.locator('text=Noor Al-Layl')).not.toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=Zahra Silk')).not.toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=Samar Obsidian')).not.toBeVisible({ timeout: 5000 });
  
  console.log('Real products verified, fake data removed!');
  
  // Click Orders tab to check live tracking
  const ordersButton = page.locator('button:has-text("Orders"), a:has-text("Orders")').first();
  await expect(ordersButton).toBeVisible({ timeout: 10000 });
  await ordersButton.click();
  await page.waitForTimeout(1000);
  
  // Check for Live Tracking indicator
  const liveIndicator = page.locator('text=Live Tracking');
  await expect(liveIndicator).toBeVisible({ timeout: 10000 });
  
  console.log('Live Tracking indicator verified on dashboard');
  
  // Take screenshot of live dashboard with real products
  await page.screenshot({ path: '/tmp/live-dashboard-verification.png', fullPage: true });
});
