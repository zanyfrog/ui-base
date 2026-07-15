import type { ShapedRecord } from '@ui.base/app-manager-api-client';
import { BaseHTMLElement, attr, clientFromElement, defineAppManagerElement, dispatch, escapeHtml, formatError } from '../utils/dom.js';

const ASSET_ACCEPT = 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/avif,application/pdf,text/plain,text/css,application/json';

function isImage(asset: ShapedRecord): boolean {
  return (asset.storageRecord.mime_type || '').startsWith('image/');
}

function preview(asset: ShapedRecord): string {
  const label = asset.storageRecord.alt_text || asset.storageRecord.asset_key || asset.storageRecord.original_file_name || 'asset';
  if (isImage(asset) && asset.storageRecord.public_url) {
    return `<img src="${attr(asset.storageRecord.public_url)}" alt="${attr(label)}" loading="lazy" />`;
  }
  return `<span class="uibam-asset-file-badge">${escapeHtml(asset.storageRecord.file_extension || asset.storageRecord.asset_type || 'file')}</span>`;
}

export class UibApplicationAssetList extends BaseHTMLElement {
  static get observedAttributes() {
    return ['orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token', 'application-key'];
  }

  private records: ShapedRecord[] = [];
  private loading = false;
  private uploading = false;
  private error = '';
  private loadedKey = '';

  connectedCallback() {
    void this.load();
  }

  attributeChangedCallback() {
    if (this.isConnected) void this.load();
  }

  private get applicationKey(): string {
    return this.getAttribute('application-key') || '';
  }

  private async load(force = false) {
    if (!this.applicationKey) return;
    if (!force && this.loadedKey === this.applicationKey) return;
    this.loadedKey = this.applicationKey;
    this.loading = true;
    this.error = '';
    this.render();
    try {
      const result = await clientFromElement(this).listAssets(this.applicationKey);
      this.records = result.records;
      this.loading = false;
      this.render();
    } catch (error) {
      this.loading = false;
      this.error = formatError(error);
      this.loadedKey = '';
      this.render();
    }
  }

  private async upload() {
    const file = this.querySelector<HTMLInputElement>('[data-upload-field="file"]')?.files?.[0];
    if (!file) return;
    const assetKey = this.querySelector<HTMLInputElement>('[data-upload-field="assetKey"]')?.value || file.name.replace(/\.[^.]+$/, '');
    const altText = this.querySelector<HTMLInputElement>('[data-upload-field="altText"]')?.value || '';
    const usageContext = this.querySelector<HTMLInputElement>('[data-upload-field="usageContext"]')?.value || 'general';
    const tagsText = this.querySelector<HTMLInputElement>('[data-upload-field="tags"]')?.value || '';
    this.uploading = true;
    this.error = '';
    this.render();
    try {
      const asset = await clientFromElement(this).uploadAsset(this.applicationKey, file, {
        assetKey,
        altText,
        usageContext,
        tags: tagsText ? tagsText.split(',').map((item) => item.trim()).filter(Boolean) : [],
        isPublic: true,
      });
      this.uploading = false;
      dispatch(this, 'uib-asset-created', { applicationKey: this.applicationKey, assetId: asset.storageRecord.asset_id });
      await this.load(true);
    } catch (error) {
      this.uploading = false;
      this.error = formatError(error);
      this.render();
    }
  }

  private async removeAsset(assetId: string) {
    if (!assetId) return;
    if (!window.confirm(`Remove asset ${assetId}? The record will be soft-deleted and direct file routes will stop displaying it.`)) return;
    try {
      await clientFromElement(this).deleteAsset(this.applicationKey, assetId);
      await this.load(true);
    } catch (error) {
      this.error = formatError(error);
      this.render();
    }
  }

  private bind() {
    this.querySelector('[data-action="refresh-assets"]')?.addEventListener('click', () => void this.load(true));
    this.querySelector('[data-action="upload-asset"]')?.addEventListener('click', () => void this.upload());
    this.querySelectorAll<HTMLElement>('[data-action="edit-asset"]').forEach((button) => {
      button.addEventListener('click', () => dispatch(this, 'uib-asset-edit-requested', { applicationKey: this.applicationKey, assetId: button.dataset.assetId }));
    });
    this.querySelectorAll<HTMLElement>('[data-action="remove-asset"]').forEach((button) => {
      button.addEventListener('click', () => void this.removeAsset(button.dataset.assetId || ''));
    });
  }

  private uploadMarkup(): string {
    return `
      <div class="uibam-card uibam-asset-upload-card">
        <div class="uibam-card-header">
          <div>
            <h2>Upload asset</h2>
            <p class="uibam-subtitle">Create an application_asset record and store the file in local ORM asset storage.</p>
          </div>
        </div>
        <div class="uibam-card-body uibam-asset-upload-grid">
          <label class="uibam-field">
            <span>File</span>
            <input type="file" accept="${attr(ASSET_ACCEPT)}" data-upload-field="file" ${this.uploading ? 'disabled' : ''} />
          </label>
          <label class="uibam-field">
            <span>Asset key</span>
            <input type="text" data-upload-field="assetKey" placeholder="optional-slug" />
          </label>
          <label class="uibam-field">
            <span>Alt text</span>
            <input type="text" data-upload-field="altText" placeholder="Image description" />
          </label>
          <label class="uibam-field">
            <span>Usage context</span>
            <input type="text" data-upload-field="usageContext" value="general" />
          </label>
          <label class="uibam-field uibam-field--wide">
            <span>Tags</span>
            <input type="text" data-upload-field="tags" placeholder="comma, separated, tags" />
          </label>
          <button class="uibam-button" type="button" data-action="upload-asset" ${this.uploading ? 'disabled' : ''}>${this.uploading ? 'Uploading...' : 'Upload asset'}</button>
        </div>
      </div>`;
  }

  private tableMarkup(): string {
    if (this.loading) return '<div class="uibam-loading">Loading assets...</div>';
    if (!this.records.length) return '<div class="uibam-empty">No active assets yet. Upload an image, icon, PDF, or text asset to begin.</div>';
    return `
      <div class="uibam-table-wrap">
        <table class="uibam-table">
          <thead>
            <tr>
              <th class="uibam-actions-column">Actions</th>
              <th>Preview</th>
              <th>Asset</th>
              <th>Type</th>
              <th>MIME</th>
              <th>Size</th>
              <th>Version</th>
              <th>URLs</th>
            </tr>
          </thead>
          <tbody>
            ${this.records.map((asset) => `
              <tr>
                <td class="uibam-actions-cell">
                  <div class="uibam-actions uibam-actions--icons">
                    <button class="uibam-icon-button" type="button" data-action="edit-asset" data-asset-id="${attr(asset.storageRecord.asset_id)}" title="Edit asset" aria-label="Edit asset ${attr(asset.storageRecord.asset_id)}">✎</button>
                    <button class="uibam-icon-button uibam-icon-button--danger" type="button" data-action="remove-asset" data-asset-id="${attr(asset.storageRecord.asset_id)}" title="Remove asset" aria-label="Remove asset ${attr(asset.storageRecord.asset_id)}">×</button>
                  </div>
                </td>
                <td><div class="uibam-asset-thumb uibam-asset-thumb--table">${preview(asset)}</div></td>
                <td><strong>${escapeHtml(asset.storageRecord.asset_key || asset.storageRecord.original_file_name || asset.storageRecord.asset_id)}</strong><br><code>${escapeHtml(asset.storageRecord.asset_id || '')}</code></td>
                <td>${escapeHtml(asset.storageRecord.asset_type || '')}</td>
                <td>${escapeHtml(asset.storageRecord.mime_type || '')}</td>
                <td>${escapeHtml(asset.storageRecord.file_size_bytes || '')}</td>
                <td>${escapeHtml(asset.storageRecord.asset_version || '1')}</td>
                <td><a href="${attr(asset.storageRecord.public_url || '#')}" target="_blank" rel="noreferrer">display</a> · <a href="${attr(asset.storageRecord.download_url || '#')}" target="_blank" rel="noreferrer">download</a></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  render() {
    this.innerHTML = `
      <section class="uibam-stack">
        <div class="uibam-card">
          <div class="uibam-card-header">
            <div>
              <h2>Assets for ${escapeHtml(this.applicationKey)}</h2>
              <p class="uibam-subtitle">Manage application_asset rows. Soft-deleted assets are hidden and direct file routes return 404.</p>
            </div>
            <button class="uibam-button-secondary" type="button" data-action="refresh-assets">Refresh</button>
          </div>
          <div class="uibam-card-body">
            ${this.error ? `<div class="uibam-error" role="alert">${escapeHtml(this.error)}</div>` : ''}
            ${this.tableMarkup()}
          </div>
        </div>
        ${this.uploadMarkup()}
      </section>`;
    this.bind();
  }
}

defineAppManagerElement('uib-application-asset-list', UibApplicationAssetList);
