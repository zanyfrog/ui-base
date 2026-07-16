import {
  ASSET_FILE_TYPES,
  ASSET_SCOPES,
  ASSET_VISIBILITIES,
  assetSelection,
  baseAssetStyles,
  boolFromAttribute,
  emitAssetEvent,
  escapeHtml,
  humanize,
  normalizeAsset,
  normalizeAssets,
  parseJson,
  registerElement
} from '../asset-core.js';
import { createOrmAssetProvider } from '../providers/orm-asset-provider.js';
import './uib-asset-details.js';
import './uib-asset-filter-bar.js';
import './uib-asset-grid.js';
import './uib-asset-list.js';
import './uib-asset-preview.js';
import './uib-asset-search.js';
import './uib-asset-thumbnail.js';
import './uib-asset-picker.js';
import './uib-asset-uploader.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;
const DEFAULT_SIMPLE_INSERTABLE_TYPES = ['image', 'icon', 'document', 'svg', 'pdf'];
const DEFAULT_SIMPLE_ACCEPT = ['image/*', 'application/pdf', 'text/plain'];
const DEFAULT_SIMPLE_STATUS = 'active';
const ICON_PATHS = {
  addAsset: [
    'M5 4h8.7L19 9.3V20H5V4Zm2 2v12h10v-7h-5V6H7Zm7 .4V9h2.6L14 6.4Z',
    'M10 12h2v2h2v2h-2v2h-2v-2H8v-2h2v-2Z'
  ],
  filter: [
    'M4 6.5h10v2H4v-2Zm12-.75h4v3.5h-4v-3.5ZM4 15.5h4v2H4v-2Zm6-.75h10v3.5H10v-3.5Z'
  ],
  grid: [
    'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7ZM6 6v3h3V6H6Zm9 0v3h3V6h-3ZM6 15v3h3v-3H6Zm9 0v3h3v-3h-3Z'
  ],
  list: [
    'M8 6h12v2H8V6Zm0 5h12v2H8v-2Zm0 5h12v2H8v-2ZM4 6h2v2H4V6Zm0 5h2v2H4v-2Zm0 5h2v2H4v-2Z'
  ]
};

function iconSvg(name, className = 'button-icon') {
  const paths = ICON_PATHS[name] || ICON_PATHS.addAsset;
  return (
  `<svg class="` +
  (className) +
  `" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">` +
  (paths.map((path) => `<path fill="currentColor" d="${path}"></path>`).join('')) +
  `</svg>`
);
}

function attrList(value, fallback = []) {
  if (!value) return [...fallback];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function categoryKey(category) {
  if (typeof category === 'string') return category;
  return category?.key || category?.categoryKey || category?.category_key || category?.value || category?.id || '';
}

function categoryName(category) {
  if (typeof category === 'string') return humanize(category);
  return category?.name || category?.displayName || category?.display_name || categoryKey(category);
}

function stripExtension(fileName = '') {
  return String(fileName || 'Asset').replace(/\.[^.]+$/, '') || 'Asset';
}

function slugify(value) {
  return String(value || 'asset')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'asset';
}

function inferFileType(file) {
  const mimeType = String(file?.type || '').toLowerCase();
  const name = String(file?.name || '').toLowerCase();
  if (mimeType.startsWith('image/')) return name.includes('icon') || mimeType === 'image/svg+xml' && name.includes('icon') ? 'icon' : 'image';
  if (mimeType === 'application/pdf' || /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/.test(name)) return 'document';
  if (mimeType.startsWith('text/')) return 'document';
  if (mimeType === 'application/json' || name.endsWith('.json')) return 'json';
  return 'other';
}

function acceptedMatches(file, acceptedTypes = []) {
  if (!file) return false;
  if (!acceptedTypes.length) return true;
  const fileType = String(file.type || '').toLowerCase();
  const fileName = String(file.name || '').toLowerCase();
  return acceptedTypes.some((accepted) => {
    const value = String(accepted || '').trim().toLowerCase();
    if (!value) return false;
    if (value.endsWith('/*')) return fileType.startsWith(value.slice(0, -1));
    if (value.startsWith('.')) return fileName.endsWith(value);
    return fileType === value;
  });
}

function buildInsertPayload(asset, extra = {}) {
  const normalized = normalizeAsset(asset);
  return {
    assetId: normalized.id,
    assetKey: normalized.key,
    name: normalized.name,
    assetType: normalized.assetType || normalized.fileType,
    mimeType: normalized.mimeType,
    applicationKey: normalized.applicationKey,
    ownerApplicationKey: normalized.ownerApplicationKey,
    reuseScope: normalized.reuseScope || normalized.scope,
    assetVisibility: normalized.assetVisibility || normalized.visibility,
    publicUrl: normalized.publicUrl || normalized.url,
    downloadUrl: normalized.downloadUrl,
    altText: normalized.altText,
    description: normalized.description,
    ...extra
  };
}

function selectedSetFrom(value) {
  if (value instanceof Set) return new Set(value);
  return new Set(Array.isArray(value) ? value.filter(Boolean) : []);
}

export class UibAssetBrowser extends BaseHTMLElement {
  static get observedAttributes() {
    return [
      'mode',
      'variant',
      'name',
      'value',
      'label',
      'placeholder',
      'disabled',
      'selection-mode',
      'application-key',
      'default-application-key',
      'api-base-url',
      'view',
      'default-layout',
      'show-upload',
      'allow-upload',
      'layout',
      'insertable-only',
      'insertable-file-types',
      'accepted-file-types',
      'max-selection',
      'default-asset-type',
      'default-file-type',
      'default-category',
      'default-reuse-scope',
      'default-scope',
      'default-visibility',
      'default-status',
      'default-search',
      'reuse-scope',
      'asset-visibility',
      'category',
      'copy-on-select',
      'selection-behavior',
      'include-shared'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._provider = null;
    this._providerAssigned = false;
    this._headers = {};
    this._getAuthHeaders = null;
    this._assets = [];
    this._categories = [];
    this._permissionSets = [];
    this._versions = [];
    this._usage = [];
    this._uploadPolicy = null;
    this._selectedAsset = null;
    this._selectedAssetIds = new Set();
    this._query = '';
    this._filters = { applicationKey: '', fileType: 'all', scope: 'all', visibility: 'all', category: 'all', status: DEFAULT_SIMPLE_STATUS };
    this._loading = false;
    this._message = '';
    this._defaultsApplied = false;
    this._filterPanelOpen = false;
    this._createAssetPanelOpen = false;
    this._simpleFiltersOpen = false;
    this._simpleUploadOpen = false;
    this._pendingUploadFile = null;
    this._pendingUploadPreviewUrl = '';
    this._pendingUploadFileName = '';
  }

  set provider(value) {
    this._providerAssigned = Boolean(value);
    this._provider = value || null;
    if (this.isConnected) this.loadAll();
  }

  get provider() {
    this.ensureProvider();
    return this._provider;
  }

  set headers(value) {
    this._headers = value && typeof value === 'object' ? { ...value } : {};
    const picker = this.shadowRoot?.querySelector?.('uib-asset-picker');
    if (picker) picker.headers = this._headers;
  }

  get headers() { return this._headers; }

  set getAuthHeaders(value) {
    this._getAuthHeaders = typeof value === 'function' ? value : null;
    const picker = this.shadowRoot?.querySelector?.('uib-asset-picker');
    if (picker) picker.getAuthHeaders = this._getAuthHeaders;
  }

  get getAuthHeaders() { return this._getAuthHeaders; }

  set assets(value) {
    this._assets = this.filterInsertableAssets(normalizeAssets(value));
    if (!this.isSimple() && !this._selectedAsset && this._assets[0]) this.selectAsset(this._assets[0]);
    if (this.isConnected) this.render();
  }

  get assets() { return this._assets; }
  set categories(value) { this._categories = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get categories() { return this._categories; }
  set permissionSets(value) { this._permissionSets = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get permissionSets() { return this._permissionSets; }
  set uploadPolicy(value) { this._uploadPolicy = value || null; if (this.isConnected) this.render(); }
  get uploadPolicy() { return this._uploadPolicy; }
  set selectedAssetIds(value) { this._selectedAssetIds = selectedSetFrom(value); if (this.isConnected) this.render(); }
  get selectedAssetIds() { return Array.from(this._selectedAssetIds); }

  connectedCallback() {
    this.applyDefaultFilters();
    this.ensureProvider();
    this.loadAll();
  }

  disconnectedCallback() {
    this.revokePendingUploadPreview();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'api-base-url' || name === 'application-key') {
      if (!this._providerAssigned) this._provider = null;
    }
    if (name.startsWith('default-') || ['application-key', 'category', 'reuse-scope', 'asset-visibility'].includes(name)) {
      this.applyDefaultFilters({ force: true });
    }
    if (this.isConnected) {
      if (['api-base-url', 'application-key', 'default-application-key', 'insertable-only', 'insertable-file-types'].includes(name) || name.startsWith('default-')) this.loadAssets();
      else this.render();
    }
  }

  mode() { return this.getAttribute('mode') || 'browse'; }
  variant() { return this.getAttribute('variant') || (this.mode() === 'simple' ? 'simple' : 'advanced'); }
  isSimple() { return this.variant() === 'simple'; }
  view() { return this.getAttribute('view') || this.getAttribute('default-layout') || (this.isSimple() ? 'list' : 'grid'); }
  layout() { return this.getAttribute('layout') || 'split'; }
  selectionMode() { return this.getAttribute('selection-mode') || 'single'; }
  showUpload() { return this.mode() === 'manage' || boolFromAttribute(this.getAttribute('show-upload'), false); }
  allowUpload() { return boolFromAttribute(this.getAttribute('allow-upload'), false); }
  insertableOnly() { return this.isSimple() ? boolFromAttribute(this.getAttribute('insertable-only'), true) : false; }
  insertableFileTypes() { return attrList(this.getAttribute('insertable-file-types'), DEFAULT_SIMPLE_INSERTABLE_TYPES); }
  acceptedFileTypes() { return attrList(this.getAttribute('accepted-file-types'), DEFAULT_SIMPLE_ACCEPT); }
  maxSelection() {
    const value = Number(this.getAttribute('max-selection') || 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  selectionBehavior() { return this.getAttribute('selection-behavior') || 'reference'; }
  copyOnSelect() { return boolFromAttribute(this.getAttribute('copy-on-select'), this.selectionBehavior() === 'copy'); }
  activeApplicationKey() { return this._filters.applicationKey || this.getAttribute('application-key') || this.getAttribute('default-application-key') || ''; }

  applyDefaultFilters({ force = false } = {}) {
    if (this._defaultsApplied && !force) return;
    this._query = this.getAttribute('default-search') || this._query || '';
    this._filters = {
      ...this._filters,
      applicationKey: this.getAttribute('default-application-key') || this.getAttribute('application-key') || this._filters.applicationKey || '',
      fileType: this.getAttribute('default-asset-type') || this.getAttribute('default-file-type') || this._filters.fileType || 'all',
      scope: this.getAttribute('default-reuse-scope') || this.getAttribute('default-scope') || this.getAttribute('reuse-scope') || this._filters.scope || 'all',
      visibility: this.getAttribute('default-visibility') || this.getAttribute('asset-visibility') || this._filters.visibility || 'all',
      category: this.getAttribute('default-category') || this.getAttribute('category') || this._filters.category || 'all',
      status: this.getAttribute('default-status') || this._filters.status || DEFAULT_SIMPLE_STATUS
    };
    this._defaultsApplied = true;
  }

  ensureProvider() {
    if (this._provider || this._providerAssigned) return;
    const baseUrl = this.getAttribute('api-base-url');
    if (!baseUrl) return;
    this._provider = createOrmAssetProvider({
      baseUrl,
      applicationKey: this.getAttribute('application-key') || this.getAttribute('default-application-key') || '',
      getAuthHeaders: () => (this._getAuthHeaders ? this._getAuthHeaders() : { ...this._headers })
    });
  }

  async loadAll() {
    await Promise.all([this.loadLookups(), this.loadAssets()]);
  }

  async loadLookups() {
    this.ensureProvider();
    if (!this._provider) { this.render(); return; }
    try {
      const [categories, permissionSets, uploadPolicy] = await Promise.all([
        this._provider.listCategories?.() ?? [],
        this._provider.listPermissionSets?.() ?? [],
        this._provider.getUploadPolicy?.() ?? null
      ]);
      this._categories = categories || [];
      this._permissionSets = permissionSets || [];
      this._uploadPolicy = uploadPolicy || this._uploadPolicy;
    } catch (error) {
      this._message = error instanceof Error ? error.message : String(error);
    }
    this.render();
  }

  async loadAssets() {
    this.ensureProvider();
    if (!this._provider) { this.render(); return; }
    this._loading = true;
    this.render();
    try {
      const result = await this._provider.search({
        query: this._query,
        filters: this._filters,
        applicationKey: this.activeApplicationKey(),
        includeShared: true
      });
      this._assets = this.filterInsertableAssets(normalizeAssets(result?.records || []));
      if (this.isSimple()) {
        const assetIds = new Set(this._assets.map((asset) => asset.id));
        this._selectedAssetIds = new Set(Array.from(this._selectedAssetIds).filter((id) => assetIds.has(id)));
      } else if (!this._selectedAsset || !this._assets.some((asset) => asset.id === this._selectedAsset?.id)) {
        this._selectedAsset = this._assets[0] || null;
        await this.loadSelectedDetails();
      }
      this._message = `${this._assets.length} asset${this._assets.length === 1 ? '' : 's'} loaded.`;
    } catch (error) {
      this._message = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
      this.render();
    }
  }

  filterInsertableAssets(assets) {
    if (!this.insertableOnly()) return assets;
    const allowed = new Set(this.insertableFileTypes().map((type) => type.toLowerCase()));
    return assets.filter((asset) => allowed.has(String(asset.fileType || '').toLowerCase()));
  }

  async loadSelectedDetails() {
    if (!this._selectedAsset || !this._provider) {
      this._versions = [];
      this._usage = [];
      return;
    }
    try {
      const [versions, usage] = await Promise.all([
        this._provider.listVersions?.(this._selectedAsset.id) ?? [],
        this._selectedAsset.permissions.canViewUsage ? (this._provider.listUsage?.(this._selectedAsset.id) ?? []) : []
      ]);
      this._versions = versions || [];
      this._usage = usage || [];
    } catch (error) {
      this._message = error instanceof Error ? error.message : String(error);
    }
  }

  async selectAsset(asset) {
    this._selectedAsset = normalizeAsset(asset);
    await this.loadSelectedDetails();
    this.render();
  }

  render() {
    if (this.isSimple()) {
      this.renderSimple();
      return;
    }
    this.renderAdvanced();
  }

  renderAdvanced() {
    const activeElement = this.shadowRoot?.activeElement || null;
    const restoreSearchFocus = activeElement?.tagName?.toLowerCase?.() === 'uib-asset-search' || activeElement?.matches?.('uib-asset-search');
    const searchInput = activeElement?.shadowRoot?.querySelector?.('input') || null;
    const searchSelectionStart = searchInput?.selectionStart ?? null;
    const searchSelectionEnd = searchInput?.selectionEnd ?? null;
    const mode = this.mode();
    const view = this.view();
    const layout = this.layout();
    const selectedId = this._selectedAsset?.id || '';
    const canCreate = this.showUpload() || this._assets.some((asset) => asset.permissions.canCreate);
    const filterPanelId = 'uib-asset-browser-filter-panel';
    const createPanelId = 'uib-asset-browser-create-panel';
    const filtersToggleLabel = this._filterPanelOpen ? 'Hide filters' : 'Show filters';
    const createToggleLabel = this._createAssetPanelOpen ? 'Hide create asset' : 'Add or insert asset';
    this.shadowRoot.innerHTML = (
  `<style>` +
  (baseAssetStyles) +
  ` .browser { display: grid; gap: 1rem; } .action-strip { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.75rem; align-items: center; padding: 0.85rem 1rem; } .view-toggle { display: flex; flex-wrap: wrap; gap: 0.45rem; justify-content: flex-end; } .panel-card { overflow: hidden; } .panel-header { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.75rem; align-items: center; padding: 0.85rem 1rem; } .panel-copy { min-width: 0; } .icon-button { width: 2.5rem; min-width: 2.5rem; min-height: 2.5rem; padding: 0; display: inline-grid; place-items: center; } .button-icon { width: 1.1rem; height: 1.1rem; flex: 0 0 auto; } .panel-body { display: grid; gap: 0.75rem; padding: 0 1rem 1rem; } .filter-fields { grid-template-columns: minmax(240px, 0.72fr) minmax(0, 1fr); align-items: end; } .filter-fields uib-asset-search { min-width: 0; } .upload-wrap { display: grid; gap: 0.75rem; } .layout { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr); gap: 1rem; align-items: start; } .layout[data-layout="full"] { grid-template-columns: 1fr; } .right-rail { display: grid; gap: 1rem; position: sticky; top: 1rem; } .status { min-height: 1.8rem; color: var(--uib-assets-muted); font-size: 0.88rem; } @media (max-width: 1060px) { .layout, .filter-fields { grid-template-columns: 1fr; } .right-rail { position: static; } .action-strip { grid-template-columns: 1fr; align-items: start; } .view-toggle { justify-content: flex-start; } } @media (max-width: 640px) { .panel-header { grid-template-columns: 1fr; } .panel-toggle, .add-insert-button { justify-self: start; } } ` +
  `</style>` +
  `<section class="browser" aria-label="Asset browser">` +
  `<div class="asset-card action-strip">` +
  `<div class="status" aria-live="polite">` +
  (this._loading ? 'Loading assets...' : escapeHtml(this._message || 'Search, filter, open, select, upload, or edit assets.')) +
  `</div>` +
  `<div class="view-toggle" aria-label="Asset browser view">` +
  `<button type="button" data-view="list" class="icon-button ` +
  (view === 'list' ? 'primary' : '') +
  `" title="Show list view" aria-label="Show list view">` +
  (iconSvg('list')) +
  `</button>` +
  `<button type="button" data-view="grid" class="icon-button ` +
  (view === 'grid' ? 'primary' : '') +
  `" title="Show grid view" aria-label="Show grid view">` +
  (iconSvg('grid')) +
  `</button>` +
  `</div>` +
  `</div>` +
  `<section class="asset-card panel-card" aria-label="Asset filters">` +
  `<div class="panel-header">` +
  `<div class="panel-copy">` +
  `<h2 class="title">` +
  `Filters` +
  `</h2>` +
  `</div>` +
  `<button type="button" class="panel-toggle icon-button ` +
  (this._filterPanelOpen ? 'primary' : '') +
  `" data-toggle-filters aria-controls="` +
  (filterPanelId) +
  `" aria-expanded="` +
  (this._filterPanelOpen ? 'true' : 'false') +
  `" title="` +
  (filtersToggleLabel) +
  `" aria-label="` +
  (filtersToggleLabel) +
  `"> ` +
  (iconSvg('filter')) +
  ` ` +
  `</button>` +
  `</div>` +
  `<div id="` +
  (filterPanelId) +
  `" class="panel-body filter-fields" ` +
  (this._filterPanelOpen ? '' : 'hidden') +
  `><uib-asset-search value="` +
  (escapeHtml(this._query)) +
  `">` +
  `</uib-asset-search>` +
  `<uib-asset-filter-bar>` +
  `</uib-asset-filter-bar>` +
  `</div>` +
  `</section>` +
  ` ` +
  (canCreate ? `
          <section class="asset-card panel-card" aria-label="Create Asset">
            <div class="panel-header">
              <div class="panel-copy">
                <h2 class="title">Create Asset</h2>
              </div>
              <button type="button" class="add-insert-button icon-button primary" data-toggle-create-asset aria-controls="${createPanelId}" aria-expanded="${this._createAssetPanelOpen ? 'true' : 'false'}" title="${createToggleLabel}" aria-label="${createToggleLabel}">
                ${iconSvg('addAsset')}
              </button>
            </div>
            <div id="${createPanelId}" class="panel-body upload-wrap" ${this._createAssetPanelOpen ? '' : 'hidden'}>
              <uib-asset-uploader embedded></uib-asset-uploader>
            </div>
          </section>
        ` : '') +
  ` <div class="layout" data-layout="` +
  (escapeHtml(layout)) +
  `">` +
  `<section class="asset-results" aria-label="Asset results">` +
  ` ` +
  (view === 'list' ? '<uib-asset-list></uib-asset-list>' : '<uib-asset-grid></uib-asset-grid>') +
  ` ` +
  `</section>` +
  `<aside class="right-rail" aria-label="Selected asset panels">` +
  `<uib-asset-preview>` +
  `</uib-asset-preview>` +
  `<uib-asset-details>` +
  `</uib-asset-details>` +
  `</aside>` +
  `</div>` +
  `</section>`
);

    const search = this.shadowRoot.querySelector('uib-asset-search');
    search?.addEventListener('uib-asset-search', (event) => { this._query = event.detail.query || ''; this.loadAssets(); });
    if (restoreSearchFocus && search) {
      queueMicrotask(() => {
        search.focusInput?.();
        const input = search.shadowRoot?.querySelector('input');
        if (input && typeof searchSelectionStart === 'number' && typeof input.setSelectionRange === 'function') {
          input.setSelectionRange(searchSelectionStart, searchSelectionEnd ?? searchSelectionStart);
        }
      });
    }

    const filterBar = this.shadowRoot.querySelector('uib-asset-filter-bar');
    if (filterBar) {
      filterBar.categories = this._categories;
      filterBar.filters = this._filters;
      filterBar.addEventListener('uib-asset-filter-change', (event) => { this._filters = { ...this._filters, ...event.detail.filters }; this.loadAssets(); });
    }

    this.shadowRoot.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => { this.setAttribute('view', button.dataset.view); });
    });
    this.shadowRoot.querySelector('[data-toggle-filters]')?.addEventListener('click', () => {
      const nextOpen = !this._filterPanelOpen;
      this._filterPanelOpen = nextOpen;
      this.render();
      if (nextOpen) queueMicrotask(() => this.shadowRoot.querySelector('uib-asset-search')?.focusInput?.());
    });
    this.shadowRoot.querySelector('[data-toggle-create-asset]')?.addEventListener('click', () => {
      const nextOpen = !this._createAssetPanelOpen;
      this._createAssetPanelOpen = nextOpen;
      this.render();
      if (nextOpen) {
        queueMicrotask(() => {
          const uploader = this.shadowRoot.querySelector('uib-asset-uploader');
          uploader?.shadowRoot?.querySelector('input[name="name"]')?.focus?.();
        });
      }
    });

    const results = this.shadowRoot.querySelector('uib-asset-list, uib-asset-grid');
    if (results) {
      results.assets = this._assets;
      results.setAttribute('selected-asset-id', selectedId);
      results.setAttribute('selection-mode', this.selectionMode());
      results.addEventListener('uib-asset-open', (event) => {
        this.selectAsset(event.detail.asset);
        emitAssetEvent(this, 'uib-asset-open', event.detail);
      });
      results.addEventListener('uib-asset-select', (event) => emitAssetEvent(this, 'uib-asset-select', event.detail));
    }

    const preview = this.shadowRoot.querySelector('uib-asset-preview');
    if (preview) preview.asset = this._selectedAsset;
    const details = this.shadowRoot.querySelector('uib-asset-details');
    if (details) {
      details.asset = this._selectedAsset;
      details.versions = this._versions;
      details.usage = this._usage;
      details.permissionSets = this._permissionSets;
      details.addEventListener('uib-asset-select', (event) => emitAssetEvent(this, 'uib-asset-select', event.detail));
      details.addEventListener('uib-asset-update-request', (event) => this.handleUpdate(event.detail));
      details.addEventListener('uib-asset-archive-request', (event) => this.handleArchive(event.detail));
      details.addEventListener('uib-asset-restore-request', (event) => this.handleRestore(event.detail));
      details.addEventListener('uib-asset-copy-to-app-request', (event) => emitAssetEvent(this, 'uib-asset-copy-to-app-request', event.detail));
      details.addEventListener('uib-asset-permission-change-request', (event) => emitAssetEvent(this, 'uib-asset-permission-change-request', { asset: this._selectedAsset, ...event.detail }));
    }

    const uploader = this.shadowRoot.querySelector('uib-asset-uploader');
    if (uploader) {
      if (this._uploadPolicy) uploader.uploadPolicy = this._uploadPolicy;
      uploader.permissionSets = this._permissionSets;
      uploader.addEventListener('uib-asset-upload-request', (event) => this.handleUpload(event.detail.request));
      uploader.addEventListener('uib-asset-upload-invalid', (event) => {
        this._message = event.detail.errors.join(' ');
        this.render();
      });
    }
  }

  renderSimple() {
    const passThroughAttributes = [
      'name',
      'value',
      'label',
      'placeholder',
      'disabled',
      'selection-mode',
      'application-key',
      'default-application-key',
      'api-base-url',
      'view',
      'default-layout',
      'allow-upload',
      'insertable-only',
      'insertable-file-types',
      'accepted-file-types',
      'max-selection',
      'default-asset-type',
      'default-file-type',
      'default-category',
      'default-reuse-scope',
      'default-scope',
      'default-visibility',
      'default-status',
      'default-search',
      'reuse-scope',
      'asset-visibility',
      'category',
      'copy-on-select',
      'selection-behavior',
      'include-shared'
    ];
    const attrs = passThroughAttributes
      .filter((name) => this.hasAttribute(name))
      .map((name) => `${name}="${escapeHtml(this.getAttribute(name))}"`)
      .join(' ');

    this.shadowRoot.innerHTML = (
  `<style>` +
  ` :host { display: block; } ` +
  `</style>` +
  `<uib-asset-picker ` +
  (attrs) +
  `>` +
  `</uib-asset-picker>`
);

    const picker = this.shadowRoot.querySelector('uib-asset-picker');
    if (!picker) return;
    picker.headers = this._headers;
    picker.getAuthHeaders = this._getAuthHeaders;
    if (this._providerAssigned || this._provider) picker.provider = this._provider;
    if (this._categories.length) picker.categories = this._categories;
    if (this._uploadPolicy) picker.uploadPolicy = this._uploadPolicy;
    if (this._assets.length && !this._provider) picker.assets = this._assets;
  }

  renderSimpleFilterFields() {
    const filters = this._filters;
    const option = (value, label, selected) => (
  `<option value="` +
  (escapeHtml(value)) +
  `" ` +
  (value === selected ? 'selected' : '') +
  `>` +
  (escapeHtml(label)) +
  `</option>`
);
    return (
  `<div class="filter-grid">` +
  `<label>` +
  `Search <input name="query" value="` +
  (escapeHtml(this._query)) +
  `" placeholder="Search assets" />` +
  `</label>` +
  `<label>` +
  `Application <input name="applicationKey" value="` +
  (escapeHtml(filters.applicationKey || '')) +
  `" placeholder="demo-app" />` +
  `</label>` +
  `<label>` +
  `Category ` +
  `<select name="category">` +
  (option('all', 'All categories', filters.category)) +
  (this._categories.map((category) => option(categoryKey(category), categoryName(category), filters.category)).join('')) +
  `</select>` +
  `</label>` +
  `<label>` +
  `File type ` +
  `<select name="fileType">` +
  (option('all', 'All file types', filters.fileType)) +
  (ASSET_FILE_TYPES.map((type) => option(type, humanize(type), filters.fileType)).join('')) +
  `</select>` +
  `</label>` +
  `<label>` +
  `Scope ` +
  `<select name="scope">` +
  (option('all', 'All scopes', filters.scope)) +
  (ASSET_SCOPES.map((scope) => option(scope, humanize(scope), filters.scope)).join('')) +
  `</select>` +
  `</label>` +
  `<label>` +
  `Visibility ` +
  `<select name="visibility">` +
  (option('all', 'All visibility', filters.visibility)) +
  (ASSET_VISIBILITIES.map((visibility) => option(visibility, humanize(visibility), filters.visibility)).join('')) +
  `</select>` +
  `</label>` +
  `<label>` +
  `Status ` +
  `<select name="status">` +
  (option('active', 'Active', filters.status)) +
  (option('archived', 'Archived', filters.status)) +
  (option('all', 'Active and archived', filters.status)) +
  `</select>` +
  `</label>` +
  `</div>` +
  `<div class="filter-actions">` +
  `<button type="submit" class="primary">` +
  `Apply filters` +
  `</button>` +
  `<button type="button" data-clear-simple-filters>` +
  `Clear` +
  `</button>` +
  `</div>`
);
  }

  renderSimpleUploadFields() {
    const accept = this.acceptedFileTypes().join(',');
    const preview = this._pendingUploadPreviewUrl
      ? (
  `<img src="` +
  (escapeHtml(this._pendingUploadPreviewUrl)) +
  `" alt="` +
  (escapeHtml(this._pendingUploadFileName || 'Selected file')) +
  ` preview" />`
)
      : (
  `<span>` +
  (escapeHtml(this._pendingUploadFileName || 'Select file')) +
  `</span>`
);
    return (
  `<div class="row-between">` +
  `<div>` +
  `<h2 class="title">` +
  ` Upload asset ` +
  `</h2>` +
  `<p class="subtitle">` +
  ` Choose a file and optionally add a description. Defaults are applied automatically. ` +
  `</p>` +
  `</div>` +
  `<button type="submit" class="primary">` +
  ` Upload ` +
  `</button>` +
  `</div>` +
  `<div class="upload-grid">` +
  `<div class="upload-preview">` +
  ` ` +
  (preview) +
  ` ` +
  `</div>` +
  `<div class="upload-fields">` +
  `<label>` +
  ` File <input name="simpleFile" type="file" accept="` +
  (escapeHtml(accept)) +
  `" />` +
  `</label>` +
  `<label>` +
  ` Description ` +
  `<textarea name="description" placeholder="Optional description">` +
  `</textarea>` +
  `</label>` +
  `<p class="subtitle small">` +
  ` Defaults: type inferred from the file, scope ` +
  (escapeHtml(this.uploadDefaultScope())) +
  ` , visibility ` +
  (escapeHtml(this.uploadDefaultVisibility())) +
  ` , category ` +
  (escapeHtml(this.uploadDefaultCategory())) +
  ` , status active. ` +
  `</p>` +
  `</div>` +
  `</div>`
);
  }

  renderSimpleAssetOption(asset) {
    const selected = this._selectedAssetIds.has(asset.id);
    const pressed = selected ? 'true' : 'false';
    const checkText = selected ? '✓' : (this.selectionMode() === 'multiple' ? '+' : '');
    return (
  `<button type="button" class="asset-option" data-id="` +
  (escapeHtml(asset.id)) +
  `" aria-pressed="` +
  (pressed) +
  `" aria-selected="` +
  (pressed) +
  `">` +
  `<uib-asset-thumbnail>` +
  `</uib-asset-thumbnail>` +
  `<p class="asset-name">` +
  ` ` +
  (escapeHtml(asset.name)) +
  ` ` +
  `</p>` +
  `<span class="selected-mark" aria-hidden="true">` +
  ` ` +
  (escapeHtml(checkText)) +
  ` ` +
  `</span>` +
  `</button>`
);
  }

  handleSimpleFilterSubmit(form) {
    const formData = new FormData(form);
    this._query = String(formData.get('query') || '').trim();
    this._filters = {
      ...this._filters,
      applicationKey: String(formData.get('applicationKey') || '').trim(),
      category: String(formData.get('category') || 'all'),
      fileType: String(formData.get('fileType') || 'all'),
      scope: String(formData.get('scope') || 'all'),
      visibility: String(formData.get('visibility') || 'all'),
      status: String(formData.get('status') || DEFAULT_SIMPLE_STATUS)
    };
    this.loadAssets();
  }

  clearSimpleFilters() {
    this._query = '';
    this._filters = { applicationKey: '', fileType: 'all', scope: 'all', visibility: 'all', category: 'all', status: DEFAULT_SIMPLE_STATUS };
    this._defaultsApplied = false;
    this.applyDefaultFilters({ force: true });
    this.loadAssets();
  }

  setPendingUploadFile(file) {
    this.revokePendingUploadPreview();
    this._pendingUploadFile = file || null;
    this._pendingUploadFileName = file?.name || '';
    if (file && String(file.type || '').startsWith('image/') && typeof URL !== 'undefined' && URL.createObjectURL) {
      this._pendingUploadPreviewUrl = URL.createObjectURL(file);
    }
    this.render();
  }

  revokePendingUploadPreview() {
    if (this._pendingUploadPreviewUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) URL.revokeObjectURL(this._pendingUploadPreviewUrl);
    this._pendingUploadPreviewUrl = '';
  }

  uploadDefaultCategory() {
    return this._filters.category && this._filters.category !== 'all'
      ? this._filters.category
      : this.getAttribute('default-category') || this.getAttribute('category') || 'general';
  }

  uploadDefaultScope() {
    return this._filters.scope && this._filters.scope !== 'all'
      ? this._filters.scope
      : this.getAttribute('default-reuse-scope') || this.getAttribute('default-scope') || this.getAttribute('reuse-scope') || 'global';
  }

  uploadDefaultVisibility() {
    return this._filters.visibility && this._filters.visibility !== 'all'
      ? this._filters.visibility
      : this.getAttribute('default-visibility') || this.getAttribute('asset-visibility') || 'public';
  }

  validateSimpleUpload(file) {
    const errors = [];
    if (!file) errors.push('Choose a file to upload.');
    const maxFileSizeBytes = Number(this._uploadPolicy?.maxFileSizeBytes || 0);
    if (file && maxFileSizeBytes && file.size > maxFileSizeBytes) errors.push(`File exceeds ${maxFileSizeBytes} bytes.`);
    if (file && !acceptedMatches(file, this.acceptedFileTypes())) errors.push(`File type is not allowed: ${file.type || file.name || 'unknown'}.`);
    return errors;
  }

  async handleSimpleUpload(form) {
    this.ensureProvider();
    const formData = new FormData(form);
    const file = this._pendingUploadFile || formData.get('simpleFile');
    const actualFile = file instanceof File && file.size ? file : null;
    const errors = this.validateSimpleUpload(actualFile);
    if (errors.length) {
      this._message = errors.join(' ');
      emitAssetEvent(this, 'asset-upload-invalid', { errors });
      emitAssetEvent(this, 'uib-asset-upload-invalid', { errors });
      this.render();
      return;
    }

    const name = stripExtension(actualFile.name);
    const category = this.uploadDefaultCategory();
    const scope = this.uploadDefaultScope();
    const visibility = this.uploadDefaultVisibility();
    const fileType = inferFileType(actualFile);
    const request = {
      sourceType: 'local_file',
      name,
      key: slugify(name),
      description: String(formData.get('description') || '').trim(),
      file: actualFile,
      fileName: actualFile.name,
      originalFileName: actualFile.name,
      fileSizeBytes: actualFile.size,
      fileType,
      assetType: fileType,
      mimeType: actualFile.type || '',
      category,
      categories: [category].filter(Boolean),
      tags: [],
      scope,
      reuseScope: scope,
      reuse_scope: scope,
      visibility,
      assetVisibility: visibility,
      asset_visibility: visibility,
      status: 'active',
      isActive: true,
      is_active: true,
      applicationKey: this.activeApplicationKey() || this.getAttribute('application-key') || ''
    };

    emitAssetEvent(this, 'asset-upload-request', { request });
    emitAssetEvent(this, 'uib-asset-upload-request', { request });
    if (!this._provider?.createAsset) return;

    this._loading = true;
    this._message = 'Uploading asset...';
    this.render();
    try {
      const created = await this.createAssetFromRequest(request);
      const asset = normalizeAsset(created);
      this._pendingUploadFile = null;
      this._pendingUploadFileName = '';
      this.revokePendingUploadPreview();
      await this.loadAssets();
      this._message = `Uploaded ${asset.name}.`;
      emitAssetEvent(this, 'asset-uploaded', { asset, insert: buildInsertPayload(asset, { uploaded: true }) });
      emitAssetEvent(this, 'uib-asset-created', { asset });
      if (this.selectionMode() === 'multiple') {
        this._selectedAssetIds.add(asset.id);
        emitAssetEvent(this, 'asset-selection-change', this.currentMultiSelectionDetail({ uploaded: true }));
        this.render();
      } else {
        await this.emitSingleSelection(asset, { uploaded: true });
      }
    } catch (error) {
      this._message = error instanceof Error ? error.message : String(error);
      this.render();
    } finally {
      this._loading = false;
    }
  }

  async createAssetFromRequest(request) {
    const asset = await this._provider.createAsset(request);
    if (request.file && !this._provider.supportsDirectFileUpload && this._provider.uploadAssetFile) {
      await this._provider.uploadAssetFile(asset.id, request.file, { notes: 'Initial upload.', applicationKey: request.applicationKey });
      if (this._provider.getAsset) return this._provider.getAsset(asset.id, request.applicationKey);
    }
    return asset;
  }

  async handleSimpleAssetClick(assetId) {
    const asset = this._assets.find((item) => item.id === assetId);
    if (!asset) return;
    this._selectedAsset = asset;
    if (this.selectionMode() === 'multiple') {
      if (this._selectedAssetIds.has(asset.id)) this._selectedAssetIds.delete(asset.id);
      else {
        const maxSelection = this.maxSelection();
        if (maxSelection && this._selectedAssetIds.size >= maxSelection) {
          this._message = `You can select up to ${maxSelection} asset${maxSelection === 1 ? '' : 's'}.`;
          this.render();
          return;
        }
        this._selectedAssetIds.add(asset.id);
      }
      emitAssetEvent(this, 'asset-selection-change', this.currentMultiSelectionDetail());
      this.render();
      return;
    }
    await this.emitSingleSelection(asset);
  }

  shouldCopyAsset(asset) {
    if (!this.copyOnSelect()) return false;
    const applicationKey = this.activeApplicationKey();
    if (!applicationKey) return false;
    const normalized = normalizeAsset(asset);
    const assetApplicationKey = normalized.applicationKey || normalized.ownerApplicationKey || '';
    return normalized.scope !== 'application' || Boolean(assetApplicationKey && assetApplicationKey !== applicationKey);
  }

  async resolveAssetForSelection(asset) {
    const normalized = normalizeAsset(asset);
    if (!this.shouldCopyAsset(normalized)) return { asset: normalized, copied: false };
    if (!this._provider?.copyAssetToApplication) {
      this._message = 'Copy is not available from the current asset provider; selected the original asset.';
      return { asset: normalized, copied: false, copyUnavailable: true };
    }
    emitAssetEvent(this, 'asset-copy-request', { asset: normalized, applicationKey: this.activeApplicationKey() });
    emitAssetEvent(this, 'uib-asset-copy-to-app-request', { asset: normalized, applicationKey: this.activeApplicationKey() });
    try {
      const copied = normalizeAsset(await this._provider.copyAssetToApplication(normalized.id, this.activeApplicationKey(), { source: 'simple-picker' }));
      await this.loadAssets();
      return { asset: copied, copied: true, sourceAssetId: normalized.id };
    } catch (error) {
      this._message = `Could not copy asset into this application; selected the original asset instead. ${error instanceof Error ? error.message : String(error)}`;
      emitAssetEvent(this, 'asset-copy-failed', { asset: normalized, applicationKey: this.activeApplicationKey(), error });
      emitAssetEvent(this, 'uib-asset-copy-failed', { asset: normalized, applicationKey: this.activeApplicationKey(), error });
      return { asset: normalized, copied: false, copyFailed: true, copyError: error instanceof Error ? error.message : String(error) };
    }
  }

  async emitSingleSelection(asset, extra = {}) {
    this.ensureProvider();
    this._loading = true;
    this.render();
    try {
      const resolved = await this.resolveAssetForSelection(asset);
      const selectedAsset = normalizeAsset(resolved.asset);
      this._selectedAsset = selectedAsset;
      this._selectedAssetIds = new Set([selectedAsset.id]);
      const insert = buildInsertPayload(selectedAsset, {
        ...extra,
        copied: resolved.copied,
        sourceAssetId: resolved.sourceAssetId,
        copyUnavailable: resolved.copyUnavailable
      });
      const selection = assetSelection(selectedAsset);
      emitAssetEvent(this, 'asset-selected', insert);
      emitAssetEvent(this, 'uib-asset-select', { asset: selectedAsset, selection, insert });
      this._message = `Selected ${selectedAsset.name}.`;
    } catch (error) {
      this._message = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
      this.render();
    }
  }

  currentMultiSelectionDetail(extra = {}) {
    const rawAssets = this._assets.filter((asset) => this._selectedAssetIds.has(asset.id));
    return {
      assets: rawAssets.map((asset) => buildInsertPayload(asset, extra)),
      selections: rawAssets.map((asset) => assetSelection(asset)),
      rawAssets
    };
  }

  async emitMultipleSelection() {
    const assets = this._assets.filter((asset) => this._selectedAssetIds.has(asset.id));
    if (!assets.length) return;
    this._loading = true;
    this.render();
    try {
      const resolvedAssets = [];
      const inserts = [];
      for (const asset of assets) {
        const resolved = await this.resolveAssetForSelection(asset);
        const selectedAsset = normalizeAsset(resolved.asset);
        resolvedAssets.push(selectedAsset);
        inserts.push(buildInsertPayload(selectedAsset, {
          copied: resolved.copied,
          sourceAssetId: resolved.sourceAssetId,
          copyUnavailable: resolved.copyUnavailable
        }));
      }
      this._selectedAssetIds = new Set(resolvedAssets.map((asset) => asset.id));
      const selections = resolvedAssets.map((asset) => assetSelection(asset));
      emitAssetEvent(this, 'assets-selected', { assets: inserts, selections, rawAssets: resolvedAssets });
      emitAssetEvent(this, 'uib-assets-select', { assets: resolvedAssets, selections, inserts });
      this._message = `Selected ${resolvedAssets.length} asset${resolvedAssets.length === 1 ? '' : 's'}.`;
    } catch (error) {
      this._message = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
      this.render();
    }
  }

  async handleUpload(request) {
    emitAssetEvent(this, 'uib-asset-upload-request', { request });
    if (!this._provider) return;
    try {
      let asset;
      if (request.sourceType === 'external_url' || request.sourceType === 'icon_url') asset = await this._provider.createExternalUrlAsset(request);
      else if (request.sourceType === 'json' || request.sourceType === 'component_config') asset = await this._provider.createJsonAsset(request);
      else asset = await this._provider.createAsset({ ...request, applicationKey: request.applicationKey || this.activeApplicationKey() || this.getAttribute('application-key') || '' });
      if (request.file && !this._provider.supportsDirectFileUpload && this._provider.uploadAssetFile) await this._provider.uploadAssetFile(asset.id, request.file, { notes: 'Initial upload.' });
      await this.loadAssets();
      this._message = `Created ${asset.name}.`;
      emitAssetEvent(this, 'uib-asset-created', { asset });
    } catch (error) {
      this._message = error instanceof Error ? error.message : String(error);
      this.render();
    }
  }

  async handleUpdate({ asset, patch }) {
    emitAssetEvent(this, 'uib-asset-update-request', { asset, patch });
    if (!this._provider) return;
    try {
      const updated = await this._provider.updateAsset(asset.id, { ...patch, applicationKey: asset.applicationKey || this.activeApplicationKey() || this.getAttribute('application-key') || '' });
      await this.selectAsset(updated);
      await this.loadAssets();
      this._message = `Updated ${updated.name}.`;
    } catch (error) {
      this._message = error instanceof Error ? error.message : String(error);
      this.render();
    }
  }

  async handleArchive({ asset, reason }) {
    emitAssetEvent(this, 'uib-asset-archive-request', { asset, reason });
    if (!this._provider?.archiveAsset) return;
    await this._provider.archiveAsset(asset.id, reason || 'Archived from browser.');
    await this.loadAssets();
  }

  async handleRestore({ asset, reason }) {
    emitAssetEvent(this, 'uib-asset-restore-request', { asset, reason });
    if (!this._provider?.restoreAsset) return;
    await this._provider.restoreAsset(asset.id, reason || 'Restored from browser.');
    await this.loadAssets();
  }
}

registerElement('uib-asset-browser', UibAssetBrowser);
