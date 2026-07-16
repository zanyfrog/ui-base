import { baseAssetStyles, escapeHtml, registerElement } from '../asset-core.js';
import './uib-asset-picker.js';
import './uib-asset-image.js';

const styles = `
${baseAssetStyles}
.visual-control{display:grid;gap:1rem}.visual-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}.visual-field{display:grid;gap:.35rem;color:var(--uib-assets-muted);font-size:.85rem;font-weight:850}.visual-field--wide{grid-column:1/-1}.visual-preview{display:grid;grid-template-columns:minmax(9rem,14rem) minmax(0,1fr);gap:.85rem;align-items:center;padding:.85rem;border:1px solid var(--uib-assets-border);border-radius:var(--uib-assets-radius-sm);background:var(--uib-assets-surface-soft)}.visual-preview uib-asset-image{min-height:7rem}.visual-summary{display:grid;gap:.35rem}.visual-summary strong{color:var(--uib-assets-text)}.visual-note{margin:0;color:var(--uib-assets-muted);font-size:.86rem;line-height:1.45}@media(max-width:720px){.visual-grid,.visual-preview{grid-template-columns:1fr}}
`;
function cleanSource(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['url', 'asset', 'none'].includes(normalized)) return normalized;
  return 'none';
}

function cleanRole(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['image', 'icon', 'background', 'svg'].includes(normalized)) return normalized;
  return 'image';
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

export class UibVisualSourceControl extends HTMLElement {
  static get observedAttributes() {
    return ['visual-source', 'visual-role', 'src', 'asset-id', 'alt', 'label', 'application-key', 'api-base-url', 'use-asset-picker'];
  }

  constructor() {
    super();
    this.headers = undefined;
    this.getAuthHeaders = undefined;
    this._suppressAttributeRender = false;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected && !this._suppressAttributeRender) this.render();
  }

  value() {
    return {
      visualSource: cleanSource(this.getAttribute('visual-source')),
      visualRole: cleanRole(this.getAttribute('visual-role')),
      visualSrc: this.getAttribute('src') || '',
      visualAssetId: this.getAttribute('asset-id') || '',
      visualAlt: this.getAttribute('alt') || ''
    };
  }

  setValue(value, emit = true) {
    const next = value || {};
    this._suppressAttributeRender = true;
    this.setAttribute('visual-source', cleanSource(next.visualSource || next.source || this.getAttribute('visual-source')));
    this.setAttribute('visual-role', cleanRole(next.visualRole || next.role || this.getAttribute('visual-role')));
    this.setAttribute('src', String(next.visualSrc ?? next.src ?? this.getAttribute('src') ?? ''));
    this.setAttribute('asset-id', String(next.visualAssetId ?? next.assetId ?? this.getAttribute('asset-id') ?? ''));
    this.setAttribute('alt', String(next.visualAlt ?? next.alt ?? this.getAttribute('alt') ?? ''));
    this._suppressAttributeRender = false;
    if (emit) this.emitChange();
  }

  emitChange() {
    const detail = this.value();
    this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail }));
    this.dispatchEvent(new CustomEvent('uib-visual-source-change', { bubbles: true, composed: true, detail }));
  }

  collectAndEmit() {
    const source = this.shadowRoot.querySelector('[data-field="visualSource"]')?.value || 'none';
    const role = this.shadowRoot.querySelector('[data-field="visualRole"]')?.value || 'image';
    const src = this.shadowRoot.querySelector('[data-field="visualSrc"]')?.value || '';
    const assetId = this.shadowRoot.querySelector('[data-field="visualAssetId"]')?.value || '';
    const alt = this.shadowRoot.querySelector('[data-field="visualAlt"]')?.value || '';

    this._suppressAttributeRender = true;
    this.setAttribute('visual-source', cleanSource(source));
    this.setAttribute('visual-role', cleanRole(role));
    this.setAttribute('src', src);
    this.setAttribute('asset-id', assetId);
    this.setAttribute('alt', alt);
    this._suppressAttributeRender = false;
    this.emitChange();
    this.renderPreviewOnly();
  }

  pickerMarkup(value) {
    if (!this.hasAttribute('use-asset-picker')) return '';

    const appKey = this.getAttribute('application-key') || '';
    const baseUrl = this.getAttribute('api-base-url') || '';

    return (
  `<label class="visual-field visual-field--wide">` +
  `<span>` +
  `Asset picker` +
  `</span>` +
  `<uib-asset-picker data-visual-picker="true" data-picker-mode="simple" label="Visual asset" placeholder="Select or upload visual asset" value="` +
  (escapeHtml(value.visualAssetId)) +
  `" application-key="` +
  (escapeHtml(appKey)) +
  `" default-application-key="` +
  (escapeHtml(appKey)) +
  `" api-base-url="` +
  (escapeHtml(baseUrl)) +
  `" selection-mode="single" view="list" default-layout="list" default-asset-type="image" default-file-type="image" default-reuse-scope="global" default-scope="global" default-visibility="public" asset-visibility="public" allow-upload insertable-only insertable-file-types="image,icon,svg" accepted-file-types="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/avif" copy-on-select="false" selection-behavior="select" >` +
  `</uib-asset-picker>` +
  `</label>`
);
  }

  configurePicker() {
    const picker = this.shadowRoot.querySelector('uib-asset-picker[data-visual-picker]');
    if (!picker) return;

    picker.headers = typeof this.getAuthHeaders === 'function' ? this.getAuthHeaders() : this.headers;
    picker.getAuthHeaders = this.getAuthHeaders;
    picker.selectedAssetIds = picker.getAttribute('value') ? [picker.getAttribute('value')] : [];

    const handleSelection = (event) => {
      event.stopPropagation();
      const assetId = firstTextValue(event.detail, ['assetId', 'asset_id', 'id', 'value']);
      if (!assetId) return;

      const input = this.shadowRoot.querySelector('[data-field="visualAssetId"]');
      if (input) input.value = assetId;

      const source = this.shadowRoot.querySelector('[data-field="visualSource"]');
      if (source) source.value = 'asset';

      this.collectAndEmit();
    };

    picker.addEventListener('uib-asset-select', handleSelection);
    picker.addEventListener('asset-selected', handleSelection);
    picker.addEventListener('uib-asset-clear', (event) => {
      event.stopPropagation();
      const input = this.shadowRoot.querySelector('[data-field="visualAssetId"]');
      if (input) input.value = '';
      this.collectAndEmit();
    });

    if (!picker.dataset.uibConfigured && typeof picker.loadAll === 'function') {
      picker.dataset.uibConfigured = 'true';
      window.setTimeout(() => void picker.loadAll(), 0);
    }
  }

  renderPreviewOnly() {
    const preview = this.shadowRoot.querySelector('.visual-preview');
    if (!preview) return;

    const value = this.value();
    preview.innerHTML = (
  `<uib-asset-image src="` +
  (escapeHtml(value.visualSrc)) +
  `" asset-id="` +
  (escapeHtml(value.visualAssetId)) +
  `" alt="` +
  (escapeHtml(value.visualAlt)) +
  `" role="` +
  (escapeHtml(value.visualRole)) +
  `" fit="` +
  (value.visualRole==='icon'||value.visualRole==='svg'?'contain':'cover') +
  `">` +
  `</uib-asset-image>` +
  `<div class="visual-summary">` +
  `<strong>` +
  ` ` +
  (escapeHtml(value.visualSource)) +
  ` / ` +
  (escapeHtml(value.visualRole)) +
  ` ` +
  `</strong>` +
  `<p class="visual-note">` +
  ` URL source wins when src has a value. Asset ID remains available for storage and preview resolution. ` +
  `</p>` +
  `</div>`
);
  }

  bind() {
    this.shadowRoot.querySelectorAll('select,input').forEach((input) => {
      input.addEventListener('input', () => this.collectAndEmit());
      input.addEventListener('change', () => this.collectAndEmit());
    });
    this.configurePicker();
  }

  render() {
    const value = this.value();
    const label = this.getAttribute('label') || 'Visual source';

    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<section class="visual-control" part="control">` +
  `<div>` +
  `<h3 class="title">` +
  ` ` +
  (escapeHtml(label)) +
  ` ` +
  `</h3>` +
  `<p class="subtitle">` +
  ` Source tells where the visual comes from. Role tells how the Hero should present it. ` +
  `</p>` +
  `</div>` +
  `<div class="visual-grid">` +
  `<label class="visual-field">` +
  `<span>` +
  ` Source ` +
  `</span>` +
  `<select data-field="visualSource">` +
  `<option value="none" ` +
  (value.visualSource==='none'?'selected':'') +
  `> None ` +
  `</option>` +
  `<option value="url" ` +
  (value.visualSource==='url'?'selected':'') +
  `> URL ` +
  `</option>` +
  `<option value="asset" ` +
  (value.visualSource==='asset'?'selected':'') +
  `> Asset ID ` +
  `</option>` +
  `</select>` +
  `</label>` +
  `<label class="visual-field">` +
  `<span>` +
  ` Role ` +
  `</span>` +
  `<select data-field="visualRole">` +
  `<option value="image" ` +
  (value.visualRole==='image'?'selected':'') +
  `> Image ` +
  `</option>` +
  `<option value="icon" ` +
  (value.visualRole==='icon'?'selected':'') +
  `> Icon ` +
  `</option>` +
  `<option value="background" ` +
  (value.visualRole==='background'?'selected':'') +
  `> Background ` +
  `</option>` +
  `<option value="svg" ` +
  (value.visualRole==='svg'?'selected':'') +
  `> SVG ` +
  `</option>` +
  `</select>` +
  `</label>` +
  `<label class="visual-field visual-field--wide">` +
  `<span>` +
  ` URL / data image ` +
  `</span>` +
  `<input data-field="visualSrc" value="` +
  (escapeHtml(value.visualSrc)) +
  `" placeholder="https://example.local/image.png or data:image/svg+xml,...">` +
  `</label>` +
  `<label class="visual-field">` +
  `<span>` +
  ` Asset ID ` +
  `</span>` +
  `<input data-field="visualAssetId" value="` +
  (escapeHtml(value.visualAssetId)) +
  `" placeholder="asset_123">` +
  `</label>` +
  `<label class="visual-field">` +
  `<span>` +
  ` Alt text ` +
  `</span>` +
  `<input data-field="visualAlt" value="` +
  (escapeHtml(value.visualAlt)) +
  `">` +
  `</label>` +
  ` ` +
  (this.pickerMarkup(value)) +
  ` ` +
  `</div>` +
  `<div class="visual-preview" part="preview">` +
  `</div>` +
  `</section>`
);

    this.renderPreviewOnly();
    this.bind();
  }
}

registerElement('uib-visual-source-control', UibVisualSourceControl);
