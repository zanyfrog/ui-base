import { createMockAssetProvider } from '@ui-base/assets';

let ASSET_ROUTES = [
  { path: '/assets-demo/simple', label: 'Form Picker', description: 'Compact picker field for attaching an image/file/asset to a form field.' },
  { path: '/assets-demo/browser', label: 'Browser', description: 'List/grid/split browsing with search and filters.' },
  { path: '/assets-demo/picker', label: 'Picker', description: 'Form-field picker with selected thumbnail/name and Browse -> search-first modal.' },
  { path: '/assets-demo/manage', label: 'Manage', description: 'Upload, create, edit, archive, and restore examples.' },
  { path: '/assets-demo/permissions', label: 'Permissions', description: 'Mock users with different resolved item permissions.' },
  { path: '/assets-demo/versions', label: 'Versions', description: 'Pinned/latest, draft, pending review, and approved version examples.' },
  { path: '/assets-demo/usage', label: 'Usage', description: 'Where-used records and restricted usage behavior.' }
];

let MODE_OPTIONS = [
  { value: 'browse', label: 'browse - browse/details mode' },
  { value: 'pick', label: 'pick - selection mode' },
  { value: 'manage', label: 'manage - upload/manage mode' },
  { value: 'simple', label: 'simple - picker alias' }
];
let DIALOG_PICKER_MODE_OPTIONS = [
  { value: 'pick', label: 'pick - choose and return selection' },
  { value: 'browse', label: 'browse - browse with details' },
  { value: 'manage', label: 'manage - upload/manage in dialog' },
  { value: 'simple', label: 'simple - form-picker style in dialog' }
];
let VIEW_OPTIONS = [
  { value: 'list', label: 'list' },
  { value: 'grid', label: 'grid' }
];
let LAYOUT_OPTIONS = [
  { value: 'split', label: 'split - results plus details rail' },
  { value: 'full', label: 'full - results only' }
];
let SELECTION_OPTIONS = [
  { value: 'single', label: 'single' },
  { value: 'multiple', label: 'multiple' }
];
let CATEGORY_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'general', label: 'general' },
  { value: 'hero', label: 'hero' },
  { value: 'logo', label: 'logo' },
  { value: 'document', label: 'document' },
  { value: 'background', label: 'background' },
  { value: 'detail-icon', label: 'detail-icon' }
];
let ASSET_TYPE_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'image', label: 'image' },
  { value: 'icon', label: 'icon' },
  { value: 'document', label: 'document' },
  { value: 'pdf', label: 'pdf' },
  { value: 'svg', label: 'svg' },
  { value: 'json', label: 'json' },
  { value: 'other', label: 'other' }
];
let SCOPE_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'application', label: 'application' },
  { value: 'shared', label: 'shared' },
  { value: 'global', label: 'global' }
];
let VISIBILITY_OPTIONS = [
  { value: '', label: 'Not set' },
  { value: 'public', label: 'public' },
  { value: 'application_private', label: 'application_private' },
  { value: 'shared_private', label: 'shared_private' },
  { value: 'global_private', label: 'global_private' },
  { value: 'admin_only', label: 'admin_only' }
];
let STATUS_OPTIONS = [
  { value: 'active', label: 'active' },
  { value: 'archived', label: 'archived' },
  { value: 'all', label: 'all' }
];
let ACTOR_OPTIONS = [
  { value: 'admin', label: 'admin' },
  { value: 'viewer', label: 'viewer' },
  { value: 'restricted', label: 'restricted' }
];

let PROVIDER_MODE_OPTIONS = [
  { value: 'mock', label: 'Mock demo provider - in memory' },
  { value: 'orm', label: 'ORM server - live assets' }
];


function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function routeList(currentPath) {
  return `
    <nav class="route-list" aria-label="Asset examples">
      <a class="route-button" href="/assets-demo/" data-link ${currentPath === '/assets-demo' ? 'aria-current="page"' : ''}>Overview</a>
      ${ASSET_ROUTES.map((route) => `<a class="route-button" href="${route.path}" data-link ${currentPath === route.path ? 'aria-current="page"' : ''}>${route.label}</a>`).join('')}
    </nav>
  `;
}

function field(id, label, value = '', type = 'text') {
  return `<div class="field"><label for="${id}">${escapeHtml(label)}</label><input id="${id}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" /></div>`;
}

function numberField(id, label, value = '') {
  return field(id, label, value, 'number');
}

function optionHtml(option, selectedValue) {
  const item = typeof option === 'string' ? { value: option, label: option } : option;
  const value = String(item.value ?? '');
  const selected = value === String(selectedValue ?? '') ? 'selected' : '';
  return `<option value="${escapeHtml(value)}" ${selected}>${escapeHtml(item.label ?? value)}</option>`;
}

function selectField(id, label, options, value = '') {
  return `
    <div class="field">
      <label for="${id}">${escapeHtml(label)}</label>
      <select id="${id}">${options.map((option) => optionHtml(option, value)).join('')}</select>
    </div>
  `;
}

function checkboxField(id, label, checked = false) {
  return `
    <label class="checkbox-row" for="${id}">
      <input id="${id}" type="checkbox" ${checked ? 'checked' : ''} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function status(main, text) {
  const box = main.querySelector('#assetStatus');
  if (box) box.textContent = text;
}

function providerMode(main) {
  return main.querySelector('#providerMode')?.value || 'orm';
}

function apiBaseUrl(main) {
  return main.querySelector('#apiBaseUrl')?.value || 'http://localhost:4020';
}

function ormHeadersFromControls(main) {
  const appKey = main.querySelector('#applicationKey')?.value || 'demo-app';
  const headers = {};
  if (main.querySelector('#ormAdmin')?.checked) headers['X-Orm-Admin'] = 'true';
  if (main.querySelector('#applicationAdmin')?.checked) headers['X-Application-Admin'] = appKey;
  if (main.querySelector('#sharedAssetAdmin')?.checked) headers['X-Shared-Asset-Admin'] = 'true';
  if (main.querySelector('#globalAssetAdmin')?.checked) headers['X-Global-Asset-Admin'] = 'true';
  const adminApps = main.querySelector('#adminApplications')?.value || appKey;
  if (adminApps) headers['X-Admin-Applications'] = adminApps;
  return headers;
}

function providerFromControls(main) {
  if (providerMode(main) !== 'mock') return null;
  return createMockAssetProvider({
    applicationKey: main.querySelector('#applicationKey')?.value || 'demo-app',
    actorProfile: main.querySelector('#actorProfile')?.value || 'admin'
  });
}

function normalizeTargets(targets) {
  const value = typeof targets === 'function' ? targets() : targets;
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value.length === 'number' && !value.tagName) return Array.from(value).filter(Boolean);
  return [value].filter(Boolean);
}

function serializeComponent(element) {
  if (!element) return 'No component mounted.';
  const tag = element.tagName.toLowerCase();
  const attrs = Array.from(element.attributes)
    .filter((attr) => attr.name !== 'id')
    .map((attr) => (attr.value === '' ? `  ${attr.name}` : `  ${attr.name}="${attr.value}"`));
  if (!attrs.length) return `<${tag}></${tag}>`;
  return `<${tag}\n${attrs.join('\n')}\n></${tag}>`;
}

function updateMarkup(main, targets) {
  const output = main.querySelector('#componentMarkup');
  if (!output) return;
  output.textContent = serializeComponent(normalizeTargets(targets)[0]);
}

function setTargetAttribute(target, config, input) {
  const attr = config.attr;
  if (!target || !attr) return;
  if (config.type === 'bool') {
    if (input.checked) target.setAttribute(attr, 'true');
    else target.removeAttribute(attr);
    return;
  }
  const value = String(input.value ?? '');
  if (attr === 'value' && 'value' in target) {
    target.value = value;
    if (value || config.removeOnEmpty === false) target.setAttribute(attr, value);
    else target.removeAttribute(attr);
    return;
  }
  if (value === '' && config.removeOnEmpty !== false) target.removeAttribute(attr);
  else target.setAttribute(attr, value);
}

function bindHarness(main, targets, configs = []) {
  const targetGetter = () => normalizeTargets(targets);

  function configureTargets() {
    const provider = providerFromControls(main);
    const appKey = main.querySelector('#applicationKey')?.value || 'demo-app';
    const baseUrl = apiBaseUrl(main);
    const headers = ormHeadersFromControls(main);
    targetGetter().forEach((target) => {
      target.setAttribute('application-key', appKey);
      target.setAttribute('default-application-key', appKey);
      if (providerMode(main) === 'mock') {
        target.removeAttribute('api-base-url');
        target.headers = {};
        target.provider = provider;
      } else {
        target.headers = headers;
        target.getAuthHeaders = () => ormHeadersFromControls(main);
        target.provider = null;
        target.setAttribute('api-base-url', baseUrl);
      }
    });
    updateMarkup(main, targetGetter);
  }

  function applyControl(config, input) {
    targetGetter().forEach((target) => setTargetAttribute(target, config, input));
    config.onChange?.(input.value, input, targetGetter());
    updateMarkup(main, targetGetter);
    status(main, `Changed ${config.attr || config.id} to ${config.type === 'bool' ? input.checked : input.value || 'not set'}.`);
  }

  ['providerMode', 'apiBaseUrl', 'applicationKey', 'actorProfile', 'ormAdmin', 'applicationAdmin', 'sharedAssetAdmin', 'globalAssetAdmin', 'adminApplications'].forEach((id) => {
    const input = main.querySelector(`#${id}`);
    const eventName = input?.type === 'checkbox' || input?.tagName === 'SELECT' ? 'change' : 'input';
    input?.addEventListener(eventName, () => {
      configureTargets();
      const mode = providerMode(main);
      status(main, mode === 'orm'
        ? `Provider reset: ORM ${apiBaseUrl(main)} / applicationKey=${main.querySelector('#applicationKey')?.value || ''}.`
        : `Provider reset: mock applicationKey=${main.querySelector('#applicationKey')?.value || ''}, actorProfile=${main.querySelector('#actorProfile')?.value || ''}.`);
    });
  });

  configs.forEach((config) => {
    const input = main.querySelector(`#${config.id}`);
    if (!input) return;
    const eventName = input.type === 'checkbox' || input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventName, () => applyControl(config, input));
    if (config.applyInitial !== false) applyControl(config, input);
  });

  configureTargets();
  updateMarkup(main, targetGetter);
}

function bindAssetEvents(main, targets) {
  targetTargets(targets).forEach((target) => bindAssetEventsToTarget(main, target));
}

function targetTargets(targets) {
  return normalizeTargets(targets);
}

function bindAssetEventsToTarget(main, target) {
  if (!target) return;
  target.addEventListener('uib-asset-select', (event) => {
    const selection = event.detail.selection || event.detail.insert || event.detail.asset || event.detail;
    const name = selection?.name || event.detail.asset?.name || 'asset';
    const output = main.querySelector('#selectionOutput');
    if (output) output.textContent = JSON.stringify(event.detail, null, 2);
    status(main, `Selected ${name}.`);
  });
  target.addEventListener('asset-selected', (event) => {
    const output = main.querySelector('#selectionOutput');
    if (output) output.textContent = JSON.stringify(event.detail, null, 2);
    status(main, `Picker selected ${event.detail.name || event.detail.asset?.name || 'asset'}.`);
  });
  target.addEventListener('assets-selected', (event) => {
    const output = main.querySelector('#selectionOutput');
    if (output) output.textContent = JSON.stringify(event.detail.assets || event.detail, null, 2);
    status(main, `Picker selected ${event.detail.assets?.length || 0} assets.`);
  });
  target.addEventListener('uib-assets-select', (event) => {
    const output = main.querySelector('#selectionOutput');
    if (output) output.textContent = JSON.stringify(event.detail, null, 2);
    status(main, `Multi-select event returned ${event.detail.assets?.length || event.detail.selections?.length || 0} assets.`);
  });
  target.addEventListener('asset-cleared', () => {
    const output = main.querySelector('#selectionOutput');
    if (output) output.textContent = 'Selection cleared.';
    status(main, 'Selection cleared.');
  });
  target.addEventListener('uib-asset-picker-select', (event) => {
    const output = main.querySelector('#selectionOutput');
    if (output) output.textContent = JSON.stringify(event.detail.selection || event.detail, null, 2);
    status(main, `Dialog chose ${event.detail.selection?.name || event.detail.asset?.name || 'selected asset'}.`);
  });
  target.addEventListener('uib-asset-created', (event) => {
    status(main, `Created asset ${event.detail.asset?.name || 'asset'}.`);
  });
  target.addEventListener('uib-asset-copy-to-app-request', (event) => {
    status(main, `Copy into app requested for ${event.detail.asset?.name || 'asset'}.`);
  });
}

function demoLayout(main, path, title, description, controlsHtml, demoHtml) {
  main.innerHTML = `
    <section class="page-heading">
      <h1>${title}</h1>
      <p>${description}</p>
    </section>
    ${routeList(path)}
    <section class="demo-layout assets-demo-layout">
      <aside class="card controls">
        <div class="card-content">
          <h2>Parent state controls</h2>
          <div class="form-grid">
            ${selectField('providerMode', 'Provider mode', PROVIDER_MODE_OPTIONS, 'mock')}
            ${field('apiBaseUrl', 'ORM API base URL', 'http://localhost:4020')}
            ${field('applicationKey', 'applicationKey', 'demo-app')}
            ${selectField('actorProfile', 'mock actorProfile', ACTOR_OPTIONS, 'admin')}
            ${checkboxField('ormAdmin', 'X-Orm-Admin: true', true)}
            ${checkboxField('applicationAdmin', 'X-Application-Admin: current app', true)}
            ${checkboxField('sharedAssetAdmin', 'X-Shared-Asset-Admin: true', true)}
            ${checkboxField('globalAssetAdmin', 'X-Global-Asset-Admin: true', true)}
            ${field('adminApplications', 'X-Admin-Applications', 'demo-app')}
            ${controlsHtml}
          </div>
          <div id="assetStatus" class="status-box">Change a dropdown, checkbox, or text value to update the component live.</div>
          <details class="control-section" open>
            <summary><strong>Current component markup</strong></summary>
            <pre id="componentMarkup" class="code-sample">No component mounted.</pre>
          </details>
        </div>
      </aside>
      <section class="assets-demo-stage">${demoHtml}</section>
    </section>
  `;
}

function renderOverview(main, path) {
  main.innerHTML = `
    <section class="page-heading">
      <h1>Assets Package Demo</h1>
      <p><code>@ui-base/assets</code> is a reusable Web Component package for asset browsing, picking, uploading, editing, permissions, usage, and version history. Each child demo now has live controls so testers can change component settings without editing source code. The demos default to mock data so they work immediately, and can be switched to the live ORM API at http://localhost:4020.</p>
    </section>
    ${routeList(path)}
    <section class="route-grid" aria-label="Asset demo child routes">
      ${ASSET_ROUTES.map((route) => `
        <a class="card home-card" href="${route.path}" data-link>
          <span>
            <h2>${route.label}</h2>
            <p>${route.description}</p>
          </span>
          <strong class="secondary-button">Open</strong>
        </a>
      `).join('')}
    </section>
  `;
}

function renderBrowser(main, path) {
  const controls = [
    { id: 'mode', attr: 'mode' },
    { id: 'selectionMode', attr: 'selection-mode' },
    { id: 'view', attr: 'view' },
    { id: 'layout', attr: 'layout' },
    { id: 'showUpload', attr: 'show-upload', type: 'bool' },
    { id: 'insertableOnly', attr: 'insertable-only', type: 'bool' },
    { id: 'defaultCategory', attr: 'default-category' },
    { id: 'defaultAssetType', attr: 'default-asset-type' },
    { id: 'defaultReuseScope', attr: 'default-reuse-scope' },
    { id: 'defaultVisibility', attr: 'default-visibility' }
  ];
  demoLayout(
    main,
    path,
    'Asset Browser',
    'Browse mock assets immediately, or switch provider mode to the live ORM API. Use these controls to switch modes, layouts, selection behavior, upload visibility, and default filters.',
    selectField('mode', 'mode', MODE_OPTIONS, 'browse') +
      selectField('selectionMode', 'selection-mode', SELECTION_OPTIONS, 'single') +
      selectField('view', 'view', VIEW_OPTIONS, 'grid') +
      selectField('layout', 'layout', LAYOUT_OPTIONS, 'split') +
      checkboxField('showUpload', 'show-upload', false) +
      checkboxField('insertableOnly', 'insertable-only', false) +
      selectField('defaultCategory', 'default-category', CATEGORY_OPTIONS, '') +
      selectField('defaultAssetType', 'default-asset-type', ASSET_TYPE_OPTIONS, '') +
      selectField('defaultReuseScope', 'default-reuse-scope', SCOPE_OPTIONS, '') +
      selectField('defaultVisibility', 'default-visibility', VISIBILITY_OPTIONS, ''),
    `
      <div class="card card-content stack-block">
        <uib-asset-browser id="assetExample" mode="browse" selection-mode="single" view="grid" layout="split" application-key="demo-app" api-base-url="http://localhost:4020"></uib-asset-browser>
        <pre id="selectionOutput" class="code-sample selection-output">No selection yet.</pre>
      </div>
    `
  );
  const browser = main.querySelector('#assetExample');
  bindAssetEventsToTarget(main, browser);
  bindHarness(main, browser, controls);
}

function renderSimple(main, path) {
  const controls = [
    { id: 'selectionMode', attr: 'selection-mode' },
    { id: 'defaultLayout', attr: 'default-layout' },
    { id: 'defaultCategory', attr: 'default-category' },
    { id: 'defaultAssetType', attr: 'default-asset-type' },
    { id: 'defaultReuseScope', attr: 'default-reuse-scope' },
    { id: 'defaultVisibility', attr: 'default-visibility' },
    { id: 'defaultStatus', attr: 'default-status' },
    { id: 'defaultSearch', attr: 'default-search' },
    { id: 'maxSelection', attr: 'max-selection' },
    { id: 'acceptedFileTypes', attr: 'accepted-file-types', removeOnEmpty: false },
    { id: 'allowUpload', attr: 'allow-upload', type: 'bool' },
    { id: 'insertableOnly', attr: 'insertable-only', type: 'bool' },
    { id: 'includeShared', attr: 'include-shared', type: 'bool' },
    { id: 'copyOnSelect', attr: 'copy-on-select', type: 'bool' }
  ];
  demoLayout(
    main,
    path,
    'Asset Picker for Forms',
    'A form-field asset picker with an inline selected-value slot and a search-first modal browser. This is the recommended form control; browser simple mode delegates to this picker.',
    selectField('selectionMode', 'selection-mode', SELECTION_OPTIONS, 'single') +
      selectField('defaultLayout', 'default-layout', VIEW_OPTIONS, 'list') +
      selectField('defaultCategory', 'default-category', CATEGORY_OPTIONS, 'general') +
      selectField('defaultAssetType', 'default-asset-type', ASSET_TYPE_OPTIONS, '') +
      selectField('defaultReuseScope', 'default-reuse-scope', SCOPE_OPTIONS, 'global') +
      selectField('defaultVisibility', 'default-visibility', VISIBILITY_OPTIONS, 'public') +
      selectField('defaultStatus', 'default-status', STATUS_OPTIONS, 'active') +
      field('defaultSearch', 'default-search', '') +
      numberField('maxSelection', 'max-selection', '5') +
      field('acceptedFileTypes', 'accepted-file-types', 'image/*,application/pdf,text/plain') +
      checkboxField('allowUpload', 'allow-upload', true) +
      checkboxField('insertableOnly', 'insertable-only', true) +
      checkboxField('includeShared', 'include-shared', true) +
      checkboxField('copyOnSelect', 'copy-on-select', false),
    `
      <form id="assetForm" class="card card-content stack-block">
        <p class="help-text">Click the browse icon to open the search-first modal picker. The submitted value is the selected <code>assetId</code>. Multiple mode submits a JSON array string. Results include mixed insertable assets such as images, icons, PDFs, and documents.</p>
        <uib-asset-picker
          id="assetExample"
          name="heroIconAssetId"
          label="Hero icon asset"
          placeholder="Attach a hero icon"
          application-key="demo-app" api-base-url="http://localhost:4020"
          selection-mode="single"
          default-layout="list"
          default-category="general"
          default-reuse-scope="global"
          default-visibility="public"
          default-status="active"
          max-selection="5"
          accepted-file-types="image/*,application/pdf,text/plain"
          allow-upload
          insertable-only
          include-shared>
        </uib-asset-picker>
        <div class="button-row">
          <button id="showFormValue" class="primary" type="button">Show form value</button>
        </div>
        <pre id="selectionOutput" class="code-sample selection-output">No selection yet.</pre>
      </form>
      <div class="card card-content stack-block">
        <h2>Compatibility alias</h2>
        <p class="help-text"><code>uib-asset-browser variant="simple"</code> passes through to <code>uib-asset-picker</code>. The same controls above are applied to both components.</p>
        <uib-asset-browser
          id="assetAlias"
          variant="simple"
          name="compatAssetId"
          label="Browser simple alias"
          application-key="demo-app" api-base-url="http://localhost:4020"
          selection-mode="single"
          default-layout="list"
          default-category="general"
          default-reuse-scope="global"
          default-visibility="public"
          default-status="active"
          max-selection="5"
          accepted-file-types="image/*,application/pdf,text/plain"
          allow-upload
          insertable-only
          include-shared>
        </uib-asset-browser>
      </div>
    `
  );
  const targets = () => [main.querySelector('#assetExample'), main.querySelector('#assetAlias')];
  targets().forEach((target) => bindAssetEventsToTarget(main, target));
  bindHarness(main, targets, controls);
  main.querySelector('#showFormValue')?.addEventListener('click', () => {
    const formData = new FormData(main.querySelector('#assetForm'));
    main.querySelector('#selectionOutput').textContent = JSON.stringify(Object.fromEntries(formData.entries()), null, 2);
  });
}

function renderPicker(main, path) {
  const controls = [
    { id: 'pickerName', attr: 'name', removeOnEmpty: false },
    { id: 'pickerLabel', attr: 'label', removeOnEmpty: false },
    { id: 'pickerPlaceholder', attr: 'placeholder', removeOnEmpty: false },
    { id: 'pickerValue', attr: 'value' },
    { id: 'selectionMode', attr: 'selection-mode' },
    { id: 'view', attr: 'view' },
    { id: 'defaultLayout', attr: 'default-layout' },
    { id: 'defaultCategory', attr: 'default-category' },
    { id: 'defaultAssetType', attr: 'default-asset-type' },
    { id: 'defaultReuseScope', attr: 'default-reuse-scope' },
    { id: 'defaultVisibility', attr: 'default-visibility' },
    { id: 'defaultStatus', attr: 'default-status' },
    { id: 'defaultSearch', attr: 'default-search' },
    { id: 'maxSelection', attr: 'max-selection' },
    { id: 'acceptedFileTypes', attr: 'accepted-file-types', removeOnEmpty: false },
    { id: 'allowUpload', attr: 'allow-upload', type: 'bool' },
    { id: 'insertableOnly', attr: 'insertable-only', type: 'bool' },
    { id: 'includeShared', attr: 'include-shared', type: 'bool' },
    { id: 'copyOnSelect', attr: 'copy-on-select', type: 'bool' },
    { id: 'disabled', attr: 'disabled', type: 'bool' }
  ];
  demoLayout(
    main,
    path,
    'Asset Picker',
    'The picker is a form-field control wired to mock data by default and can be switched to the live ORM API. It shows the selected thumbnail/name inline, then opens a search-first modal when Browse is clicked. Change the controls to test settings and real selections live.',
    field('pickerName', 'name', 'heroIconAssetId') +
      field('pickerLabel', 'label', 'Hero icon asset') +
      field('pickerPlaceholder', 'placeholder', 'Attach an image, file, or asset') +
      field('pickerValue', 'value', '') +
      selectField('selectionMode', 'selection-mode', SELECTION_OPTIONS, 'single') +
      selectField('view', 'view', VIEW_OPTIONS, 'list') +
      selectField('defaultLayout', 'default-layout', VIEW_OPTIONS, 'list') +
      selectField('defaultCategory', 'default-category', CATEGORY_OPTIONS, 'general') +
      selectField('defaultAssetType', 'default-asset-type', ASSET_TYPE_OPTIONS, '') +
      selectField('defaultReuseScope', 'default-reuse-scope', SCOPE_OPTIONS, 'global') +
      selectField('defaultVisibility', 'default-visibility', VISIBILITY_OPTIONS, 'public') +
      selectField('defaultStatus', 'default-status', STATUS_OPTIONS, 'active') +
      field('defaultSearch', 'default-search', '') +
      numberField('maxSelection', 'max-selection', '5') +
      field('acceptedFileTypes', 'accepted-file-types', 'image/*,application/pdf,text/plain') +
      checkboxField('allowUpload', 'allow-upload', true) +
      checkboxField('insertableOnly', 'insertable-only', true) +
      checkboxField('includeShared', 'include-shared', true) +
      checkboxField('copyOnSelect', 'copy-on-select', false) +
      checkboxField('disabled', 'disabled', false),
    `
      <form id="assetPickerForm" class="card card-content stack-block">
        <p class="help-text">This page now mounts the actual <code>uib-asset-picker</code>. The selected value appears in the field as thumbnail/icon + name. Click the <strong>browse icon</strong> to open the search-first modal. Click the <strong>upload icon</strong> to start the same modal in upload mode.</p>
        <uib-asset-picker
          id="assetPicker"
          name="heroIconAssetId"
          label="Hero icon asset"
          placeholder="Attach an image, file, or asset"
          application-key="demo-app" api-base-url="http://localhost:4020"
          selection-mode="single"
          view="list"
          default-layout="list"
          default-category="general"
          default-reuse-scope="global"
          default-visibility="public"
          default-status="active"
          max-selection="5"
          accepted-file-types="image/*,application/pdf,text/plain"
          allow-upload
          insertable-only
          include-shared>
        </uib-asset-picker>
        <div class="button-row">
          <button id="showFormValue" class="primary" type="button">Show form value</button>
          <button id="clearPickerValue" type="button">Clear through parent</button>
        </div>
        <pre id="selectionOutput" class="code-sample selection-output">No selection yet.</pre>
      </form>
      <div class="card card-content stack-block">
        <h2>What to verify</h2>
        <ul>
          <li>The closed picker shows a thumbnail/icon and selected asset name.</li>
          <li>Browse opens the modal picker with search always visible.</li>
          <li>Filters are hidden behind the Filters button.</li>
          <li>Single-select closes after choosing an asset; multiple-select uses Use Selected.</li>
          <li>Uploads require only a file and optional description, then apply defaults.</li>
        </ul>
      </div>
    `
  );
  const picker = main.querySelector('#assetPicker');
  bindAssetEventsToTarget(main, picker);
  bindHarness(main, picker, controls);
  const selectionOutput = main.querySelector('#selectionOutput');
  picker.addEventListener('asset-upload-request', (event) => {
    if (!selectionOutput) return;
    selectionOutput.textContent = `Upload requested:
${JSON.stringify(event.detail?.request ?? {}, null, 2)}`;
  });
  picker.addEventListener('asset-uploaded', (event) => {
    if (!selectionOutput) return;
    selectionOutput.textContent = `Upload complete:
${JSON.stringify(event.detail ?? {}, null, 2)}`;
  });
  picker.addEventListener('asset-upload-invalid', (event) => {
    if (!selectionOutput) return;
    selectionOutput.textContent = `Upload blocked:
${JSON.stringify(event.detail ?? {}, null, 2)}`;
  });
  picker.addEventListener('asset-upload-error', (event) => {
    if (!selectionOutput) return;
    selectionOutput.textContent = `Upload error:
${JSON.stringify(event.detail ?? {}, null, 2)}`;
  });
  picker.addEventListener('uib-asset-upload-error', (event) => {
    if (!selectionOutput) return;
    selectionOutput.textContent = `Upload error:
${JSON.stringify(event.detail ?? {}, null, 2)}`;
  });
  picker.addEventListener('uib-asset-uploaded', (event) => {
    if (!selectionOutput) return;
    selectionOutput.textContent = `Upload complete:
${JSON.stringify(event.detail ?? {}, null, 2)}`;
  });
  picker.addEventListener('uib-asset-upload-request', (event) => {
    if (!selectionOutput) return;
    selectionOutput.textContent = `Upload requested:
${JSON.stringify(event.detail?.request ?? {}, null, 2)}`;
  });
  picker.addEventListener('uib-asset-created', (event) => {
    if (!selectionOutput) return;
    selectionOutput.textContent = `Upload complete:
${JSON.stringify(event.detail ?? {}, null, 2)}`;
  });
  main.querySelector('#showFormValue')?.addEventListener('click', () => {
    const formData = new FormData(main.querySelector('#assetPickerForm'));
    selectionOutput.textContent = JSON.stringify(Object.fromEntries(formData.entries()), null, 2);
  });
  main.querySelector('#clearPickerValue')?.addEventListener('click', () => {
    picker.value = '';
    picker.removeAttribute('value');
    main.querySelector('#pickerValue').value = '';
    if (selectionOutput) selectionOutput.textContent = 'Cleared by parent.';
  });
}

function renderManage(main, path) {
  const controls = [
    { id: 'mode', attr: 'mode' },
    { id: 'selectionMode', attr: 'selection-mode' },
    { id: 'view', attr: 'view' },
    { id: 'layout', attr: 'layout' },
    { id: 'defaultCategory', attr: 'default-category' },
    { id: 'defaultAssetType', attr: 'default-asset-type' },
    { id: 'defaultReuseScope', attr: 'default-reuse-scope' },
    { id: 'defaultVisibility', attr: 'default-visibility' }
  ];
  demoLayout(
    main,
    path,
    'Asset Management',
    'Manage mode is wired to mock data by default so testers can exercise upload/edit flows without a server, and can be switched to ORM for live testing. Use these controls to compare manage, browse, pick, and simple mode behavior.',
    selectField('mode', 'mode', MODE_OPTIONS, 'manage') +
      selectField('selectionMode', 'selection-mode', SELECTION_OPTIONS, 'single') +
      selectField('view', 'view', VIEW_OPTIONS, 'grid') +
      selectField('layout', 'layout', LAYOUT_OPTIONS, 'split') +
      selectField('defaultCategory', 'default-category', CATEGORY_OPTIONS, 'general') +
      selectField('defaultAssetType', 'default-asset-type', ASSET_TYPE_OPTIONS, '') +
      selectField('defaultReuseScope', 'default-reuse-scope', SCOPE_OPTIONS, 'global') +
      selectField('defaultVisibility', 'default-visibility', VISIBILITY_OPTIONS, 'public'),
    `
      <div class="card card-content stack-block">
        <uib-asset-browser id="assetExample" mode="manage" selection-mode="single" view="grid" layout="split" application-key="demo-app" api-base-url="http://localhost:4020"></uib-asset-browser>
        <pre id="selectionOutput" class="code-sample selection-output">No selection yet.</pre>
      </div>
    `
  );
  const browser = main.querySelector('#assetExample');
  bindAssetEventsToTarget(main, browser);
  bindHarness(main, browser, controls);
}

function renderPermissions(main, path) {
  const controls = [
    { id: 'mode', attr: 'mode' },
    { id: 'selectionMode', attr: 'selection-mode' },
    { id: 'view', attr: 'view' },
    { id: 'layout', attr: 'layout' },
    { id: 'insertableOnly', attr: 'insertable-only', type: 'bool' },
    { id: 'defaultVisibility', attr: 'default-visibility' }
  ];
  demoLayout(
    main,
    path,
    'Asset Permissions',
    'Switch the mock actor profile and component settings to verify hidden actions, restricted fields, and item-level permissions. Unauthorized assets are hidden by the provider.',
    selectField('mode', 'mode', MODE_OPTIONS, 'browse') +
      selectField('selectionMode', 'selection-mode', SELECTION_OPTIONS, 'single') +
      selectField('view', 'view', VIEW_OPTIONS, 'list') +
      selectField('layout', 'layout', LAYOUT_OPTIONS, 'split') +
      checkboxField('insertableOnly', 'insertable-only', false) +
      selectField('defaultVisibility', 'default-visibility', VISIBILITY_OPTIONS, ''),
    `
      <div class="card card-content stack-block">
        <uib-asset-browser id="assetExample" mode="browse" selection-mode="single" view="list" layout="split" application-key="demo-app" api-base-url="http://localhost:4020"></uib-asset-browser>
        <pre id="selectionOutput" class="code-sample selection-output">No selection yet.</pre>
      </div>
    `
  );
  const browser = main.querySelector('#assetExample');
  bindAssetEventsToTarget(main, browser);
  bindHarness(main, browser, controls);
}

function renderVersions(main, path) {
  const controls = [
    { id: 'mode', attr: 'mode' },
    { id: 'selectionMode', attr: 'selection-mode' },
    { id: 'view', attr: 'view' },
    { id: 'layout', attr: 'layout' },
    { id: 'defaultAssetType', attr: 'default-asset-type' },
    { id: 'defaultReuseScope', attr: 'default-reuse-scope' }
  ];
  demoLayout(
    main,
    path,
    'Asset Versions',
    'Open an asset and choose the Versions tab. Shared/global replacements can be pending review while pinned consumers remain on a selected version.',
    selectField('mode', 'mode', MODE_OPTIONS, 'browse') +
      selectField('selectionMode', 'selection-mode', SELECTION_OPTIONS, 'single') +
      selectField('view', 'view', VIEW_OPTIONS, 'grid') +
      selectField('layout', 'layout', LAYOUT_OPTIONS, 'split') +
      selectField('defaultAssetType', 'default-asset-type', ASSET_TYPE_OPTIONS, '') +
      selectField('defaultReuseScope', 'default-reuse-scope', SCOPE_OPTIONS, ''),
    `
      <div class="card card-content stack-block">
        <uib-asset-browser id="assetExample" mode="browse" selection-mode="single" view="grid" layout="split" application-key="demo-app" api-base-url="http://localhost:4020"></uib-asset-browser>
        <pre id="selectionOutput" class="code-sample selection-output">No selection yet.</pre>
      </div>
    `
  );
  const browser = main.querySelector('#assetExample');
  bindAssetEventsToTarget(main, browser);
  bindHarness(main, browser, controls);
}

function renderUsage(main, path) {
  const controls = [
    { id: 'mode', attr: 'mode' },
    { id: 'selectionMode', attr: 'selection-mode' },
    { id: 'view', attr: 'view' },
    { id: 'layout', attr: 'layout' },
    { id: 'defaultCategory', attr: 'default-category' },
    { id: 'defaultAssetType', attr: 'default-asset-type' }
  ];
  demoLayout(
    main,
    path,
    'Asset Usage',
    'Open an asset and choose the Usage tab. The provider may return usage records, restricted usage summaries, or nothing when usage is hidden.',
    selectField('mode', 'mode', MODE_OPTIONS, 'browse') +
      selectField('selectionMode', 'selection-mode', SELECTION_OPTIONS, 'single') +
      selectField('view', 'view', VIEW_OPTIONS, 'grid') +
      selectField('layout', 'layout', LAYOUT_OPTIONS, 'split') +
      selectField('defaultCategory', 'default-category', CATEGORY_OPTIONS, '') +
      selectField('defaultAssetType', 'default-asset-type', ASSET_TYPE_OPTIONS, ''),
    `
      <div class="card card-content stack-block">
        <uib-asset-browser id="assetExample" mode="browse" selection-mode="single" view="grid" layout="split" application-key="demo-app" api-base-url="http://localhost:4020"></uib-asset-browser>
        <pre id="selectionOutput" class="code-sample selection-output">No selection yet.</pre>
      </div>
    `
  );
  const browser = main.querySelector('#assetExample');
  bindAssetEventsToTarget(main, browser);
  bindHarness(main, browser, controls);
}

function applyAssetsData(data = {}) {
  const optionSets = data.assets?.optionSets || {};
  ASSET_ROUTES = data.routes?.assets || ASSET_ROUTES;
  PROVIDER_MODE_OPTIONS = optionSets.providerModes || PROVIDER_MODE_OPTIONS;
  MODE_OPTIONS = optionSets.modes || MODE_OPTIONS;
  DIALOG_PICKER_MODE_OPTIONS = optionSets.dialogPickerModes || DIALOG_PICKER_MODE_OPTIONS;
  VIEW_OPTIONS = optionSets.views || VIEW_OPTIONS;
  LAYOUT_OPTIONS = optionSets.layouts || LAYOUT_OPTIONS;
  SELECTION_OPTIONS = optionSets.selectionModes || SELECTION_OPTIONS;
  CATEGORY_OPTIONS = optionSets.categories || CATEGORY_OPTIONS;
  ASSET_TYPE_OPTIONS = optionSets.assetTypes || ASSET_TYPE_OPTIONS;
  SCOPE_OPTIONS = optionSets.scopes || SCOPE_OPTIONS;
  VISIBILITY_OPTIONS = optionSets.visibilities || VISIBILITY_OPTIONS;
  STATUS_OPTIONS = optionSets.statuses || STATUS_OPTIONS;
  ACTOR_OPTIONS = optionSets.actors || ACTOR_OPTIONS;
}

export function renderAssetsRoute(main, path, data) {
  applyAssetsData(data);
  const normalized = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  if (normalized === '/assets-demo') return renderOverview(main, normalized);
  if (normalized === '/assets-demo/simple') return renderSimple(main, normalized);
  if (normalized === '/assets-demo/browser') return renderBrowser(main, normalized);
  if (normalized === '/assets-demo/picker') return renderPicker(main, normalized);
  if (normalized === '/assets-demo/manage') return renderManage(main, normalized);
  if (normalized === '/assets-demo/permissions') return renderPermissions(main, normalized);
  if (normalized === '/assets-demo/versions') return renderVersions(main, normalized);
  if (normalized === '/assets-demo/usage') return renderUsage(main, normalized);
  return renderOverview(main, '/assets-demo');
}
