const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5176/product/black-swan', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  
  // Check the image container background
  const bg = await page.evaluate(() => {
    const mainImg = document.querySelector('img');
    if (!mainImg) return 'no img';
    let parent = mainImg.parentElement;
    while (parent && parent.tagName !== 'SECTION') {
      const style = window.getComputedStyle(parent);
      const bg = style.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return { tag: parent.tagName, class: parent.className, bg: bg };
      }
      parent = parent.parentElement;
    }
    return 'no bg found';
  });
  console.log('Background:', JSON.stringify(bg));
  
  // Check for red color in computed style
  const hasRed = await page.evaluate(() => {
    const mainImg = document.querySelector('img');
    if (!mainImg) return false;
    let parent = mainImg.parentElement;
    while (parent) {
      const style = window.getComputedStyle(parent);
      const bg = style.backgroundColor;
      if (bg.includes('232') || bg.includes('255, 114') || bg.includes('255,114')) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  });
  console.log('Has red bg:', hasRed);
  
  await browser.close();
})();
