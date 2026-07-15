import { assetSelection, baseAssetStyles, emitAssetEvent, escapeHtml, formatBytes, formatDate, humanize, maskedValue, normalizeAsset, registerElement } from '../asset-core.js';
import './uib-asset-metadata-editor.js';
import './uib-asset-permission-panel.js';
import './uib-asset-usage.js';
import './uib-asset-version-history.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetDetails extends BaseHTMLElement {
  static get observedAttributes() { return ['tab']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._asset = null;
    this._versions = [];
    this._usage = [];
    this._permissionSets = [];
  }

  set asset(value) { this._asset = value ? normalizeAsset(value) : null; if (this.isConnected) this.render(); }
  get asset() { return this._asset; }
  set versions(value) { this._versions = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get versions() { return this._versions; }
  set usage(value) { this._usage = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get usage() { return this._usage; }
  set permissionSets(value) { this._permissionSets = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get permissionSets() { return this._permissionSets; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  currentTab() {
    const tab = this.getAttribute('tab') || 'summary';
    return ['summary', 'edit', 'versions', 'usage', 'permissions'].includes(tab) ? tab : 'summary';
  }

  tabButton(tab, label) {
    const current = this.currentTab();
    return `<button type="button" data-tab="${tab}" aria-pressed="${current === tab ? 'true' : 'false'}" class="${current === tab ? 'primary' : ''}">${label}</button>`;
  }

  renderSummary(asset) {
    return `
      <dl class="summary-grid">
        <div><dt>Name</dt><dd>${escapeHtml(asset.name)}</dd></div>
        <div><dt>Key</dt><dd>${escapeHtml(asset.key)}</dd></div>
        <div><dt>Type</dt><dd>${escapeHtml(humanize(asset.fileType))}</dd></div>
        <div><dt>Source</dt><dd>${escapeHtml(humanize(asset.sourceType))}</dd></div>
        <div><dt>Scope</dt><dd>${escapeHtml(humanize(asset.scope))}</dd></div>
        <div><dt>Visibility</dt><dd>${escapeHtml(humanize(asset.visibility))}</dd></div>
        <div><dt>File size</dt><dd>${escapeHtml(formatBytes(asset.fileSizeBytes))}</dd></div>
        <div><dt>Version</dt><dd>v${escapeHtml(asset.currentVersionNumber || 1)}</dd></div>
        <div><dt>Updated</dt><dd>${escapeHtml(formatDate(asset.updatedAt || asset.lastUpdatedAt))}</dd></div>
        <div><dt>Permission set</dt><dd>${escapeHtml(asset.permissionSetKey)}</dd></div>
        <div class="wide"><dt>Description</dt><dd>${escapeHtml(asset.description || 'No description')}</dd></div>
        <div class="wide"><dt>Storage path</dt><dd>${maskedValue(asset, 'storagePath', asset.storagePath)}</dd></div>
      </dl>
      <div class="row">
        ${asset.permissions.canSelect ? '<button type="button" class="primary" data-action="select">Select asset</button>' : ''}
        ${asset.permissions.canDownload && asset.url ? `<a class="asset-button" href="${escapeHtml(asset.url)}" download>Download</a>` : ''}
        ${asset.permissions.canCopyToApp ? '<button type="button" data-action="copy">Copy into app</button>' : ''}
        ${asset.permissions.canArchive && asset.isActive ? '<button type="button" class="danger" data-action="archive">Archive</button>' : ''}
        ${asset.permissions.canRestore && !asset.isActive ? '<button type="button" data-action="restore">Restore</button>' : ''}
      </div>
    `;
  }

  renderPanel(asset) {
    const tab = this.currentTab();
    if (tab === 'edit') return '<uib-asset-metadata-editor></uib-asset-metadata-editor>';
    if (tab === 'versions') return '<uib-asset-version-history></uib-asset-version-history>';
    if (tab === 'usage') return asset.permissions.canViewUsage ? '<uib-asset-usage></uib-asset-usage>' : '<div class="empty-state restricted">Usage is restricted by permission set.</div>';
    if (tab === 'permissions') return '<uib-asset-permission-panel></uib-asset-permission-panel>';
    return this.renderSummary(asset);
  }

  render() {
    const asset = this._asset;
    this.shadowRoot.innerHTML = `
      <style>${baseAssetStyles}
        .details { display: grid; gap: 1rem; padding: 1rem; }
        .tabs { display: flex; flex-wrap: wrap; gap: 0.45rem; }
        .tabs button { min-height: 2.1rem; padding: 0.4rem 0.65rem; font-size: 0.82rem; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; margin: 0; }
        .summary-grid div { padding: 0.75rem; border: 1px solid var(--uib-assets-border); border-radius: 0.8rem; background: var(--uib-assets-surface-soft); }
        .summary-grid .wide { grid-column: 1 / -1; }
        dt { margin: 0 0 0.2rem; color: var(--uib-assets-muted); font-size: 0.76rem; font-weight: 850; text-transform: uppercase; letter-spacing: 0.04em; }
        dd { margin: 0; overflow-wrap: anywhere; }
      </style>
      <section class="asset-card details" aria-label="Asset details">
        ${asset ? `
          <div class="row-between">
            <div>
              <h2 class="title">${escapeHtml(asset.name)}</h2>
              <p class="subtitle">${escapeHtml(asset.key)}</p>
            </div>
            <div class="row">
              <span class="badge strong">${escapeHtml(humanize(asset.fileType))}</span>
              <span class="badge">${escapeHtml(humanize(asset.visibility))}</span>
            </div>
          </div>
          <nav class="tabs" aria-label="Asset details tabs">
            ${this.tabButton('summary', 'Summary')}
            ${this.tabButton('edit', 'Edit')}
            ${this.tabButton('versions', 'Versions')}
            ${this.tabButton('usage', 'Usage')}
            ${this.tabButton('permissions', 'Permissions')}
          </nav>
          <div class="panel">${this.renderPanel(asset)}</div>
        ` : '<div class="empty-state">Open an asset to view details.</div>'}
      </section>
    `;

    this.shadowRoot.querySelectorAll('[data-tab]').forEach((button) => {
      button.addEventListener('click', () => this.setAttribute('tab', button.dataset.tab));
    });
    this.shadowRoot.querySelector('[data-action="select"]')?.addEventListener('click', () => emitAssetEvent(this, 'uib-asset-select', { asset, selection: assetSelection(asset) }));
    this.shadowRoot.querySelector('[data-action="copy"]')?.addEventListener('click', () => emitAssetEvent(this, 'uib-asset-copy-to-app-request', { asset }));
    this.shadowRoot.querySelector('[data-action="archive"]')?.addEventListener('click', () => emitAssetEvent(this, 'uib-asset-archive-request', { asset, reason: 'Archived from AssetDetails.' }));
    this.shadowRoot.querySelector('[data-action="restore"]')?.addEventListener('click', () => emitAssetEvent(this, 'uib-asset-restore-request', { asset, reason: 'Restored from AssetDetails.' }));

    const editor = this.shadowRoot.querySelector('uib-asset-metadata-editor');
    if (editor) { editor.asset = asset; editor.permissionSets = this._permissionSets; }
    const history = this.shadowRoot.querySelector('uib-asset-version-history');
    if (history) { history.asset = asset; history.versions = this._versions; }
    const usage = this.shadowRoot.querySelector('uib-asset-usage');
    if (usage) usage.usage = this._usage;
    const permissionPanel = this.shadowRoot.querySelector('uib-asset-permission-panel');
    if (permissionPanel) { permissionPanel.asset = asset; permissionPanel.permissionSets = this._permissionSets; }
  }
}

registerElement('uib-asset-details', UibAssetDetails);
