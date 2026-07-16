import { ASSET_SCOPES, ASSET_VISIBILITIES, baseAssetStyles, emitAssetEvent, escapeHtml, normalizeAsset, registerElement } from '../asset-core.js';
import './uib-asset-permission-set-picker.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetMetadataEditor extends BaseHTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._asset = null;
    this._permissionSets = [];
  }

  set asset(value) { this._asset = value ? normalizeAsset(value) : null; if (this.isConnected) this.render(); }
  get asset() { return this._asset; }
  set permissionSets(value) { this._permissionSets = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get permissionSets() { return this._permissionSets; }
  connectedCallback() { this.render(); }

  render() {
    const asset = this._asset;
    this.shadowRoot.innerHTML = (
  `<style>` +
  (baseAssetStyles) +
  ` form { display: grid; gap: 0.85rem; } .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.85rem; } @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } } ` +
  `</style>` +
  `<section class="asset-card" style="padding: 1rem;" aria-label="Asset metadata editor">` +
  ` ` +
  (asset ? `
          <form>
            <div class="row-between">
              <div>
                <h2 class="title">Edit metadata</h2>
                <p class="subtitle">Changes are emitted to the parent or provider as an update request.</p>
              </div>
              <button type="submit" class="primary" ${asset.permissions.canEditMetadata ? '' : 'disabled'}>Save metadata</button>
            </div>
            <div class="grid">
              <label>Name <input name="name" value="${escapeHtml(asset.name)}" /></label>
              <label>Asset key <input name="key" value="${escapeHtml(asset.key)}" /></label>
              <label>Scope <select name="scope">${ASSET_SCOPES.map((scope) => `<option value="${scope}" ${scope === asset.scope ? 'selected' : ''}>${scope}</option>`).join('')}</select></label>
              <label>Visibility <select name="visibility">${ASSET_VISIBILITIES.map((visibility) => `<option value="${visibility}" ${visibility === asset.visibility ? 'selected' : ''}>${visibility}</option>`).join('')}</select></label>
              <label>Categories <input name="categories" value="${escapeHtml((asset.categories || []).join(', '))}" /></label>
              <label>Tags <input name="tags" value="${escapeHtml((asset.tags || []).join(', '))}" /></label>
            </div>
            <label>Description <textarea name="description">${escapeHtml(asset.description)}</textarea></label>
            <uib-asset-permission-set-picker value="${escapeHtml(asset.permissionSetKey)}" ${asset.permissions.canManagePermissions ? '' : 'disabled'}></uib-asset-permission-set-picker>
          </form>
        ` : '<div class="empty-state">Open an asset to edit metadata.</div>') +
  ` ` +
  `</section>`
);
    const picker = this.shadowRoot.querySelector('uib-asset-permission-set-picker');
    if (picker) picker.permissionSets = this._permissionSets;
    this.shadowRoot.querySelector('form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const patch = Object.fromEntries(form.entries());
      patch.categories = String(patch.categories || '').split(',').map((item) => item.trim()).filter(Boolean);
      patch.tags = String(patch.tags || '').split(',').map((item) => item.trim()).filter(Boolean);
      patch.permissionSetKey = picker?.getAttribute('value') || asset.permissionSetKey;
      emitAssetEvent(this, 'uib-asset-update-request', { asset, patch });
    });
  }
}

registerElement('uib-asset-metadata-editor', UibAssetMetadataEditor);
