import { baseAssetStyles, emitAssetEvent, escapeHtml, registerElement } from '../asset-core.js';
import './uib-asset-browser.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;
const DIALOG_PASS_THROUGH_ATTRIBUTES = [
  'application-key',
  'selection-mode',
  'view',
  'layout',
  'default-layout',
  'default-category',
  'default-asset-type',
  'default-file-type',
  'default-reuse-scope',
  'default-scope',
  'default-visibility',
  'default-status',
  'default-search',
  'reuse-scope',
  'asset-visibility',
  'category',
  'insertable-file-types',
  'accepted-file-types',
  'max-selection',
  'selection-behavior'
];
const DIALOG_BOOL_ATTRIBUTES = ['allow-upload', 'show-upload', 'insertable-only', 'include-shared', 'copy-on-select'];
const DIALOG_PICKER_MODES = new Set(['pick', 'browse', 'manage', 'simple']);

function boolFromAttribute(value, fallback = false) {
  if (value === null || value === undefined) return fallback;
  if (value === '' || value === true) return true;
  const normalized = String(value).toLowerCase();
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return true;
}

function attributeList(element) {
  const attrs = [];
  const emitted = new Set();
  const pushAttr = (name, value) => {
    if (emitted.has(name)) return;
    emitted.add(name);
    attrs.push(`${name}="${escapeHtml(value)}"`);
  };
  DIALOG_PASS_THROUGH_ATTRIBUTES.forEach((name) => {
    if (!element.hasAttribute(name)) return;
    pushAttr(name, element.getAttribute(name));
  });
  DIALOG_BOOL_ATTRIBUTES.forEach((name) => {
    if (!boolFromAttribute(element.getAttribute(name), false)) return;
    pushAttr(name, 'true');
    if (name === 'allow-upload') pushAttr('show-upload', 'true');
  });
  return attrs.join(' ');
}

function normalizePickerMode(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (DIALOG_PICKER_MODES.has(raw)) return raw;
  if (raw === 'browser' || raw === 'dialog' || raw === 'default') return 'pick';
  return 'pick';
}

export class UibAssetPickerDialog extends BaseHTMLElement {
  static get observedAttributes() {
    return [
      'open',
      'application-key',
      'selection-mode',
      'mode',
      'picker-mode',
      'data-picker-mode',
      'view',
      'layout',
      'default-layout',
      'allow-upload',
      'show-upload',
      'insertable-only',
      'insertable-file-types',
      'accepted-file-types',
      'max-selection',
      'default-category',
      'default-asset-type',
      'default-file-type',
      'default-reuse-scope',
      'default-scope',
      'default-visibility',
      'default-status',
      'default-search',
      'reuse-scope',
      'asset-visibility',
      'category',
      'include-shared',
      'copy-on-select',
      'selection-behavior'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._provider = null;
    this._assets = [];
    this._selected = null;
  }

  set provider(value) { this._provider = value || null; if (this.isConnected) this.render(); }
  get provider() { return this._provider; }
  set assets(value) { this._assets = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get assets() { return this._assets; }
  connectedCallback() { this.render(); }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'selection-mode') this._selected = null;
    if (this.isConnected) this.render();
  }

  pickerMode() {
    return normalizePickerMode(this.getAttribute('data-picker-mode') || this.getAttribute('picker-mode') || this.getAttribute('mode'));
  }

  open() { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }

  render() {
    const isOpen = this.hasAttribute('open');
    const pickerMode = this.pickerMode();
    const passthrough = attributeList(this);
    const selectionMode = this.getAttribute('selection-mode') || 'single';
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (baseAssetStyles) +
  ` .backdrop { position: fixed; inset: 0; z-index: 50; display: ` +
  (isOpen ? 'grid' : 'none') +
  ` ; place-items: center; padding: 1rem; background: rgba(6, 21, 40, 0.62); } .dialog { width: min(1180px, 100%); max-height: min(86vh, 900px); overflow: auto; padding: 1rem; } .dialog-header { margin-bottom: 0.75rem; } .dialog-meta { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.45rem; } ` +
  `</style>` +
  `<div class="backdrop" role="presentation">` +
  `<section class="asset-card dialog" role="dialog" aria-modal="true" aria-label="Asset picker">` +
  `<div class="dialog-header row-between">` +
  `<div>` +
  `<h2 class="title">` +
  ` Choose an asset ` +
  `</h2>` +
  `<p class="subtitle">` +
  ` The selected value returns asset id and version details, not just a URL. ` +
  `</p>` +
  `<div class="dialog-meta" aria-label="Current picker settings">` +
  `<span class="badge strong">` +
  ` mode: ` +
  (escapeHtml(pickerMode)) +
  ` ` +
  `</span>` +
  `<span class="badge">` +
  ` selection: ` +
  (escapeHtml(selectionMode)) +
  ` ` +
  `</span>` +
  `</div>` +
  `</div>` +
  `<div class="row">` +
  `<button type="button" data-action="close">` +
  ` Cancel ` +
  `</button>` +
  `<button type="button" class="primary" data-action="choose" ` +
  (this._selected ? '' : 'disabled') +
  `> Choose selected ` +
  `</button>` +
  `</div>` +
  `</div>` +
  `<uib-asset-browser mode="` +
  (escapeHtml(pickerMode)) +
  `" data-picker-mode="` +
  (escapeHtml(pickerMode)) +
  `" ` +
  (passthrough) +
  `>` +
  `</uib-asset-browser>` +
  `</section>` +
  `</div>`
);
    this.shadowRoot.querySelector('[data-action="close"]')?.addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('[data-action="choose"]')?.addEventListener('click', () => {
      if (!this._selected) return;
      emitAssetEvent(this, 'uib-asset-picker-select', this._selected);
      this.close();
    });
    this.shadowRoot.querySelector('.backdrop')?.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) this.close();
    });
    const browser = this.shadowRoot.querySelector('uib-asset-browser');
    if (browser) {
      if (this._provider) browser.provider = this._provider;
      else browser.assets = this._assets;
      browser.addEventListener('uib-asset-select', (event) => {
        this._selected = event.detail;
        emitAssetEvent(this, 'uib-asset-select', event.detail);
        this.render();
      });
      browser.addEventListener('uib-assets-select', (event) => {
        this._selected = event.detail;
        emitAssetEvent(this, 'uib-assets-select', event.detail);
        this.render();
      });
    }
  }
}

registerElement('uib-asset-picker-dialog', UibAssetPickerDialog);
