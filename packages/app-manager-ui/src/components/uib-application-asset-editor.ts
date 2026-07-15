import type { ShapedRecord, StorageRecord } from '@ui.base/app-manager-api-client';
import { APPLICATION_ASSET_FIELDS } from '../record-fields.js';
import { BaseHTMLElement, attr, clientFromElement, cloneRecord, defineAppManagerElement, escapeHtml, formatError, recordsEqual } from '../utils/dom.js';
import { formToRecord, renderFieldGroups, validateRecord } from './record-form.js';

const ASSET_ACCEPT = 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml,image/avif,application/pdf,text/plain,text/css,application/json';

function isImage(record: StorageRecord): boolean {
  return (record.mime_type || '').startsWith('image/');
}

export class UibApplicationAssetEditor extends BaseHTMLElement {
  static get observedAttributes() {
    return ['orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token', 'application-key', 'asset-id'];
  }

  private originalRecord: StorageRecord = {};
  private currentRecord: StorageRecord = {};
  private loading = false;
  private saving = false;
  private replacing = false;
  private error = '';
  private state: 'clean' | 'dirty' | 'saved' | 'error' = 'clean';
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

  private get assetId(): string {
    return this.getAttribute('asset-id') || '';
  }

  private async load() {
    const key = `${this.applicationKey}:${this.assetId}`;
    if (key === this.loadedKey) return;
    this.loadedKey = key;
    this.loading = true;
    this.error = '';
    this.render();
    try {
      const result = await clientFromElement(this).getAsset(this.applicationKey, this.assetId);
      this.originalRecord = cloneRecord(result.storageRecord);
      this.currentRecord = cloneRecord(result.storageRecord);
      this.loading = false;
      this.state = 'clean';
      this.render();
    } catch (error) {
      this.loading = false;
      this.error = formatError(error);
      this.state = 'error';
      this.loadedKey = '';
      this.render();
    }
  }

  private updateFromForm() {
    const form = this.querySelector<HTMLFormElement>('form');
    if (!form) return;
    this.currentRecord = formToRecord(form, APPLICATION_ASSET_FIELDS);
    this.state = recordsEqual(this.currentRecord, this.originalRecord) ? 'clean' : 'dirty';
  }

  private async save() {
    this.updateFromForm();
    const errors = validateRecord(APPLICATION_ASSET_FIELDS, this.currentRecord);
    if (errors.length) {
      this.error = errors.join(' ');
      this.state = 'error';
      this.render();
      return;
    }
    this.saving = true;
    this.error = '';
    this.render();
    try {
      const result = await clientFromElement(this).updateAsset(this.applicationKey, this.assetId, this.currentRecord);
      this.originalRecord = cloneRecord(result.storageRecord);
      this.currentRecord = cloneRecord(result.storageRecord);
      this.saving = false;
      this.state = 'saved';
      this.render();
    } catch (error) {
      this.saving = false;
      this.error = formatError(error);
      this.state = 'error';
      this.render();
    }
  }

  private async replaceFile() {
    const file = this.querySelector<HTMLInputElement>('[data-action="replace-asset-file"]')?.files?.[0];
    if (!file) return;
    this.updateFromForm();
    this.replacing = true;
    this.error = '';
    this.render();
    try {
      const result: ShapedRecord = await clientFromElement(this).replaceAssetFile(this.applicationKey, this.assetId, file, {
        assetKey: this.currentRecord.asset_key,
        assetType: this.currentRecord.asset_type,
        altText: this.currentRecord.alt_text,
        caption: this.currentRecord.caption,
        description: this.currentRecord.description,
        tags: this.currentRecord.tags,
        usageContext: this.currentRecord.usage_context,
        isPublic: this.currentRecord.is_public,
      });
      this.originalRecord = cloneRecord(result.storageRecord);
      this.currentRecord = cloneRecord(result.storageRecord);
      this.replacing = false;
      this.state = 'saved';
      this.render();
    } catch (error) {
      this.replacing = false;
      this.error = formatError(error);
      this.state = 'error';
      this.render();
    }
  }

  private bind() {
    const form = this.querySelector<HTMLFormElement>('form');
    form?.addEventListener('input', () => {
      this.updateFromForm();
      this.renderFooterOnly();
    });
    form?.addEventListener('change', () => {
      this.updateFromForm();
      this.renderFooterOnly();
    });
    this.querySelector('[data-action="save-asset"]')?.addEventListener('click', () => void this.save());
    this.querySelector('[data-action="replace-asset"]')?.addEventListener('click', () => void this.replaceFile());
  }

  private renderFooterOnly() {
    const footer = this.querySelector<HTMLElement>('.uibam-form-footer');
    if (footer) footer.outerHTML = this.footerMarkup();
    this.querySelector('[data-action="save-asset"]')?.addEventListener('click', () => void this.save());
  }

  private footerMarkup(): string {
    const dirty = this.state === 'dirty';
    return `
      <div class="uibam-form-footer">
        <div class="uibam-status-line">
          <span class="uibam-badge ${this.state === 'saved' ? 'uibam-badge--success' : dirty || this.state === 'error' ? 'uibam-badge--warning' : 'uibam-badge--muted'}">${escapeHtml(this.state)}</span>
          ${this.error ? `<span role="alert">${escapeHtml(this.error)}</span>` : ''}
        </div>
        <button class="uibam-button" type="button" data-action="save-asset" ${this.saving || !dirty ? 'disabled' : ''}>${this.saving ? 'Saving...' : 'Save asset metadata'}</button>
      </div>`;
  }

  private previewMarkup(): string {
    const record = this.currentRecord;
    if (isImage(record) && record.public_url) {
      return `<img src="${attr(record.public_url)}" alt="${attr(record.alt_text || record.asset_key || 'asset')}" loading="lazy" />`;
    }
    return `<div class="uibam-asset-file-badge">${escapeHtml(record.file_extension || record.mime_type || 'file')}</div>`;
  }

  render() {
    if (this.loading) {
      this.innerHTML = '<div class="uibam-loading">Loading asset...</div>';
      return;
    }
    if (this.error && !Object.keys(this.currentRecord).length) {
      this.innerHTML = `<div class="uibam-error" role="alert">${escapeHtml(this.error)}</div>`;
      return;
    }
    this.innerHTML = `
      <section class="uibam-editor-layout">
        <aside class="uibam-card uibam-editor-panel">
          <div class="uibam-card-header">
            <div>
              <h2>Edit asset</h2>
              <p class="uibam-subtitle">All application_asset fields are editable. Replacing the file keeps the same asset_id and stable public URL.</p>
            </div>
          </div>
          <div class="uibam-card-body">
            <form class="uibam-form" novalidate>
              ${renderFieldGroups(APPLICATION_ASSET_FIELDS, this.currentRecord, ['Identity', 'File', 'URLs', 'Metadata'])}
              ${this.footerMarkup()}
            </form>
          </div>
        </aside>
        <aside class="uibam-card uibam-preview-card">
          <div class="uibam-card-header">
            <div>
              <h2>Preview and file</h2>
              <p class="uibam-subtitle">Direct routes return 404 after soft delete.</p>
            </div>
          </div>
          <div class="uibam-card-body uibam-asset-preview-panel">
            <div class="uibam-asset-preview-large">${this.previewMarkup()}</div>
            <div class="uibam-status-line">
              <a class="uibam-button-secondary" href="${attr(this.currentRecord.public_url || '#')}" target="_blank" rel="noreferrer">Open display URL</a>
              <a class="uibam-button-secondary" href="${attr(this.currentRecord.download_url || '#')}" target="_blank" rel="noreferrer">Download</a>
            </div>
            <div class="uibam-asset-replace">
              <label class="uibam-field">
                <span>Replace file</span>
                <input type="file" accept="${attr(ASSET_ACCEPT)}" data-action="replace-asset-file" ${this.replacing ? 'disabled' : ''} />
              </label>
              <button class="uibam-button" type="button" data-action="replace-asset" ${this.replacing ? 'disabled' : ''}>${this.replacing ? 'Replacing...' : 'Replace file and increment version'}</button>
            </div>
          </div>
        </aside>
      </section>`;
    this.bind();
  }
}

defineAppManagerElement('uib-application-asset-editor', UibApplicationAssetEditor);
