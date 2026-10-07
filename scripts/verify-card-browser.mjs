import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

// Optional real-browser verification. Provide PLAYWRIGHT_MODULE_PATH when using
// a bundled Playwright installation and CARD_BROWSER_EXECUTABLE for a local browser.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href : 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pageHtml = `<!doctype html><html lang="en"><head><title>Card contract probe</title>
<script type="importmap">{"imports":{"@ui-base/core":"/packages/ui-base-core/src/index.js","@ui-base/icons/icon":"/packages/ui-base-icons/src/uib-icon.js"}}</script>
</head><body><script type="module">import {UibCard} from '/packages/ui-base-ui/src/layout/uib-card.js'; window.cardReady = Boolean(UibCard);</script></body></html>`;
const server = createServer((req, res) => {
  if (req.url === '/') { res.setHeader('Content-Type', 'text/html'); res.end(pageHtml); return; }
  const target = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!target.startsWith(path.join(root, 'packages') + path.sep) || !target.endsWith('.js') || !fs.existsSync(target)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', 'text/javascript'); res.end(fs.readFileSync(target));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CARD_BROWSER_EXECUTABLE || undefined });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForFunction(() => window.cardReady);
  const evidence = await page.evaluate(async () => {
    const card = document.createElement('uib-card');
    card.setAttribute('selectable', ''); card.setAttribute('heading', 'Summary');
    card.innerHTML = '<button>Child action</button><p>Body</p>';
    document.body.append(card);
    const outer = () => card.shadowRoot.querySelector('.uib-card');
    const child = card.querySelector('button');
    child.click();
    const childClickIgnored = !card.selected;
    const childKey = new KeyboardEvent('keydown', { key: ' ', bubbles: true, composed: true, cancelable: true });
    child.dispatchEvent(childKey);
    const nestedSpacePrevented = childKey.defaultPrevented;
    outer().focus();
    const focusedBefore = card.shadowRoot.activeElement === outer();
    outer().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true }));
    const selectedAfterEnter = card.selected;
    const focusedAfterSelection = card.shadowRoot.activeElement === outer();
    const footer = document.createElement('span'); footer.slot = 'footer'; footer.textContent = 'Late footer'; card.append(footer);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const lateFooterHidden = card.shadowRoot.querySelector('[part="footer"]').hidden;
    card.setAttribute('aria-label', 'Override');
    const ariaLabelForwarded = outer().getAttribute('aria-label');
    return { childClickIgnored, nestedSpacePrevented, focusedBefore, selectedAfterEnter, focusedAfterSelection, lateFooterHidden, ariaLabelForwarded };
  });
  assert.equal(evidence.childClickIgnored, true);
  assert.equal(evidence.focusedBefore, true);
  assert.equal(evidence.selectedAfterEnter, true);
  assert.equal(evidence.nestedSpacePrevented, false);
  assert.equal(evidence.focusedAfterSelection, true);
  assert.equal(evidence.lateFooterHidden, false);
  assert.equal(evidence.ariaLabelForwarded, 'Override');
  await page.evaluate(() => { window.nativeChildClicks = 0; document.querySelector('uib-card button').addEventListener('click', () => window.nativeChildClicks++); });
  await page.locator('uib-card > button').focus(); await page.keyboard.press('Space');
  const native = await page.evaluate(() => ({ childClicks: window.nativeChildClicks, cardSelected: document.querySelector('uib-card').selected }));
  assert.equal(native.childClicks, 1); assert.equal(native.cardSelected, true);
  console.log(JSON.stringify({ browser: browser.version(), assertions: 9, evidence, native, interpretation: 'Approved rendering and keyboard regressions pass, including native child Space activation. This is not screen-reader certification.' }, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
