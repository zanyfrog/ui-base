import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..');
const requiredFiles = [
  'packages/ui-base-core/package.json',
  'packages/ui-base-core/README.md',
  'packages/ui-base-core/src/index.js',
  'packages/ui-base-core/src/base-element.js',
  'packages/ui-base-core/src/localization.js',
  'packages/ui-base-core/src/validation.js',
  'packages/ui-base-core/src/metadata.js',
  'packages/ui-base-design-system/package.json',
  'packages/ui-base-design-system/README.md',
  'packages/ui-base-design-system/src/tokens.css',
  'packages/ui-base-design-system/src/a11y.css',
  'packages/ui-base-design-system/docs/DESIGN_SYSTEM.md',
  'packages/ui-base-design-system/docs/ACCESSIBILITY_STANDARD.md',
  'packages/ui-base-design-system/docs/COMPONENT_SPECIFICATION_TEMPLATE.md',
  'packages/ui-base-design-system/docs/VERSIONING_AND_LIFECYCLE.md',
  'packages/ui-base-design-system/docs/PACKAGE_ROADMAP.md',
  'packages/ui-base-theme/package.json',
  'packages/ui-base-theme/README.md',
  'packages/ui-base-theme/src/default.css',
  'packages/ui-base-theme/src/dark.css',
  'packages/ui-base-theme/src/sample-tour.css',
  'packages/ui-base-icons/package.json',
  'packages/ui-base-icons/README.md',
  'packages/ui-base-icons/src/index.js',
  'packages/ui-base-icons/src/uib-icon.js',
  'packages/ui-base-icons/src/icon-registry.js',
  'packages/ui-base-ui/package.json',
  'packages/ui-base-ui/README.md',
  'packages/ui-base-ui/src/index.js',
  'packages/ui-base-ui/src/styles.css',
  'packages/ui-base-ui/src/help/uib-help.js',
  'packages/ui-base-ui/src/label/uib-label.js',
  'packages/ui-base-ui/src/forms/uib-toggle.js',
  'packages/ui-base-ui/src/forms/uib-checkbox.js',
  'packages/ui-base-ui/src/content/uib-eyebrow.js',
  'packages/ui-base-ui/src/content/uib-heading-block.js',
  'packages/ui-base-ui/src/actions/uib-action-button.js',
  'packages/ui-base-ui/src/actions/uib-action-group.js',
  'packages/ui-base-ui/src/media/uib-media.js',
  'packages/ui-base-ui/src/details/uib-detail-item.js',
  'packages/ui-base-ui/src/details/uib-detail-item-edit.js',
  'packages/ui-base-ui/src/details/uib-detail-list.js',
  'packages/ui-base-ui/src/details/uib-detail-list-editor.js',
  'packages/ui-base-ui/src/navigation/uib-menu.js',
  'packages/ui-base-ui/src/navigation/uib-menuitem.js',
  'packages/ui-base-ui/src/layout/index.js',
  'packages/ui-base-ui/src/metadata/index.js',
  'packages/ui-base-ui/src/reservations/base-tour-reservation.js',
  'packages/ui-base-ui/src/reservations/uib-new-reservation.js',
  'packages/ui-base-ui/src/reservations/uib-cancel-reservation.js',
  'packages/ui-base-ui/src/reservations/uib-find-reservation.js',
  'packages/ui-base-ui/src/reservations/uib-book-group-reservation.js',
  'packages/ui-base-forms/package.json',
  'packages/ui-base-forms/README.md',
  'packages/ui-base-forms/src/index.js',
  'packages/ui-base-forms/src/uib-forms-form.js',
  'packages/ui-base-forms/src/form-control-base.js',
  'packages/ui-base-forms/src/controls/uib-forms-textbox.js',
  'packages/ui-base-forms/src/controls/uib-forms-number.js',
  'packages/ui-base-forms/src/controls/uib-forms-date.js',
  'packages/ui-base-forms/src/controls/uib-forms-email.js',
  'packages/ui-base-forms/src/controls/uib-forms-password.js',
  'packages/ui-base-forms/src/controls/uib-forms-phone.js',
  'packages/ui-base-forms/src/controls/uib-forms-textarea.js',
  'packages/ui-base-forms/src/controls/uib-forms-select.js',
  'packages/ui-base-forms/src/controls/uib-forms-checkbox.js',
  'packages/ui-base-forms/src/layout/uib-forms-field.js',
  'packages/ui-base-forms/src/layout/uib-forms-input-group.js',
  'packages/ui-base-forms/src/layout/uib-forms-wizard.js',
  'packages/ui-base-hero/package.json',
  'packages/ui-base-hero/README.md',
  'packages/ui-base-hero/src/index.js',
  'packages/ui-base-hero/src/uib-hero.js',
  'packages/ui-base-hero/src/defaults.js',
  'packages/ui-base-calendar/package.json',
  'packages/ui-base-calendar/README.md',
  'packages/ui-base-calendar/src/index.js',
  'packages/ui-base-calendar/src/metadata.js',
  'packages/ui-base-assets/package.json',
  'packages/ui-base-assets/README.md',
  'packages/ui-base-assets/src/index.js',
  'packages/ui-base-assets/src/asset-core.js',
  'packages/ui-base-assets/src/models/index.js',
  'packages/ui-base-assets/src/providers/index.js',
  'packages/ui-base-assets/src/providers/mock-asset-provider.js',
  'packages/ui-base-assets/src/providers/orm-asset-provider.js',
  'packages/ui-base-assets/src/components/uib-asset-browser.js',
  'packages/ui-base-assets/src/components/uib-asset-list.js',
  'packages/ui-base-assets/src/components/uib-asset-grid.js',
  'packages/ui-base-assets/src/components/uib-asset-preview.js',
  'packages/ui-base-assets/src/components/uib-asset-details.js',
  'packages/ui-base-assets/src/components/uib-asset-filter-bar.js',
  'packages/ui-base-assets/src/components/uib-asset-search.js',
  'packages/ui-base-assets/src/components/uib-asset-picker-dialog.js',
  'packages/ui-base-assets/src/components/uib-asset-image.js',
  'packages/ui-base-assets/src/components/uib-visual-source-control.js',
  'packages/ui-base-assets/src/components/uib-asset-thumbnail.js',
  'packages/ui-base-assets/src/components/uib-asset-uploader.js',
  'packages/ui-base-assets/src/components/uib-asset-metadata-editor.js',
  'packages/ui-base-assets/src/components/uib-asset-version-history.js',
  'packages/ui-base-assets/src/components/uib-asset-usage.js',
  'packages/ui-base-assets/src/components/uib-asset-permission-panel.js',
  'packages/ui-base-assets/src/components/uib-asset-permission-set-picker.js',
  'packages/ui-base-tour-ui/package.json',
  'packages/ui-base-tour-ui/README.md',
  'packages/ui-base-tour-ui/src/index.js',
  'packages/ui-base-tour-ui/src/reservations/base-tour-reservation.js',
  'packages/ui-base-tour-ui/src/reservations/uib-new-reservation.js',
  'packages/ui-base-tour-ui/src/reservations/uib-cancel-reservation.js',
  'packages/ui-base-tour-ui/src/reservations/uib-find-reservation.js',
  'packages/ui-base-tour-ui/src/reservations/uib-book-group-reservation.js',
  'apps/demo/src/main.js',
  'apps/demo/src/routes/design-system-demo.js',
  'apps/demo/src/routes/component-catalog-demo.js',
  'apps/demo/src/routes/component-tests-demo.js',
  'apps/demo/src/routes/hero-demo.js',
  'apps/demo/src/routes/tour-ui-demo.js',
  'apps/demo/src/routes/calendar-package-demo.js',
  'apps/demo/src/routes/calendar-demo.js',
  'apps/demo/src/routes/assets-demo.js',
  'apps/demo/src/routes/ui-controls-demo.js',
  'apps/demo/src/routes/forms-demo.js',
  'package-tests/index.html',
  'design-system/index.html',
  'components/index.html',
  'calendar-demo/index.html',
  'hero/index.html',
  'hero/organization/index.html',
  'hero/sample-site/index.html',
  'hero/asset-backed-details/index.html',
  'tour-ui/index.html',
  'tour-ui/new-reservation/index.html',
  'tour-ui/cancel-reservation/index.html',
  'tour-ui/find-reservation/index.html',
  'tour-ui/book-group-reservation/index.html',
  'ui-controls/index.html',
  'assets-demo/index.html',
  'assets-demo/browser/index.html',
  'assets-demo/picker/index.html',
  'assets-demo/manage/index.html',
  'assets-demo/permissions/index.html',
  'assets-demo/versions/index.html',
  'assets-demo/usage/index.html',
  'docs/UI_BASE_DESIGN_SYSTEM.md',
  'docs/PACKAGE_ROADMAP.md',
  'docs/COMPONENT_SPECIFICATION_TEMPLATE.md',
  'docs/ACCESSIBILITY_STANDARD.md',
  'docs/VERSIONING_AND_LIFECYCLE.md',
  'docs/UPDATING_SEPARATE_APPS.md',
  'PACKAGE_GUIDE.md'
];

let failed = false;
for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

for (const removed of ['apps/demo/src/routes/sample-tour.js', 'apps/demo/docs/SAMPLE_TOUR_PACKAGE_UPDATES.md', 'sample-tour/index.html']) {
  if (existsSync(join(root, removed))) {
    console.error(`Sample Tour app artifact should not be in package workspace: ${removed}`);
    failed = true;
  }
}

const routeSourceFiles = [
  'apps/demo/src/main.js',
  'apps/demo/src/routes/design-system-demo.js',
  'apps/demo/src/routes/component-catalog-demo.js',
  'apps/demo/src/routes/component-tests-demo.js',
  'apps/demo/src/routes/hero-demo.js',
  'apps/demo/src/routes/tour-ui-demo.js',
  'apps/demo/src/routes/calendar-package-demo.js',
  'apps/demo/src/routes/calendar-demo.js',
  'apps/demo/src/routes/assets-demo.js',
  'apps/demo/src/routes/ui-controls-demo.js',
  'apps/demo/src/routes/forms-demo.js'
];
for (const route of ['/package-tests/', '/component-tests/', '/design-system/', '/components/', '/assets-demo/', '/assets-demo/browser', '/assets-demo/picker', '/assets-demo/manage', '/assets-demo/permissions', '/assets-demo/versions', '/assets-demo/usage', '/calendar-demo/', '/calendar/', '/calendar/uib-calendar-day-view', '/calendar/uib-calendar-week-view', '/calendar/uib-calendar-month-view', '/calendar/uib-calendar-year-view', '/calendar/uib-date-window-view', '/calendar/uib-day-of-week-view', '/ui-controls/', '/forms/', '/forms/uib-forms-checkbox', '/forms/uib-forms-date', '/forms/uib-forms-email', '/forms/uib-forms-field', '/forms/uib-forms-form', '/forms/uib-forms-input-group', '/forms/uib-forms-number', '/forms/uib-forms-password', '/forms/uib-forms-phone', '/forms/uib-forms-select', '/forms/uib-forms-textarea', '/forms/uib-forms-textbox', '/forms/uib-forms-wizard', '/hero/', '/hero/organization', '/hero/sample-site', '/hero/asset-backed-details', '/tour-ui/', '/tour-ui/new-reservation', '/tour-ui/cancel-reservation', '/tour-ui/find-reservation', '/tour-ui/book-group-reservation']) {
  if (!routeSourceFiles.some((file) => readFileSync(join(root, file), 'utf8').includes(route))) {
    console.error(`Route source is missing ${route}`);
    failed = true;
  }
}

const mainSource = readFileSync(join(root, 'apps/demo/src/main.js'), 'utf8');
if (mainSource.includes('renderSampleTourRoute') || mainSource.includes('/sample-tour/')) {
  console.error('Demo app still references the Sample Tour route.');
  failed = true;
}

const uiComponentSource = readFileSync(join(root, 'packages/ui-base-ui/src/index.js'), 'utf8');
for (const exportName of ['UibHelp', 'UibLabel', 'UibToggle', 'UibCheckbox', 'UibEyebrow', 'UibHeadingBlock', 'UibActionButton', 'UibActionGroup', 'UibMedia', 'UibDetailItem', 'UibDetailItemEdit', 'UibDetailList', 'UibDetailListEditor', 'UibMenu', 'UibMenuItem', 'UibStack', 'UibGrid', 'UibRow', 'UibColumn', 'UibPanel', 'UibCard', 'UibDialog', 'UibAccordion', 'UibTabs', 'UibSplitter', 'UibNewReservation', 'UibCancelReservation', 'UibFindReservation', 'UibBookGroupReservation']) {
  if (!uiComponentSource.includes(exportName)) {
    console.error(`UI package index is missing export: ${exportName}`);
    failed = true;
  }
}

const formsSource = readFileSync(join(root, 'packages/ui-base-forms/src/index.js'), 'utf8');
for (const exportName of ['UibFormsForm', 'UibFormsTextbox', 'UibFormsNumber', 'UibFormsDate', 'UibFormsEmail', 'UibFormsPassword', 'UibFormsPhone', 'UibFormsTextarea', 'UibFormsSelect', 'UibFormsCheckbox', 'UibFormsField', 'UibFormsInputGroup', 'UibFormsWizard']) {
  if (!formsSource.includes(exportName)) {
    console.error(`Forms package index is missing export: ${exportName}`);
    failed = true;
  }
}

const calendarSource = readFileSync(join(root, 'packages/ui-base-calendar/src/index.js'), 'utf8');
for (const exportName of ['UibCalendarDayView', 'UibCalendarWeekView', 'UibCalendarMonthView', 'UibCalendarYearView', 'UibDateWindowView', 'UibDayOfWeekView']) {
  if (!calendarSource.includes(exportName)) {
    console.error(`Calendar package index is missing export: ${exportName}`);
    failed = true;
  }
}

const uiHeroSource = readFileSync(join(root, 'packages/ui-base-ui/src/hero/uib-hero.js'), 'utf8');
if (!uiHeroSource.includes('@ui-base/hero')) {
  console.error('UI hero compatibility entry must re-export @ui-base/hero.');
  failed = true;
}
const uiReservationSource = readFileSync(join(root, 'packages/ui-base-ui/src/reservations/index.js'), 'utf8');
if (!uiReservationSource.includes('@ui-base/tour-ui')) {
  console.error('UI reservation compatibility entries must re-export @ui-base/tour-ui.');
  failed = true;
}


const assetsComponentSource = readFileSync(join(root, 'packages/ui-base-assets/src/index.js'), 'utf8');
for (const exportName of ['UibAssetBrowser', 'UibAssetList', 'UibAssetGrid', 'UibAssetPreview', 'UibAssetDetails', 'UibAssetFilterBar', 'UibAssetSearch', 'UibAssetPickerDialog', 'UibAssetImage', 'UibVisualSourceControl', 'UibAssetThumbnail', 'UibAssetUploader', 'UibAssetMetadataEditor', 'UibAssetVersionHistory', 'UibAssetUsage', 'UibAssetPermissionPanel', 'UibAssetPermissionSetPicker', 'createMockAssetProvider', 'createOrmAssetProvider']) {
  if (!assetsComponentSource.includes(exportName)) {
    console.error(`Assets package index is missing export: ${exportName}`);
    failed = true;
  }
}

const heroComponentSource = readFileSync(join(root, 'packages/ui-base-hero/src/index.js'), 'utf8');
if (!heroComponentSource.includes('UibHero')) {
  console.error('Hero package index is missing export: UibHero');
  failed = true;
}
for (const exportName of ['applyHeroDefaults', 'createSampleTourHeroDefaults', 'SAMPLE_TOUR_HERO_DEFAULTS']) {
  if (!heroComponentSource.includes(exportName)) {
    console.error(`Hero package index is missing export: ${exportName}`);
    failed = true;
  }
}

function walk(dir, found = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', 'dist', 'package-output'].includes(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, found);
    else if (/\.(mjs|js)$/.test(entry)) found.push(full);
  }
  return found;
}

for (const file of walk(root)) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.error?.message || result.stderr || result.stdout || `Syntax check failed for ${file}.`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('All required package workspace files exist and JavaScript syntax checks passed.');
