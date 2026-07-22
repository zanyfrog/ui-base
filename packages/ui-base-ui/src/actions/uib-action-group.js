import { defineUiBaseElement, escapeHtml, setOrRemoveAttribute } from '@ui-base/core';
import './uib-action-button.js';

const styles = `
:host{display:block}.group{display:flex;flex-wrap:wrap;align-items:center;gap:var(--uib-action-group-gap,.75rem)}:host([align="center"]) .group{justify-content:center}:host([align="end"]) .group{justify-content:flex-end}:host([stacked]) .group{display:grid;align-items:stretch}:host([stacked]) uib-action-button{width:100%}
`;
function parseActions(value) { if (Array.isArray(value)) return value; if (!value) return []; try { const parsed = JSON.parse(String(value)); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
function boolish(value, fallback = true) { if (value === undefined || value === null || value === '') return fallback; if (typeof value === 'boolean') return value; return !['false','0','no','off'].includes(String(value).trim().toLowerCase()); }
export class UibActionGroup extends HTMLElement {
  static get observedAttributes() { return ['actions','align','stacked']; }
  constructor() { super(); this._actions = undefined; this.attachShadow({ mode: 'open' }); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  get actions() { return Array.isArray(this._actions) ? this._actions : parseActions(this.getAttribute('actions')); }
  set actions(value) { this._actions = Array.isArray(value) ? value : []; setOrRemoveAttribute(this, 'actions', JSON.stringify(this._actions)); if (this.isConnected) this.render(); }
  renderAction(action, index) {
    const item = action && typeof action === 'object' ? action : {};
    const label = item.label || item.text || item.title || `Action ${index + 1}`;
    const kind = item.kind || item.key || item.name || item.id || (index === 0 ? 'primary' : index === 1 ? 'secondary' : `action-${index + 1}`);
    const variant = item.variant || (index === 0 ? 'primary' : 'secondary');
    const href = item.href || item.url || (String(item.type || '').toLowerCase() === 'link' ? item.value : '');
    const actionToken = item.action || item.actionToken || item.token || (String(item.type || '').toLowerCase() === 'action' ? item.value : '');
    const shown = boolish(item.shown ?? item.show ?? item.visible, true);
    if (!shown || !label) return '';
    return (
  `<uib-action-button label="` +
  (escapeHtml(label)) +
  `" kind="` +
  (escapeHtml(kind)) +
  `" variant="` +
  (escapeHtml(variant)) +
  `" href="` +
  (escapeHtml(href || '')) +
  `" action-token="` +
  (escapeHtml(actionToken || '')) +
  `" ` +
  (boolish(item.disabled, false) ? 'disabled' : '') +
  ` ` +
  (item.target ? `target="${escapeHtml(item.target)}"` : '') +
  ` ` +
  (item.rel ? `rel="${escapeHtml(item.rel)}"` : '') +
  `>` +
  `</uib-action-button>`
);
  }
  render() {
    const actionMarkup = this.actions.map((action, index) => this.renderAction(action, index)).join('');
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (styles) +
  ` ` +
  `</style>` +
  `<div class="group" part="group">` +
  ` ` +
  (actionMarkup || '<slot></slot>') +
  ` ` +
  `</div>`
);
  }
}

defineUiBaseElement('uib-action-group', UibActionGroup);
