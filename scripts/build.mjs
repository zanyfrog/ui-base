import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..');
const dist = resolve(root, 'dist');

function copyRequired(relativeSource, relativeDestination = relativeSource) {
  const source = resolve(root, relativeSource);
  const destination = resolve(dist, relativeDestination);

  if (!existsSync(source)) {
    throw new Error(`Required build source is missing: ${relativeSource}`);
  }

  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

function copyOptional(relativeSource, relativeDestination = relativeSource) {
  const source = resolve(root, relativeSource);
  if (!existsSync(source)) return;
  const destination = resolve(dist, relativeDestination);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

const spaRoutes = [
  'package-tests',
  'component-tests',
  'design-system',
  'components',
  'calendar-demo',
  'calendar-demo/day',
  'calendar-demo/week',
  'calendar-demo/month',
  'calendar-demo/year',
  'calendar-demo/date-window',
  'calendar-demo/day-of-week',
  'calendar-demo/day-of-week-paging',
  'calendar',
  'calendar/uib-calendar-day-view',
  'calendar/uib-calendar-week-view',
  'calendar/uib-calendar-month-view',
  'calendar/uib-calendar-year-view',
  'calendar/uib-date-window-view',
  'calendar/uib-day-of-week-view',
  'ui-controls',
  'forms',
  'forms/uib-forms-checkbox',
  'forms/uib-forms-date',
  'forms/uib-forms-email',
  'forms/uib-forms-field',
  'forms/uib-forms-form',
  'forms/uib-forms-input-group',
  'forms/uib-forms-number',
  'forms/uib-forms-password',
  'forms/uib-forms-phone',
  'forms/uib-forms-select',
  'forms/uib-forms-textarea',
  'forms/uib-forms-textbox',
  'forms/uib-forms-wizard',
  'assets-demo',
  'assets-demo/simple',
  'assets-demo/browser',
  'assets-demo/picker',
  'assets-demo/manage',
  'assets-demo/permissions',
  'assets-demo/versions',
  'assets-demo/usage',
  'hero',
  'hero/organization',
  'hero/sample-site',
  'hero/asset-backed-details',
  'tour-ui',
  'tour-ui/new-reservation',
  'tour-ui/cancel-reservation',
  'tour-ui/find-reservation',
  'tour-ui/book-group-reservation'
];

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

copyRequired('apps');
copyRequired('packages');
copyRequired('scripts');
copyRequired('package.json');
copyRequired('README.md');
copyRequired('PACKAGE_GUIDE.md');
copyRequired('apps/demo/index.html', 'index.html');

// Keep existing route folders for source browsing, then ensure every SPA route can be opened directly.
copyOptional('hero');
copyOptional('tour-ui');
copyOptional('ui-controls');
copyOptional('assets-demo');
copyOptional('calendar-demo');
copyOptional('components');
copyOptional('design-system');
copyOptional('package-tests');

for (const route of spaRoutes) {
  copyRequired('apps/demo/index.html', `${route}/index.html`);
}

writeFileSync(
  resolve(dist, 'BUILD_NOTES.txt'),
  `Static demo build. Serve this folder as a web root so all SPA demo routes can be opened directly. Routes included:\n${spaRoutes.map((route) => `/${route}/`).join('\n')}\n`
);

console.log(`Built static demo to ${dist}`);
