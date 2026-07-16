import { ASSET_FILE_TYPES, ASSET_SCOPES, ASSET_VISIBILITIES, DEFAULT_ASSET_UPLOAD_POLICY, baseAssetStyles, emitAssetEvent, escapeHtml, registerElement } from '../asset-core.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetUploader extends BaseHTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._uploadPolicy = DEFAULT_ASSET_UPLOAD_POLICY;
    this._permissionSets = [];
  }

  set uploadPolicy(value) { this._uploadPolicy = { ...DEFAULT_ASSET_UPLOAD_POLICY, ...(value || {}) }; if (this.isConnected) this.render(); }
  get uploadPolicy() { return this._uploadPolicy; }
  set permissionSets(value) { this._permissionSets = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get permissionSets() { return this._permissionSets; }
  connectedCallback() { this.render(); }

  render() {
    const policy = this._uploadPolicy;
    const embedded = this.hasAttribute('embedded');
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (baseAssetStyles) +
  ` .uploader-shell { padding: 1rem; } .uploader-shell.embedded { padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; } form { display: grid; gap: 0.9rem; } .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.85rem; } @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } } ` +
  `</style>` +
  `<section class="asset-card uploader-shell ` +
  (embedded ? 'embedded' : '') +
  `" aria-label="Asset uploader">` +
  `<form>` +
  `<div class="row-between">` +
  `<div>` +
  `<h2 class="title">` +
  ` Upload or create an asset ` +
  `</h2>` +
  `<p class="subtitle">` +
  ` Supports local files, external URLs, icon URLs, JSON, and component config assets. ` +
  `</p>` +
  `</div>` +
  `<button type="submit" class="primary">` +
  ` Create asset ` +
  `</button>` +
  `</div>` +
  `<div class="grid">` +
  `<label>` +
  ` Source type ` +
  `<select name="sourceType">` +
  `<option value="local_file">` +
  ` Local file ` +
  `</option>` +
  ` ` +
  (policy.allowExternalUrl ? '<option value="external_url">External URL</option><option value="icon_url">Icon URL</option>' : '') +
  ` ` +
  (policy.allowJsonAsset ? '<option value="json">JSON</option>' : '') +
  ` ` +
  (policy.allowComponentConfig ? '<option value="component_config">Component config</option>' : '') +
  ` ` +
  `</select>` +
  `</label>` +
  `<label>` +
  ` File type ` +
  `<select name="fileType">` +
  ` ` +
  (ASSET_FILE_TYPES.map((type) => `<option value="${type}">${type}</option>`).join('')) +
  ` ` +
  `</select>` +
  `</label>` +
  `<label>` +
  ` Name ` +
  `<input name="name" required placeholder="Sample Visitor Center Hero" />` +
  `</label>` +
  `<label>` +
  ` Asset key ` +
  `<input name="key" placeholder="sample-site-hero" />` +
  `</label>` +
  `<label>` +
  ` Scope ` +
  `<select name="scope">` +
  ` ` +
  (ASSET_SCOPES.map((scope) => `<option value="${scope}">${scope}</option>`).join('')) +
  ` ` +
  `</select>` +
  `</label>` +
  `<label>` +
  ` Visibility ` +
  `<select name="visibility">` +
  ` ` +
  (ASSET_VISIBILITIES.map((visibility) => `<option value="${visibility}">${visibility}</option>`).join('')) +
  ` ` +
  `</select>` +
  `</label>` +
  `<label>` +
  ` Categories ` +
  `<input name="categories" placeholder="hero, demo-app" />` +
  `</label>` +
  `<label>` +
  ` Tags ` +
  `<input name="tags" placeholder="example, icon" />` +
  `</label>` +
  `<label>` +
  ` Permission set ` +
  `<select name="permissionSetKey">` +
  ` ` +
  (this._permissionSets.map((set) => `<option value="${escapeHtml(set.key)}">${escapeHtml(set.name || set.key)}</option>`).join('')) +
  ` ` +
  `</select>` +
  `</label>` +
  `<label>` +
  ` File <input name="file" type="file" accept="` +
  (escapeHtml(policy.allowedMimeTypes.join(','))) +
  `" />` +
  `</label>` +
  `</div>` +
  `<label>` +
  ` URL ` +
  `<input name="url" placeholder="https://example.gov/icon.svg or /assets/icon.svg" />` +
  `</label>` +
  `<label>` +
  ` Description ` +
  `<textarea name="description" placeholder="Describe how this asset should be used.">` +
  `</textarea>` +
  `</label>` +
  `<label>` +
  ` JSON / component config ` +
  `<textarea name="json" placeholder='{"component":"@ui.base/hero"}'>` +
  `</textarea>` +
  `</label>` +
  `<p class="subtitle small">` +
  ` Max file size: ` +
  (Math.round(policy.maxFileSizeBytes / 1024 / 1024)) +
  ` MB. UI validates for user feedback; ORM must enforce the same policy. ` +
  `</p>` +
  `</form>` +
  `</section>`
);
    this.shadowRoot.querySelector('form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const file = form.get('file');
      const request = Object.fromEntries(form.entries());
      request.categories = String(request.categories || '').split(',').map((item) => item.trim()).filter(Boolean);
      request.tags = String(request.tags || '').split(',').map((item) => item.trim()).filter(Boolean);
      request.file = file instanceof File && file.size ? file : null;
      request.fileSizeBytes = request.file?.size || 0;
      request.fileName = request.file?.name || '';

      const errors = [];
      if (request.file && request.file.size > policy.maxFileSizeBytes) errors.push(`File exceeds ${policy.maxFileSizeBytes} bytes.`);
      if (request.file && policy.allowedMimeTypes.length && !policy.allowedMimeTypes.includes(request.file.type)) errors.push(`File type is not allowed: ${request.file.type || 'unknown'}.`);
      if (errors.length) {
        emitAssetEvent(this, 'uib-asset-upload-invalid', { errors, request });
        return;
      }
      emitAssetEvent(this, 'uib-asset-upload-request', { request });
    });
  }
}

registerElement('uib-asset-uploader', UibAssetUploader);
