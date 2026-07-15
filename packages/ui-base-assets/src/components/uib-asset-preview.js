import { baseAssetStyles, escapeHtml, humanize, maskedValue, normalizeAsset, registerElement } from '../asset-core.js';
import './uib-asset-thumbnail.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetPreview extends BaseHTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._asset = null;
  }

  set asset(value) { this._asset = value ? normalizeAsset(value) : null; if (this.isConnected) this.render(); }
  get asset() { return this._asset; }
  connectedCallback() { this.render(); }

  renderPreview(asset) {
    if (!asset) return '<div class="empty-state">Open an asset to preview it.</div>';
    if (asset.maskedFields.includes('url')) return '<div class="empty-state restricted">Preview restricted by permission set.</div>';
    if (asset.url && ['image', 'svg', 'icon'].includes(asset.fileType)) {
      return `<img src="${escapeHtml(asset.url)}" alt="${escapeHtml(asset.name)}" />`;
    }
    if (asset.fileType === 'json' || asset.fileType === 'component_config') {
      return `<pre class="code-block"><code>${escapeHtml(JSON.stringify(asset.raw?.raw || asset.raw || { assetId: asset.id, key: asset.key }, null, 2))}</code></pre>`;
    }
    if (asset.url && asset.fileType === 'pdf') {
      return `<iframe title="${escapeHtml(asset.name)}" src="${escapeHtml(asset.url)}"></iframe>`;
    }
    if (asset.url && asset.fileType === 'external_url') {
      return `<p><a class="asset-button primary" href="${escapeHtml(asset.url)}" target="_blank" rel="noreferrer">Open external asset</a></p>`;
    }
    return '<uib-asset-thumbnail></uib-asset-thumbnail>';
  }

  render() {
    const asset = this._asset;
    this.shadowRoot.innerHTML = `
      <style>${baseAssetStyles}
        .preview { display: grid; gap: 1rem; padding: 1rem; }
        .preview-media { overflow: hidden; min-height: 220px; display: grid; place-items: center; border: 1px solid var(--uib-assets-border); border-radius: 1rem; background: var(--uib-assets-surface-soft); }
        img { width: 100%; height: min(52vh, 420px); object-fit: contain; }
        iframe { width: 100%; min-height: 420px; border: 0; background: white; }
        .meta { display: flex; flex-wrap: wrap; gap: 0.45rem; }
      </style>
      <section class="asset-card preview" aria-label="Asset preview">
        ${asset ? `
          <div class="row-between">
            <div>
              <h2 class="title">${escapeHtml(asset.name)}</h2>
              <p class="subtitle">${escapeHtml(asset.key)}</p>
            </div>
            <span class="badge strong">${escapeHtml(humanize(asset.fileType))}</span>
          </div>
          <div class="preview-media">${this.renderPreview(asset)}</div>
          <div class="meta">
            <span class="badge">${escapeHtml(humanize(asset.scope))}</span>
            <span class="badge">${escapeHtml(humanize(asset.visibility))}</span>
            <span class="badge">v${escapeHtml(asset.currentVersionNumber || 1)}</span>
          </div>
          <p class="small muted">Storage path: ${maskedValue(asset, 'storagePath', asset.storagePath)}</p>
        ` : '<div class="empty-state">Open an asset to preview it.</div>'}
      </section>
    `;
    const thumbnail = this.shadowRoot.querySelector('uib-asset-thumbnail');
    if (thumbnail && asset) thumbnail.asset = asset;
  }
}

registerElement('uib-asset-preview', UibAssetPreview);
