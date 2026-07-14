// Render favicon-options.html to a viewable PNG (playwright chromium is available in /c/moltbot)
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1180, height: 900 });
  const url = 'file:///C:/moltbot/websites/church-website-studio/09-website-projects/webcare-solutions/favicon-options.html';
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  await page.screenshot({
    path: 'C:/moltbot/websites/church-website-studio/09-website-projects/webcare-solutions/favicon-lab.png',
    fullPage: true
  });
  await browser.close();
  console.log('saved favicon-lab.png');
})().catch(e => { console.error(e); process.exit(1); });
