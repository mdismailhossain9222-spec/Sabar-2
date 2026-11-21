# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\live-tracking.spec.ts >> Sabr By Simran - Live Redirect Verification >> main site /admin redirects to dashboard and loads
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
  6  | test.describe('Sabr By Simran - Live Redirect Verification', () => {
  7  |   test('main site /admin redirects to dashboard and loads', async ({ page }) => {
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
  22 | test('dashboard loads with live tracking indicator', async ({ page }) => {
  23 |   await page.goto('https://sabar-dashboard.vercel.app', { waitUntil: 'load', timeout: 60000 });
  24 |   
  25 |   // Check for the dashboard title
  26 |   await expect(page.locator('text=Sabr By Simran').first()).toBeVisible({ timeout: 30000 });
  27 |   
  28 |   // Click Orders tab
  29 |   const ordersButton = page.locator('button:has-text("Orders"), a:has-text("Orders")').first();
  30 |   await expect(ordersButton).toBeVisible({ timeout: 10000 });
  31 |   await ordersButton.click();
  32 |   await page.waitForTimeout(1000);
  33 |   
  34 |   // Check for Live Tracking indicator
  35 |   const liveIndicator = page.locator('text=Live Tracking');
  36 |   await expect(liveIndicator).toBeVisible({ timeout: 10000 });
  37 |   
  38 |   console.log('Live Tracking indicator verified on dashboard');
  39 |   
  40 |   // Take screenshot of live dashboard
  41 |   await page.screenshot({ path: '/tmp/live-dashboard-verification.png', fullPage: true });
  42 | });
  43 | 
```