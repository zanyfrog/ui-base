import { baseAssetStyles, emitAssetEvent, escapeHtml, registerElement } from '../asset-core.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibAssetSearch extends BaseHTMLElement {
  static get observedAttributes() { return ['value', 'placeholder']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._value = '';
    this._suppressValueAttributeRender = false;
  }

  connectedCallback() { this._value = this.getAttribute('value') || this._value || ''; this.render(); }
  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === 'value') {
      this._value = this.getAttribute('value') || '';
      const input = this.shadowRoot.querySelector('input');
      if (input) {
        if (input.value !== this._value) input.value = this._value;
        if (this._suppressValueAttributeRender || this.shadowRoot.activeElement === input) {
          this._suppressValueAttributeRender = false;
          return;
        }
      }
      this._suppressValueAttributeRender = false;
    }
    this.render();
  }

  focusInput(options) { this.shadowRoot.querySelector('input')?.focus(options); }

  render() {
    const value = this._value || this.getAttribute('value') || '';
    const placeholder = this.getAttribute('placeholder') || 'Search assets by name, key, tag, category, or description';
    this.shadowRoot.innerHTML = (
  `<style>` +
  (baseAssetStyles) +
  ` .search { position: relative; } input { padding-left: 2.35rem; min-height: 2.85rem; } .icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--uib-assets-muted); } ` +
  `</style>` +
  `<label class="search">` +
  `<span class="icon" aria-hidden="true">` +
  `⌕` +
  `</span>` +
  `<span class="sr-only" style="position:absolute;left:-9999px;">` +
  `Search assets` +
  `</span>` +
  `<input type="search" value="` +
  (escapeHtml(value)) +
  `" placeholder="` +
  (escapeHtml(placeholder)) +
  `" />` +
  `</label>`
);
    this.shadowRoot.querySelector('input')?.addEventListener('input', (event) => {
      this._value = event.target.value;
      if (this.getAttribute('value') !== this._value) {
        this._suppressValueAttributeRender = true;
        this.setAttribute('value', this._value);
      }
      emitAssetEvent(this, 'uib-asset-search', { query: this._value });
    });
  }
}

registerElement('uib-asset-search', UibAssetSearch);
