import { defineUiBaseElement, escapeHtml, setOrRemoveAttribute } from '@ui-base/core';

const styles = `
:host{display:block;color:var(--uib-detail-editor-color,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}.field{display:grid;gap:.3rem;color:var(--uib-color-muted,#53657f);font-size:.82rem;font-weight:850}.field--wide{grid-column:1/-1}.field-note{color:var(--uib-color-muted,#53657f);font-size:.78rem;font-weight:650;line-height:1.35}input,textarea{width:100%;min-height:2.35rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:.75rem;padding:.58rem .7rem;background:var(--uib-color-surface,#fff);color:var(--uib-color-ink,#13294b);font:inherit;font-weight:700}textarea{min-height:4.5rem;resize:vertical}@media(max-width:720px){.fields{grid-template-columns:1fr}}
`;

function parseObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (!value) return {};
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function stringValue(value) {
  return value === null || value === undefined ? '' : String(value);
}

function cleanDetail(value) {
  const row = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const detail = {
    label: stringValue(row.label),
    value: stringValue(row.value),
    icon: stringValue(row.icon),
    iconUrl: stringValue(row.iconUrl || row.icon_url || row.iconSrc || row.iconHref || row.iconImage),
    iconAssetId: stringValue(row.iconAssetId || row.icon_asset_id || row.assetId || row.asset_id),
    iconAlt: stringValue(row.iconAlt || row.icon_alt || row.alt),
    description: stringValue(row.description)
  };
  return Object.fromEntries(Object.entries(detail).filter(([, item]) => item !== ''));
}

function firstTextValue(value, keys) {
  const queue = [value];
  const visited = new Set();
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);
    for (const key of keys) {
      const candidate = current[key];
      if (candidate !== undefined && candidate !== null && candidate !== '') return String(candidate);
    }
    for (const nestedKey of ['insert', 'selection', 'asset', 'record', 'storageRecord', 'raw']) {
      if (current[nestedKey]) queue.push(current[nestedKey]);
    }
  }
  return '';
}

export class UibDetailItemEdit extends HTMLElement {
  static get observedAttributes() {
    return ['detail', 'label', 'use-asset-picker', 'application-key', 'api-base-url', 'asset-map', 'index'];
  }

  constructor() {
    super();
    this._detail = undefined;
    this._suppressAttributeRender = false;
    this.headers = undefined;
    this.getAuthHeaders = undefined;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected && !this._suppressAttributeRender) this.render();
  }

  get detail() {
    if (this._detail) return cleanDetail(this._detail);
    return cleanDetail(parseObject(this.getAttribute('detail')));
  }

  set detail(value) {
    this._detail = cleanDetail(value);
    this.syncDetailAttribute(this._detail);
    if (this.isConnected) this.render();
  }

  get index() {
    const value = Number.parseInt(this.getAttribute('index') || '0', 10);
    return Number.isFinite(value) ? value : 0;
  }

  syncDetailAttribute(detail) {
    this._suppressAttributeRender = true;
    setOrRemoveAttribute(this, 'detail', JSON.stringify(cleanDetail(detail)));
    this._suppressAttributeRender = false;
  }

  collectDetail() {
    const fieldValue = (name) => this.shadowRoot.querySelector(`[data-field="${name}"]`)?.value || '';
    return cleanDetail({
      label: fieldValue('label'),
      value: fieldValue('value'),
      icon: fieldValue('icon'),
      iconUrl: fieldValue('iconUrl'),
      iconAssetId: fieldValue('iconAssetId'),
      iconAlt: fieldValue('iconAlt'),
      description: fieldValue('description')
    });
  }

  emitChange(extra = {}) {
    const detail = this.detail;
    const eventDetail = {
      index: this.index,
      oldValue: undefined,
      newValue: detail,
      detail,
      ...extra
    };
    this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail: eventDetail }));
    this.dispatchEvent(new CustomEvent('uib-detail-item-edit-change', { bubbles: true, composed: true, detail: eventDetail }));
  }

  updateFromFields(extra = {}) {
    this._detail = this.collectDetail();
    this.emitChange(extra);
  }

  emitAssetChange(extra = {}) {
    const detail = this.detail;
    this.dispatchEvent(new CustomEvent('uib-detail-item-asset-change', {
      bubbles: true,
      composed: true,
      detail: {
        index: this.index,
        assetId: detail.iconAssetId || '',
        detail,
        ...extra
      }
    }));
  }

  setAssetId(assetId, extra = {}) {
    const input = this.shadowRoot.querySelector('[data-field="iconAssetId"]');
    if (input) input.value = assetId;
    this.updateFromFields({ field: 'iconAssetId', assetId, ...extra });
    this.emitAssetChange({ assetId, ...extra });
  }

  pickerMarkup(detail) {
    if (!this.hasAttribute('use-asset-picker')) return '';
    const appKey = this.getAttribute('application-key') || '';
    const baseUrl = this.getAttribute('api-base-url') || '';
    const assetId = detail.iconAssetId || '';
    return (
  `<div class="field field--wide">` +
  `<span>` +
  `Asset picker` +
  `</span>` +
  `<span class="field-note">` +
  `Selecting an asset stores its ID in iconAssetId. Icon URL and alt text below can override the resolved asset image and alt text.` +
  `</span>` +
  `<uib-asset-picker data-detail-picker="true" data-picker-mode="simple" label="Detail icon asset" placeholder="Select or upload icon" value="` +
  (escapeHtml(assetId)) +
  `" application-key="` +
  (escapeHtml(appKey)) +
  `" default-application-key="` +
  (escapeHtml(appKey)) +
  `" api-base-url="` +
  (escapeHtml(baseUrl)) +
  `" selection-mode="single" view="list" default-layout="list" default-asset-type="image" default-file-type="image" default-reuse-scope="global" default-scope="global" default-visibility="public" asset-visibility="public" allow-upload insertable-only insertable-file-types="image,icon,svg" accepted-file-types="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/avif" copy-on-select="false" selection-behavior="select" >` +
  `</uib-asset-picker>` +
  `</div>`
);
  }

  configurePicker() {
    const picker = this.shadowRoot.querySelector('uib-asset-picker[data-detail-picker]');
    if (!picker) return;
    const assetId = this.detail.iconAssetId || '';
    picker.headers = typeof this.getAuthHeaders === 'function' ? this.getAuthHeaders() : this.headers;
    picker.getAuthHeaders = this.getAuthHeaders;
    picker.value = assetId;
    picker.selectedAssetIds = assetId ? [assetId] : [];

    picker.addEventListener('uib-asset-select', (event) => {
      event.stopPropagation();
      const assetId = firstTextValue(event.detail, ['assetId', 'asset_id', 'id', 'value']);
      if (assetId) this.setAssetId(assetId, { asset: event.detail?.asset || event.detail?.selection?.asset || null, sourceEvent: event.type });
    });
    picker.addEventListener('asset-selected', (event) => {
      event.stopPropagation();
      const assetId = firstTextValue(event.detail, ['assetId', 'asset_id', 'id', 'value']);
      if (assetId) this.setAssetId(assetId, { asset: event.detail?.asset || event.detail?.selection?.asset || null, sourceEvent: event.type });
    });
    picker.addEventListener('uib-asset-clear', (event) => {
      event.stopPropagation();
      this.setAssetId('', { cleared: true, sourceEvent: event.type });
    });
    picker.addEventListener('asset-cleared', (event) => {
      event.stopPropagation();
      this.setAssetId('', { cleared: true, sourceEvent: event.type });
    });

    if (!picker.dataset.uibConfigured && typeof picker.loadAll === 'function') {
      picker.dataset.uibConfigured = 'true';
      window.setTimeout(() => void picker.loadAll(), 0);
    }
  }

  bind() {
    this.shadowRoot.querySelectorAll('input,textarea').forEach((input) => {
      input.addEventListener('input', () => this.updateFromFields());
    });
    this.configurePicker();
  }

  render() {
    const detail = this.detail;
    this.shadowRoot.innerHTML = (
  `<style>` +
  (styles) +
  `</style>` +
  `<div class="fields" part="fields">` +
  `<label class="field">` +
  `<span>` +
  `Label` +
  `</span>` +
  `<input data-field="label" value="` +
  (escapeHtml(detail.label || '')) +
  `">` +
  `</label>` +
  `<label class="field">` +
  `<span>` +
  `Value` +
  `</span>` +
  `<input data-field="value" value="` +
  (escapeHtml(detail.value || '')) +
  `">` +
  `</label>` +
  `<label class="field">` +
  `<span>` +
  `Text icon fallback` +
  `</span>` +
  `<input data-field="icon" value="` +
  (escapeHtml(detail.icon || '')) +
  `" placeholder="ex: OK">` +
  `</label>` +
  `<label class="field">` +
  `<span>` +
  `Icon asset ID` +
  `</span>` +
  `<input data-field="iconAssetId" value="` +
  (escapeHtml(detail.iconAssetId || '')) +
  `" placeholder="asset_123">` +
  `</label>` +
  ` ` +
  (this.pickerMarkup(detail)) +
  ` ` +
  `<label class="field">` +
  `<span>` +
  `Icon URL override` +
  `</span>` +
  `<input data-field="iconUrl" value="` +
  (escapeHtml(detail.iconUrl || '')) +
  `" placeholder="/icons/example.svg">` +
  `</label>` +
  `<label class="field">` +
  `<span>` +
  `Icon alt override` +
  `</span>` +
  `<input data-field="iconAlt" value="` +
  (escapeHtml(detail.iconAlt || '')) +
  `">` +
  `</label>` +
  `<label class="field field--wide">` +
  `<span>` +
  `Description` +
  `</span>` +
  `<textarea data-field="description">` +
  (escapeHtml(detail.description || '')) +
  `</textarea>` +
  `</label>` +
  `</div>`
);
    this.bind();
  }
}

defineUiBaseElement('uib-detail-item-edit', UibDetailItemEdit);
