// סקריפט רינדור — ממיר את קבצי ה-HTML של הפרויקט ל-PNG/PDF אמיתיים
// הרצה: node scripts/render.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const EXPORTS = path.join(ROOT, '07-exports');

function fileUrl(p) { return 'file://' + p; }

async function shootElement(page, url, selector, outPath, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(fileUrl(url), { waitUntil: 'networkidle' });
  await page.waitForTimeout(150);
  const el = await page.$(selector);
  if (!el) throw new Error(`selector not found: ${selector} in ${url}`);
  await el.screenshot({ path: outPath });
  console.log('✓ PNG', path.relative(ROOT, outPath));
}

async function main() {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage();

  // ---------- 1) תיק העבודות: 14 עמודים -> PNG לכל עמוד + PDF מלא ----------
  const deckDir = path.join(EXPORTS, 'deck-pages');
  fs.mkdirSync(deckDir, { recursive: true });
  const portfolioPath = path.join(ROOT, '01-portfolio-deck', 'portfolio.html');
  await page.setViewportSize({ width: 1240, height: 1150 });
  await page.goto(fileUrl(portfolioPath), { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  for (let i = 1; i <= 14; i++) {
    const sel = `#p${i}`;
    const el = await page.$(sel);
    if (!el) { console.warn('missing page', sel); continue; }
    // scrollIntoView + viewport screenshot (not elementHandle.screenshot) —
    // element screenshots don't reliably composite nested iframe content.
    await el.evaluate((node) => node.scrollIntoView());
    await page.waitForTimeout(120);
    const num = String(i).padStart(2, '0');
    await page.screenshot({ path: path.join(deckDir, `page-${num}.png`) });
    console.log('✓ PNG deck page', num);
  }

  await page.pdf({
    path: path.join(ROOT, '01-portfolio-deck', 'portfolio.pdf'),
    width: '1240px',
    height: '1150px',
    printBackground: true,
    margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
  });
  console.log('✓ PDF portfolio.pdf');

  // ---------- 2) מוקאפ אינסטגרם ----------
  const gridDir = path.join(EXPORTS, 'grid');
  fs.mkdirSync(gridDir, { recursive: true });
  await shootElement(
    page,
    path.join(ROOT, '02-instagram-grid', 'grid-mockup.html'),
    '.ig-wrap',
    path.join(gridDir, 'grid-mockup.png'),
    { width: 1180, height: 1700 }
  );

  // ---------- 3) קרוסלה: 7 שקופיות ----------
  const carDir = path.join(EXPORTS, 'carousel');
  fs.mkdirSync(carDir, { recursive: true });
  for (let i = 1; i <= 7; i++) {
    await shootElement(
      page,
      path.join(ROOT, '03-carousel', `slide-${i}.html`),
      '.slide',
      path.join(carDir, `slide-${i}.png`),
      { width: 1080, height: 1350 }
    );
  }

  // ---------- 4) סטוריז: 5 קבצים ----------
  const storyDir = path.join(EXPORTS, 'stories');
  fs.mkdirSync(storyDir, { recursive: true });
  for (let i = 1; i <= 5; i++) {
    await shootElement(
      page,
      path.join(ROOT, '04-stories', `story-${i}.html`),
      '.story',
      path.join(storyDir, `story-${i}.png`),
      { width: 1080, height: 1920 }
    );
  }

  // ---------- 5) סטוריבורד לרילס: 2 עמודים + PDF ----------
  const reelDir = path.join(EXPORTS, 'reel');
  fs.mkdirSync(reelDir, { recursive: true });
  const reelPath = path.join(ROOT, '05-reel-storyboard', 'reel-storyboard.html');
  await page.setViewportSize({ width: 1240, height: 1150 });
  await page.goto(fileUrl(reelPath), { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  for (let i = 1; i <= 2; i++) {
    const el = await page.$(`#r${i}`);
    await el.evaluate((node) => node.scrollIntoView());
    await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(reelDir, `storyboard-0${i}.png`) });
    console.log('✓ PNG reel page', i);
  }
  await page.pdf({
    path: path.join(ROOT, '05-reel-storyboard', 'reel-storyboard.pdf'),
    width: '1240px',
    height: '1150px',
    printBackground: true,
    margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
  });
  console.log('✓ PDF reel-storyboard.pdf');

  await browser.close();
  console.log('\nDone.');
}

main().catch((e) => { console.error(e); process.exit(1); });
