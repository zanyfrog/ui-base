import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH ? pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href : 'playwright');
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = process.env.CARD_REFERENCE_STATIC === '1' ? path.join(workspace, 'dist') : workspace;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  let target = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (target !== root && !target.startsWith(root + path.sep)) { res.writeHead(400); res.end(); return; }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!fs.existsSync(target)) target = path.join(root, 'apps/demo/index.html');
  res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream'); res.end(fs.readFileSync(target));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CARD_BROWSER_EXECUTABLE || undefined });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  const origin = `http://127.0.0.1:${server.address().port}`;
  await page.goto(`${origin}/reference/card`);
  await page.locator('[data-new-workspace]').waitFor();
  await page.locator('[data-new-workspace]').click();
  const edit = async (name, value) => { await page.locator(`[data-setting="${name}"]`).fill(value); await page.locator(`[data-setting="${name}"]`).press('Tab'); };
  await edit('displayName', 'Saved summary'); await edit('heading', 'Saved heading');
  await page.locator('[data-setting="interactionMode"]').selectOption('selectable');
  assert.equal(await page.locator('[data-setting="href"]').count(), 0);
  await page.locator('[data-save-workspace]').click();
  assert.match(await page.locator('[data-workspace-status]').textContent(), /revision 2/);
  await page.reload(); await page.locator('[data-setting="heading"]').waitFor();
  assert.equal(await page.locator('[data-setting="heading"]').inputValue(), 'Saved heading');
  assert.equal(await page.locator('[data-setting="displayName"]').inputValue(), 'Saved summary');
  const surface = page.locator('[data-component-preview] uib-card .uib-card');
  await surface.focus(); await page.keyboard.press('Space');
  assert.equal(await surface.getAttribute('aria-pressed'), 'true');
  assert.equal(await surface.evaluate(element => element.getRootNode().activeElement === element), true);
  assert.match(await page.locator('[data-preview-events]').textContent(), /uib-card-select/);
  assert.equal(await page.locator('[data-setting="selected"]').isChecked(), false); // Preview state does not mutate saved settings.
  await page.locator('[data-clone-workspace]').click();
  assert.equal(await page.locator('[data-workspace-list] option').count(), 2);
  const records = await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('ui-base:component-workspaces:v1')).records));
  assert.equal(records[0].componentId, records[1].componentId); assert.notEqual(records[0].instance.instanceId, records[1].instance.instanceId);
  await page.locator('[data-setting="interactionMode"]').selectOption('link');
  await page.locator('[data-validate-workspace]').click(); assert.match(await page.locator('[data-workspace-status]').textContent(), /required/);
  await edit('href', '/would-navigate'); await page.locator('[data-save-workspace]').click();
  await surface.click(); assert.equal(new URL(page.url()).pathname, '/reference/card');
  await page.locator('[data-setting="interactionMode"]').selectOption('action');
  assert.equal(await page.locator('[data-setting="href"]').count(), 0);
  await edit('action', 'preview-action');
  assert.equal(await page.locator('[data-component-preview] uib-card').getAttribute('action'), 'preview-action');
  await surface.focus(); await page.keyboard.press('Enter');
  assert.deepEqual(errors, []);
  assert.match(await page.locator('[data-preview-events]').textContent(), /uib-card-action/);
  await page.locator('[data-reload-workspace]').click();
  assert.equal(await page.locator('[data-setting="interactionMode"]').inputValue(), 'link');
  assert.equal(await page.getByRole('button', { name: 'Check In / Publish', exact: true }).isDisabled(), true);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.locator('[data-delete-workspace]').click(); assert.equal(await page.locator('[data-workspace-list] option').count(), 1);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ browser: browser.version(), staticBuild: root !== workspace, result: 'Workspace CRUD, persisted reload, generated controls, real-card keyboard/action/link preview, mobile layout and stage gate passed.', pageErrors: errors }, null, 2));
} finally {
  await browser?.close(); await new Promise(resolve => server.close(resolve));
}
