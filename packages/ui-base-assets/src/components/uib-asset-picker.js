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
import './uib-asset-thumbnail.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;
const DEFAULT_PICKER_INSERTABLE_TYPES = ['image', 'icon', 'document', 'svg', 'pdf'];
const DEFAULT_PICKER_ACCEPT = ['image/*', 'application/pdf', 'text/plain'];
const DEFAULT_PICKER_STATUS = 'active';

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

function uniqueUploadKey(name) {
  const base = slugify(name);
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${base}-${stamp}-${random}`;
}

function inferFileType(file) {
  const mimeType = String(file?.type || '').toLowerCase();
  const name = String(file?.name || '').toLowerCase();
  if (mimeType.startsWith('image/')) return name.includes('icon') || (mimeType === 'image/svg+xml' && name.includes('icon')) ? 'icon' : 'image';
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

function parseSelectionValue(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const parsed = parseJson(value, null);
  if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
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

function fileFromFormValue(value) {
  if (typeof File !== 'undefined' && value instanceof File && value.size) return value;
  if (typeof Blob !== 'undefined' && value instanceof Blob && value.size) return value;
  return null;
}

export class UibAssetPicker extends BaseHTMLElement {
  static formAssociated = true;

  static get observedAttributes() {
    return [
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
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._internals = this.attachInternals?.() || null;
    this._provider = null;
    this._providerAssigned = false;
    this._headers = {};
    this._getAuthHeaders = null;
    this._assets = [];
    this._assetCache = new Map();
    this._categories = [];
    this._permissionSets = [];
    this._uploadPolicy = null;
    this._selectedAssetIds = new Set();
    this._selectedAsset = null;
    this._query = '';
    this._filters = { applicationKey: '', fileType: 'all', scope: 'all', visibility: 'all', category: 'all', status: DEFAULT_PICKER_STATUS };
    this._defaultsApplied = false;
    this._open = false;
    this._filtersOpen = false;
    this._uploadOpen = false;
    this._loading = false;
    this._message = '';
    this._uploadMessage = '';
    this._value = '';
    this._suppressValueAttribute = false;
    this._pendingUploadFile = null;
    this._pendingUploadPreviewUrl = '';
    this._pendingUploadFileName = '';
    this._pendingUploadDescription = '';
    this._searchTimer = null;
    this._onDocumentClick = (event) => {
      if (!this._open) return;
      if (event.composedPath?.().includes(this)) return;
      this.close();
    };
    this._onKeyDown = (event) => {
      if (event.key === 'Escape' && this._open) {
        event.stopPropagation();
        this.close();
      }
    };
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
  }

  get headers() { return this._headers; }

  set getAuthHeaders(value) {
    this._getAuthHeaders = typeof value === 'function' ? value : null;
  }

  get getAuthHeaders() { return this._getAuthHeaders; }

  set assets(value) {
    this._assets = this.filterInsertableAssets(normalizeAssets(value));
    this.cacheAssets(this._assets);
    this.syncSelectedAssets();
    if (this.isConnected) this.render();
  }

  get assets() { return this._assets; }

  set categories(value) { this._categories = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get categories() { return this._categories; }

  set uploadPolicy(value) { this._uploadPolicy = value || null; if (this.isConnected) this.render(); }
  get uploadPolicy() { return this._uploadPolicy; }

  set value(value) { this.setValue(value, { reflect: true, render: true }); }
  get value() { return this._value; }

  connectedCallback() {
    this.setValue(this.getAttribute('value') || this._value || '', { reflect: false, render: false });
    this.applyDefaultFilters();
    this.ensureProvider();
    this.loadAll();
    if (typeof document !== 'undefined') document.addEventListener('click', this._onDocumentClick);
    this.addEventListener('keydown', this._onKeyDown);
    this.render();
  }

  disconnectedCallback() {
    if (typeof document !== 'undefined') document.removeEventListener('click', this._onDocumentClick);
    this.removeEventListener('keydown', this._onKeyDown);
    this.revokePendingUploadPreview();
    if (this._searchTimer) clearTimeout(this._searchTimer);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'value') {
      if (!this._suppressValueAttribute) this.setValue(newValue || '', { reflect: false, render: this.isConnected });
      return;
    }
    if (name === 'api-base-url' || name === 'application-key') {
      if (!this._providerAssigned) this._provider = null;
    }
    if (name.startsWith('default-') || ['application-key', 'category', 'reuse-scope', 'asset-visibility'].includes(name)) {
      this.applyDefaultFilters({ force: true });
    }
    if (name === 'selection-mode') this.setValue(this._value, { reflect: true, render: false });
    if (this.isConnected) {
      if (['api-base-url', 'application-key', 'default-application-key', 'insertable-only', 'insertable-file-types'].includes(name) || name.startsWith('default-')) this.loadAssets();
      else this.render();
    }
  }

  selectionMode() { return this.getAttribute('selection-mode') || 'single'; }
  isMultiple() { return this.selectionMode() === 'multiple'; }
  fieldName() { return this.getAttribute('name') || ''; }
  label() { return this.getAttribute('label') || ''; }
  placeholder() { return this.getAttribute('placeholder') || (this.isMultiple() ? 'Choose assets' : 'Choose an asset'); }
  disabled() { return boolFromAttribute(this.getAttribute('disabled'), false); }
  view() { return this.getAttribute('view') || this.getAttribute('default-layout') || 'list'; }
  allowUpload() { return boolFromAttribute(this.getAttribute('allow-upload'), false); }
  insertableOnly() { return boolFromAttribute(this.getAttribute('insertable-only'), true); }
  insertableFileTypes() { return attrList(this.getAttribute('insertable-file-types'), DEFAULT_PICKER_INSERTABLE_TYPES); }
  acceptedFileTypes() { return attrList(this.getAttribute('accepted-file-types'), DEFAULT_PICKER_ACCEPT); }
  includeShared() { return boolFromAttribute(this.getAttribute('include-shared'), true); }
  maxSelection() {
    const value = Number(this.getAttribute('max-selection') || 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }
  selectionBehavior() { return this.getAttribute('selection-behavior') || 'reference'; }
  copyOnSelect() { return boolFromAttribute(this.getAttribute('copy-on-select'), this.selectionBehavior() === 'copy'); }
  activeApplicationKey() { return this._filters.applicationKey || this.getAttribute('application-key') || this.getAttribute('default-application-key') || ''; }

  setValue(value, { reflect = false, render = false } = {}) {
    const ids = parseSelectionValue(value);
    this._selectedAssetIds = this.isMultiple() ? new Set(ids) : new Set(ids.slice(0, 1));
    this._value = this.selectionValue();
    this.syncSelectedAssets();
    this.updateFormValue();
    if (reflect && this.getAttribute('value') !== this._value) {
      this._suppressValueAttribute = true;
      if (this._value === '') this.removeAttribute('value');
      else this.setAttribute('value', this._value);
      this._suppressValueAttribute = false;
    }
    if (render && this.isConnected) this.render();
  }

  selectionValue() {
    const ids = Array.from(this._selectedAssetIds).filter(Boolean);
    return this.isMultiple() ? JSON.stringify(ids) : (ids[0] || '');
  }

  updateValueFromSelection({ emitNative = false } = {}) {
    this._value = this.selectionValue();
    this.updateFormValue();
    if (this.getAttribute('value') !== this._value) {
      this._suppressValueAttribute = true;
      if (this._value === '') this.removeAttribute('value');
      else this.setAttribute('value', this._value);
      this._suppressValueAttribute = false;
    }
    if (emitNative) this.emitNativeFormEvents();
  }

  updateFormValue() {
    this._internals?.setFormValue?.(this._value);
    this.syncFallbackInput();
  }

  syncFallbackInput() {
    if (this._internals || typeof document === 'undefined') return;
    const existing = Array.from(this.children).find((child) => child?.dataset?.uibAssetPickerValue === 'true');
    const name = this.fieldName();
    if (!name) {
      existing?.remove();
      return;
    }
    const input = existing || document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = this._value;
    input.dataset.uibAssetPickerValue = 'true';
    if (!existing) this.appendChild(input);
  }

  emitNativeFormEvents() {
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  cacheAssets(assets = []) {
    normalizeAssets(assets).forEach((asset) => {
      if (asset.id) this._assetCache.set(asset.id, asset);
    });
  }

  selectedAssets() {
    const ids = Array.from(this._selectedAssetIds);
    return ids.map((id) => this._assetCache.get(id) || this._assets.find((asset) => asset.id === id)).filter(Boolean);
  }

  syncSelectedAssets() {
    const selectedAssets = this.selectedAssets();
    this._selectedAsset = selectedAssets[0] || null;
  }

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
      status: this.getAttribute('default-status') || this._filters.status || DEFAULT_PICKER_STATUS
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
    if (!this._provider) { this.syncSelectedAssets(); this.render(); return; }
    this._loading = true;
    this.render();
    try {
      const result = await this._provider.search({
        query: this._query,
        filters: this._filters,
        applicationKey: this.activeApplicationKey(),
        includeShared: this.includeShared()
      });
      this._assets = this.filterInsertableAssets(normalizeAssets(result?.records || []));
      this.cacheAssets(this._assets);
      this.syncSelectedAssets();
      this._message = `${this._assets.length} asset${this._assets.length === 1 ? '' : 's'} loaded.`;
      this.updateValueFromSelection();
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

  open(options = {}) {
    if (this.disabled()) return;
    const { upload = false } = options || {};
    this._open = true;
    this._filtersOpen = false;
    this._uploadOpen = Boolean(upload);
    if (upload) this._uploadMessage = this._pendingUploadFile ? `Selected ${this._pendingUploadFile.name}. Press upload to save it.` : '';
    this.render();
    queueMicrotask(() => {
      if (upload) {
        this.shadowRoot.querySelector('input[name="assetFile"]')?.focus();
        return;
      }
      this.shadowRoot.querySelector('[data-search-input]')?.focus();
    });
  }

  close() {
    this._open = false;
    this._filtersOpen = false;
    this._uploadOpen = false;
    this._uploadMessage = '';
    this.render();
  }

  openUpload() {
    this.open({ upload: true });
  }

  toggleOpen() {
    if (this._open) this.close();
    else this.open();
  }

  render() {
    const activeElement = this.shadowRoot?.activeElement || null;
    const restoreSearchFocus = activeElement?.matches?.('[data-search-input]');
    const searchSelectionStart = restoreSearchFocus ? activeElement.selectionStart : null;
    const searchSelectionEnd = restoreSearchFocus ? activeElement.selectionEnd : null;
    const selectedAssets = this.selectedAssets();
    const selectedIds = Array.from(this._selectedAssetIds);
    const selectedCount = selectedIds.length;
    const label = this.label();
    const placeholder = this.placeholder();
    const name = this.fieldName();
    const disabled = this.disabled();
    const open = this._open;
    const selectionMode = this.selectionMode();
    const canUseSelected = this.isMultiple() && selectedCount > 0;
    const selectedSummary = this.renderSelectedSummary(selectedAssets, selectedIds, placeholder);
    const filterPanelId = 'uib-asset-picker-filters';
    const uploadPanelId = 'uib-asset-picker-upload';
    this.shadowRoot.innerHTML = (
  `<style>` +
  (baseAssetStyles) +
  ` :host { display: block; position: relative; } .picker-shell { display: grid; gap: 0.35rem; position: relative; } .field-label { display: inline-flex; color: var(--uib-assets-muted); font-size: 0.85rem; font-weight: 850; } .control-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto auto; gap: 0.45rem; align-items: stretch; } .picker-value { width: 100%; min-height: 3.1rem; display: grid; align-items: center; border: 1px solid var(--uib-assets-border-strong); border-radius: 0.85rem; padding: 0.35rem 0.5rem; background: var(--uib-assets-surface); } .picker-action, .clear-button, .filter-icon, .upload-icon, .dialog-close { min-width: 2.25rem; min-height: 2.25rem; border-radius: 999px; white-space: nowrap; } .picker-action.primary { padding-inline: 0.9rem; } .picker-action.primary.icon-button { padding: 0; color: var(--uib-assets-primary-contrast); background: var(--uib-assets-primary); border-color: var(--uib-assets-primary); } .icon-button { width: 2.35rem; min-width: 2.35rem; padding: 0; display: inline-grid; place-items: center; font-size: 1.05rem; line-height: 1; } .picker-value[data-disabled="true"], .picker-action:disabled, .clear-button:disabled { cursor: not-allowed; opacity: 0.58; } .selected-single, .placeholder-line { display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 0.55rem; align-items: center; min-width: 0; } .placeholder-thumb { width: 42px; height: 42px; border-radius: 0.65rem; border: 1px dashed var(--uib-assets-border-strong); background: var(--uib-assets-surface-soft); display: grid; place-items: center; color: var(--uib-assets-muted); font-weight: 950; } .selected-single uib-asset-thumbnail { width: 42px; } .selected-text { display: grid; min-width: 0; } .selected-name { overflow: hidden; color: var(--uib-assets-text); font-weight: 950; line-height: 1.2; text-overflow: ellipsis; white-space: nowrap; } .selected-meta { overflow: hidden; color: var(--uib-assets-muted); font-size: 0.76rem; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; } .chip-wrap { display: flex; flex-wrap: wrap; gap: 0.35rem; min-width: 0; } .asset-chip { display: inline-grid; grid-template-columns: 28px minmax(0, auto); gap: 0.35rem; align-items: center; max-width: 15rem; padding: 0.22rem 0.45rem 0.22rem 0.28rem; border: 1px solid var(--uib-assets-border); border-radius: 999px; background: var(--uib-assets-surface-soft); } .asset-chip uib-asset-thumbnail { width: 28px; } .asset-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8rem; font-weight: 850; } .modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 1rem; background: rgba(6, 21, 40, 0.56); } .modal-dialog { width: min(36rem, calc(100vw - 2rem)); max-height: min(74vh, 40rem); display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; gap: 0.55rem; overflow: hidden; padding: 0.85rem; border: 1px solid var(--uib-assets-border-strong); border-radius: var(--uib-assets-radius); background: var(--uib-assets-surface); box-shadow: 0 24px 72px rgba(10, 31, 68, 0.28); } .dialog-header { display: flex; gap: 0.75rem; align-items: start; justify-content: space-between; } .dialog-title-wrap { min-width: 0; } .picker-toolbar { display: grid; grid-template-columns: minmax(12rem, 1fr) auto auto; gap: 0.35rem; align-items: center; } .picker-toolbar input { min-height: 2.35rem; } .dialog-panels { display: grid; gap: 0.45rem; } .filter-panel, .upload-panel { display: grid; gap: 0.55rem; padding: 0.6rem; border: 1px solid var(--uib-assets-border); border-radius: 0.75rem; background: var(--uib-assets-surface-soft); } .filter-panel { width: min(100%, 30rem); justify-self: start; box-shadow: 0 8px 24px rgba(10, 31, 68, 0.08); } .filter-panel[hidden], .upload-panel[hidden], [hidden] { display: none !important; } .filter-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: end; } .filter-grid label { width: auto; min-width: 7.2rem; max-width: 10.5rem; } .filter-grid input, .filter-grid select { width: auto; min-width: 7.2rem; max-width: 10.5rem; } .filter-grid input[name="applicationKey"] { max-width: 10rem; } .filter-actions, .picker-footer { display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: center; justify-content: space-between; } .status { min-height: 1.25rem; color: var(--uib-assets-muted); font-size: 0.78rem; } .modal-body { min-height: 0; overflow: auto; padding-right: 0.15rem; } .asset-options { display: grid; gap: 0.3rem; } .asset-option { width: 100%; min-height: auto; display: grid; grid-template-columns: 44px minmax(0, 1fr) auto; gap: 0.5rem; align-items: center; padding: 0.42rem; border-radius: 0.7rem; text-align: left; background: var(--uib-assets-surface); } .asset-option[aria-selected="true"], .asset-option[aria-pressed="true"] { border-color: var(--uib-assets-primary); background: var(--uib-assets-surface-tint); } .asset-option uib-asset-thumbnail { width: 44px; } .asset-name { overflow: hidden; margin: 0; padding-left: 0.75rem; color: var(--uib-assets-text); font-weight: 900; text-overflow: ellipsis; white-space: nowrap; } .selected-mark { display: inline-grid; width: 1.35rem; height: 1.35rem; place-items: center; border-radius: 999px; border: 1px solid var(--uib-assets-border-strong); color: var(--uib-assets-muted); font-size: 0.75rem; font-weight: 950; } .asset-option[aria-selected="true"] .selected-mark, .asset-option[aria-pressed="true"] .selected-mark { background: var(--uib-assets-primary); border-color: var(--uib-assets-primary); color: var(--uib-assets-primary-contrast); } .upload-grid { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 0.55rem; align-items: start; } .upload-preview { min-height: 64px; display: grid; place-items: center; border: 1px dashed var(--uib-assets-border-strong); border-radius: 0.7rem; background: var(--uib-assets-surface); color: var(--uib-assets-muted); font-size: 0.78rem; text-align: center; } .upload-preview img { width: 100%; height: 64px; object-fit: cover; border-radius: 0.6rem; } .upload-fields { display: grid; gap: 0.55rem; } .upload-fields textarea { min-height: 4.5rem; } .file-row { display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: center; } .small-button { min-height: 2rem; padding: 0.3rem 0.7rem; border-radius: 0.65rem; font-size: 0.84rem; } .selected-file-name { color: var(--uib-assets-muted); font-size: 0.84rem; font-weight: 750; } .visually-hidden-file { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none; } .upload-status { margin: 0; padding: 0.45rem 0.6rem; border: 1px solid var(--uib-assets-border); border-radius: 0.65rem; background: var(--uib-assets-surface); color: var(--uib-assets-text); font-size: 0.84rem; font-weight: 750; } .strong { color: var(--uib-assets-text); font-weight: 850; } @media (max-width: 640px) { .control-row { grid-template-columns: 1fr; } .picker-action, .clear-button { justify-self: start; } .modal-backdrop { align-items: end; padding: 0.5rem; } .modal-dialog { width: 100%; max-height: 94vh; } .picker-toolbar, .filter-grid, .upload-grid { grid-template-columns: 1fr; } } ` +
  `</style>` +
  `<div class="picker-shell" data-open="` +
  (open ? 'true' : 'false') +
  `"> ` +
  (name ? `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(this._value)}" />` : '') +
  ` ` +
  (label ? `<span class="field-label">${escapeHtml(label)}</span>` : '') +
  ` ` +
  `<div class="control-row">` +
  `<div class="picker-value" data-disabled="` +
  (disabled ? 'true' : 'false') +
  `" aria-live="polite" title="Selected asset for this field"> ` +
  (selectedSummary) +
  ` ` +
  `</div>` +
  `<button type="button" class="picker-action primary icon-button" data-open-picker title="Browse existing assets" aria-label="Browse existing assets" ` +
  (disabled ? 'disabled' : '') +
  `>` +
  `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">` +
  `<path fill="currentColor" d="M10.5 4a6.5 6.5 0 0 1 5.17 10.44l4.45 4.44-1.41 1.41-4.45-4.44A6.5 6.5 0 1 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z">` +
  `</path>` +
  `</svg>` +
  `</button>` +
  ` ` +
  (this.allowUpload() ? `<button type="button" class="picker-action icon-button" data-open-upload title="Upload a new asset" aria-label="Upload a new asset" ${disabled ? 'disabled' : ''}>⇧</button>` : '') +
  ` ` +
  (selectedCount ? `<button type="button" class="clear-button danger" data-clear-selection title="Clear selected asset" ${disabled ? 'disabled' : ''}>Clear</button>` : '') +
  ` ` +
  `</div>` +
  ` ` +
  (open ? this.renderModal(selectionMode, canUseSelected, filterPanelId, uploadPanelId) : '') +
  ` ` +
  `</div>`
);

    this.wireEvents();
    this.assignThumbnails();
    if (restoreSearchFocus) {
      queueMicrotask(() => {
        const input = this.shadowRoot.querySelector('[data-search-input]');
        if (!input) return;
        input.focus();
        if (typeof searchSelectionStart === 'number' && typeof input.setSelectionRange === 'function') {
          input.setSelectionRange(searchSelectionStart, searchSelectionEnd ?? searchSelectionStart);
        }
      });
    }
  }

  renderSelectedSummary(selectedAssets, selectedIds, placeholder) {
    if (this.isMultiple()) {
      if (!selectedIds.length) {
        return (
  `<span class="placeholder-line">` +
  `<span class="placeholder-thumb" aria-hidden="true">` +
  `+` +
  `</span>` +
  `<span class="selected-text">` +
  `<span class="selected-name">` +
  (escapeHtml(placeholder)) +
  `</span>` +
  `<span class="selected-meta">` +
  `Attach one or more assets` +
  `</span>` +
  `</span>` +
  `</span>`
);
      }
      return (
  `<span class="chip-wrap">` +
  (selectedIds.map((id) => {
        const asset = selectedAssets.find((item) => item.id === id);
        return `<span class="asset-chip" data-chip-id="${escapeHtml(id)}">${asset ? '<uib-asset-thumbnail></uib-asset-thumbnail>' : '<span class="placeholder-thumb" aria-hidden="true">?</span>'}<span>${escapeHtml(asset?.name || id)}</span></span>`;
      }).join('')) +
  `</span>`
);
    }

    const selectedId = selectedIds[0] || '';
    const asset = selectedAssets[0] || null;
    if (!selectedId) {
      return (
  `<span class="placeholder-line">` +
  `<span class="placeholder-thumb" aria-hidden="true">` +
  `+` +
  `</span>` +
  `<span class="selected-text">` +
  `<span class="selected-name">` +
  (escapeHtml(placeholder)) +
  `</span>` +
  `<span class="selected-meta">` +
  `Attach an image, file, or asset` +
  `</span>` +
  `</span>` +
  `</span>`
);
    }
    return (
  `<span class="selected-single">` +
  (asset ? '<uib-asset-thumbnail class="selected-thumbnail"></uib-asset-thumbnail>' : '<span class="placeholder-thumb" aria-hidden="true">?</span>') +
  `<span class="selected-text">` +
  `<span class="selected-name">` +
  (escapeHtml(asset?.name || selectedId)) +
  `</span>` +
  `<span class="selected-meta">` +
  (escapeHtml(asset ? [asset.fileType, asset.category].filter(Boolean).join(' · ') : 'Asset selected')) +
  `</span>` +
  `</span>` +
  `</span>`
);
  }

  renderModal(selectionMode, canUseSelected, filterPanelId, uploadPanelId) {
    const allowUpload = this.allowUpload();
    const view = 'list';
    const filtersButtonLabel = this._filtersOpen ? 'Hide more filters' : 'Show more filters';
    const uploadButtonLabel = this._uploadOpen ? 'Hide upload form' : 'Upload a new asset';
    return (
  `<div class="modal-backdrop" data-modal-backdrop role="presentation">` +
  `<section class="modal-dialog" role="dialog" aria-modal="true" aria-label="Choose asset">` +
  `<div class="dialog-header">` +
  `<div class="dialog-title-wrap">` +
  `<h2 class="title">` +
  ` Choose an asset ` +
  `</h2>` +
  `<p class="subtitle">` +
  ` Search existing assets first. Upload a new file only when needed. ` +
  `</p>` +
  `</div>` +
  `<button type="button" class="dialog-close icon-button" data-close-picker aria-label="Close asset picker" title="Close asset picker">` +
  ` × ` +
  `</button>` +
  `</div>` +
  `<div class="dialog-panels">` +
  `<div class="picker-toolbar">` +
  `<input data-search-input value="` +
  (escapeHtml(this._query)) +
  `" placeholder="Search assets" aria-label="Search assets" title="Search assets by name, description, tag, or file name" /><button type="button" class="filter-icon icon-button ` +
  (this._filtersOpen ? 'primary' : '') +
  `" data-toggle-filters aria-controls="` +
  (filterPanelId) +
  `" aria-expanded="` +
  (this._filtersOpen ? 'true' : 'false') +
  `" title="` +
  (filtersButtonLabel) +
  `" aria-label="` +
  (filtersButtonLabel) +
  `"> ☰ ` +
  `</button>` +
  ` ` +
  (allowUpload ? `<button type="button" data-toggle-upload class="upload-icon icon-button ${this._uploadOpen ? 'primary' : ''}" aria-controls="${uploadPanelId}" aria-expanded="${this._uploadOpen ? 'true' : 'false'}" title="${uploadButtonLabel}" aria-label="${uploadButtonLabel}">⇧</button>` : '') +
  ` ` +
  `</div>` +
  `<div class="status" aria-live="polite">` +
  ` ` +
  (this._loading ? 'Loading assets...' : escapeHtml(this._message || 'Choose an asset.')) +
  ` ` +
  `</div>` +
  ` ` +
  (this._filtersOpen ? `
            <form id="${filterPanelId}" class="filter-panel" data-filter-panel-open="true">
            ${this.renderFilterFields()}
            </form>
            ` : '') +
  ` ` +
  (allowUpload && this._uploadOpen ? `
            <form id="${uploadPanelId}" class="upload-panel" data-upload-panel-open="true">
            ${this.renderUploadFields()}
            </form>
            ` : '') +
  ` ` +
  `</div>` +
  `<div class="modal-body">` +
  ` ` +
  (this._assets.length ? `
            <div class="asset-options" data-view="${escapeHtml(view)}" role="listbox" aria-multiselectable="${this.isMultiple() ? 'true' : 'false'}">
            ${this._assets.map((asset) => this.renderAssetOption(asset)).join('')}
            </div>
            ` : `<div class="empty-state">No insertable assets match the current filters. Try a broader search, change filters, or upload a new file.</div>`) +
  ` ` +
  `</div>` +
  ` ` +
  (selectionMode === 'multiple' ? `<div class="picker-footer"><span class="small muted">${this._selectedAssetIds.size} selected</span><button type="button" class="primary" data-use-selected title="Use the selected assets" ${canUseSelected ? '' : 'disabled'}>Use Selected</button></div>` : '') +
  ` ` +
  `</section>` +
  `</div>`
);
  }

  renderFilterFields() {
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
  `<label title="Limit results to assets for one application">` +
  `Application <input name="applicationKey" value="` +
  (escapeHtml(filters.applicationKey || '')) +
  `" placeholder="demo-app" title="Limit results to assets for one application" />` +
  `</label>` +
  `<label title="Limit results to one category">` +
  `Category ` +
  `<select name="category" title="Limit results to one category">` +
  (option('all', 'All categories', filters.category)) +
  (this._categories.map((category) => option(categoryKey(category), categoryName(category), filters.category)).join('')) +
  `</select>` +
  `</label>` +
  `<label title="Limit results to one file type">` +
  `File type ` +
  `<select name="fileType" title="Limit results to one file type">` +
  (option('all', 'All file types', filters.fileType)) +
  (ASSET_FILE_TYPES.map((type) => option(type, humanize(type), filters.fileType)).join('')) +
  `</select>` +
  `</label>` +
  `<label title="Limit results by reuse scope">` +
  `Scope ` +
  `<select name="scope" title="Limit results by reuse scope">` +
  (option('all', 'All scopes', filters.scope)) +
  (ASSET_SCOPES.map((scope) => option(scope, humanize(scope), filters.scope)).join('')) +
  `</select>` +
  `</label>` +
  `<label title="Limit results by visibility">` +
  `Visibility ` +
  `<select name="visibility" title="Limit results by visibility">` +
  (option('all', 'All visibility', filters.visibility)) +
  (ASSET_VISIBILITIES.map((visibility) => option(visibility, humanize(visibility), filters.visibility)).join('')) +
  `</select>` +
  `</label>` +
  `<label title="Limit results by status">` +
  `Status ` +
  `<select name="status" title="Limit results by status">` +
  (option('active', 'Active', filters.status)) +
  (option('archived', 'Archived', filters.status)) +
  (option('all', 'Active and archived', filters.status)) +
  `</select>` +
  `</label>` +
  `</div>` +
  `<div class="filter-actions">` +
  `<button type="submit" class="primary" title="Apply selected filters">` +
  `Apply filters` +
  `</button>` +
  `<button type="button" data-clear-filters title="Clear filters and show broader results">` +
  `Clear` +
  `</button>` +
  `</div>`
);
  }

  renderUploadFields() {
    const accept = this.acceptedFileTypes().join(',');
    const hasPendingFile = Boolean(this._pendingUploadFile);
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
  (escapeHtml(this._pendingUploadFileName || 'No file selected')) +
  `</span>`
);
    const uploadStatus = this._uploadMessage
      ? (
  `<p class="upload-status" role="status" aria-live="polite">` +
  ` ` +
  (escapeHtml(this._uploadMessage)) +
  ` ` +
  `</p>`
)
      : '';
    return (
  `<div class="row-between">` +
  `<div>` +
  `<h2 class="title">` +
  ` Upload asset ` +
  `</h2>` +
  `<p class="subtitle small">` +
  ` Choose a file and optionally add a description. Defaults are applied automatically. ` +
  `</p>` +
  `</div>` +
  `<button type="button" class="primary icon-button" data-upload-submit title="Upload selected file" aria-label="Upload selected file">` +
  ` ⇧ ` +
  `</button>` +
  `</div>` +
  `<div class="upload-grid">` +
  `<div class="upload-preview">` +
  ` ` +
  (preview) +
  ` ` +
  `</div>` +
  `<div class="upload-fields">` +
  `<label title="Choose a local file to upload">` +
  ` File ` +
  `<span class="file-row">` +
  `<button type="button" class="small-button" data-choose-upload-file title="Choose a local file to upload">` +
  ` Choose file ` +
  `</button>` +
  `<span class="selected-file-name" title="Selected file name">` +
  ` ` +
  (escapeHtml(this._pendingUploadFileName || 'No file selected')) +
  ` ` +
  `</span>` +
  `</span>` +
  `<input class="visually-hidden-file" data-upload-file-input name="assetFile" type="file" accept="` +
  (escapeHtml(accept)) +
  `" title="Choose a local file to upload" />` +
  `</label>` +
  `<label title="Describe the asset for future search and reuse">` +
  ` Description ` +
  `<textarea name="description" data-upload-description placeholder="Optional description" title="Describe the asset for future search and reuse">` +
  ` ` +
  (escapeHtml(this._pendingUploadDescription || '')) +
  ` ` +
  `</textarea>` +
  `</label>` +
  ` ` +
  (uploadStatus) +
  ` ` +
  `<p class="subtitle small">` +
  ` Defaults: type inferred from file, scope ` +
  (escapeHtml(this.uploadDefaultScope())) +
  ` , visibility ` +
  (escapeHtml(this.uploadDefaultVisibility())) +
  ` , category ` +
  (escapeHtml(this.uploadDefaultCategory())) +
  ` , status active. ` +
  `</p>` +
  ` ` +
  (hasPendingFile ? '<p class="subtitle small strong">Ready to upload the selected file.</p>' : '<p class="subtitle small">Select a file before pressing upload.</p>') +
  ` ` +
  `</div>` +
  `</div>`
);
  }

  renderAssetOption(asset) {
    const selected = this._selectedAssetIds.has(asset.id);
    const pressed = selected ? 'true' : 'false';
    const checkText = selected ? '✓' : (this.isMultiple() ? '+' : '');
    return (
  `<button type="button" class="asset-option" data-id="` +
  (escapeHtml(asset.id)) +
  `" role="option" aria-pressed="` +
  (pressed) +
  `" aria-selected="` +
  (pressed) +
  `" title="Choose ` +
  (escapeHtml(asset.name)) +
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

  wireEvents() {
    this.shadowRoot.querySelector('[data-open-picker]')?.addEventListener('click', () => this.open());
    this.shadowRoot.querySelector('[data-open-upload]')?.addEventListener('click', () => this.openUpload());
    this.shadowRoot.querySelector('[data-toggle-picker]')?.addEventListener('click', () => this.toggleOpen());
    this.shadowRoot.querySelector('[data-close-picker]')?.addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('[data-modal-backdrop]')?.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) this.close();
    });
    this.shadowRoot.querySelector('[data-clear-selection]')?.addEventListener('click', () => this.clearSelection());
    this.shadowRoot.querySelector('[data-toggle-filters]')?.addEventListener('click', () => {
      this._filtersOpen = !this._filtersOpen;
      this.render();
    });
    this.shadowRoot.querySelector('[data-toggle-upload]')?.addEventListener('click', () => {
      this._uploadOpen = !this._uploadOpen;
      this.render();
    });
    this.shadowRoot.querySelector('[data-search-input]')?.addEventListener('input', (event) => {
      this._query = String(event.currentTarget.value || '').trim();
      if (this._searchTimer) clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this.loadAssets(), 180);
    });
    this.shadowRoot.querySelector('form.filter-panel')?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleFilterSubmit(event.currentTarget);
    });
    this.shadowRoot.querySelector('[data-clear-filters]')?.addEventListener('click', () => this.clearFilters());
    const uploadFileInput = this.shadowRoot.querySelector('[data-upload-file-input]');
    this.shadowRoot.querySelector('[data-choose-upload-file]')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      uploadFileInput?.click();
    });
    uploadFileInput?.addEventListener('change', (event) => {
      this.setPendingUploadFile(event.currentTarget.files?.[0] || null);
    });
    this.shadowRoot.querySelector('[data-upload-description]')?.addEventListener('input', (event) => {
      this._pendingUploadDescription = String(event.currentTarget.value || '');
    });
    this.shadowRoot.querySelector('[data-upload-submit]')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      void this.handleUpload(event.currentTarget?.closest('form.upload-panel') || null);
    });
    this.shadowRoot.querySelector('form.upload-panel')?.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handleUpload(event.currentTarget);
    });
    this.shadowRoot.querySelectorAll('.asset-option').forEach((button) => {
      button.addEventListener('click', () => this.handleAssetClick(button.dataset.id));
    });
    this.shadowRoot.querySelector('[data-use-selected]')?.addEventListener('click', () => this.emitMultipleSelection());
  }

  assignThumbnails() {
    this.shadowRoot.querySelector('.selected-thumbnail')?.setAttribute('data-ready', 'true');
    const selectedThumbnail = this.shadowRoot.querySelector('.selected-thumbnail');
    if (selectedThumbnail) selectedThumbnail.asset = this._selectedAsset;
    this.shadowRoot.querySelectorAll('.asset-chip').forEach((chip) => {
      const thumbnail = chip.querySelector('uib-asset-thumbnail');
      if (!thumbnail) return;
      thumbnail.asset = this._assetCache.get(chip.dataset.chipId) || this._assets.find((asset) => asset.id === chip.dataset.chipId) || null;
    });
    this.shadowRoot.querySelectorAll('.asset-option uib-asset-thumbnail').forEach((thumbnail, index) => {
      thumbnail.asset = this._assets[index];
    });
  }

  handleFilterSubmit(form) {
    const formData = new FormData(form);
    this._filters = {
      ...this._filters,
      applicationKey: String(formData.get('applicationKey') || '').trim(),
      category: String(formData.get('category') || 'all'),
      fileType: String(formData.get('fileType') || 'all'),
      scope: String(formData.get('scope') || 'all'),
      visibility: String(formData.get('visibility') || 'all'),
      status: String(formData.get('status') || DEFAULT_PICKER_STATUS)
    };
    this.loadAssets();
  }

  clearFilters() {
    this._query = '';
    this._filters = { applicationKey: '', fileType: 'all', scope: 'all', visibility: 'all', category: 'all', status: DEFAULT_PICKER_STATUS };
    this._defaultsApplied = false;
    this.applyDefaultFilters({ force: true });
    this.loadAssets();
  }

  setPendingUploadFile(file) {
    this.revokePendingUploadPreview();
    this._pendingUploadFile = file || null;
    this._pendingUploadFileName = file?.name || '';
    this._uploadMessage = file ? `Selected ${file.name}. Press upload to save it.` : '';
    if (file && String(file.type || '').startsWith('image/') && typeof URL !== 'undefined' && URL.createObjectURL) {
      this._pendingUploadPreviewUrl = URL.createObjectURL(file);
    }
    this.render();
  }

  revokePendingUploadPreview() {
    if (this._pendingUploadPreviewUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) URL.revokeObjectURL(this._pendingUploadPreviewUrl);
    this._pendingUploadPreviewUrl = '';
  }

  showUploadProblem(message, detail = {}) {
    this._uploadMessage = message;
    this._message = message;
    emitAssetEvent(this, 'asset-upload-invalid', { errors: [message], ...detail });
    emitAssetEvent(this, 'uib-asset-upload-invalid', { errors: [message], ...detail });
    this.render();
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

  uploadDefaultAssetType(file) {
    const configured = this._filters.fileType && this._filters.fileType !== 'all'
      ? this._filters.fileType
      : this.getAttribute('default-asset-type') || this.getAttribute('default-file-type') || '';
    return configured || inferFileType(file);
  }

  validateUpload(file) {
    const errors = [];
    if (!file) errors.push('Choose a file to upload.');
    const maxFileSizeBytes = Number(this._uploadPolicy?.maxFileSizeBytes || 0);
    if (file && maxFileSizeBytes && file.size > maxFileSizeBytes) errors.push(`File exceeds ${maxFileSizeBytes} bytes.`);
    if (file && !acceptedMatches(file, this.acceptedFileTypes())) errors.push(`File type is not allowed: ${file.type || file.name || 'unknown'}.`);
    return errors;
  }

  async handleUpload(form = null) {
    this.ensureProvider();
    const formData = form ? new FormData(form) : null;
    const descriptionControl = this.shadowRoot.querySelector('[data-upload-description]');
    if (descriptionControl) this._pendingUploadDescription = String(descriptionControl.value || '');
    const file = this._pendingUploadFile || fileFromFormValue(formData?.get('assetFile'));
    const actualFile = fileFromFormValue(file);
    const errors = this.validateUpload(actualFile);
    if (errors.length) {
      this._uploadMessage = errors.join(' ');
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
    const fileType = this.uploadDefaultAssetType(actualFile);
    const request = {
      sourceType: 'local_file',
      name,
      key: uniqueUploadKey(name),
      description: String(this._pendingUploadDescription || formData?.get('description') || '').trim(),
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

    this._uploadMessage = `Uploading ${actualFile.name}...`;
    emitAssetEvent(this, 'asset-upload-request', { request });
    emitAssetEvent(this, 'uib-asset-upload-request', { request });
    if (!this._provider?.createAsset) {
      this._uploadMessage = 'Live upload is unavailable because the ORM provider is not connected.';
      this._message = 'Live upload is unavailable because the ORM provider is not connected.';
      emitAssetEvent(this, 'asset-upload-invalid', { errors: ['ORM provider is not connected.'] });
      emitAssetEvent(this, 'uib-asset-upload-invalid', { errors: ['ORM provider is not connected.'] });
      this.render();
      return;
    }

    this._loading = true;
    this._message = 'Uploading asset...';
    this.render();
    try {
      const created = await this.createAssetFromRequest(request);
      const asset = normalizeAsset(created);
      this.cacheAssets([asset]);
      this._pendingUploadFile = null;
      this._pendingUploadFileName = '';
      this._pendingUploadDescription = '';
      this.revokePendingUploadPreview();
      await this.loadAssets();
      this._uploadMessage = `Uploaded ${asset.name}.`;
      this._message = `Uploaded ${asset.name}.`;
      emitAssetEvent(this, 'asset-uploaded', { asset, insert: buildInsertPayload(asset, { uploaded: true }) });
      emitAssetEvent(this, 'uib-asset-uploaded', { asset, insert: buildInsertPayload(asset, { uploaded: true }) });
      emitAssetEvent(this, 'uib-asset-created', { asset });
      if (this.isMultiple()) {
        this._selectedAssetIds.add(asset.id);
        this.updateValueFromSelection({ emitNative: true });
        emitAssetEvent(this, 'asset-selection-change', this.currentMultiSelectionDetail({ uploaded: true }));
        this.render();
      } else {
        await this.emitSingleSelection(asset, { uploaded: true });
      }
    } catch (error) {
      if (await this.handleUploadConflict(error, request)) return;
      const message = this.uploadErrorMessage(error);
      this._uploadMessage = message;
      this._message = message;
      emitAssetEvent(this, 'asset-upload-error', { error: message, request, detail: error?.body || null });
      emitAssetEvent(this, 'uib-asset-upload-error', { error: message, request, detail: error?.body || null });
      this.render();
    } finally {
      this._loading = false;
      this.render();
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

  uploadErrorMessage(error) {
    const body = error?.body || null;
    if (typeof body === 'string' && body.trim()) return body.trim();
    const bodyMessage = body?.message || body?.detail || body?.title || body?.error || '';
    if (bodyMessage) return String(bodyMessage);
    if (error?.message) return String(error.message);
    return 'Upload failed.';
  }

  conflictAssetId(error) {
    const body = error?.body || {};
    const candidates = [
      body.assetId,
      body.asset_id,
      body.existingAssetId,
      body.existing_asset_id,
      body.id,
      body.asset?.assetId,
      body.asset?.asset_id,
      body.asset?.id,
      body.record?.assetId,
      body.record?.asset_id,
      body.record?.id,
      body.existing?.assetId,
      body.existing?.asset_id,
      body.existing?.id
    ];
    return candidates.map((value) => String(value || '').trim()).find(Boolean) || '';
  }

  isUploadConflict(error) {
    const status = Number(error?.status || error?.body?.status || 0);
    if (status === 409) return true;
    return /already exists|duplicate|conflict/i.test(this.uploadErrorMessage(error));
  }

  findExistingAssetForConflict(assetId, request = {}) {
    const id = String(assetId || '').trim();
    const key = String(request.key || request.assetKey || request.asset_key || '').trim();
    const name = String(request.name || '').trim().toLowerCase();
    const originalFileName = String(request.originalFileName || request.fileName || '').trim().toLowerCase();
    const baseFileName = stripExtension(originalFileName).trim().toLowerCase();
    return this._assets.find((asset) => {
      const normalized = normalizeAsset(asset);
      if (id && normalized.id === id) return true;
      if (key && normalized.key === key) return true;
      const assetName = String(normalized.name || '').trim().toLowerCase();
      return Boolean(assetName && (assetName === name || assetName === baseFileName));
    }) || null;
  }

  async handleUploadConflict(error, request = {}) {
    if (!this.isUploadConflict(error)) return false;

    const message = this.uploadErrorMessage(error) || 'Asset already exists.';
    const assetId = this.conflictAssetId(error);
    let existingAsset = null;
    let fetchErrorMessage = '';

    if (assetId && this._provider?.getAsset) {
      try {
        existingAsset = normalizeAsset(await this._provider.getAsset(assetId, request.applicationKey));
      } catch (fetchError) {
        fetchErrorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      }
    }

    if (!existingAsset) existingAsset = this.findExistingAssetForConflict(assetId, request);

    if (!existingAsset) {
      try {
        await this.loadAssets();
        existingAsset = this.findExistingAssetForConflict(assetId, request);
      } catch (loadError) {
        if (!fetchErrorMessage) fetchErrorMessage = loadError instanceof Error ? loadError.message : String(loadError);
      }
    }

    const detail = {
      error: message,
      assetId,
      request,
      asset: existingAsset || null,
      detail: error?.body || null,
      fetchError: fetchErrorMessage || null
    };

    emitAssetEvent(this, 'asset-upload-conflict', detail);
    emitAssetEvent(this, 'uib-asset-upload-conflict', detail);

    if (existingAsset) {
      const asset = normalizeAsset(existingAsset);
      this.cacheAssets([asset]);
      this._pendingUploadFile = null;
      this._pendingUploadFileName = '';
      this._pendingUploadDescription = '';
      this.revokePendingUploadPreview();
      this._uploadMessage = `Asset already exists. Selected ${asset.name}.`;
      this._message = this._uploadMessage;

      if (this.isMultiple()) {
        this._selectedAssetIds.add(asset.id);
        this.updateValueFromSelection({ emitNative: true });
        emitAssetEvent(this, 'asset-selection-change', this.currentMultiSelectionDetail({ uploadConflict: true, existing: true }));
        this.render();
      } else {
        await this.emitSingleSelection(asset, { uploadConflict: true, existing: true });
      }
      return true;
    }

    this._uploadMessage = `${message} The existing asset could not be shown. It may be hidden by current filters, application scope, visibility permissions, or status.`;
    if (fetchErrorMessage) this._uploadMessage += ` ${fetchErrorMessage}`;
    this._message = this._uploadMessage;
    this.render();
    return true;
  }

  async handleAssetClick(assetId) {
    if (this.disabled()) return;
    const asset = this._assets.find((item) => item.id === assetId);
    if (!asset) return;
    this._selectedAsset = asset;
    if (this.isMultiple()) {
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
      this.updateValueFromSelection({ emitNative: true });
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
      const copied = normalizeAsset(await this._provider.copyAssetToApplication(normalized.id, this.activeApplicationKey(), { source: 'asset-picker' }));
      this.cacheAssets([copied]);
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
      this.cacheAssets([selectedAsset]);
      this._selectedAsset = selectedAsset;
      this._selectedAssetIds = new Set([selectedAsset.id]);
      this.updateValueFromSelection({ emitNative: true });
      const insert = buildInsertPayload(selectedAsset, {
        ...extra,
        copied: resolved.copied,
        sourceAssetId: resolved.sourceAssetId,
        copyUnavailable: resolved.copyUnavailable
      });
      const selection = assetSelection(selectedAsset);
      const detail = { ...insert, value: selectedAsset.id, asset: selectedAsset, selection };
      emitAssetEvent(this, 'asset-selected', detail);
      emitAssetEvent(this, 'uib-asset-select', { asset: selectedAsset, selection, insert, value: selectedAsset.id });
      this._message = `Selected ${selectedAsset.name}.`;
      this._open = false;
      this._filtersOpen = false;
      this._uploadOpen = false;
    } catch (error) {
      this._message = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
      this.render();
    }
  }

  currentMultiSelectionDetail(extra = {}) {
    const rawAssets = this.selectedAssets();
    const inserts = rawAssets.map((asset) => buildInsertPayload(asset, extra));
    return {
      value: this.selectionValue(),
      assetIds: Array.from(this._selectedAssetIds),
      assets: inserts,
      selections: rawAssets.map((asset) => assetSelection(asset)),
      rawAssets
    };
  }

  async emitMultipleSelection() {
    const assets = this.selectedAssets();
    if (!assets.length) return;
    this._loading = true;
    this.render();
    try {
      const resolvedAssets = [];
      const inserts = [];
      for (const asset of assets) {
        const resolved = await this.resolveAssetForSelection(asset);
        const selectedAsset = normalizeAsset(resolved.asset);
        this.cacheAssets([selectedAsset]);
        resolvedAssets.push(selectedAsset);
        inserts.push(buildInsertPayload(selectedAsset, {
          copied: resolved.copied,
          sourceAssetId: resolved.sourceAssetId,
          copyUnavailable: resolved.copyUnavailable
        }));
      }
      this._selectedAssetIds = new Set(resolvedAssets.map((asset) => asset.id));
      this.syncSelectedAssets();
      this.updateValueFromSelection({ emitNative: true });
      const selections = resolvedAssets.map((asset) => assetSelection(asset));
      emitAssetEvent(this, 'assets-selected', { value: this.selectionValue(), assetIds: Array.from(this._selectedAssetIds), assets: inserts, selections, rawAssets: resolvedAssets });
      emitAssetEvent(this, 'uib-assets-select', { value: this.selectionValue(), assets: resolvedAssets, selections, inserts });
      this._message = `Selected ${resolvedAssets.length} asset${resolvedAssets.length === 1 ? '' : 's'}.`;
      this._open = false;
      this._filtersOpen = false;
      this._uploadOpen = false;
    } catch (error) {
      this._message = error instanceof Error ? error.message : String(error);
    } finally {
      this._loading = false;
      this.render();
    }
  }

  clearSelection() {
    this._selectedAssetIds = new Set();
    this._selectedAsset = null;
    this.updateValueFromSelection({ emitNative: true });
    emitAssetEvent(this, 'asset-cleared', { value: this._value });
    emitAssetEvent(this, 'uib-asset-clear', { value: this._value });
    this.render();
  }
}

registerElement('uib-asset-picker', UibAssetPicker);
