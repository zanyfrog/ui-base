import { assetSelection, baseAssetStyles, emitAssetEvent, escapeHtml, formatBytes, formatDate, humanize, normalizeAssets, registerElement } from '../asset-core.js';
import './uib-asset-thumbnail.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetList extends BaseHTMLElement {
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
    this.shadowRoot.innerHTML = (
  `<style>` +
  (baseAssetStyles) +
  ` .name-cell { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 0.75rem; align-items: center; } uib-asset-thumbnail { width: 74px; } .asset-name { margin: 0; font-weight: 900; } .asset-key { color: var(--uib-assets-muted); font-size: 0.8rem; } .actions { display: flex; flex-wrap: wrap; gap: 0.4rem; } .actions button { min-height: 2rem; padding: 0.4rem 0.6rem; font-size: 0.8rem; } @media (max-width: 820px) { .hide-sm { display: none; } .data-table th, .data-table td { padding: 0.55rem; } } ` +
  `</style>` +
  ` ` +
  (this._assets.length ? `
        <table class="data-table" aria-label="Asset list">
          <thead>
            <tr>
              <th>Asset</th>
              <th class="hide-sm">Type</th>
              <th class="hide-sm">Scope</th>
              <th class="hide-sm">Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this._assets.map((asset) => `
              <tr data-id="${escapeHtml(asset.id)}" aria-selected="${asset.id === selectedId ? 'true' : 'false'}">
                <td>
                  <div class="name-cell">
                    <uib-asset-thumbnail></uib-asset-thumbnail>
                    <div>
                      <p class="asset-name">${escapeHtml(asset.name)}</p>
                      <div class="asset-key">${escapeHtml(asset.key)} · ${escapeHtml(formatBytes(asset.fileSizeBytes))}</div>
                    </div>
                  </div>
                </td>
                <td class="hide-sm"><span class="badge strong">${escapeHtml(humanize(asset.fileType))}</span></td>
                <td class="hide-sm"><span class="badge">${escapeHtml(humanize(asset.scope))}</span> <span class="badge">${escapeHtml(humanize(asset.visibility))}</span></td>
                <td class="hide-sm">${escapeHtml(formatDate(asset.updatedAt || asset.lastUpdatedAt || asset.createdAt))}</td>
                <td>
                  <div class="actions">
                    <button type="button" data-action="open" data-id="${escapeHtml(asset.id)}">Open</button>
                    ${asset.permissions.canSelect ? `<button type="button" class="primary" data-action="select" data-id="${escapeHtml(asset.id)}">${selectionMode === 'multiple' ? 'Add' : 'Select'}</button>` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `<div class="empty-state">No assets match the current search and filters.</div>`) +
  ` `
);

    this.shadowRoot.querySelectorAll('uib-asset-thumbnail').forEach((thumbnail, index) => { thumbnail.asset = this._assets[index]; });
    this.shadowRoot.querySelectorAll('tr[data-id]').forEach((row) => {
      row.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        this.selectAsset(row.dataset.id, false);
      });
    });
    this.shadowRoot.querySelectorAll('button[data-action]').forEach((button) => {
      button.addEventListener('click', () => this.selectAsset(button.dataset.id, button.dataset.action === 'select'));
    });
  }

  selectAsset(assetId, select) {
    const asset = this._assets.find((item) => item.id === assetId);
    if (!asset) return;
    if (select) emitAssetEvent(this, 'uib-asset-select', { asset, selection: assetSelection(asset) });
    else emitAssetEvent(this, 'uib-asset-open', { asset });
  }
}

registerElement('uib-asset-list', UibAssetList);
