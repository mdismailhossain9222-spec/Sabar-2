import { test, expect } from '@playwright/test';

// Bypass Playwright's strict "stable" hover check (the page has intentional
// infinite decorative animations like the marquee). We measure the button's
// own geometry directly to prove the hover no longer causes a flicker loop.
test('Order Now button hover is stable (no flicker loop)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5179');
  const card = page.locator('#collection .grid article').first();
  await card.waitFor({ state: 'visible' });
  // Let all in-view transitions settle before measuring.
  await page.waitForTimeout(2500);

  const btn = card.locator('button:has-text("Order Now")');
  await btn.waitFor({ state: 'visible' });

  const transitions = await btn.evaluate((el) => {
    const cs = window.getComputedStyle(el);
    return { transitionProperty: cs.transitionProperty, transitionDuration: cs.transitionDuration };
  });
  console.log('Transitions:', JSON.stringify(transitions));
  expect(transitions.transitionProperty).not.toContain('all');

  const box = await btn.boundingBox();
  // Move the cursor directly to the button centre and hold it there.
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(100);

  const samples = [];
  for (let i = 0; i < 40; i++) {
    const b = await btn.boundingBox();
    samples.push({ x: b.x, y: b.y, w: b.width, h: b.height });
    await page.waitForTimeout(50);
  }
  const xs = new Set(samples.map((s) => s.x.toFixed(2)));
  const ys = new Set(samples.map((s) => s.y.toFixed(2)));
  const ws = new Set(samples.map((s) => s.w.toFixed(2)));
  const hs = new Set(samples.map((s) => s.h.toFixed(2)));
  console.log('Distinct positions during hover -> x:', xs.size, 'y:', ys.size, 'w:', ws.size, 'h:', hs.size);
  // A flicker loop would produce many distinct positions as the button jumps.
  expect(xs.size).toBeLessThanOrEqual(2);
  expect(ys.size).toBeLessThanOrEqual(2);
  expect(ws.size).toBeLessThanOrEqual(2);
  expect(hs.size).toBeLessThanOrEqual(2);
});

test('Liquid glass button hover does not change dimensions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5179');
  const card = page.locator('#collection .grid article').first();
  await card.waitFor({ state: 'visible' });
  await page.waitForTimeout(2500);

  const btn = card.locator('button:has-text("Order Now")');
  await btn.waitFor({ state: 'visible' });

  const before = await btn.boundingBox();
  const box = before;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(600);
  const after = await btn.boundingBox();
  console.log('Before hover:', before, 'After hover:', after);
  expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);
});