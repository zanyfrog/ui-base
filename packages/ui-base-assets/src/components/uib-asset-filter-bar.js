import { ASSET_FILE_TYPES, ASSET_SCOPES, ASSET_VISIBILITIES, baseAssetStyles, emitAssetEvent, escapeHtml, humanize, registerElement } from '../asset-core.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetFilterBar extends BaseHTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._categories = [];
    this._filters = { fileType: 'all', scope: 'all', visibility: 'all', category: 'all', status: 'active' };
  }

  set categories(value) { this._categories = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get categories() { return this._categories; }
  set filters(value) { this._filters = { ...this._filters, ...(value || {}) }; if (this.isConnected) this.render(); }
  get filters() { return this._filters; }
  connectedCallback() { this.render(); }

  render() {
    const filters = this._filters;
    const option = (value, label, selected) => `<option value="${escapeHtml(value)}" ${value === selected ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    this.shadowRoot.innerHTML = `
      <style>${baseAssetStyles}
        .filters { display: grid; grid-template-columns: repeat(5, minmax(130px, 1fr)); gap: 0.7rem; }
        @media (max-width: 980px) { .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .filters { grid-template-columns: 1fr; } }
      </style>
      <div class="filters" aria-label="Asset filters">
        <label>Type <select name="fileType">${option('all', 'All types', filters.fileType)}${ASSET_FILE_TYPES.map((type) => option(type, humanize(type), filters.fileType)).join('')}</select></label>
        <label>Scope <select name="scope">${option('all', 'All scopes', filters.scope)}${ASSET_SCOPES.map((scope) => option(scope, humanize(scope), filters.scope)).join('')}</select></label>
        <label>Visibility <select name="visibility">${option('all', 'All visibility', filters.visibility)}${ASSET_VISIBILITIES.map((visibility) => option(visibility, humanize(visibility), filters.visibility)).join('')}</select></label>
        <label>Category <select name="category">${option('all', 'All categories', filters.category)}${this._categories.map((category) => option(category.key, category.name || category.key, filters.category)).join('')}</select></label>
        <label>Status <select name="status">${option('active', 'Active', filters.status)}${option('archived', 'Archived', filters.status)}${option('all', 'Active and archived', filters.status)}</select></label>
      </div>
    `;
    this.shadowRoot.querySelectorAll('select').forEach((select) => {
      select.addEventListener('change', () => {
        this._filters = { ...this._filters, [select.name]: select.value };
        emitAssetEvent(this, 'uib-asset-filter-change', { filters: { ...this._filters } });
      });
    });
  }
}

registerElement('uib-asset-filter-bar', UibAssetFilterBar);
