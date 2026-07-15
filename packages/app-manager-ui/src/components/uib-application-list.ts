import type { ShapedRecord, StorageRecord } from '@ui.base/app-manager-api-client';
import { BaseHTMLElement, attr, clientFromElement, defineAppManagerElement, dispatch, escapeHtml, formatError, passClientAttributes, statusBadge } from '../utils/dom.js';
import './uib-application-editor.js';

export class UibApplicationList extends BaseHTMLElement {
  static get observedAttributes() {
    return ['orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token'];
  }

  private records: ShapedRecord[] = [];
  private loading = true;
  private error = '';
  private editorMode: 'hidden' | 'create' | 'edit' = 'hidden';
  private editorRecord: StorageRecord | null = null;

  connectedCallback() {
    this.addEventListener('uib-application-saved', this.handleApplicationSaved as EventListener);
    void this.load();
  }

  attributeChangedCallback() {
    if (this.isConnected) void this.load();
  }

  private async load() {
    this.loading = true;
    this.error = '';
    this.render();
    try {
      const client = clientFromElement(this);
      const result = await client.listApplications();
      this.records = result.records;
      this.loading = false;
      this.render();
    } catch (error) {
      this.loading = false;
      this.error = formatError(error);
      this.render();
    }
  }

  private handleApplicationSaved = () => {
    this.editorMode = 'hidden';
    this.editorRecord = null;
    void this.load();
  };

  private createRecord() {
    this.editorMode = 'create';
    this.editorRecord = null;
    this.render();
  }

  private editRecord(applicationKey: string) {
    const item = this.records.find((record) => record.storageRecord.application_key === applicationKey);
    if (!item) return;
    this.editorMode = 'edit';
    this.editorRecord = item.storageRecord;
    this.render();
  }

  private async removeRecord(applicationKey: string) {
    const confirmed = window.confirm(`Remove ${applicationKey}? This is a soft delete and will set is_active=false.`);
    if (!confirmed) return;
    try {
      await clientFromElement(this).deleteApplication(applicationKey);
      await this.load();
    } catch (error) {
      this.error = formatError(error);
      this.render();
    }
  }

  private bind() {
    this.querySelector('[data-action="create"]')?.addEventListener('click', () => this.createRecord());
    this.querySelectorAll<HTMLElement>('[data-action="select"]').forEach((button) => {
      button.addEventListener('click', () => dispatch(this, 'uib-application-selected', { applicationKey: button.dataset.applicationKey }));
    });
    this.querySelectorAll<HTMLElement>('[data-action="edit"]').forEach((button) => {
      button.addEventListener('click', () => this.editRecord(button.dataset.applicationKey || ''));
    });
    this.querySelectorAll<HTMLElement>('[data-action="remove"]').forEach((button) => {
      button.addEventListener('click', () => void this.removeRecord(button.dataset.applicationKey || ''));
    });

    const editor = this.querySelector('uib-application-editor') as HTMLElement & { record?: StorageRecord };
    if (editor && this.editorRecord) {
      editor.record = this.editorRecord;
    }
  }

  private rowActionsMarkup(row: StorageRecord): string {
    return `
      <div class="uibam-actions uibam-actions--icons" aria-label="Application actions for ${attr(row.application_key)}">
        <button class="uibam-icon-button" type="button" data-action="select" data-application-key="${attr(row.application_key)}" aria-label="Select ${attr(row.application_key)}" title="Select application">
          <span aria-hidden="true">&#9658;</span>
          <span class="uibam-sr-only">Select</span>
        </button>
        <button class="uibam-icon-button" type="button" data-action="edit" data-application-key="${attr(row.application_key)}" aria-label="Edit ${attr(row.application_key)}" title="Edit application">
          <span aria-hidden="true">&#9998;</span>
          <span class="uibam-sr-only">Edit</span>
        </button>
        <button class="uibam-icon-button uibam-icon-button--danger" type="button" data-action="remove" data-application-key="${attr(row.application_key)}" aria-label="Remove ${attr(row.application_key)}" title="Remove application">
          <span aria-hidden="true">&#10005;</span>
          <span class="uibam-sr-only">Remove</span>
        </button>
      </div>`;
  }

  private tableMarkup(): string {
    if (this.loading) return '<div class="uibam-loading">Loading applications...</div>';
    if (this.error) return `<div class="uibam-error" role="alert">${escapeHtml(this.error)}</div>`;
    if (!this.records.length) return '<div class="uibam-empty">No applications found. Create the first application to begin.</div>';

    return `
      <div class="uibam-table-wrap">
        <table class="uibam-table">
          <thead>
            <tr>
              <th class="uibam-actions-column">Actions</th>
              <th>Application</th>
              <th>Key</th>
              <th>Status</th>
              <th>Theme</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            ${this.records.map((item) => {
              const row = item.storageRecord;
              return `
                <tr>
                  <td class="uibam-actions-cell">${this.rowActionsMarkup(row)}</td>
                  <td><strong>${escapeHtml(row.name || row.application_key)}</strong><br /><span>${escapeHtml(row.description || '')}</span></td>
                  <td><code>${escapeHtml(row.application_key)}</code></td>
                  <td>${statusBadge(row.is_active)}</td>
                  <td>${escapeHtml(row.default_theme || '')}</td>
                  <td>${escapeHtml(row.date_updated || '')}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  private editorMarkup(): string {
    if (this.editorMode === 'hidden') return '';
    const attrs = passClientAttributes(this);
    return `
      <div style="margin-top: var(--uib-space-5);">
        <uib-application-editor ${attrs} mode="${this.editorMode}"></uib-application-editor>
      </div>`;
  }

  render() {
    this.innerHTML = `
      <section class="uibam-card">
        <div class="uibam-card-header">
          <div>
            <h2>Applications</h2>
            <p class="uibam-subtitle">List, create, update, select, and remove application_info records for the current dev actor.</p>
          </div>
          <div class="uibam-actions">
            <button class="uibam-button" type="button" data-action="create">Add application</button>
            <button class="uibam-button-secondary" type="button" data-action="refresh">Refresh</button>
          </div>
        </div>
        <div class="uibam-card-body">
          ${this.tableMarkup()}
          ${this.editorMarkup()}
        </div>
      </section>
    `;
    this.querySelector('[data-action="refresh"]')?.addEventListener('click', () => void this.load());
    this.bind();
  }
}

defineAppManagerElement('uib-application-list', UibApplicationList);
