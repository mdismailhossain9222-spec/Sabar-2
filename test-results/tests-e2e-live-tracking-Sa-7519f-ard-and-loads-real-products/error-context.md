# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\live-tracking.spec.ts >> Sabr By Simran - Live Dashboard Verification >> main site /admin redirects to dashboard and loads real products
- Location: tests\e2e\live-tracking.spec.ts:7:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "https://sabar-2.mdismailhossain9222.workers.dev/admin", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const MAIN_URL = 'https://sabar-2.mdismailhossain9222.workers.dev';
  4  | const DASHBOARD_URL = 'https://sabar-dashboard.vercel.app';
  5  | 
  6  | test.describe('Sabr By Simran - Live Dashboard Verification', () => {
  7  |   test('main site /admin redirects to dashboard and loads real products', async ({ page }) => {
> 8  |     const response = await page.goto(`${MAIN_URL}/admin`, { waitUntil: 'load', timeout: 60000 });
     |                                 ^ Error: page.goto: Test timeout of 30000ms exceeded.
  9  |     console.log('/admin redirect status:', response?.status());
  10 |     expect(response?.status()).toBeLessThan(400);
  11 |     
  12 |     // Verify we're on the dashboard (redirected to Vercel)
  13 |     await expect(page.locator('text=Sabr By Simran').first()).toBeVisible({ timeout: 30000 });
  14 |     
  15 |     // Check URL contains vercel.app
  16 |     const url = page.url();
  17 |     console.log('Final URL after redirect:', url);
  18 |     expect(url).toContain('vercel.app');
  19 |   });
  20 | });
  21 | 
  22 | test('dashboard loads with real products and live tracking indicator', async ({ page }) => {
  23 |   await page.goto('https://sabar-dashboard.vercel.app', { waitUntil: 'load', timeout: 60000 });
  24 |   
  25 |   // Check for the dashboard title
  26 |   await expect(page.locator('text=Sabr By Simran').first()).toBeVisible({ timeout: 30000 });
  27 |   
  28 |   // Click Products tab
  29 |   const productsButton = page.locator('button:has-text("Products"), a:has-text("Products")').first();
  30 |   await expect(productsButton).toBeVisible({ timeout: 10000 });
  31 |   await productsButton.click();
  32 |   await page.waitForTimeout(1000);
  33 |   
  34 |   // Verify real products are showing (not fake seed data)
  35 |   await expect(page.locator('text=The Black Swan')).toBeVisible({ timeout: 10000 });
  36 |   await expect(page.locator('text=The Éclat')).toBeVisible({ timeout: 10000 });
  37 |   await expect(page.locator('text=The Espresso')).toBeVisible({ timeout: 10000 });
  38 |   await expect(page.locator('text=The Coco')).toBeVisible({ timeout: 10000 });
  39 |   
  40 |   // Verify NO fake seed data (Noor Al-Layl, etc.)
  41 |   await expect(page.locator('text=Noor Al-Layl')).not.toBeVisible({ timeout: 5000 });
  42 |   await expect(page.locator('text=Zahra Silk')).not.toBeVisible({ timeout: 5000 });
  43 |   await expect(page.locator('text=Samar Obsidian')).not.toBeVisible({ timeout: 5000 });
  44 |   
  45 |   console.log('Real products verified, fake data removed!');
  46 |   
  47 |   // Click Orders tab to check live tracking
  48 |   const ordersButton = page.locator('button:has-text("Orders"), a:has-text("Orders")').first();
  49 |   await expect(ordersButton).toBeVisible({ timeout: 10000 });
  50 |   await ordersButton.click();
  51 |   await page.waitForTimeout(1000);
  52 |   
  53 |   // Check for Live Tracking indicator
  54 |   const liveIndicator = page.locator('text=Live Tracking');
  55 |   await expect(liveIndicator).toBeVisible({ timeout: 10000 });
  56 |   
  57 |   console.log('Live Tracking indicator verified on dashboard');
  58 |   
  59 |   // Take screenshot of live dashboard with real products
  60 |   await page.screenshot({ path: '/tmp/live-dashboard-verification.png', fullPage: true });
  61 | });
  62 | 
```