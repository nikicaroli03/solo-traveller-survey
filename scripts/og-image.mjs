// Genera public/og.png (1200×630) da scripts/og-template.html usando Microsoft Edge
// già installato (playwright-core non scarica browser). Uso: npm run og-image
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const template = fileURLToPath(new URL('./og-template.html', import.meta.url));
const output = fileURLToPath(new URL('../public/og.png', import.meta.url));

const browser = await chromium.launch({ channel: process.env.OG_BROWSER ?? 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(template).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: output });
await browser.close();
console.log(`Creato ${output}`);
