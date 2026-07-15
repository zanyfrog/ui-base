import { createMockAssetProvider } from '@ui.base/assets';
import { ASSET_COMPONENT_API, UI_BASE_ASSET_COMPONENTS } from '../../../../packages/ui-base-assets/src/metadata.js';
import { appendEventLog, escapeAttr, escapeHtml, json } from './demo-utils.js';

const BOOLEAN_ATTRIBUTES = new Set(['allow-upload', 'copy-on-select', 'disabled', 'include-shared', 'insertable-only', 'open', 'show-upload', 'use-asset-picker']);
const NUMBER_ATTRIBUTES = new Set(['max-selection']);
const MULTILINE_ATTRIBUTES = new Set(['accepted-file-types', 'asset', 'asset-map', 'insertable-file-types']);
const SELECT_OPTIONS = {
  'asset-visibility': ['', 'public', 'application_private', 'shared_private', 'global_private', 'admin_only'],
  category: ['', 'general', 'hero', 'logo', 'document', 'detail-icon'],
  'data-picker-mode': ['pick', 'browse', 'manage', 'simple'],
  'default-asset-type': ['', 'image', 'icon', 'document', 'svg', 'pdf', 'json', 'other'],
  'default-category': ['', 'general', 'hero', 'logo', 'document', 'detail-icon'],
  'default-file-type': ['', 'image', 'icon', 'document', 'svg', 'pdf', 'json', 'other'],
  'default-layout': ['list', 'grid'],
  'default-reuse-scope': ['', 'application', 'shared', 'global'],
  'default-scope': ['', 'application', 'shared', 'global'],
  'default-status': ['active', 'archived', 'all'],
  'default-visibility': ['', 'public', 'application_private', 'shared_private', 'global_private', 'admin_only'],
  fit: ['cover', 'contain', 'fill', 'none', 'scale-down'],
  'file-type': ['image', 'svg', 'icon', 'document', 'pdf', 'json', 'other'],
  layout: ['split', 'full'],
  mode: ['browse', 'pick', 'manage', 'simple'],
  'mime-type': ['image/svg+xml', 'image/png', 'application/pdf', 'application/json', 'text/plain'],
  'picker-mode': ['pick', 'browse', 'manage', 'simple'],
  ratio: ['1/1', '4/3', '16:9', '21:9'],
  role: ['', 'img', 'presentation', 'icon'],
  'reuse-scope': ['', 'application', 'shared', 'global'],
  'selection-behavior': ['', 'close', 'stay-open'],
  'selection-mode': ['single', 'multiple'],
  tab: ['summary', 'preview', 'metadata', 'versions', 'usage', 'permissions', 'edit'],
  view: ['list', 'grid'],
  'visual-role': ['image', 'icon', 'svg', 'decorative'],
  'visual-source': ['none', 'url', 'asset']
};

const SAMPLE_ASSETS = [
  {
    id: 'asset-tour-size',
    key: 'tour-size-icon',
    name: 'Tour size icon',
    fileType: 'svg',
    mimeType: 'image/svg+xml',
    url: '/apps/demo/assets/icons/tour-size.svg',
    publicUrl: '/apps/demo/assets/icons/tour-size.svg',
    thumbnailUrl: '/apps/demo/assets/icons/tour-size.svg',
    scope: 'global',
    visibility: 'public',
    category: 'detail-icon',
    categories: ['detail-icon', 'general'],
    altText: 'Tour size',
    description: 'Reusable icon for tour capacity details.',
    currentVersionNumber: 3,
    permissions: {
      canView: true,
      canSelect: true,
      canDownload: true,
      canCopyToApp: true,
      canCreate: true,
      canEditMetadata: true,
      canReplaceFile: true,
      canUploadNewVersion: true,
      canSubmitForReview: true,
      canApproveVersion: true,
      canRejectVersion: true,
      canArchive: true,
      canRestore: true,
      canHardDelete: false,
      canViewUsage: true,
      canManagePermissions: true
    }
  },
  {
    id: 'asset-accessibility',
    key: 'accessibility-icon',
    name: 'Accessibility icon',
    fileType: 'svg',
    mimeType: 'image/svg+xml',
    url: '/apps/demo/assets/icons/accessibility.svg',
    publicUrl: '/apps/demo/assets/icons/accessibility.svg',
    thumbnailUrl: '/apps/demo/assets/icons/accessibility.svg',
    scope: 'shared',
    visibility: 'public',
    category: 'general',
    altText: 'Accessibility',
    description: 'Shared accessibility marker.',
    currentVersionNumber: 1,
    permissions: {
      canView: true,
      canSelect: true,
      canDownload: true,
      canCopyToApp: true,
      canCreate: false,
      canEditMetadata: true,
      canReplaceFile: false,
      canUploadNewVersion: false,
      canSubmitForReview: false,
      canApproveVersion: false,
      canRejectVersion: false,
      canArchive: false,
      canRestore: false,
      canHardDelete: false,
      canViewUsage: true,
      canManagePermissions: false
    }
  }
];

const SAMPLE_CATEGORIES = [
  { key: 'general', name: 'General' },
  { key: 'detail-icon', name: 'Detail icon' },
  { key: 'hero', name: 'Hero' }
];

const SAMPLE_VERSIONS = [
  { versionNumber: 3, status: 'approved', fileName: 'tour-size.svg', createdAt: '2026-07-01', notes: 'Current approved version.' },
  { versionNumber: 2, status: 'archived', fileName: 'tour-size-v2.svg', createdAt: '2026-06-15', notes: 'Previous icon treatment.' }
];

const SAMPLE_USAGE = [
  { label: 'Sample Tour Hero', entityType: 'hero', applicationName: 'Demo application' },
  { label: 'Reservation Detail List', entityType: 'component_config', applicationName: 'Demo application' }
];

const SAMPLE_PERMISSION_SETS = [
  { key: 'application-asset-manager', name: 'Application asset manager' },
  { key: 'application-asset-viewer', name: 'Application asset viewer' }
];

const SAMPLE_ASSET_MAP = {
  'asset-tour-size': { url: '/apps/demo/assets/icons/tour-size.svg', alt: 'Tour size' },
  'asset-accessibility': { url: '/apps/demo/assets/icons/accessibility.svg', alt: 'Accessibility' }
};

const COMPONENT_DEFAULTS = {
  'uib-asset-browser': { mode: 'browse', 'selection-mode': 'single', view: 'grid', layout: 'split', 'application-key': 'demo-app' },
  'uib-asset-picker': { name: 'heroAsset', label: 'Hero asset', placeholder: 'Attach an asset', 'selection-mode': 'single', 'application-key': 'demo-app', 'allow-upload': true },
  'uib-asset-picker-dialog': { open: true, 'application-key': 'demo-app', 'selection-mode': 'single', 'data-picker-mode': 'pick', view: 'grid' },
  'uib-asset-image': { src: '/apps/demo/assets/icons/tour-size.svg', alt: 'Tour size', role: 'icon', fit: 'contain', ratio: '1/1', 'fallback-label': 'Tour size' },
  'uib-visual-source-control': { label: 'Hero visual source', 'visual-source': 'url', 'visual-role': 'icon', src: '/apps/demo/assets/icons/availability.svg', alt: 'Availability', 'application-key': 'demo-app' },
  'uib-asset-list': { 'selection-mode': 'single', 'selected-asset-id': 'asset-tour-size' },
  'uib-asset-grid': { 'selection-mode': 'single', 'selected-asset-id': 'asset-tour-size' },
  'uib-asset-details': { tab: 'summary' },
  'uib-asset-search': { placeholder: 'Search assets', value: 'tour' },
  'uib-asset-thumbnail': { label: 'Tour size', 'file-type': 'svg', url: '/apps/demo/assets/icons/tour-size.svg', 'thumbnail-url': '/apps/demo/assets/icons/tour-size.svg', 'mime-type': 'image/svg+xml', 'file-name': 'tour-size.svg' },
  'uib-asset-permission-set-picker': { value: 'application-asset-manager' }
};

export const ASSETS_ROUTE_PATHS = [
  '/assets/',
  ...UI_BASE_ASSET_COMPONENTS.map((item) => `/assets/${item.tagName}`)
];

const componentEntries = UI_BASE_ASSET_COMPONENTS.map((item) => ({
  ...item,
  route: `/assets/${item.tagName}`,
  title: item.tagName.replace(/^uib-/, '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
  summary: item.purpose || 'Component exported from @ui.base/assets.'
}));

function normalizePath(pathname) {
  if (!pathname || pathname === '') return '/assets';
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function visibleAttributes(component) {
  const apiAttributes = ASSET_COMPONENT_API[component.tagName]?.attributes?.map((item) => item.name);
  return Array.from(new Set(apiAttributes || component.attributes || [])).sort((a, b) => a.localeCompare(b));
}

function defaultValueFor(name, component) {
  if (name === 'name') return component.tagName.replace(/^uib-/, '').replace(/-/g, '');
  if (name === 'label') return component.title;
  if (name === 'application-key') return 'demo-app';
  if (name === 'api-base-url') return 'http://localhost:4020';
  if (name === 'asset-id') return 'asset-tour-size';
  if (name === 'asset-map') return JSON.stringify(SAMPLE_ASSET_MAP);
  if (name === 'src' || name === 'url' || name === 'thumbnail-url') return '/apps/demo/assets/icons/tour-size.svg';
  if (name === 'alt') return 'Tour size';
  if (name === 'placeholder') return 'Choose an asset';
  if (name === 'max-selection') return '5';
  return '';
}

function defaultState(component) {
  const defaults = COMPONENT_DEFAULTS[component.tagName] || {};
  const state = {};
  visibleAttributes(component).forEach((name) => {
    if (BOOLEAN_ATTRIBUTES.has(name)) {
      state[name] = Boolean(defaults[name]);
      return;
    }
    state[name] = defaults[name] ?? defaultValueFor(name, component);
  });
  state.children = defaults.children || '';
  return state;
}

function cardPreviewState(component) {
  const state = defaultState(component);
  if (component.tagName === 'uib-asset-picker-dialog') state.open = false;
  return state;
}

function initialRouteComponent(path) {
  const slug = normalizePath(path).replace(/^\/assets\/?/, '');
  return componentEntries.find((item) => item.tagName === slug) || null;
}

function controlMarkup(name, value) {
  const id = `assets-control-${name}`;

  if (BOOLEAN_ATTRIBUTES.has(name)) {
    return `
      <label class="checkbox-row forms-prop-check" for="${escapeAttr(id)}">
        <input id="${escapeAttr(id)}" type="checkbox" data-prop="${escapeAttr(name)}" ${value ? 'checked' : ''}>
        <span>${escapeHtml(name)}</span>
      </label>
    `;
  }

  if (SELECT_OPTIONS[name]) {
    return `
      <div class="field">
        <label for="${escapeAttr(id)}">${escapeHtml(name)}</label>
        <select id="${escapeAttr(id)}" data-prop="${escapeAttr(name)}">
          ${SELECT_OPTIONS[name].map((option) => `<option value="${escapeAttr(option)}" ${String(value) === option ? 'selected' : ''}>${escapeHtml(option || 'empty')}</option>`).join('')}
        </select>
      </div>
    `;
  }

  if (MULTILINE_ATTRIBUTES.has(name)) {
    return `
      <div class="field">
        <label for="${escapeAttr(id)}">${escapeHtml(name)}</label>
        <textarea id="${escapeAttr(id)}" data-prop="${escapeAttr(name)}" spellcheck="false">${escapeHtml(value)}</textarea>
      </div>
    `;
  }

  const type = NUMBER_ATTRIBUTES.has(name) ? 'number' : 'text';
  return `
    <div class="field">
      <label for="${escapeAttr(id)}">${escapeHtml(name)}</label>
      <input id="${escapeAttr(id)}" type="${escapeAttr(type)}" value="${escapeAttr(value)}" data-prop="${escapeAttr(name)}">
    </div>
  `;
}

function setAttributeValue(element, name, value) {
  if (BOOLEAN_ATTRIBUTES.has(name)) {
    element.toggleAttribute(name, Boolean(value));
    return;
  }
  if (value === null || value === undefined || String(value) === '') element.removeAttribute(name);
  else element.setAttribute(name, String(value));
}

function hydrateAssetElement(element, component) {
  if (!element) return;
  if ('assets' in element) element.assets = SAMPLE_ASSETS;
  if ('categories' in element) element.categories = SAMPLE_CATEGORIES;
  if ('permissionSets' in element) element.permissionSets = SAMPLE_PERMISSION_SETS;
  if ('versions' in element) element.versions = SAMPLE_VERSIONS;
  if ('usage' in element) element.usage = SAMPLE_USAGE;
  if ('asset' in element) element.asset = SAMPLE_ASSETS[0];
  if ('assetMap' in element) element.assetMap = SAMPLE_ASSET_MAP;
  if ('provider' in element && ['uib-asset-browser', 'uib-asset-picker', 'uib-asset-picker-dialog'].includes(component.tagName)) {
    element.provider = createMockAssetProvider({ applicationKey: 'demo-app', actorProfile: 'admin' });
  }
  if (component.tagName === 'uib-asset-image') element.assetResolver = async () => SAMPLE_ASSETS[0];
}

function renderPreviewElement(container, component, state) {
  container.textContent = '';
  const element = document.createElement(component.tagName);
  visibleAttributes(component).forEach((name) => setAttributeValue(element, name, state[name]));
  element.innerHTML = state.children || '';
  container.append(element);
  hydrateAssetElement(element, component);
  return element;
}

function serializedMarkup(component, state) {
  const attrs = visibleAttributes(component)
    .filter((name) => BOOLEAN_ATTRIBUTES.has(name) ? state[name] : String(state[name] ?? '') !== '')
    .map((name) => BOOLEAN_ATTRIBUTES.has(name) ? name : `${name}="${escapeAttr(state[name])}"`);
  const children = state.children || '';
  const open = attrs.length ? `<${component.tagName}\n  ${attrs.join('\n  ')}>` : `<${component.tagName}>`;
  return `${open}${children ? `\n  ${children}\n` : ''}</${component.tagName}>`;
}

function apiItems(items, emptyText = 'None documented.') {
  if (!items?.length) return `<p class="forms-api-empty">${escapeHtml(emptyText)}</p>`;
  return `
    <dl class="forms-api-list">
      ${items.map((item) => `
        <div>
          <dt><code>${escapeHtml(item.name)}</code>${item.type ? ` <span>${escapeHtml(item.type)}</span>` : ''}</dt>
          <dd>${escapeHtml(item.description)}</dd>
        </div>
      `).join('')}
    </dl>
  `;
}

function renderComponentApi(component) {
  const api = ASSET_COMPONENT_API[component.tagName];
  if (!api) return '';

  return `
    <details class="card forms-api-card">
      <summary>
        <span>
          <strong>Component API</strong>
          <small>Attributes, properties, custom events, styling hooks, and examples.</small>
        </span>
      </summary>
      <div class="forms-api-content">
        <section>
          <h2>Attributes</h2>
          ${apiItems(api.attributes)}
        </section>
        <section>
          <h2>Properties</h2>
          ${apiItems(api.properties)}
        </section>
        <section>
          <h2>Custom Events</h2>
          ${apiItems(api.events, 'No custom events documented for this component.')}
        </section>
        <section>
          <h2>Slots</h2>
          ${apiItems(api.slots)}
        </section>
        <section>
          <h2>CSS Parts</h2>
          ${apiItems(api.cssParts)}
        </section>
        <section>
          <h2>CSS Variables</h2>
          ${apiItems(api.cssVariables)}
        </section>
        <section class="forms-api-example-section">
          <h2>Example</h2>
          <pre class="code-block forms-api-code"><code>${escapeHtml(api.examples?.[0] || `<${component.tagName}></${component.tagName}>`)}</code></pre>
        </section>
      </div>
    </details>
  `;
}

function renderIndex(main) {
  main.innerHTML = `
    <section class="page-heading">
      <p class="eyebrow">@ui.base/assets</p>
      <h1>Assets component demos.</h1>
      <p>Each exported asset component has a focused page with public prop controls, mock-data previews, event logging, markup output, and package API notes.</p>
    </section>
    <section class="forms-component-grid" aria-label="Asset components">
      ${componentEntries.map((component) => `
        <a class="card forms-component-card" href="${escapeAttr(component.route)}" data-link>
          <span>
            <p class="eyebrow">${escapeHtml(component.package)}</p>
            <h2><code>${escapeHtml(component.tagName)}</code></h2>
            <p>${escapeHtml(component.summary)}</p>
          </span>
          <div class="forms-card-preview assets-card-preview" aria-hidden="true" data-card-preview="${escapeAttr(component.tagName)}"></div>
        </a>
      `).join('')}
    </section>
  `;

  componentEntries.forEach((component) => {
    const preview = main.querySelector(`[data-card-preview="${component.tagName}"]`);
    if (preview) renderPreviewElement(preview, component, cardPreviewState(component));
  });
}

function bindPreviewEvents(preview, eventLog, component) {
  preview.addEventListener('click', (event) => {
    if (event.target.closest?.('a')) event.preventDefault();
  });

  const eventNames = Array.from(new Set([...(component.events || []), 'change']));
  eventNames.forEach((eventName) => {
    preview.addEventListener(eventName, (event) => {
      appendEventLog(eventLog, eventName, event.detail || {}, { tag: event.target?.localName || component.tagName });
    });
  });
}

function renderComponentPage(main, component) {
  const state = defaultState(component);
  const attrs = visibleAttributes(component);

  main.innerHTML = `
    <section class="page-heading forms-detail-heading">
      <p class="eyebrow">@ui.base/assets</p>
      <h1><code>${escapeHtml(component.tagName)}</code></h1>
      <p>${escapeHtml(component.summary)}</p>
      <div class="button-row">
        <a class="secondary-button compact-control-button" href="/assets/" data-link>Back to assets</a>
        <a class="secondary-button compact-control-button" href="/assets-demo/" data-link>Workflow demos</a>
      </div>
    </section>

    <section class="demo-layout forms-demo-layout">
      <aside class="card controls forms-controls" aria-label="${escapeAttr(component.tagName)} prop controls">
        <div class="card-content">
          <div class="controls-header">
            <h2>Public props</h2>
            <span class="forms-control-count">${attrs.length}</span>
          </div>
          <div class="form-grid" data-assets-controls>
            ${attrs.map((name) => controlMarkup(name, state[name])).join('')}
            <div class="field">
              <label for="assets-control-children">children / slots</label>
              <textarea id="assets-control-children" data-prop="children" spellcheck="false">${escapeHtml(state.children)}</textarea>
            </div>
          </div>
        </div>
      </aside>

      <div class="forms-preview-stack">
        ${renderComponentApi(component)}

        <section class="card">
          <div class="preview-toolbar">
            <div>
              <strong>Live preview</strong>
              <span>Seeded with mock asset data where the component expects properties.</span>
            </div>
          </div>
          <div class="forms-live-preview assets-live-preview" data-assets-preview></div>
        </section>

        <section class="card">
          <div class="card-content">
            <h2>Latest event</h2>
            <pre class="code-block forms-event-log" data-assets-event-log>${escapeHtml(json({}))}</pre>
          </div>
        </section>

        <section class="card">
          <div class="card-content">
            <h2>Current markup</h2>
            <pre class="code-block forms-markup-output"><code data-assets-markup></code></pre>
          </div>
        </section>
      </div>
    </section>
  `;

  const preview = main.querySelector('[data-assets-preview]');
  const markup = main.querySelector('[data-assets-markup]');
  const eventLog = main.querySelector('[data-assets-event-log]');

  const updatePreview = () => {
    renderPreviewElement(preview, component, state);
    markup.textContent = serializedMarkup(component, state);
  };

  main.querySelector('[data-assets-controls]')?.addEventListener('input', (event) => {
    const prop = event.target?.dataset?.prop;
    if (!prop) return;
    state[prop] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updatePreview();
  });

  main.querySelector('[data-assets-controls]')?.addEventListener('change', (event) => {
    const prop = event.target?.dataset?.prop;
    if (!prop) return;
    state[prop] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    updatePreview();
  });

  bindPreviewEvents(preview, eventLog, component);
  updatePreview();
}

export function renderAssetsPackageRoute(main, path) {
  const component = initialRouteComponent(path);
  if (!component) {
    renderIndex(main);
    return;
  }
  renderComponentPage(main, component);
}
