import { baseAssetStyles, escapeHtml, formatDate, registerElement, statusBadge } from '../asset-core.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetVersionHistory extends BaseHTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._versions = [];
    this._asset = null;
  }

  set versions(value) { this._versions = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get versions() { return this._versions; }
  set asset(value) { this._asset = value || null; if (this.isConnected) this.render(); }
  get asset() { return this._asset; }
  connectedCallback() { this.render(); }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${baseAssetStyles}
        .version { display: grid; gap: 0.45rem; padding: 0.75rem; border: 1px solid var(--uib-assets-border); border-radius: 0.85rem; background: var(--uib-assets-surface); }
        .version + .version { margin-top: 0.55rem; }
      </style>
      <section class="stack-sm" aria-label="Asset version history">
        ${this._versions.length ? this._versions.map((version) => `
          <article class="version">
            <div class="row-between">
              <strong>Version ${escapeHtml(version.versionNumber || version.version_number || '?')}</strong>
              ${statusBadge(version.status)}
            </div>
            <div class="small muted">${escapeHtml(version.fileName || version.file_name || 'No file name')} · ${escapeHtml(formatDate(version.createdAt || version.created_at))}</div>
            ${version.notes ? `<div class="small">${escapeHtml(version.notes)}</div>` : ''}
          </article>
        `).join('') : '<div class="empty-state">No versions returned for this asset.</div>'}
      </section>
    `;
  }
}

registerElement('uib-asset-version-history', UibAssetVersionHistory);
