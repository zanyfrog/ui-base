import type { ShapedRecord } from '@ui-base/app-manager-api-client';
import { BaseHTMLElement, attr, clientFromElement, defineAppManagerElement, dispatch, escapeHtml, formatError, passClientAttributes } from '../utils/dom.js';

const DEFAULT_ASSET_ACCEPT = 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/avif,application/pdf,text/plain,text/css,application/json';

function isImageAsset(asset: ShapedRecord): boolean {
  return (asset.storageRecord.mime_type || '').startsWith('image/');
}

function assetLabel(asset: ShapedRecord): string {
  return asset.storageRecord.asset_key || asset.storageRecord.original_file_name || asset.storageRecord.asset_id || 'asset';
}

function assetPreview(asset: ShapedRecord): string {
  const url = asset.storageRecord.public_url || '';
  if (isImageAsset(asset) && url) {
    return `<img src="${attr(url)}" alt="${attr(asset.storageRecord.alt_text || assetLabel(asset))}" loading="lazy" />`;
  }
  return `<span class="uibam-asset-file-badge">${escapeHtml(asset.storageRecord.file_extension || asset.storageRecord.asset_type || 'file')}</span>`;
}

export class UibAppManagerAssetPicker extends BaseHTMLElement {
  static get observedAttributes() {
    return ['orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token', 'application-key', 'usage-context', 'accept'];
  }

  private loading = false;
  private uploading = false;
  private error = '';
  private records: ShapedRecord[] = [];
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

  private get usageContext(): string {
    return this.getAttribute('usage-context') || 'general';
  }

  private get accept(): string {
    return this.getAttribute('accept') || DEFAULT_ASSET_ACCEPT;
  }

  private async load(force = false) {
    if (!this.applicationKey) {
      this.records = [];
      this.render();
      return;
    }
    const key = `${this.applicationKey}:${this.usageContext}`;
    if (!force && key === this.loadedKey) return;
    this.loadedKey = key;
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

  private pickerRecords(): ShapedRecord[] {
    if (this.usageContext.includes('icon')) {
      return this.records.filter((asset) => isImageAsset(asset) || ['icon', 'image'].includes(asset.storageRecord.asset_type));
    }
    return this.records;
  }

  private async upload() {
    const fileInput = this.querySelector<HTMLInputElement>('[data-picker-field="file"]');
    const file = fileInput?.files?.[0];
    if (!file || !this.applicationKey) return;
    const altText = this.querySelector<HTMLInputElement>('[data-picker-field="altText"]')?.value || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
    const assetKey = this.querySelector<HTMLInputElement>('[data-picker-field="assetKey"]')?.value || file.name.replace(/\.[^.]+$/, '');
    this.uploading = true;
    this.error = '';
    this.render();
    try {
      const asset = await clientFromElement(this).uploadAsset(this.applicationKey, file, {
        assetKey,
        altText,
        assetType: this.usageContext.includes('icon') ? 'icon' : undefined,
        usageContext: this.usageContext,
        tags: [this.usageContext],
        isPublic: true,
      });
      this.uploading = false;
      dispatch(this, 'uib-asset-uploaded', { asset });
      dispatch(this, 'uib-asset-selected', { asset });
      await this.load(true);
    } catch (error) {
      this.uploading = false;
      this.error = formatError(error);
      this.render();
    }
  }

  private bind() {
    this.querySelector('[data-action="picker-refresh"]')?.addEventListener('click', () => void this.load(true));
    this.querySelector('[data-action="picker-upload"]')?.addEventListener('click', () => void this.upload());
    this.querySelectorAll<HTMLElement>('[data-action="picker-select"]').forEach((button) => {
      button.addEventListener('click', () => {
        const asset = this.records.find((item) => item.storageRecord.asset_id === button.dataset.assetId);
        if (asset) dispatch(this, 'uib-asset-selected', { asset });
      });
    });
  }

  render() {
    if (!this.applicationKey) {
      this.innerHTML = '<div class="uibam-empty uibam-empty--compact">Select an application before choosing assets.</div>';
      return;
    }
    const records = this.pickerRecords();
    this.innerHTML = `
      <section class="uibam-asset-picker" ${passClientAttributes(this)}>
        <div class="uibam-repeatable-header">
          <div>
            <h4>Asset picker</h4>
            <p class="uibam-subtitle">Choose an existing asset or upload a new one for ${escapeHtml(this.applicationKey)}.</p>
          </div>
          <button class="uibam-button-muted" type="button" data-action="picker-refresh">Refresh</button>
        </div>
        ${this.error ? `<div class="uibam-error" role="alert">${escapeHtml(this.error)}</div>` : ''}
        <div class="uibam-asset-picker-upload">
          <label class="uibam-field">
            <span>Upload file</span>
            <input type="file" accept="${attr(this.accept)}" data-picker-field="file" ${this.uploading ? 'disabled' : ''} />
          </label>
          <label class="uibam-field">
            <span>Asset key</span>
            <input type="text" data-picker-field="assetKey" placeholder="optional-slug" />
          </label>
          <label class="uibam-field">
            <span>Alt text</span>
            <input type="text" data-picker-field="altText" placeholder="Image description" />
          </label>
          <button class="uibam-button-secondary" type="button" data-action="picker-upload" ${this.uploading ? 'disabled' : ''}>${this.uploading ? 'Uploading...' : 'Upload and select'}</button>
        </div>
        ${this.loading ? '<div class="uibam-loading">Loading assets...</div>' : records.length ? `
          <div class="uibam-asset-grid">
            ${records.map((asset) => `
              <article class="uibam-asset-card">
                <div class="uibam-asset-thumb">${assetPreview(asset)}</div>
                <div>
                  <strong>${escapeHtml(assetLabel(asset))}</strong>
                  <div class="uibam-status-line">
                    <span>${escapeHtml(asset.storageRecord.mime_type || '')}</span>
                    <span>${escapeHtml(asset.storageRecord.asset_id || '')}</span>
                  </div>
                </div>
                <button class="uibam-button-secondary" type="button" data-action="picker-select" data-asset-id="${attr(asset.storageRecord.asset_id)}">Select</button>
              </article>`).join('')}
          </div>` : '<div class="uibam-empty uibam-empty--compact">No active assets found for this application.</div>'}
      </section>`;
    this.bind();
  }
}

defineAppManagerElement('uib-app-manager-asset-picker', UibAppManagerAssetPicker);
