import { test, expect } from '@playwright/test';

test.describe('Sabar by Simran UI Tests', () => {
  const URL = 'http://localhost:5179';

  test('Mobile View (iPhone 14)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);

    // Check if Navbar exists
    await expect(page.locator('header nav')).toBeVisible();

    // Check Hero Video
    const video = page.locator('section[aria-labelledby="hero-heading"] video[src="/2.mp4"]');
    await expect(video).toBeVisible();

    // Check Product Grid (should stack)
    const productGrid = page.locator('#collection .grid');
    await expect(productGrid).toBeVisible();

    // Check for horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);

    await page.screenshot({ path: 'mobile-view.png', fullPage: true });
  });

  test('Tablet View (iPad)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(URL);

    const productGrid = page.locator('#collection .grid');
    // On tablet it should be 2 columns
    const columns = await productGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(columns).toBe(2);

    await page.screenshot({ path: 'tablet-view.png', fullPage: true });
  });

  test('Desktop View (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(URL);

    const productGrid = page.locator('#collection .grid');
    // On desktop it should be 4 columns (xl:grid-cols-4)
    const columns = await productGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(columns).toBe(4);

    await page.screenshot({ path: 'desktop-view.png', fullPage: true });
  });
});