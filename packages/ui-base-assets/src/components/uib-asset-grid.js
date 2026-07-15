import { assetSelection, baseAssetStyles, emitAssetEvent, escapeHtml, formatBytes, humanize, normalizeAssets, registerElement } from '../asset-core.js';
import './uib-asset-thumbnail.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetGrid extends BaseHTMLElement {
  static get observedAttributes() { return ['selected-asset-id', 'selection-mode']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._assets = [];
  }

  set assets(value) { this._assets = normalizeAssets(value); if (this.isConnected) this.render(); }
  get assets() { return this._assets; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const selectedId = this.getAttribute('selected-asset-id') || '';
    const selectionMode = this.getAttribute('selection-mode') || 'single';
    this.shadowRoot.innerHTML = `
      <style>${baseAssetStyles}
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 0.85rem; }
        .asset-tile { display: grid; gap: 0.75rem; padding: 0.75rem; text-align: left; cursor: pointer; }
        .asset-tile[aria-selected="true"] { outline: 3px solid rgba(23, 74, 139, 0.25); border-color: var(--uib-assets-primary); }
        .tile-title { margin: 0; font-size: 0.98rem; font-weight: 900; line-height: 1.25; }
        .tile-meta { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .tile-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .tile-actions button { min-height: 2.05rem; padding: 0.4rem 0.65rem; font-size: 0.8rem; }
      </style>
      ${this._assets.length ? `
        <div class="grid" aria-label="Asset grid">
          ${this._assets.map((asset) => `
            <article class="asset-card asset-tile" data-id="${escapeHtml(asset.id)}" aria-selected="${asset.id === selectedId ? 'true' : 'false'}" tabindex="0">
              <uib-asset-thumbnail></uib-asset-thumbnail>
              <div>
                <p class="tile-title">${escapeHtml(asset.name)}</p>
                <p class="subtitle small">${escapeHtml(asset.key)} · ${escapeHtml(formatBytes(asset.fileSizeBytes))}</p>
              </div>
              <div class="tile-meta">
                <span class="badge strong">${escapeHtml(humanize(asset.fileType))}</span>
                <span class="badge">${escapeHtml(humanize(asset.scope))}</span>
              </div>
              <div class="tile-actions">
                <button type="button" data-action="open" data-id="${escapeHtml(asset.id)}">Open</button>
                ${asset.permissions.canSelect ? `<button type="button" class="primary" data-action="select" data-id="${escapeHtml(asset.id)}">${selectionMode === 'multiple' ? 'Add' : 'Select'}</button>` : ''}
              </div>
            </article>
          `).join('')}
        </div>
      ` : `<div class="empty-state">No assets match the current search and filters.</div>`}
    `;
    this.shadowRoot.querySelectorAll('uib-asset-thumbnail').forEach((thumbnail, index) => { thumbnail.asset = this._assets[index]; });
    this.shadowRoot.querySelectorAll('.asset-tile').forEach((tile) => {
      tile.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        this.openAsset(tile.dataset.id);
      });
      tile.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.openAsset(tile.dataset.id);
        }
      });
    });
    this.shadowRoot.querySelectorAll('button[data-action]').forEach((button) => {
      button.addEventListener('click', () => this.openAsset(button.dataset.id, button.dataset.action === 'select'));
    });
  }

  openAsset(assetId, select = false) {
    const asset = this._assets.find((item) => item.id === assetId);
    if (!asset) return;
    if (select) emitAssetEvent(this, 'uib-asset-select', { asset, selection: assetSelection(asset) });
    else emitAssetEvent(this, 'uib-asset-open', { asset });
  }
}

registerElement('uib-asset-grid', UibAssetGrid);
