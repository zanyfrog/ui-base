import { UibBaseElement, defineUiBaseElement, escapeHtml } from '@ui-base/core';
import {
  clearRecentValues,
  listRecentValueGroups,
  removeRecentValue
} from './recent-values.js';

const styles = `
:host{display:block;color:var(--uib-color-ink,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.manager{display:grid;gap:1rem}.header{display:grid;gap:.25rem}.header h2{margin:0;font-size:1.15rem;line-height:1.2}.header p,.empty{margin:0;color:var(--uib-color-muted,#53657f)}.groups{display:grid;gap:.75rem}.group{display:grid;gap:.65rem;padding:.85rem;border:1px solid var(--uib-color-border,#d8e1ee);border-radius:var(--uib-radius-md,.75rem);background:var(--uib-color-surface,#fff)}.group-header{display:flex;gap:.75rem;align-items:start;justify-content:space-between}.group-title{min-width:0}.group-title h3{margin:0;font-size:1rem;line-height:1.25}.key{display:block;overflow:hidden;margin-top:.15rem;color:var(--uib-color-muted,#53657f);font-size:.82rem;text-overflow:ellipsis;white-space:nowrap}.values{display:grid;gap:.4rem;margin:0;padding:0;list-style:none}.value-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.5rem;align-items:center}.value{overflow:hidden;padding:.35rem .5rem;border-radius:var(--uib-radius-sm,.5rem);background:var(--uib-color-surface-muted,#f5f8fc);text-overflow:ellipsis;white-space:nowrap}.button{min-height:2rem;border:1px solid var(--uib-color-border-strong,#bdcbdd);border-radius:var(--uib-radius-sm,.5rem);background:var(--uib-color-surface,#fff);color:var(--uib-color-ink,#13294b);font:inherit;font-weight:750;cursor:pointer}.button:hover{border-color:var(--uib-color-primary,#174a8b);color:var(--uib-color-primary,#174a8b)}.button:focus-visible{outline:none;box-shadow:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25))}.clear{padding-inline:.7rem}.delete{width:2rem;padding:0}@media (max-width:560px){.group-header,.value-row{grid-template-columns:1fr}.group-header{display:grid}.button.clear,.button.delete{width:100%}.button.delete{padding-inline:.7rem}}
`;

export class UibRecentValuesManager extends UibBaseElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._refresh = () => this.render();
  }

  connectedCallback() {
    this.render();
    window.addEventListener('storage', this._refresh);
    document.addEventListener('uib-recent-values-save', this._refresh);
    document.addEventListener('uib-recent-values-clear', this._refresh);
  }

  disconnectedCallback() {
    window.removeEventListener('storage', this._refresh);
    document.removeEventListener('uib-recent-values-save', this._refresh);
    document.removeEventListener('uib-recent-values-clear', this._refresh);
  }

  _emitClear(detail) {
    this.emitMtEvent('uib-recent-values-clear', detail);
  }

  _clearGroup(key) {
    if (!window.confirm(`Clear all recent values for ${key}?`)) return;
    clearRecentValues(key);
    this._emitClear({ key, value: null, values: [] });
    this.render();
  }

  _deleteValue(key, value) {
    const values = removeRecentValue(key, value);
    this._emitClear({ key, value, values });
    this.render();
  }

  render() {
    const groups = listRecentValueGroups();
    this.shadowRoot.innerHTML = (
  `<style>` +
  (styles) +
  `</style>` +
  `<section class="manager" part="manager">` +
  `<div class="header" part="header">` +
  `<h2>Recent values</h2>` +
  `<p>Saved local input history from this browser.</p>` +
  `</div>` +
  (groups.length ? (
  `<div class="groups" part="groups">` +
  (groups.map((group) => (
  `<article class="group" part="group" data-key="${escapeHtml(group.key)}">` +
  `<div class="group-header">` +
  `<div class="group-title">` +
  `<h3>${escapeHtml(group.label || group.name || group.key)}</h3>` +
  `<code class="key">${escapeHtml(group.key)}</code>` +
  `</div>` +
  `<button class="button clear" type="button" data-clear-key="${escapeHtml(group.key)}">Clear all</button>` +
  `</div>` +
  `<ul class="values">` +
  (group.values.map((value) => (
  `<li class="value-row">` +
  `<span class="value" title="${escapeHtml(value)}">${escapeHtml(value)}</span>` +
  `<button class="button delete" type="button" title="Delete value" aria-label="Delete ${escapeHtml(value)}" data-delete-key="${escapeHtml(group.key)}" data-delete-value="${escapeHtml(value)}">x</button>` +
  `</li>`
)).join('')) +
  `</ul>` +
  `</article>`
)).join('')) +
  `</div>`
) : `<p class="empty" part="empty">No recent values saved.</p>`) +
  `</section>`
);

    this.shadowRoot.querySelectorAll('[data-clear-key]').forEach((button) => {
      button.addEventListener('click', () => this._clearGroup(button.dataset.clearKey));
    });
    this.shadowRoot.querySelectorAll('[data-delete-key]').forEach((button) => {
      button.addEventListener('click', () => this._deleteValue(button.dataset.deleteKey, button.dataset.deleteValue));
    });
  }
}

defineUiBaseElement('uib-recent-values-manager', UibRecentValuesManager);
