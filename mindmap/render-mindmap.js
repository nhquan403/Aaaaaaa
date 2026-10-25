// Render mindmap-cau-1.html to a 16:9 PNG and report any card whose content overflows.
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const html = path.join(__dirname, 'mindmap-cau-1.html');
  const out = path.join(__dirname, 'mindmap-cau-1-ebc-x10.png');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  await page.goto('file://' + html);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  const report = await page.evaluate(() => {
    const font = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight);
    const cards = [...document.querySelectorAll('.card, .hub, footer.conc')].map(el => {
      const r = el.getBoundingClientRect();
      return { id: el.id || el.className, top: Math.round(r.top), bottom: Math.round(r.bottom), overflow: el.scrollHeight - el.clientHeight };
    });
    const main = document.querySelector('.main').getBoundingClientRect();
    return { fontsLoaded: [...new Set(font)].length, cards, mainBottom: Math.round(main.bottom), docH: document.documentElement.scrollHeight };
  });
  console.log(JSON.stringify(report, null, 1));

  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  await browser.close();
  console.log('saved', out);
})();
