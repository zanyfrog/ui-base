import { defineUiBaseElement, escapeHtml, setOrRemoveAttribute } from '@ui.base/core';
import './uib-detail-list.js';
import './uib-detail-item-edit.js';

const styles = `
:host{display:block;color:var(--uib-detail-editor-color,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.editor{display:grid;gap:1rem}.toolbar{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.75rem}.title{margin:0;font-size:1rem;line-height:1.2}.hint{margin:.2rem 0 0;color:var(--uib-color-muted,#53657f);font-size:.88rem;line-height:1.45}.rows{display:grid;gap:.85rem}.row{display:grid;gap:.75rem;padding:.85rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:1rem;background:var(--uib-color-surface,#fff)}.actions{display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap}.button{display:inline-flex;align-items:center;justify-content:center;min-height:2.25rem;padding:.48rem .75rem;border:1px solid var(--uib-color-border-strong,#aab8cc);border-radius:999px;background:var(--uib-color-surface,#fff);color:var(--uib-color-ink,#13294b);cursor:pointer;font:inherit;font-weight:850}.button--primary{border-color:var(--uib-color-primary,#174a8b);background:var(--uib-color-primary,#174a8b);color:#fff}.button--danger{border-color:rgba(180,35,42,.35);color:var(--uib-color-danger,#b4232a)}.button:disabled{cursor:not-allowed;opacity:.48}.preview{padding:.75rem;border-radius:1rem;background:var(--uib-color-surface-soft,#f8fbff)}.empty{padding:1rem;border:1px dashed var(--uib-color-border-strong,#aab8cc);border-radius:1rem;color:var(--uib-color-muted,#53657f);text-align:center}uib-detail-item-edit{display:block}
`;

function parseDetails(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseObject(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (!value) return {};
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function cleanDetail(value) {
  const row = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const detail = {
    label: String(row.label || ''),
    value: String(row.value || ''),
    icon: String(row.icon || ''),
    iconUrl: String(row.iconUrl || row.icon_url || row.iconSrc || row.iconHref || row.iconImage || ''),
    iconAssetId: String(row.iconAssetId || row.icon_asset_id || row.assetId || row.asset_id || ''),
    iconAlt: String(row.iconAlt || row.icon_alt || row.alt || ''),
    description: String(row.description || '')
  };
  return Object.fromEntries(Object.entries(detail).filter(([, item]) => item !== ''));
}

export class UibDetailListEditor extends HTMLElement {
  static get observedAttributes() {
    return ['details', 'label', 'asset-map', 'use-asset-picker', 'application-key', 'api-base-url'];
  }

  constructor() {
    super();
    this._details = undefined;
    this.headers = undefined;
    this.getAuthHeaders = undefined;
    this._suppressAttributeRender = false;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected && !this._suppressAttributeRender) this.render();
  }

  get details() {
    return Array.isArray(this._details) ? this._details : parseDetails(this.getAttribute('details')).map(cleanDetail);
  }

  set details(value) {
    this._details = Array.isArray(value) ? value.map(cleanDetail) : [];
    this.syncDetailsAttribute(this._details);
    if (this.isConnected) this.render();
  }

  get assetMap() {
    return parseObject(this.getAttribute('asset-map'));
  }

  syncDetailsAttribute(details) {
    this._suppressAttributeRender = true;
    setOrRemoveAttribute(this, 'details', JSON.stringify(details.map(cleanDetail)));
    this._suppressAttributeRender = false;
  }

  emitDetailEvent(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
  }

  emitChange(extra = {}) {
    const details = this.details.map(cleanDetail);
    this.emitDetailEvent('change', { oldValue: undefined, newValue: details, details, ...extra });
    this.emitDetailEvent('uib-detail-list-editor-change', { details, ...extra });
  }

  setRows(details, eventType, eventDetail) {
    this._details = details.map(cleanDetail);
    this.syncDetailsAttribute(this._details);
    this.emitDetailEvent(eventType, { details: this._details, ...eventDetail });
    this.emitChange(eventDetail);
    this.render();
  }

  collectRows() {
    const editors = [...this.shadowRoot.querySelectorAll('uib-detail-item-edit[data-index]')];
    if (!editors.length) return this.details;
    return editors.map((editor) => cleanDetail(editor.detail || {}));
  }

  updateRow(index, detail) {
    const previous = this.details;
    const next = this.collectRows();
    next[index] = cleanDetail(detail);
    this._details = next;
    this.syncDetailsAttribute(next);
    this.emitDetailEvent('uib-detail-update', { index, detail: next[index], oldDetail: previous[index], details: next });
    this.emitChange({ index, detail: next[index] });
    this.renderPreviewOnly();
  }

  updateAssetRow(index, detail, assetDetail = {}) {
    const previous = this.details;
    const next = this.collectRows();
    next[index] = cleanDetail(detail);
    this._details = next;
    this.syncDetailsAttribute(next);
    const eventDetail = {
      index,
      detail: next[index],
      oldDetail: previous[index],
      assetId: next[index]?.iconAssetId || '',
      details: next,
      ...assetDetail
    };
    this.emitDetailEvent('uib-detail-asset-change', eventDetail);
    this.emitDetailEvent('uib-detail-update', eventDetail);
    this.emitChange({ index, detail: next[index], assetId: eventDetail.assetId, sourceEvent: assetDetail.sourceEvent });
    this.renderPreviewOnly();
  }

  addDetail() {
    const next = [...this.collectRows(), { label: 'New detail', value: '', iconAssetId: '' }];
    this.setRows(next, 'uib-detail-add', { index: next.length - 1, detail: next[next.length - 1] });
  }

  removeDetail(index) {
    const next = this.collectRows();
    const removed = next.splice(index, 1)[0];
    this.setRows(next, 'uib-detail-remove', { index, detail: removed });
  }

  moveDetail(index, direction) {
    const next = this.collectRows();
    const target = Math.max(0, Math.min(next.length - 1, index + direction));
    if (target === index) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    this.setRows(next, 'uib-detail-move', { fromIndex: index, toIndex: target, detail: item });
  }

  renderPreviewOnly() {
    const preview = this.shadowRoot.querySelector('.preview');
    if (preview) {
      preview.innerHTML = `<uib-detail-list details='${escapeHtml(JSON.stringify(this.details))}' asset-map='${escapeHtml(JSON.stringify(this.assetMap))}'></uib-detail-list>`;
    }
  }

  rowMarkup(row, index, count) {
    const item = cleanDetail(row);
    const appKey = this.getAttribute('application-key') || '';
    const baseUrl = this.getAttribute('api-base-url') || '';
    const useAssetPicker = this.hasAttribute('use-asset-picker') ? ' use-asset-picker' : '';
    return `
      <article class="row" data-index="${index}">
        <uib-detail-item-edit
          data-index="${index}"
          index="${index}"
          detail='${escapeHtml(JSON.stringify(item))}'
          asset-map='${escapeHtml(JSON.stringify(this.assetMap))}'
          application-key="${escapeHtml(appKey)}"
          api-base-url="${escapeHtml(baseUrl)}"
          ${useAssetPicker}
        ></uib-detail-item-edit>
        <div class="actions">
          <span class="hint">Detail ${index + 1}</span>
          <span>
            <button class="button" type="button" data-action="move" data-index="${index}" data-direction="-1" ${index === 0 ? 'disabled' : ''}>Up</button>
            <button class="button" type="button" data-action="move" data-index="${index}" data-direction="1" ${index === count - 1 ? 'disabled' : ''}>Down</button>
            <button class="button button--danger" type="button" data-action="remove" data-index="${index}">Remove</button>
          </span>
        </div>
      </article>
    `;
  }

  configureItemEditors() {
    this.shadowRoot.querySelectorAll('uib-detail-item-edit[data-index]').forEach((editor) => {
      editor.headers = typeof this.getAuthHeaders === 'function' ? this.getAuthHeaders() : this.headers;
      editor.getAuthHeaders = this.getAuthHeaders;
    });
  }

  bind() {
    this.shadowRoot.querySelector('[data-action="add"]')?.addEventListener('click', () => this.addDetail());
    this.shadowRoot.querySelectorAll('[data-action="remove"]').forEach((button) => {
      button.addEventListener('click', () => this.removeDetail(Number(button.getAttribute('data-index') || 0)));
    });
    this.shadowRoot.querySelectorAll('[data-action="move"]').forEach((button) => {
      button.addEventListener('click', () => this.moveDetail(Number(button.getAttribute('data-index') || 0), Number(button.getAttribute('data-direction') || 0)));
    });
    this.shadowRoot.querySelectorAll('uib-detail-item-edit[data-index]').forEach((editor) => {
      editor.addEventListener('uib-detail-item-edit-change', (event) => {
        event.stopPropagation();
        if (event.detail?.field === 'iconAssetId' && event.detail?.sourceEvent) return;
        const index = Number(editor.getAttribute('data-index') || 0);
        this.updateRow(index, event.detail?.detail || {});
      });
      editor.addEventListener('uib-detail-item-asset-change', (event) => {
        event.stopPropagation();
        const index = Number(editor.getAttribute('data-index') || 0);
        this.updateAssetRow(index, event.detail?.detail || {}, event.detail || {});
      });
    });
    this.configureItemEditors();
  }

  render() {
    const details = this.details;
    const label = this.getAttribute('label') || 'Details';
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <section class="editor" part="editor">
        <div class="toolbar">
          <div>
            <h3 class="title">${escapeHtml(label)}</h3>
            <p class="hint">Edit detail rows with a dedicated detail item editor. Each item editor includes asset selection when asset picking is enabled.</p>
          </div>
          <button class="button button--primary" type="button" data-action="add">Add detail</button>
        </div>
        <div class="rows">
          ${details.length ? details.map((row, index) => this.rowMarkup(row, index, details.length)).join('') : '<div class="empty">No details yet.</div>'}
        </div>
        <div class="preview">
          <uib-detail-list details='${escapeHtml(JSON.stringify(details))}' asset-map='${escapeHtml(JSON.stringify(this.assetMap))}'></uib-detail-list>
        </div>
      </section>
    `;
    this.bind();
  }
}

defineUiBaseElement('uib-detail-list-editor', UibDetailListEditor);
